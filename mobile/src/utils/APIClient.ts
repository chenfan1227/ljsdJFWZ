import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Alert } from 'react-native';
import { StorageManager } from './StorageManager';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class APIClient {
  private static instance: AxiosInstance;
  private static baseURL = 'http://localhost:3001/api';

  // 初始化API客户端
  static initialize(baseURL?: string): void {
    if (baseURL) {
      this.baseURL = baseURL;
    }

    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config) => {
        // 添加认证token
        const authToken = await StorageManager.getItem('authToken');
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }

        console.log(`🌐 API请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API响应: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('❌ API响应错误:', error.response?.status, error.message);

        // 处理401未授权错误
        if (error.response?.status === 401) {
          await StorageManager.removeItem('authToken');
          await StorageManager.removeItem('userData');
          Alert.alert('登录已过期', '请重新登录');
        }

        // 处理网络错误
        if (!error.response) {
          Alert.alert('网络错误', '请检查网络连接');
        }

        return Promise.reject(error);
      }
    );

    console.log('✅ API客户端初始化完成');
  }

  // GET请求
  static async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.get(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // POST请求
  static async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.post(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // PUT请求
  static async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.put(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // DELETE请求
  static async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.delete(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // 上传文件
  static async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config?.headers,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // 下载文件
  static async download(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<Blob>> {
    try {
      const response = await this.instance.get(url, {
        ...config,
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // 错误处理
  private static handleError(error: any): APIResponse {
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      
      return {
        success: false,
        error: data?.error || data?.message || `HTTP ${status} 错误`,
      };
    } else if (error.request) {
      // 网络请求错误
      return {
        success: false,
        error: '网络连接失败，请检查网络设置',
      };
    } else {
      // 其他错误
      return {
        success: false,
        error: error.message || '未知错误',
      };
    }
  }

  // 获取实例（用于高级用法）
  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }

  // 设置Base URL
  static setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    if (this.instance) {
      this.instance.defaults.baseURL = baseURL;
    }
  }

  // 设置认证token
  static async setAuthToken(token: string): Promise<void> {
    await StorageManager.setItem('authToken', token);
    if (this.instance) {
      this.instance.defaults.headers.Authorization = `Bearer ${token}`;
    }
  }

  // 移除认证token
  static async removeAuthToken(): Promise<void> {
    await StorageManager.removeItem('authToken');
    if (this.instance) {
      delete this.instance.defaults.headers.Authorization;
    }
  }

  // 检查网络连接
  static async checkConnection(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // 重试请求
  static async retryRequest<T = any>(
    requestFn: () => Promise<APIResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<APIResponse<T>> {
    let lastError: APIResponse<T>;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await requestFn();
        if (result.success) {
          return result;
        }
        lastError = result;
      } catch (error: any) {
        lastError = this.handleError(error);
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }

    return lastError!;
  }

  // 批量请求
  static async batchRequest<T = any>(
    requests: Array<() => Promise<APIResponse<T>>>
  ): Promise<APIResponse<T>[]> {
    try {
      const results = await Promise.all(requests.map(request => request()));
      return results;
    } catch (error: any) {
      return [this.handleError(error)];
    }
  }

  // 取消请求
  static createCancelToken() {
    return axios.CancelToken.source();
  }

  // 格式化URL
  static formatURL(url: string, params?: Record<string, any>): string {
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }
}

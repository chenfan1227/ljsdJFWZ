import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageManager {
  // 存储数据
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('存储数据失败:', error);
      throw error;
    }
  }

  // 获取数据
  static async getItem(key: string): Promise<any> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('获取数据失败:', error);
      return null;
    }
  }

  // 删除数据
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('删除数据失败:', error);
      throw error;
    }
  }

  // 清空所有数据
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('清空数据失败:', error);
      throw error;
    }
  }

  // 获取所有键
  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('获取所有键失败:', error);
      return [];
    }
  }

  // 批量操作
  static async multiSet(keyValuePairs: [string, any][]): Promise<void> {
    try {
      const jsonPairs: [string, string][] = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(jsonPairs);
    } catch (error) {
      console.error('批量存储数据失败:', error);
      throw error;
    }
  }

  static async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      
      keyValuePairs.forEach(([key, value]) => {
        if (value != null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('批量获取数据失败:', error);
      return {};
    }
  }
}

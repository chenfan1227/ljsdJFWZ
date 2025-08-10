import { Platform, Alert, Linking } from 'react-native';
import { 
  request, 
  requestMultiple, 
  check, 
  checkMultiple,
  PERMISSIONS, 
  RESULTS,
  Permission,
  PermissionStatus 
} from 'react-native-permissions';

export interface PermissionResult {
  granted: boolean;
  permission: Permission;
  status: PermissionStatus;
}

export class PermissionManager {
  
  // Android权限映射
  private static ANDROID_PERMISSIONS = {
    // 相机权限
    CAMERA: PERMISSIONS.ANDROID.CAMERA,
    
    // 存储权限
    READ_EXTERNAL_STORAGE: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    WRITE_EXTERNAL_STORAGE: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    
    // 位置权限
    ACCESS_FINE_LOCATION: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ACCESS_COARSE_LOCATION: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    ACCESS_BACKGROUND_LOCATION: PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    
    // 麦克风权限
    RECORD_AUDIO: PERMISSIONS.ANDROID.RECORD_AUDIO,
    
    // 联系人权限
    READ_CONTACTS: PERMISSIONS.ANDROID.READ_CONTACTS,
    WRITE_CONTACTS: PERMISSIONS.ANDROID.WRITE_CONTACTS,
    GET_ACCOUNTS: PERMISSIONS.ANDROID.GET_ACCOUNTS,
    
    // 电话权限
    READ_PHONE_STATE: PERMISSIONS.ANDROID.READ_PHONE_STATE,
    CALL_PHONE: PERMISSIONS.ANDROID.CALL_PHONE,
    READ_PHONE_NUMBERS: PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
    
    // 短信权限
    SEND_SMS: PERMISSIONS.ANDROID.SEND_SMS,
    RECEIVE_SMS: PERMISSIONS.ANDROID.RECEIVE_SMS,
    READ_SMS: PERMISSIONS.ANDROID.READ_SMS,
    RECEIVE_WAP_PUSH: PERMISSIONS.ANDROID.RECEIVE_WAP_PUSH,
    RECEIVE_MMS: PERMISSIONS.ANDROID.RECEIVE_MMS,
    
    // 日历权限
    READ_CALENDAR: PERMISSIONS.ANDROID.READ_CALENDAR,
    WRITE_CALENDAR: PERMISSIONS.ANDROID.WRITE_CALENDAR,
    
    // 传感器权限
    BODY_SENSORS: PERMISSIONS.ANDROID.BODY_SENSORS,
    ACTIVITY_RECOGNITION: PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
    
    // 蓝牙权限
    BLUETOOTH_CONNECT: PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    BLUETOOTH_SCAN: PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    BLUETOOTH_ADVERTISE: PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
    
    // 通知权限
    POST_NOTIFICATIONS: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
  };

  // iOS权限映射
  private static IOS_PERMISSIONS = {
    // 相机权限
    CAMERA: PERMISSIONS.IOS.CAMERA,
    
    // 相册权限
    PHOTO_LIBRARY: PERMISSIONS.IOS.PHOTO_LIBRARY,
    PHOTO_LIBRARY_ADD_ONLY: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
    
    // 麦克风权限
    MICROPHONE: PERMISSIONS.IOS.MICROPHONE,
    
    // 位置权限
    LOCATION_WHEN_IN_USE: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    LOCATION_ALWAYS: PERMISSIONS.IOS.LOCATION_ALWAYS,
    
    // 联系人权限
    CONTACTS: PERMISSIONS.IOS.CONTACTS,
    
    // 日历权限
    CALENDARS: PERMISSIONS.IOS.CALENDARS,
    REMINDERS: PERMISSIONS.IOS.REMINDERS,
    
    // 运动权限
    MOTION: PERMISSIONS.IOS.MOTION,
    
    // 健康权限
    HEALTH_UPDATE: PERMISSIONS.IOS.HEALTH_UPDATE,
    HEALTH_SHARE: PERMISSIONS.IOS.HEALTH_SHARE,
    
    // 语音识别权限
    SPEECH_RECOGNITION: PERMISSIONS.IOS.SPEECH_RECOGNITION,
    
    // Siri权限
    SIRI: PERMISSIONS.IOS.SIRI,
    
    // 蓝牙权限
    BLUETOOTH_PERIPHERAL: PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
    
    // Face ID权限
    FACE_ID: PERMISSIONS.IOS.FACE_ID,
    
    // 媒体库权限
    MEDIA_LIBRARY: PERMISSIONS.IOS.MEDIA_LIBRARY,
    
    // 用户跟踪权限
    APP_TRACKING_TRANSPARENCY: PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY,
  };

  // 获取平台特定权限
  private static getPlatformPermissions() {
    return Platform.OS === 'android' 
      ? this.ANDROID_PERMISSIONS 
      : this.IOS_PERMISSIONS;
  }

  // 检查单个权限
  static async checkPermission(permission: Permission): Promise<PermissionResult> {
    try {
      const status = await check(permission);
      
      return {
        granted: status === RESULTS.GRANTED,
        permission,
        status,
      };
    } catch (error) {
      console.error('检查权限失败:', error);
      return {
        granted: false,
        permission,
        status: RESULTS.UNAVAILABLE,
      };
    }
  }

  // 请求单个权限
  static async requestPermission(permission: Permission): Promise<PermissionResult> {
    try {
      const status = await request(permission);
      
      return {
        granted: status === RESULTS.GRANTED,
        permission,
        status,
      };
    } catch (error) {
      console.error('请求权限失败:', error);
      return {
        granted: false,
        permission,
        status: RESULTS.UNAVAILABLE,
      };
    }
  }

  // 批量检查权限
  static async checkMultiplePermissions(permissions: Permission[]): Promise<Record<string, PermissionResult>> {
    try {
      const results = await checkMultiple(permissions);
      const permissionResults: Record<string, PermissionResult> = {};
      
      for (const [permission, status] of Object.entries(results)) {
        permissionResults[permission] = {
          granted: status === RESULTS.GRANTED,
          permission: permission as Permission,
          status,
        };
      }
      
      return permissionResults;
    } catch (error) {
      console.error('批量检查权限失败:', error);
      return {};
    }
  }

  // 批量请求权限
  static async requestMultiplePermissions(permissions: Permission[]): Promise<Record<string, PermissionResult>> {
    try {
      const results = await requestMultiple(permissions);
      const permissionResults: Record<string, PermissionResult> = {};
      
      for (const [permission, status] of Object.entries(results)) {
        permissionResults[permission] = {
          granted: status === RESULTS.GRANTED,
          permission: permission as Permission,
          status,
        };
      }
      
      return permissionResults;
    } catch (error) {
      console.error('批量请求权限失败:', error);
      return {};
    }
  }

  // 请求相机权限
  static async requestCameraPermission(): Promise<PermissionResult> {
    const permissions = this.getPlatformPermissions();
    const permission = Platform.OS === 'android' 
      ? permissions.CAMERA 
      : permissions.CAMERA;
      
    return this.requestPermission(permission);
  }

  // 请求存储权限
  static async requestStoragePermissions(): Promise<Record<string, PermissionResult>> {
    const permissions = this.getPlatformPermissions();
    
    if (Platform.OS === 'android') {
      return this.requestMultiplePermissions([
        permissions.READ_EXTERNAL_STORAGE,
        permissions.WRITE_EXTERNAL_STORAGE,
      ]);
    } else {
      return this.requestMultiplePermissions([
        permissions.PHOTO_LIBRARY,
        permissions.PHOTO_LIBRARY_ADD_ONLY,
      ]);
    }
  }

  // 请求位置权限
  static async requestLocationPermissions(): Promise<Record<string, PermissionResult>> {
    const permissions = this.getPlatformPermissions();
    
    if (Platform.OS === 'android') {
      return this.requestMultiplePermissions([
        permissions.ACCESS_FINE_LOCATION,
        permissions.ACCESS_COARSE_LOCATION,
      ]);
    } else {
      return this.requestMultiplePermissions([
        permissions.LOCATION_WHEN_IN_USE,
      ]);
    }
  }

  // 请求联系人权限
  static async requestContactsPermission(): Promise<PermissionResult> {
    const permissions = this.getPlatformPermissions();
    const permission = Platform.OS === 'android' 
      ? permissions.READ_CONTACTS 
      : permissions.CONTACTS;
      
    return this.requestPermission(permission);
  }

  // 请求麦克风权限
  static async requestMicrophonePermission(): Promise<PermissionResult> {
    const permissions = this.getPlatformPermissions();
    const permission = Platform.OS === 'android' 
      ? permissions.RECORD_AUDIO 
      : permissions.MICROPHONE;
      
    return this.requestPermission(permission);
  }

  // 请求电话权限
  static async requestPhonePermissions(): Promise<Record<string, PermissionResult>> {
    if (Platform.OS === 'android') {
      const permissions = this.getPlatformPermissions();
      return this.requestMultiplePermissions([
        permissions.READ_PHONE_STATE,
        permissions.CALL_PHONE,
      ]);
    } else {
      // iOS不需要电话权限
      return {};
    }
  }

  // 请求短信权限
  static async requestSMSPermissions(): Promise<Record<string, PermissionResult>> {
    if (Platform.OS === 'android') {
      const permissions = this.getPlatformPermissions();
      return this.requestMultiplePermissions([
        permissions.SEND_SMS,
        permissions.RECEIVE_SMS,
        permissions.READ_SMS,
      ]);
    } else {
      // iOS不需要短信权限
      return {};
    }
  }

  // 请求蓝牙权限
  static async requestBluetoothPermissions(): Promise<Record<string, PermissionResult>> {
    const permissions = this.getPlatformPermissions();
    
    if (Platform.OS === 'android') {
      return this.requestMultiplePermissions([
        permissions.BLUETOOTH_CONNECT,
        permissions.BLUETOOTH_SCAN,
      ]);
    } else {
      return this.requestMultiplePermissions([
        permissions.BLUETOOTH_PERIPHERAL,
      ]);
    }
  }

  // 请求所有基础权限
  static async requestAllBasicPermissions(): Promise<Record<string, PermissionResult>> {
    const allResults: Record<string, PermissionResult> = {};
    
    try {
      // 相机权限
      const cameraResult = await this.requestCameraPermission();
      allResults['camera'] = cameraResult;
      
      // 存储权限
      const storageResults = await this.requestStoragePermissions();
      Object.assign(allResults, storageResults);
      
      // 位置权限
      const locationResults = await this.requestLocationPermissions();
      Object.assign(allResults, locationResults);
      
      // 联系人权限
      const contactsResult = await this.requestContactsPermission();
      allResults['contacts'] = contactsResult;
      
      // 麦克风权限
      const microphoneResult = await this.requestMicrophonePermission();
      allResults['microphone'] = microphoneResult;
      
      // 电话权限（仅Android）
      if (Platform.OS === 'android') {
        const phoneResults = await this.requestPhonePermissions();
        Object.assign(allResults, phoneResults);
      }
      
      console.log('📋 所有基础权限请求完成:', allResults);
      
    } catch (error) {
      console.error('请求基础权限失败:', error);
    }
    
    return allResults;
  }

  // 检查权限状态并显示提示
  static async checkAndRequestPermissionWithAlert(
    permission: Permission,
    title: string,
    message: string
  ): Promise<boolean> {
    try {
      // 先检查权限状态
      const checkResult = await this.checkPermission(permission);
      
      if (checkResult.granted) {
        return true;
      }
      
      // 如果权限被拒绝，显示说明对话框
      return new Promise((resolve) => {
        Alert.alert(
          title,
          message,
          [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: '授权',
              onPress: async () => {
                const requestResult = await this.requestPermission(permission);
                
                if (requestResult.granted) {
                  resolve(true);
                } else if (requestResult.status === RESULTS.BLOCKED) {
                  // 权限被永久拒绝，引导用户到设置页面
                  Alert.alert(
                    '权限被拒绝',
                    '请在设置中手动开启权限',
                    [
                      { text: '取消', style: 'cancel' },
                      { text: '去设置', onPress: () => Linking.openSettings() },
                    ]
                  );
                  resolve(false);
                } else {
                  resolve(false);
                }
              },
            },
          ]
        );
      });
      
    } catch (error) {
      console.error('权限检查和请求失败:', error);
      return false;
    }
  }

  // 获取权限状态描述
  static getPermissionStatusDescription(status: PermissionStatus): string {
    switch (status) {
      case RESULTS.GRANTED:
        return '已授权';
      case RESULTS.DENIED:
        return '被拒绝';
      case RESULTS.BLOCKED:
        return '被永久拒绝';
      case RESULTS.LIMITED:
        return '部分授权';
      case RESULTS.UNAVAILABLE:
        return '不可用';
      default:
        return '未知状态';
    }
  }

  // 打开应用设置页面
  static openAppSettings(): void {
    Linking.openSettings();
  }
}

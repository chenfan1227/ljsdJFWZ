const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // 资源文件扩展名
  resolver: {
    assetExts: [
      'bmp',
      'gif',
      'jpg',
      'jpeg',
      'png',
      'psd',
      'svg',
      'webp',
      'ttf',
      'otf',
      'woff',
      'woff2',
      'eot',
      'mp4',
      'webm',
      'wav',
      'mp3',
      'm4a',
      'aac',
      'oga',
      'json',
      'lottie',
    ],
    
    // 源文件扩展名
    sourceExts: [
      'js',
      'jsx',
      'json',
      'ts',
      'tsx',
      'web.js',
      'web.jsx',
      'web.ts',
      'web.tsx',
      'native.js',
      'native.jsx',
      'native.ts',
      'native.tsx',
      'android.js',
      'android.jsx',
      'android.ts',
      'android.tsx',
      'ios.js',
      'ios.jsx',
      'ios.ts',
      'ios.tsx',
    ],

    // 平台特定文件优先级
    platforms: ['ios', 'android', 'web', 'native'],

    // 别名配置
    alias: {
      '@': './src',
      '@assets': './src/assets',
      '@components': './src/components',
      '@screens': './src/screens',
      '@utils': './src/utils',
      '@services': './src/services',
      '@hooks': './src/hooks',
      '@navigation': './src/navigation',
      '@store': './src/store',
      '@types': './src/types',
    },
  },

  // 转换器配置
  transformer: {
    // 启用 Hermes 字节码
    hermesCommand: 'hermes',
    
    // SVG 支持
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    
    // 内联需要 metro 转换的模块
    inlineRequires: true,
    
    // 启用实验性的导入支持
    experimentalImportSupport: false,
    
    // 启用内联平台常量
    inlinePlatform: false,
    
    // 最小化输出
    minifierConfig: {
      // 保留函数名（便于调试）
      keep_fnames: true,
      // 保留类名
      keep_classnames: true,
      // 启用压缩
      mangle: {
        keep_fnames: true,
      },
    },

    // 获取转换选项
    getTransformOptions: async () => ({
      transform: {
        // 启用实验性的导入支持
        experimentalImportSupport: false,
        // 内联 require 调用
        inlineRequires: true,
      },
    }),
  },

  // 序列化器配置
  serializer: {
    // 自定义序列化器
    customSerializer: null,
    
    // 创建模块ID
    createModuleIdFactory: () => (path) => {
      // 可以自定义模块ID生成逻辑
      return path;
    },
    
    // 获取运行时代码位置
    getRunModuleStatement: (moduleId) => `__r(${JSON.stringify(moduleId)});`,
    
    // 获取模块代码片段
    getModulesRunBeforeMainModule: () => [],
    
    // 获取polyfills
    getPolyfills: () => [],
    
    // 模块过滤器
    processModuleFilter: (module) => {
      // 过滤掉不需要的模块
      return true;
    },
  },

  // 服务器配置
  server: {
    // 端口
    port: 8081,
    
    // 重写请求URL
    rewriteRequestUrl: (url) => {
      // 可以重写静态资源URL
      return url;
    },
  },

  // 监听器配置
  watcher: {
    // 额外的监听目录
    additionalExts: ['json'],
    
    // 忽略的文件/目录
    ignore: [
      /.*\.git\/.*/,
      /.*node_modules\/.*/,
      /.*\.nyc_output\/.*/,
      /.*\.next\/.*/,
      /.*\.cache\/.*/,
      /.*coverage\/.*/,
      /.*dist\/.*/,
      /.*build\/.*/,
      /.*\.DS_Store.*/,
      /.*Thumbs\.db.*/,
    ],

    // 健康检查文件
    healthCheck: {
      enabled: true,
      filePrefix: '.metro-health-check',
      timeout: 5000,
    },
  },

  // 缓存配置
  cacheStores: [
    {
      name: 'metro-cache',
      type: 'FileStore',
      root: require('path').join(require('os').tmpdir(), 'metro-cache'),
    },
  ],

  // 重置缓存
  resetCache: false,

  // 最大工作进程数
  maxWorkers: require('os').cpus().length,

  // 项目根目录
  projectRoot: __dirname,

  // 监听目录
  watchFolders: [
    // 可以添加额外的监听目录
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BannerAd, BannerAdSize, InterstitialAd, RewardedAd } from 'react-native-google-mobile-ads';

// 导入工具类
import { AdMobManager } from '../utils/AdMobManager';
import { PermissionManager } from '../utils/PermissionManager';
import { StorageManager } from '../utils/StorageManager';
import { APIClient } from '../utils/APIClient';

const { width, height } = Dimensions.get('window');

interface UserPoints {
  balance: number;
  totalEarned: number;
  todayEarned: number;
  level: string;
}

interface EarningTask {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  color: string;
  type: 'video' | 'download' | 'game' | 'daily' | 'referral';
  available: boolean;
}

const HomeScreen: React.FC = () => {
  const [userPoints, setUserPoints] = useState<UserPoints>({
    balance: 1000000,
    totalEarned: 1000000,
    todayEarned: 50000,
    level: 'VIP',
  });

  const [earningTasks, setEarningTasks] = useState<EarningTask[]>([
    {
      id: 'free_cash',
      title: '免费现金',
      description: '每日免费领取',
      points: 10000,
      icon: 'attach-money',
      color: '#4caf50',
      type: 'daily',
      available: true,
    },
    {
      id: 'watch_video',
      title: '观看视频',
      description: '观看广告获得奖励',
      points: 50000,
      icon: 'play-circle-filled',
      color: '#ff5722',
      type: 'video',
      available: true,
    },
    {
      id: 'download_app',
      title: '下载应用',
      description: '下载推荐应用',
      points: 30000,
      icon: 'get-app',
      color: '#2196f3',
      type: 'download',
      available: true,
    },
    {
      id: 'play_game',
      title: '玩游戏',
      description: '完成游戏关卡',
      points: 25000,
      icon: 'games',
      color: '#9c27b0',
      type: 'game',
      available: true,
    },
    {
      id: 'invite_friend',
      title: '邀请好友',
      description: '邀请好友注册',
      points: 100000,
      icon: 'group-add',
      color: '#ff9800',
      type: 'referral',
      available: true,
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const adMobManager = AdMobManager.getInstance();

  useEffect(() => {
    initializeScreen();
    startFloatingAnimation();
  }, []);

  // 初始化屏幕
  const initializeScreen = async () => {
    try {
      // 加载用户数据
      await loadUserData();
      
      // 初始化AdMob
      await adMobManager.initialize();
      
    } catch (error) {
      console.error('初始化主屏幕失败:', error);
    }
  };

  // 加载用户数据
  const loadUserData = async () => {
    try {
      const userData = await StorageManager.getItem('userData');
      if (userData && userData.points) {
        setUserPoints(userData.points);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  // 启动浮动动画
  const startFloatingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserData();
      // 模拟刷新延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 处理任务点击
  const handleTaskPress = async (task: EarningTask) => {
    if (!task.available) {
      Alert.alert('任务不可用', '请稍后再试');
      return;
    }

    try {
      switch (task.type) {
        case 'video':
          await handleWatchVideo(task);
          break;
        case 'download':
          await handleDownloadApp(task);
          break;
        case 'game':
          await handlePlayGame(task);
          break;
        case 'daily':
          await handleDailyReward(task);
          break;
        case 'referral':
          await handleInviteFriend(task);
          break;
        default:
          Alert.alert('功能开发中', '敬请期待');
      }
    } catch (error) {
      console.error('处理任务失败:', error);
      Alert.alert('操作失败', '请稍后重试');
    }
  };

  // 观看视频奖励
  const handleWatchVideo = async (task: EarningTask) => {
    try {
      // 显示激励视频广告
      await adMobManager.showRewardedAdWithReward(
        (reward) => {
          // 用户完成观看，给予奖励
          const newPoints = userPoints.balance + task.points;
          setUserPoints(prev => ({
            ...prev,
            balance: newPoints,
            totalEarned: prev.totalEarned + task.points,
            todayEarned: prev.todayEarned + task.points,
          }));

          Alert.alert(
            '🎉 奖励获得！',
            `恭喜您获得 ${task.points.toLocaleString()} 积分！`,
            [{ text: '太棒了！', style: 'default' }]
          );

          // 保存到本地存储
          StorageManager.setItem('userData', { points: userPoints });
        },
        (error) => {
          Alert.alert('广告加载失败', '请稍后重试');
        }
      );
    } catch (error) {
      console.error('观看视频失败:', error);
    }
  };

  // 下载应用奖励
  const handleDownloadApp = async (task: EarningTask) => {
    Alert.alert(
      '📱 下载应用',
      '即将跳转到应用商店下载推荐应用',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '去下载',
          onPress: () => {
            // 这里可以打开应用商店或下载链接
            // 模拟下载完成奖励
            setTimeout(() => {
              const newPoints = userPoints.balance + task.points;
              setUserPoints(prev => ({
                ...prev,
                balance: newPoints,
                totalEarned: prev.totalEarned + task.points,
                todayEarned: prev.todayEarned + task.points,
              }));

              Alert.alert(
                '🎉 下载完成！',
                `恭喜您获得 ${task.points.toLocaleString()} 积分！`
              );
            }, 2000);
          },
        },
      ]
    );
  };

  // 游戏奖励
  const handlePlayGame = async (task: EarningTask) => {
    Alert.alert(
      '🎮 开始游戏',
      '即将进入游戏界面',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '开始游戏',
          onPress: () => {
            // 这里可以跳转到游戏页面
            // 模拟游戏完成奖励
            setTimeout(() => {
              const newPoints = userPoints.balance + task.points;
              setUserPoints(prev => ({
                ...prev,
                balance: newPoints,
                totalEarned: prev.totalEarned + task.points,
                todayEarned: prev.todayEarned + task.points,
              }));

              Alert.alert(
                '🎉 游戏完成！',
                `恭喜您获得 ${task.points.toLocaleString()} 积分！`
              );
            }, 3000);
          },
        },
      ]
    );
  };

  // 每日奖励
  const handleDailyReward = async (task: EarningTask) => {
    const newPoints = userPoints.balance + task.points;
    setUserPoints(prev => ({
      ...prev,
      balance: newPoints,
      totalEarned: prev.totalEarned + task.points,
      todayEarned: prev.todayEarned + task.points,
    }));

    Alert.alert(
      '🎁 每日奖励！',
      `恭喜您获得 ${task.points.toLocaleString()} 积分！\n明天记得继续领取哦~`
    );

    // 设置任务为不可用（今天已领取）
    setEarningTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, available: false } : t
      )
    );
  };

  // 邀请好友
  const handleInviteFriend = async (task: EarningTask) => {
    Alert.alert(
      '👥 邀请好友',
      '分享邀请码给好友，好友注册成功后您将获得丰厚奖励！',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '分享邀请码',
          onPress: () => {
            // 这里可以调用分享功能
            Alert.alert('邀请码', 'JFB2024', [
              { text: '复制', onPress: () => {} },
              { text: '分享', onPress: () => {} },
            ]);
          },
        },
      ]
    );
  };

  // 浮动装饰元素的动画样式
  const floatingStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* 顶部横幅 */}
      <LinearGradient
        colors={['#4dd0e1', '#26c6da', '#00acc1']}
        style={styles.heroBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>积分宝</Text>
            <Text style={styles.heroSubtitle}>Start earning easily</Text>
          </View>
          
          <Animated.View style={[styles.coinIcon, floatingStyle]}>
            <Text style={styles.coinEmoji}>💰</Text>
          </Animated.View>
        </View>
        
        <View style={styles.decorativeCircles}>
          <View style={[styles.circle, { animationDelay: 0 }]} />
          <View style={[styles.circle, { animationDelay: 200 }]} />
          <View style={[styles.circle, { animationDelay: 400 }]} />
        </View>
      </LinearGradient>

      {/* 积分卡片 */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsHeader}>
          <Text style={styles.pointsTitle}>我的积分</Text>
          <Text style={styles.memberLevel}>{userPoints.level}会员</Text>
        </View>
        
        <Text style={styles.pointsBalance}>
          {userPoints.balance.toLocaleString()}
        </Text>
        
        <View style={styles.pointsStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>累计收益</Text>
            <Text style={styles.statValue}>
              {userPoints.totalEarned.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>今日收益</Text>
            <Text style={styles.statValue}>
              {userPoints.todayEarned.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* 赚钱任务列表 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>赚钱任务</Text>
        <Text style={styles.sectionSubtitle}>完成任务获得积分奖励</Text>
      </View>

      <View style={styles.tasksList}>
        {earningTasks.map((task, index) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskCard,
              !task.available && styles.taskCardDisabled,
            ]}
            onPress={() => handleTaskPress(task)}
            activeOpacity={0.8}
          >
            <View style={[styles.taskIcon, { backgroundColor: task.color }]}>
              <Icon name={task.icon} size={24} color="#fff" />
            </View>
            
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </View>
            
            <View style={styles.taskReward}>
              <Text style={styles.taskPoints}>
                +{task.points.toLocaleString()}
              </Text>
              <Text style={styles.taskPointsLabel}>积分</Text>
            </View>
            
            <Icon
              name="chevron-right"
              size={24}
              color={task.available ? '#ccc' : '#999'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* 主要行动按钮 */}
      <TouchableOpacity
        style={styles.mainCTA}
        onPress={() => Alert.alert('开始赚钱', '选择上面的任务开始赚取积分！')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#ff7043', '#f4511e']}
          style={styles.ctaGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.ctaText}>🚀 点击开始赚钱</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 联系方式 */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>联系我们了解更多</Text>
        
        <TouchableOpacity style={styles.contactItem}>
          <View style={styles.contactLeft}>
            <View style={[styles.contactIcon, { backgroundColor: '#25d366' }]}>
              <Icon name="chat" size={20} color="#fff" />
            </View>
            <Text style={styles.contactName}>WhatsApp 服务</Text>
          </View>
          <View style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>联系 ▶</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactItem}>
          <View style={styles.contactLeft}>
            <View style={[styles.contactIcon, { backgroundColor: '#0088cc' }]}>
              <Icon name="send" size={20} color="#fff" />
            </View>
            <Text style={styles.contactName}>Telegram 频道</Text>
          </View>
          <View style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>联系 ▶</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 底部间距 (适应悬浮导航栏) */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  heroBanner: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  coinIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinEmoji: {
    fontSize: 30,
  },
  decorativeCircles: {
    position: 'absolute',
    top: 30,
    left: 200,
    flexDirection: 'row',
    gap: 5,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  pointsCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  memberLevel: {
    backgroundColor: '#ff9800',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  pointsBalance: {
    fontSize: 36,
    fontWeight: '900',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  pointsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
    marginHorizontal: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  tasksList: {
    paddingHorizontal: 20,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  taskCardDisabled: {
    opacity: 0.6,
  },
  taskIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#999',
  },
  taskReward: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  taskPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4caf50',
  },
  taskPointsLabel: {
    fontSize: 12,
    color: '#999',
  },
  mainCTA: {
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#ff7043',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  contactSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  contactTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
  },
  contactItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactBtn: {
    backgroundColor: '#00bcd4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contactBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
});

export default HomeScreen;

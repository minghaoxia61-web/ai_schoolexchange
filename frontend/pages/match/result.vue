<template>
  <view class="container">
    <!-- 🔙 顶部导航 -->
    <view class="header">
      <text class="back-btn" @click="goBack">←</text>
      <text class="title">匹配结果</text>
      <view class="placeholder"></view>
    </view>

    <!-- 📋 匹配结果列表 -->
    <view class="match-list" v-if="matches && matches.length > 0">
      <view 
        class="match-card" 
        v-for="(match, index) in matches" 
        :key="index"
      >
        <!-- 🖼️ 物品图片 -->
        <view class="image-container">
          <image 
            class="item-image" 
            :src="getItemImage(match)" 
            mode="aspectFill"
          ></image>
        </view>

        <!-- 📝 物品信息 -->
        <view class="item-info">
          <!-- 🎯 标题 -->
          <view class="item-title">
            <text>{{ match.title || '物品标题' }}</text>
          </view>

          <!-- 📄 描述 -->
          <view class="item-description">
            <text>{{ match.description || '物品描述' }}</text>
          </view>

          <!-- 💰 交易方式 -->
          <view class="item-trade">
            <text class="label">交易方式：</text>
            <text class="value">{{ getTradeMethodText(match.tradeMethod) }}</text>
          </view>

          <!-- 📞 联系方式 -->
          <view class="item-contact" v-if="match.contact">
            <text class="label">联系方式：</text>
            <text class="value">{{ match.contact }}</text>
          </view>

          <!-- 📊 匹配分数 -->
          <view class="item-score">
            <text class="label">匹配分数：</text>
            <text class="value">{{ getMatchScore(match) }}</text>
          </view>

          <!-- 🔘 操作按钮 -->
          <view class="action-buttons">
            <button class="btn accept" @click="acceptMatch(match)">
              接受匹配
            </button>
            <button class="btn reject" @click="rejectMatch(match)">
              拒绝
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- ❌ 空状态 -->
    <view class="empty" v-if="!matches || matches.length === 0">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">暂无匹配结果</text>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      cycleId: '',
      matches: []
    }
  },

  onLoad(options) {
    // 解析传入的参数
    if (options.cycleId && options.matches) {
      this.cycleId = options.cycleId
      try {
        this.matches = JSON.parse(decodeURIComponent(options.matches))
      } catch (error) {
        console.error('解析匹配数据失败:', error)
        uni.showToast({
          title: '数据解析失败',
          icon: 'none'
        })
      }
    }
  },

  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },

    // 获取物品图片
    getItemImage(match) {
      if (match.images && match.images.length > 0) {
        return match.images[0]
      }
      // 默认图片
      return '/static/avatar.png'
    },

    // 获取交易方式文本
    getTradeMethodText(method) {
      switch (method) {
        case 'money':
          return '💰 金钱交易'
        case 'exchange':
          return '🔄 物品互换'
        case 'both':
          return '🤝 均可'
        default:
          return method || '未知'
      }
    },

    // 获取匹配分数
    getMatchScore(match) {
      if (match.matchScore !== undefined) {
        return (match.matchScore * 100).toFixed(0) + '%'
      }
      if (match.successProbability !== undefined) {
        return (match.successProbability * 100).toFixed(0) + '%'
      }
      return '0%'
    },

    // 接受匹配
    acceptMatch(match) {
      uni.showModal({
        title: '匹配成功！',
        content: `请联系对方：${match.contact || '暂无联系方式'}`,
        showCancel: false,
        success: () => {
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 500)
        }
      })
    },

    // 拒绝匹配
    rejectMatch(match) {
      uni.showToast({
        title: '已拒绝',
        icon: 'success'
      })
      // 从列表中移除
      const index = this.matches.indexOf(match)
      if (index > -1) {
        this.matches.splice(index, 1)
      }
      // 如果没有匹配结果了，返回首页
      if (this.matches.length === 0) {
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1000)
      }
    }
  }
}
</script>

<style>
.container {
  background: #F5EFE6;
  min-height: 100vh;
  padding-bottom: 30rpx;
}

/* 🔙 顶部导航 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #8B2E2E;
  color: white;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
}

.back-btn {
  font-size: 40rpx;
  font-weight: bold;
  cursor: pointer;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.placeholder {
  width: 40rpx;
}

/* 📋 匹配结果列表 */
.match-list {
  padding: 0 20rpx;
}

/* 🃏 匹配卡片 */
.match-card {
  background: white;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 🖼️ 图片容器 */
.image-container {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
}

.item-image {
  width: 100%;
  height: 100%;
}

/* 📝 物品信息 */
.item-info {
  padding: 20rpx;
}

/* 🎯 标题 */
.item-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

/* 📄 描述 */
.item-description {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15rpx;
}

/* 💰 交易方式 */
.item-trade {
  display: flex;
  margin-bottom: 10rpx;
  font-size: 24rpx;
}

/* 📞 联系方式 */
.item-contact {
  display: flex;
  margin-bottom: 10rpx;
  font-size: 24rpx;
}

/* 📊 匹配分数 */
.item-score {
  display: flex;
  margin-bottom: 20rpx;
  font-size: 24rpx;
}

.label {
  color: #8B2E2E;
  font-weight: bold;
  margin-right: 10rpx;
}

.value {
  color: #333;
  flex: 1;
}

/* 🔘 操作按钮 */
.action-buttons {
  display: flex;
  gap: 15rpx;
}

.btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}

.accept {
  background: #1890ff;
  color: white;
}

.reject {
  background: #f0f0f0;
  color: #333;
}

/* ❌ 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  text-align: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  color: #999;
  font-size: 30rpx;
}
</style>
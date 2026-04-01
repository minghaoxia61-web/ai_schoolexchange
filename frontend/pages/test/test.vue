<template>
  <view class="test-container">
    <view class="section">
      <text class="section-title">测试 publish 云函数</text>
      <button @click="testPublish">测试发布物品</button>
    </view>
    
    <view class="section">
      <text class="section-title">测试 posts 云函数</text>
      <button @click="testPosts">测试获取物品列表</button>
    </view>
    
    <view class="section">
      <text class="section-title">测试 match 云函数</text>
      <button @click="testMatch">测试匹配算法</button>
    </view>
    
    <view class="section">
      <text class="section-title">测试 respond 云函数</text>
      <button @click="testRespond">测试匹配响应</button>
    </view>
    
    <view class="result">
      <text class="result-title">测试结果：</text>
      <text class="result-content">{{ result }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      result: ''
    }
  },
  methods: {
    async testPublish() {
      try {
        const res = await uniCloud.callFunction({
          name: 'publish',
          data: {
            userId: 'U001',
            type: 'item',
            title: '测试物品',
            description: '测试描述',
            tradeMethod: 'money',
            price: '100',
            contact: '13800138000'
          }
        })
        this.result = JSON.stringify(res.result, null, 2)
      } catch (error) {
        this.result = '测试失败: ' + error.message
      }
    },
    async testPosts() {
      try {
        const res = await uniCloud.callFunction({
          name: 'posts',
          data: {
            page: 1,
            pageSize: 10,
            type: 'all',
            keyword: ''
          }
        })
        this.result = JSON.stringify(res.result, null, 2)
      } catch (error) {
        this.result = '测试失败: ' + error.message
      }
    },
    async testMatch() {
      try {
        const res = await uniCloud.callFunction({
          name: 'match',
          data: {
            userId: 'U001'
          }
        })
        this.result = JSON.stringify(res.result, null, 2)
      } catch (error) {
        this.result = '测试失败: ' + error.message
      }
    },
    async testRespond() {
      try {
        const res = await uniCloud.callFunction({
          name: 'respond',
          data: {
            userId: 'U001',
            matchId: 'match_1711939200000_abc123',
            action: 'accept'
          }
        })
        this.result = JSON.stringify(res.result, null, 2)
      } catch (error) {
        this.result = '测试失败: ' + error.message
      }
    }
  }
}
</script>

<style>
.test-container {
  padding: 20rpx;
}

.section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

button {
  margin-bottom: 10rpx;
}

.result {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
}

.result-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.result-content {
  font-size: 24rpx;
  white-space: pre-wrap;
}
</style>

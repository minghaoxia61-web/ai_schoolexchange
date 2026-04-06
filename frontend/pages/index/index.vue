<template>
  <view class="container">

    <!-- 🔍 搜索栏 -->
    <view class="search-box">
      <input 
        v-model="keyword" 
        placeholder="搜索你感兴趣的需求..."
        @input="handleSearch"
      />
    </view>

    <!-- 🧾 卡片列表 -->
    <view 
      class="card" 
      v-for="item in filterList" 
      :key="item.postId"
    >
      
      <!-- 👤 头像 + 昵称 -->
      <view class="user">
        <image class="avatar" :src="item.avatar || '/static/avatar.png'"></image>
        <text class="name">{{ item.userName || '匿名用户' }}</text>
      </view>

      <!-- 🎯 需求 -->
      <view class="section">
        <text class="label">标题：</text>
        <text>{{ item.title }}</text>
      </view>

      <!-- 🎁 提供 -->
      <view class="section">
        <text class="label">描述：</text>
        <text>{{ item.description }}</text>
      </view>

      <!-- 💰 交易方式 -->
      <view class="section">
        <text class="label">交易方式：</text>
        <text>{{ getTradeMethodText(item.tradeMethod) }}</text>
      </view>

      <!-- 💵 价格 -->
      <view class="section" v-if="item.price">
        <text class="label">价格：</text>
        <text class="price">¥{{ item.price }}</text>
      </view>

    </view>

    <!-- 加载中 -->
    <view class="loading" v-if="isLoading">
      <text>加载中...</text>
    </view>

    <!-- 没有更多 -->
    <view class="no-more" v-if="!hasMore && filterList.length > 0">
      <text>没有更多了</text>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-if="filterList.length === 0 && !isLoading">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无数据</text>
    </view>

    <!-- ✨ 匹配按钮 -->
    <button class="match-btn" @click="match">
      ✨ 一键匹配
    </button>

  </view>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      list: [],
      isLoading: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 20
    }
  },

  computed: {
    // 🔍 搜索过滤
    filterList() {
      if (!this.keyword) return this.list

      return this.list.filter(item =>
        item.title.includes(this.keyword) ||
        item.description.includes(this.keyword) ||
        (item.userName && item.userName.includes(this.keyword))
      )
    }
  },

  onLoad() {
    // 加载物品列表
    this.loadPosts()
  },

  methods: {
    // 加载物品列表
    async loadPosts() {
      // 如果正在加载或没有更多数据，直接返回
      if (this.isLoading || !this.hasMore) {
        return
      }

      try {
        // 设置加载状态
        this.isLoading = true

        // 调用云函数获取物品列表
        const res = await uniCloud.callFunction({
          name: 'posts',
          data: {
            page: this.currentPage,
            pageSize: this.pageSize,
            type: 'all',
            keyword: ''
          }
        })

        // 处理返回结果
        if (res.result.code === 200) {
          const data = res.result.data
          
          // 将云函数返回的数据映射到当前的数据结构
          const posts = data.list.map(item => ({
            postId: item.postId,
            name: item.userName || '匿名用户',
            avatar: '/static/avatar.png',
            title: item.title,
            description: item.description,
            tradeMethod: item.tradeMethod,
            price: item.price,
            exchangeItems: item.exchangeItems,
            userName: item.userName,
            createdAt: item.createdAt
          }))
          
          // 追加数据
          this.list = [...this.list, ...posts]
          
          // 判断是否还有更多数据
          this.hasMore = this.list.length < data.total
          
          // 页码加1
          this.currentPage++
        } else {
          uni.showToast({
            title: res.result.message || '获取数据失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取物品列表失败:', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      } finally {
        // 取消加载状态
        this.isLoading = false
      }
    },

    // 搜索处理
    handleSearch() {
      // 搜索时重新加载数据
      this.list = []
      this.currentPage = 1
      this.hasMore = true
      this.loadPosts()
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
          return ''
      }
    },

    // 匹配
    async match() {
      try {
        // 获取用户ID
        const userId = uni.getStorageSync('userId')
        if (!userId) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        uni.showLoading({
          title: '匹配中...',
          mask: true
        })

        // 1. 获取用户的第一个发布物品
        const userPostsRes = await uniCloud.callFunction({
          name: 'posts',
          data: {
            userId: userId,
            page: 1,
            pageSize: 10,
            type: 'all',
            keyword: ''
          }
        })

        let userPosts = []
        if (userPostsRes.result.code === 200) {
          userPosts = userPostsRes.result.data.list
        }

        if (!userPosts || userPosts.length === 0) {
          uni.hideLoading()
          uni.showToast({
            title: '请先发布物品',
            icon: 'none'
          })
          return
        }

        // 获取第一个发布的物品ID
        const firstPostId = userPosts[0].postId

        // 2. 调用匹配API
        const res = await uniCloud.callFunction({
          name: 'match',
          data: {
            userId: userId,
            postId: firstPostId
          }
        })

        uni.hideLoading()

        if (res.result.code === 200) {
          const matches = res.result.data.matches
          if (matches && matches.length > 0) {
            // 3. 跳转到匹配结果页面
            uni.navigateTo({
              url: `/pages/match/result?cycleId=${matches[0].matchId}&matches=${encodeURIComponent(JSON.stringify(matches))}`
            })
          } else {
            uni.showToast({
              title: '暂无匹配结果',
              icon: 'none'
            })
          }
        } else {
          uni.showToast({
            title: res.result.message || '匹配失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('匹配失败:', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style>
.container {
  background: #F5EFE6;
  min-height: 100vh;
  padding: 20rpx;
}

/* 🔍 搜索 */
.search-box {
  background: #fff;
  padding: 15rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.search-box input {
  font-size: 28rpx;
}

/* 🧾 卡片 */
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

/* 👤 用户 */
.user {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  margin-right: 15rpx;
}

.name {
  font-weight: bold;
  color: #8B2E2E;
}

/* 📌 内容 */
.section {
  margin-top: 10rpx;
}

.label {
  color: #8B2E2E;
  font-weight: bold;
}

.price {
  color: #ff6b6b;
  font-weight: bold;
}

/* 加载中 */
.loading,
.no-more,
.empty {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  color: #999;
}

/* ✨ 按钮 */
.match-btn {
  margin-top: 30rpx;
  background: #8B2E2E;
  color: white;
  border-radius: 50rpx;
}
</style>
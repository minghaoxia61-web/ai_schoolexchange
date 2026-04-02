<template>
  <view class="container">

    <!-- 👤 用户信息 -->
    <view class="profile">
      <image class="avatar" src="/static/avatar.png"></image>
      <view class="name">
        {{ isLogin ? username : '未登录' }}
      </view>

      <button class="login-btn" @click="login">
        {{ isLogin ? '退出登录' : '点击登录' }}
      </button>
    </view>

    <!-- 📦 我的需求 -->
    <view class="box">
      <view class="title">我的需求</view>

      <view 
        class="item" 
        v-for="(item,index) in myList" 
        :key="index"
      >
        <view class="text">
          {{ item.need }}（提供：{{ item.offer }}）
        </view>

        <view class="actions">
          <text @click="edit(index)">编辑</text>
          <text @click="remove(index)">删除</text>
        </view>
      </view>


    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      isLogin: false,
      username: '',
      myList: [
        { need: '拍照', offer: '修图' }
      ]
    }
  },

  // ✅ 每次进入页面都会检测登录状态
  onShow() {
    const user = uni.getStorageSync('user')

    if (user) {
      this.isLogin = true
      this.username = user
    } else {
      this.isLogin = false
      this.username = ''
    }
  },

  methods: {

    // 🔐 登录/退出
    login() {
      if (!this.isLogin) {
        uni.navigateTo({
          url: '/pages/login/login'
        })
      } else {
        this.isLogin = false
        this.username = ''
        uni.removeStorageSync('user')

        uni.showToast({
          title: '已退出登录',
          icon: 'none'
        })
      }
    },

    // ➕ 添加
    add() {
      if (!this.isLogin) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

    },

    // ❌ 删除
    remove(index) {
      this.myList.splice(index, 1)
    },

    // ✏️ 编辑
    edit(index) {
      const item = this.myList[index]

      uni.showModal({
        title: '修改需求',
        editable: true,
        placeholderText: item.need,
        success: (res) => {
          if (res.confirm && res.content) {
            item.need = res.content
          }
        }
      })
    }

  }
}
</script>

<style>
.container {
  padding: 20rpx;
  background: #F4F8FF;
  min-height: 100vh;
}

/* 👤 用户 */
.profile {
  text-align: center;
  margin-bottom: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #AFCBFF;
}

.name {
  margin-top: 10rpx;
  font-size: 30rpx;
  color: #6C8EF5;
}

.login-btn {
  margin-top: 10rpx;
  background: #6C8EF5;
  color: white;
  border-radius: 40rpx;
}

/* 📦 卡片 */
.box {
  background: #fff;
  padding: 20rpx;
  border-radius: 30rpx;
}

.title {
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #6C8EF5;
}

/* 每一项 */
.item {
  padding: 15rpx;
  border-bottom: 1px solid #eee;
}

.text {
  color: #3A4A6B;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  color: #6C8EF5;
}

/* 添加按钮 */
.add-btn {
  margin-top: 20rpx;
  background: linear-gradient(135deg, #6C8EF5, #AFCBFF);
  color: white;
  border-radius: 50rpx;
}
</style>
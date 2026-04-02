<template>
  <view>

    <view class="item" @click="goAssistant">
      🔔 系统助手
    </view>

    <view 
      class="item"
      v-for="room in rooms" 
      :key="room.id"
      @click="goRoom(room.id)"
    >
      群聊：{{ room.id }}
    </view>

  </view>
</template>

<script>
import { getChatRooms, createCycle } from '@/utils/chat.js'

export default {
  data() {
    return {
      userId: "U1",
      rooms: [],
      created: false
    }
  },
  onShow() {

    // 🔥只创建一次测试闭环（单人自动成功）
    if (!this.created) {
      createCycle({
        id: "cycle_test",
        users: ["U1"],
        path: "U1 → U1"
      })
      this.created = true
    }

    this.rooms = getChatRooms(this.userId)
  },
  methods: {
    goAssistant() {
      uni.navigateTo({
        url: "/pages/chat/assistant"
      })
    },
    goRoom(id) {
      uni.navigateTo({
        url: `/pages/chat/room?id=${id}`
      })
    }
  }
}
</script>

<style>
.item {
  padding: 20rpx;
  border-bottom: 1px solid #ddd;
}
</style>
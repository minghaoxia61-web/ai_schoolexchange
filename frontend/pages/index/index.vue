<template>
	<view class="index-container">
		<view class="search-bar">
			<view class="search-input">
				<text class="search-icon">🔍</text>
				<input 
					class="input" 
					v-model="searchKeyword" 
					placeholder="搜索闲置物品或技能服务"
					confirm-type="search"
					@confirm="handleSearch"
				/>
			</view>
		</view>

		<view class="category-tabs">
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'all' }"
				@click="switchTab('all')"
			>
				<text class="text">全部</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'item' }"
				@click="switchTab('item')"
			>
				<text class="text">闲置物品</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'skill' }"
				@click="switchTab('skill')"
			>
				<text class="text">技能服务</text>
			</view>
		</view>

		<scroll-view class="scroll-view" scroll-y="true" @scrolltolower="loadMore">
			<view class="item-list">
				<view 
					class="item-card" 
					v-for="item in filteredList" 
					:key="item.id"
					@click="viewDetail(item)"
				>
					<image class="item-image" :src="item.image" mode="aspectFill"></image>
					<view class="item-info">
						<text class="item-title">{{ item.title }}</text>
						<view class="item-tags">
							<text class="item-type">{{ item.type === 'item' ? '闲置物品' : '技能服务' }}</text>
							<text class="trade-method" :class="'method-' + item.tradeMethod">
								{{ getTradeMethodText(item.tradeMethod) }}
							</text>
						</view>
						<view class="item-price-section">
							<text class="item-price" v-if="item.tradeMethod === 'money' || item.tradeMethod === 'both'">
								¥{{ item.price }}
							</text>
							<text class="exchange-items" v-if="item.tradeMethod === 'exchange' || (item.tradeMethod === 'both' && item.exchangeItems)">
								🔄 {{ item.exchangeItems }}
							</text>
						</view>
						<text class="item-time">{{ item.time }}</text>
					</view>
				</view>
			</view>

			<view class="loading-more" v-if="isLoading">
				<text class="loading-text">加载中...</text>
			</view>

			<view class="no-more" v-if="!hasMore && filteredList.length > 0">
				<text class="no-more-text">没有更多了</text>
			</view>

			<view class="empty" v-if="filteredList.length === 0 && !isLoading">
				<text class="empty-icon">📭</text>
				<text class="empty-text">暂无数据</text>
			</view>
		</scroll-view>

		<!-- 云函数测试区域 -->
		<view class="test-section">
			<text class="test-title">云函数测试</text>
			<view class="test-buttons">
				<button class="test-btn" @click="testPublish">测试发布物品</button>
				<button class="test-btn" @click="testPosts">测试获取物品列表</button>
				<button class="test-btn" @click="testMatch">测试匹配算法</button>
				<button class="test-btn" @click="testRespond">测试匹配响应</button>
			</view>
			<view class="test-result" v-if="result">
				<text class="result-title">测试结果：</text>
				<text class="result-content">{{ result }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchKeyword = ref('')
const currentTab = ref('all')
const isLoading = ref(false)
const hasMore = ref(true)
const result = ref('')

const itemList = ref([
	{
		id: 1,
		title: '二手笔记本电脑',
		type: 'item',
		tradeMethod: 'money',
		price: '2500',
		exchangeItems: '',
		image: '/static/logo.png',
		time: '10分钟前'
	},
	{
		id: 2,
		title: '英语口语陪练',
		type: 'skill',
		tradeMethod: 'money',
		price: '50/小时',
		exchangeItems: '',
		image: '/static/logo.png',
		time: '30分钟前'
	},
	{
		id: 3,
		title: '吉他教学',
		type: 'skill',
		tradeMethod: 'exchange',
		price: '',
		exchangeItems: '二手书籍、学习用品',
		image: '/static/logo.png',
		time: '1小时前'
	},
	{
		id: 4,
		title: '闲置自行车',
		type: 'item',
		tradeMethod: 'both',
		price: '300',
		exchangeItems: '滑板、运动装备',
		image: '/static/logo.png',
		time: '2小时前'
	},
	{
		id: 5,
		title: '考研数学辅导',
		type: 'skill',
		tradeMethod: 'exchange',
		price: '',
		exchangeItems: '英语笔记、专业书籍',
		image: '/static/logo.png',
		time: '3小时前'
	},
	{
		id: 6,
		title: '二手书籍',
		type: 'item',
		tradeMethod: 'both',
		price: '20',
		exchangeItems: '',
		image: '/static/logo.png',
		time: '5小时前'
	}
])

const filteredList = computed(() => {
	let result = itemList.value

	if (currentTab.value !== 'all') {
		result = result.filter(item => item.type === currentTab.value)
	}

	if (searchKeyword.value) {
		const keyword = searchKeyword.value.toLowerCase()
		result = result.filter(item => 
			item.title.toLowerCase().includes(keyword)
		)
	}

	return result
})

const switchTab = (tab) => {
	currentTab.value = tab
}

const handleSearch = () => {
	console.log('搜索:', searchKeyword.value)
}

const getTradeMethodText = (method) => {
	switch (method) {
		case 'money':
			return '💰 金钱'
		case 'exchange':
			return '🔄 互换'
		case 'both':
			return '🤝 均可'
		default:
			return ''
	}
}

const viewDetail = (item) => {
	uni.showToast({
		title: '查看详情: ' + item.title,
		icon: 'none'
	})
}

const loadMore = () => {
	if (isLoading.value || !hasMore.value) return

	isLoading.value = true

	setTimeout(() => {
		isLoading.value = false
		hasMore.value = false
	}, 1000)
}

// 测试云函数
const testPublish = async () => {
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
		result.value = JSON.stringify(res.result, null, 2)
	} catch (error) {
		result.value = '测试失败: ' + error.message
	}
}

const testPosts = async () => {
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
		result.value = JSON.stringify(res.result, null, 2)
	} catch (error) {
		result.value = '测试失败: ' + error.message
	}
}

const testMatch = async () => {
	try {
		const res = await uniCloud.callFunction({
			name: 'match',
			data: {
				userId: 'U001'
			}
		})
		result.value = JSON.stringify(res.result, null, 2)
	} catch (error) {
		result.value = '测试失败: ' + error.message
	}
}

const testRespond = async () => {
	try {
		const res = await uniCloud.callFunction({
			name: 'respond',
			data: {
				userId: 'U001',
				matchId: 'match_1711939200000_abc123',
				action: 'accept'
			}
		})
		result.value = JSON.stringify(res.result, null, 2)
	} catch (error) {
		result.value = '测试失败: ' + error.message
	}
}
</script>

<style scoped>
.index-container {
	min-height: 100vh;
	background: #f5f5f5;
}

.search-bar {
	background: #667eea;
	padding: 20rpx 30rpx;
	padding-top: 0;
}

.search-input {
	display: flex;
	align-items: center;
	background: #ffffff;
	border-radius: 50rpx;
	padding: 20rpx 30rpx;
}

.search-icon {
	font-size: 36rpx;
	margin-right: 15rpx;
}

.input {
	flex: 1;
	font-size: 28rpx;
}

.category-tabs {
	display: flex;
	background: #ffffff;
	padding: 20rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 15rpx 0;
	position: relative;
}

.tab-item .text {
	font-size: 28rpx;
	color: #666;
}

.tab-item.active .text {
	color: #667eea;
	font-weight: bold;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 60rpx;
	height: 4rpx;
	background: #667eea;
	border-radius: 2rpx;
}

.scroll-view {
	height: calc(100vh - 180rpx);
}

.item-list {
	padding: 20rpx 30rpx;
}

.item-card {
	display: flex;
	background: #ffffff;
	border-radius: 15rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.item-image {
	width: 180rpx;
	height: 180rpx;
	border-radius: 10rpx;
	margin-right: 20rpx;
}

.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.item-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.item-tags {
	display: flex;
	gap: 10rpx;
	margin-bottom: 10rpx;
}

.item-type {
	font-size: 22rpx;
	color: #667eea;
	background: #f0f3ff;
	padding: 4rpx 12rpx;
	border-radius: 5rpx;
}

.trade-method {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 5rpx;
}

.trade-method.method-money {
	color: #52c41a;
	background: #f6ffed;
}

.trade-method.method-exchange {
	color: #fa8c16;
	background: #fff7e6;
}

.trade-method.method-both {
	color: #722ed1;
	background: #f9f0ff;
}

.item-price-section {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	margin-bottom: 8rpx;
}

.item-price {
	font-size: 36rpx;
	font-weight: bold;
	color: #ff6b6b;
}

.exchange-items {
	font-size: 26rpx;
	color: #fa8c16;
	background: #fff7e6;
	padding: 8rpx 12rpx;
	border-radius: 8rpx;
	align-self: flex-start;
}

.item-time {
	font-size: 22rpx;
	color: #999;
}

.loading-more,
.no-more,
.empty {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
}

.loading-text,
.no-more-text,
.empty-text {
	font-size: 28rpx;
	color: #999;
}

.empty-icon {
	font-size: 80rpx;
	margin-right: 20rpx;
}

.empty {
	flex-direction: column;
	gap: 20rpx;
}

/* 云函数测试区域样式 */
.test-section {
	background: #ffffff;
	margin: 20rpx 30rpx;
	padding: 30rpx;
	border-radius: 15rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.test-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.test-buttons {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
	margin-bottom: 20rpx;
}

.test-btn {
	width: 100%;
	height: 80rpx;
	font-size: 28rpx;
	border-radius: 10rpx;
}

.test-result {
	background: #f5f5f5;
	padding: 20rpx;
	border-radius: 10rpx;
	margin-top: 20rpx;
}

.result-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	display: block;
}

.result-content {
	font-size: 24rpx;
	color: #666;
	white-space: pre-wrap;
	line-height: 1.5;
}
</style>

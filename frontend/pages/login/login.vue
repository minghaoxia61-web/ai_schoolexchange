<template>
	<view class="login-container">
		<view class="login-box">
			<view class="logo-section">
				<image class="logo" src="/static/logo.png"></image>
				<text class="app-name">校园交易</text>
			</view>
			
			<view class="form-section">
				<view class="input-group">
					<text class="icon">📱</text>
					<input 
						class="input" 
						type="number" 
						v-model="phone" 
						placeholder="请输入手机号" 
						maxlength="11"
					/>
				</view>
				
				<view class="input-group">
					<text class="icon">🔒</text>
					<input 
						class="input" 
						:type="showPassword ? 'text' : 'password'" 
						v-model="password" 
						placeholder="请输入密码"
					/>
					<text class="toggle-password" @click="togglePassword">
						{{ showPassword ? '👁️' : '👁️‍🗨️' }}
					</text>
				</view>
				
				<view class="options">
					<view class="remember-me" @click="toggleRemember">
						<text class="checkbox">{{ rememberMe ? '☑️' : '⬜' }}</text>
						<text class="label">记住密码</text>
					</view>
					<text class="forget-password" @click="forgetPassword">忘记密码?</text>
				</view>
				
				<button class="login-btn" @click="handleLogin" :disabled="isLoading">
					{{ isLoading ? '登录中...' : '登录' }}
				</button>
				
				<view class="register-link">
					<text class="text">还没有账号?</text>
					<text class="link" @click="goToRegister">立即注册</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			phone: '',
			password: '',
			showPassword: false,
			rememberMe: false,
			isLoading: false
		}
	},
	onLoad() {
		this.loadSavedCredentials()
	},
	methods: {
		// 切换密码显示状态
		togglePassword() {
			this.showPassword = !this.showPassword
		},
		
		// 切换记住密码状态
		toggleRemember() {
			this.rememberMe = !this.rememberMe
		},
		
		// 处理登录
		async handleLogin() {
			// 验证表单
			if (!this.validateForm()) {
				return
			}
			
			// 如果正在登录，直接返回
			if (this.isLoading) {
				return
			}
			
			try {
				// 设置登录状态
				this.isLoading = true
				
				// 显示加载提示
				uni.showLoading({
					title: '登录中...',
					mask: true
				})
				
				// 调用云函数进行登录
				const res = await uniCloud.callFunction({
					name: 'uni-id-cf',
					data: {
						action: 'login',
						params: {
							username: this.phone,
							password: this.password
						}
					}
				})
				
				// 隐藏加载提示
				uni.hideLoading()
				
				// 处理返回结果
				if (res.result.code === 0) {
					// 登录成功，保存用户信息到本地存储
					
					// 保存 userId
					// 保存 userId - 优先使用 uid，其次 username，最后 phone
					const userId = res.result.uid || res.result.username || this.phone
					uni.setStorageSync('userId', userId)
					console.log('保存的 userId:', userId)

					
					// 保存完整的用户信息
					const userInfo = {
						uid: res.result.uid,
						username: res.result.username || this.phone,
						phone: this.phone,
						token: res.result.token,
						// 保存其他返回的用户信息
						...res.result.userInfo
					}
					uni.setStorageSync('userInfo', userInfo)
					
					// 显示登录成功提示
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 1500
					})
					
					// 处理记住密码
					if (this.rememberMe) {
						this.saveCredentials()
					} else {
						this.clearCredentials()
					}
					
					// 1.5秒后跳转到首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 1500)
				} else {
					// 登录失败，显示错误信息
					uni.showToast({
						title: res.result.msg || '登录失败',
						icon: 'none',
						duration: 2000
					})
				}
			} catch (error) {
				// 隐藏加载提示
				uni.hideLoading()
				
				console.error('登录失败:', error)
				
				// 显示网络错误提示
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none',
					duration: 2000
				})
			} finally {
				// 取消登录状态
				this.isLoading = false
			}
		},
		
		// 验证表单
		validateForm() {
			// 验证手机号是否为空
			if (!this.phone || this.phone.trim() === '') {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				})
				return false
			}
			
			// 验证手机号格式
			if (!/^1[3-9]\d{9}$/.test(this.phone)) {
				uni.showToast({
					title: '手机号格式不正确',
					icon: 'none'
				})
				return false
			}
			
			// 验证密码是否为空
			if (!this.password || this.password.trim() === '') {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				})
				return false
			}
			
			// 验证密码长度
			if (this.password.length < 6) {
				uni.showToast({
					title: '密码长度不能少于6位',
					icon: 'none'
				})
				return false
			}
			
			return true
		},
		
		// 保存登录凭据
		saveCredentials() {
			uni.setStorageSync('savedPhone', this.phone)
			uni.setStorageSync('savedPassword', this.password)
			uni.setStorageSync('rememberMe', true)
		},
		
		// 加载保存的登录凭据
		loadSavedCredentials() {
			const rememberMe = uni.getStorageSync('rememberMe')
			if (rememberMe) {
				this.phone = uni.getStorageSync('savedPhone') || ''
				this.password = uni.getStorageSync('savedPassword') || ''
				this.rememberMe = true
			}
		},
		
		// 清除登录凭据
		clearCredentials() {
			uni.removeStorageSync('savedPhone')
			uni.removeStorageSync('savedPassword')
			uni.setStorageSync('rememberMe', false)
		},
		
		// 忘记密码
		forgetPassword() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		},
		
		// 跳转到注册页面
		goToRegister() {
			uni.navigateTo({
				url: '/pages/register/register'
			})
		}
	}
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 100rpx 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.login-box {
	width: 100%;
	background: #ffffff;
	border-radius: 30rpx;
	padding: 80rpx 60rpx;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
}

.logo-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 80rpx;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	margin-bottom: 30rpx;
}

.app-name {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
}

.form-section {
	width: 100%;
}

.input-group {
	display: flex;
	align-items: center;
	background: #f5f5f5;
	border-radius: 15rpx;
	padding: 25rpx 30rpx;
	margin-bottom: 30rpx;
	position: relative;
}

.icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.input {
	flex: 1;
	font-size: 32rpx;
	color: #333;
}

.toggle-password {
	font-size: 40rpx;
	padding: 10rpx;
}

.options {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 50rpx;
}

.remember-me {
	display: flex;
	align-items: center;
}

.checkbox {
	font-size: 32rpx;
	margin-right: 10rpx;
}

.label {
	font-size: 28rpx;
	color: #666;
}

.forget-password {
	font-size: 28rpx;
	color: #667eea;
}

.login-btn {
	width: 100%;
	height: 90rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 45rpx;
	font-size: 36rpx;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
	border: none;
}

.login-btn[disabled] {
	opacity: 0.6;
}

.register-link {
	display: flex;
	justify-content: center;
	align-items: center;
}

.text {
	font-size: 28rpx;
	color: #666;
	margin-right: 10rpx;
}

.link {
	font-size: 28rpx;
	color: #667eea;
	font-weight: bold;
}
</style>

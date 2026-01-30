<script>
import { ref, computed, onMounted } from 'vue'
import BaseBody from '@/componets/BaseBody.vue';
import BaseContainer from '@/componets/BaseContainer.vue';
import BaseTitle from '@/componets/BaseTitle.vue';
import { gameorderAPI } from '@/utils/api/gameorderAPI';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

export default {
    name: 'ShoppingCartView',
    components: {
        BaseBody,
        BaseContainer,
        BaseTitle
    },
    setup() {
        const userStore = useUserStore();
        const router = useRouter();
        const cartItems = ref([]);
        const isLoading = ref(false);
        const isCheckoutLoading = ref(false);
        const errorMessage = ref('');
        const successMessage = ref('');
        
        // 计算总价
        const totalPrice = computed(() => {
            return cartItems.value.reduce((total, item) => {
                return total + item.price
            }, 0).toFixed(2)
        });
        
        // 加载购物车数据
        const loadCartItems = async () => {
            try {
                isLoading.value = true;
                errorMessage.value = '';
                
                // 检查用户是否登录
                if (!userStore.currentUser) {
                    errorMessage.value = '请先登录';
                    return;
                }
                
                // 从API获取购物车数据
                const result = await gameorderAPI.getShoppingCart(userStore.currentUser.id);
                
                if (result.success) {
                    cartItems.value = result.data;
                } else {
                    errorMessage.value = result.error || '获取购物车失败';
                }
            } catch (error) {
                console.error('加载购物车时发生错误:', error);
                errorMessage.value = '加载购物车时发生错误';
            } finally {
                isLoading.value = false;
            }
        };
        
        // 删除商品（从购物车移除）
        const removeItem = async (index) => {
            try {
                const item = cartItems.value[index];
                
                // 调用API删除订单
                const result = await gameorderAPI.deleteOrder(item.orderId, userStore.currentUser.id);
                
                if (result.success) {
                    // 从本地数组中移除
                    cartItems.value.splice(index, 1);
                    successMessage.value = '已从购物车移除';
                    setTimeout(() => {
                        successMessage.value = '';
                    }, 3000);
                } else {
                    errorMessage.value = result.error || '移除失败';
                    setTimeout(() => {
                        errorMessage.value = '';
                    }, 3000);
                }
            } catch (error) {
                console.error('移除商品时发生错误:', error);
                errorMessage.value = '移除商品时发生错误';
                setTimeout(() => {
                    errorMessage.value = '';
                }, 3000);
            }
        };
        
        // 结算
        const checkout = async () => {
            try {
                isCheckoutLoading.value = true;
                errorMessage.value = '';
                successMessage.value = '';
                
                // 检查用户是否登录
                if (!userStore.currentUser) {
                    errorMessage.value = '请先登录';
                    return;
                }
                
                // 检查购物车是否为空
                if (cartItems.value.length === 0) {
                    errorMessage.value = '购物车为空';
                    return;
                }
                
                // 获取所有订单ID
                const orderIds = cartItems.value.map(item => item.orderId);
                
                // 批量更新订单状态
                const result = await gameorderAPI.batchUpdateOrderStatus(userStore.currentUser.id, orderIds);
                
                if (result.success) {
                    successMessage.value = '结算成功！';
                    // 清空购物车
                    cartItems.value = [];
                    // 3秒后跳转到首页
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    errorMessage.value = result.error || '结算失败';
                    setTimeout(() => {
                        errorMessage.value = '';
                    }, 3000);
                }
            } catch (error) {
                console.error('结算时发生错误:', error);
                errorMessage.value = '结算时发生错误';
                setTimeout(() => {
                    errorMessage.value = '';
                }, 3000);
            } finally {
                isCheckoutLoading.value = false;
            }
        };
        
        // 继续购物
        const continueShopping = () => {
            router.push('/');
        };
        
        // 组件挂载时加载购物车数据
        onMounted(() => {
            loadCartItems();
        });
        
        return {
            cartItems,
            totalPrice,
            isLoading,
            isCheckoutLoading,
            errorMessage,
            successMessage,
            removeItem,
            checkout,
            continueShopping
        }
    }
}
</script>
<template>
    <BaseBody>
        <BaseTitle title="购物车"/>
        <BaseContainer>
            <div class="shopping-cart-container">
                <!-- 消息提示区域 -->
                <div v-if="successMessage" class="message success">
                    {{ successMessage }}
                </div>
                <div v-if="errorMessage" class="message error">
                    {{ errorMessage }}
                </div>
                
                <div class="cart-header">
                    <h2>我的购物车</h2>
                    <span class="item-count">{{ cartItems.length }} 件商品</span>
                </div>
                
                <!-- 加载状态 -->
                <div v-if="isLoading" class="loading">
                    <div class="loading-spinner"></div>
                    <p>加载购物车...</p>
                </div>
                
                <!-- 购物车为空时的提示 -->
                <div v-else-if="cartItems.length === 0" class="empty-cart">
                    <p>购物车是空的</p>
                    <button class="continue-shopping" @click="continueShopping">继续购物</button>
                </div>
                
                <!-- 购物车商品列表 -->
                <div v-else class="cart-items">
                    <div 
                        v-for="(item, index) in cartItems" 
                        :key="item.orderId" 
                        class="cart-item"
                    >
                        <!-- 商品图片 -->
                        <div class="item-image">
                            <img :src="item.image" :alt="item.name" />
                        </div>
                        
                        <!-- 商品信息 -->
                        <div class="item-info">
                            <h3 class="item-name">{{ item.name }}</h3>
                        </div>
                        
                        <!-- 商品价格 -->
                        <div class="item-price">
                            ¥{{ item.price.toFixed(2) }}
                        </div>
                        
                        <!-- 删除按钮 -->
                        <div class="item-remove">
                            <button class="remove-btn" @click="removeItem(index)">
                                <img src="/WebResources/close.svg" alt="删除" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- 结算区域 -->
                <div v-if="cartItems.length > 0" class="cart-footer">
                    <div class="total-section">
                        <span class="total-label">总计：</span>
                        <span class="total-amount">¥{{ totalPrice }}</span>
                    </div>
                    <div class="checkout-section">
                        <button class="checkout-btn" @click="checkout" :disabled="isCheckoutLoading">
                            {{ isCheckoutLoading ? '结算中...' : '结算' }}
                        </button>
                    </div>
                </div>
            </div>
        </BaseContainer>
    </BaseBody>
</template>
<style scoped>
.GS_container {
    padding-top: 48px;
    min-height: 100vh;
}
.shopping-cart-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
}

/* 消息提示样式 */
.message {
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    animation: fadeIn 0.3s ease;
}

.message.success {
    background-color: rgba(46, 204, 113, 0.1);
    border: 1px solid #2ecc71;
    color: #2ecc71;
}

.message.error {
    background-color: rgba(231, 76, 60, 0.1);
    border: 1px solid #e74c3c;
    color: #e74c3c;
}

/* 加载状态样式 */
.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background-color: #0a1a2e;
    border-radius: 8px;
    margin: 20px 0;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #499deb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 2px solid #499deb;
}

.cart-header h2 {
    margin: 0;
    font-size: 24px;
    color: #fff;
}

.item-count {
    color: #666;
    font-size: 16px;
}

.empty-cart {
    text-align: center;
    padding: 60px 20px;
    background-color: #0a1a2e;
    border-radius: 8px;
    margin: 20px 0;
}

.empty-cart p {
    font-size: 18px;
    color: #666;
    margin-bottom: 20px;
}

.continue-shopping {
    padding: 10px 20px;
    background-color: #499deb;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.continue-shopping:hover {
    background-color: #5ba5ea;
}

.cart-items {
    margin-bottom: 30px;
}

.cart-item {
    display: flex;
    align-items: center;
    padding: 20px;
    background-color: #0a1a2e;
    border-radius: 8px;
    margin-bottom: 15px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.cart-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item-image {
    width: 80px;
    height: 80px;
    margin-right: 20px;
    flex-shrink: 0;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.item-info {
    flex: 1;
    min-width: 0;
}

.item-name {
    margin: 0;
    font-size: 18px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-price {
    font-size: 18px;
    font-weight: bold;
    color: #499deb;
    margin: 0 20px;
    min-width: 80px;
}

.item-remove {
    margin-left: auto;
}

.remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.remove-btn:hover {
    opacity: 1;
}

.remove-btn img {
    width: 16px;
    height: 16px;
}

.cart-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20px;
    background-color: #0a1a2e;
    border-radius: 8px;
    margin-top: 20px;
}

.total-section {
    margin-right: 30px;
    display: flex;
    align-items: center;
}

.total-label {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    margin-right: 10px;
}

.total-amount {
    font-size: 24px;
    font-weight: bold;
    color: #499deb;
}

.checkout-btn {
    padding: 15px 40px;
    background-color: #499deb;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    transition: all 0.3s;
}

.checkout-btn:hover:not(:disabled) {
    background-color: #5ba5ea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(73, 158, 235, 0.3);
}

.checkout-btn:active:not(:disabled) {
    transform: translateY(0);
}

.checkout-btn:disabled {
    background-color: rgba(73, 158, 235, 0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .cart-item {
        flex-direction: column;
        align-items: flex-start;
        padding: 15px;
    }
    
    .item-image {
        margin-bottom: 15px;
    }
    
    .item-info {
        margin-bottom: 15px;
        width: 100%;
    }
    
    .item-price {
        margin: 0 0 15px 0;
        min-width: auto;
    }
    
    .item-remove {
        margin-left: 0;
        align-self: flex-end;
    }
    
    .cart-footer {
        flex-direction: column;
        align-items: stretch;
    }
    
    .total-section {
        margin-right: 0;
        margin-bottom: 20px;
        justify-content: space-between;
    }
    
    .checkout-btn {
        width: 100%;
    }
}
</style>
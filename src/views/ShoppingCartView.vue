<script>
import { ref, computed } from 'vue'
import BaseBody from '@/componets/BaseBody.vue';
import BaseContainer from '@/componets/BaseContainer.vue';
import BaseTitle from '@/componets/BaseTitle.vue';

export default {
    name: 'ShoppingCartView',
    components: {
        BaseBody,
        BaseContainer,
        BaseTitle
    },
    setup() {
        // 模拟购物车数据
        const cartItems = ref([
            {
                id: 1,
                name: '游戏名称1',
                price: 99.99,
                quantity: 1,
                image: '/GamesImage/game1.jpg',
                description: '游戏描述1'
            },
            {
                id: 2,
                name: '游戏名称2',
                price: 149.99,
                quantity: 2,
                image: '/GamesImage/game2.jpg',
                description: '游戏描述2'
            }
        ])
        
        // 计算总价
        const totalPrice = computed(() => {
            return cartItems.value.reduce((total, item) => {
                return total + (item.price * item.quantity)
            }, 0).toFixed(2)
        })
        
        // 增加数量
        const increaseQuantity = (index) => {
            cartItems.value[index].quantity++
        }
        
        // 减少数量
        const decreaseQuantity = (index) => {
            if (cartItems.value[index].quantity > 1) {
                cartItems.value[index].quantity--
            }
        }
        
        // 删除商品
        const removeItem = (index) => {
            cartItems.value.splice(index, 1)
        }
        
        // 结算
        const checkout = () => {
            alert('结算功能开发中...')
        }
        
        return {
            cartItems,
            totalPrice,
            increaseQuantity,
            decreaseQuantity,
            removeItem,
            checkout
        }
    }
}
</script>
<template>
    <BaseBody>
        <BaseTitle title="购物车"/>
        <BaseContainer>
            <div class="shopping-cart-container">
                <div class="cart-header">
                    <h2>我的购物车</h2>
                    <span class="item-count">{{ cartItems.length }} 件商品</span>
                </div>
                
                <!-- 购物车为空时的提示 -->
                <div v-if="cartItems.length === 0" class="empty-cart">
                    <p>购物车是空的</p>
                    <button class="continue-shopping">继续购物</button>
                </div>
                
                <!-- 购物车商品列表 -->
                <div v-else class="cart-items">
                    <div 
                        v-for="(item, index) in cartItems" 
                        :key="item.id" 
                        class="cart-item"
                    >
                        <!-- 商品图片 -->
                        <div class="item-image">
                            <img :src="item.image" :alt="item.name" />
                        </div>
                        
                        <!-- 商品信息 -->
                        <div class="item-info">
                            <h3 class="item-name">{{ item.name }}</h3>
                            <p class="item-description">{{ item.description }}</p>
                        </div>
                        
                        <!-- 商品价格 -->
                        <div class="item-price">
                            ¥{{ item.price.toFixed(2) }}
                        </div>
                        
                        <!-- 数量控制 -->
                        <div class="item-quantity">
                            <button 
                                class="quantity-btn decrease" 
                                @click="decreaseQuantity(index)"
                            >
                                -
                            </button>
                            <span class="quantity">{{ item.quantity }}</span>
                            <button 
                                class="quantity-btn increase" 
                                @click="increaseQuantity(index)"
                            >
                                +
                            </button>
                        </div>
                        
                        <!-- 小计 -->
                        <div class="item-subtotal">
                            ¥{{ (item.price * item.quantity).toFixed(2) }}
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
                        <button class="checkout-btn" @click="checkout">
                            结算
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
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-description {
    margin: 0;
    font-size: 14px;
    color: #666;
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

.item-quantity {
    display: flex;
    align-items: center;
    margin: 0 20px;
    min-width: 100px;
}

.quantity-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #ddd;
    background-color: #1a2a42;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.quantity-btn:hover {
    background-color: #2a3a52;
    border-color: #499deb;
}

.quantity-btn:active {
    transform: scale(0.95);
}

.quantity {
    width: 40px;
    text-align: center;
    font-size: 16px;
    color: #fff;
    margin: 0 10px;
}

.item-subtotal {
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    margin: 0 20px;
    min-width: 100px;
    text-align: right;
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

.checkout-btn:hover {
    background-color: #5ba5ea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(73, 158, 235, 0.3);
}

.checkout-btn:active {
    transform: translateY(0);
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
    
    .item-price, .item-quantity, .item-subtotal {
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
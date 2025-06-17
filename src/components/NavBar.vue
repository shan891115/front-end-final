<template>
    <nav class="bg-white shadow-md flex justify-center">
        <div class="container mx-auto px-10">
            <div class="flex justify-between py-4 space-x-24 items-center">
                <div class="flex-1">
                    <!-- Logo 區域 -->
                    <router-link to="/" class="flex items-center">
                      <svg width="50" height="50" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <!-- 背景 - 添加圓角 -->
                        <rect width="200" height="200" fill="#e8f5e9" rx="40" ry="40"/>
                        
                        <!-- 地圖圖示 (簡化版三折地圖) -->
                        <polygon id="map" points="40,150 60,60 100,80 130,50 160,140 130,120 100,150 70,130" 
                                 fill="#a5d6a7" stroke="#388e3c" stroke-width="2"/>

                        <!-- 地圖內部線條 (模擬路線/區塊) - 加粗線條 -->
                        <line x1="60" y1="60" x2="100" y2="80" stroke="#2e7d32" stroke-width="2" />
                        <line x1="100" y1="80" x2="130" y2="50" stroke="#2e7d32" stroke-width="2" />
                        <line x1="70" y1="130" x2="100" y2="150" stroke="#2e7d32" stroke-width="2" />
                        <line x1="100" y1="150" x2="130" y2="120" stroke="#2e7d32" stroke-width="2" />
                        
                        <!-- 虛線路徑 - 調整虛線間距 -->
                        <line x1="60" y1="60" x2="70" y2="130" stroke="#2e7d32" stroke-width="2" stroke-dasharray="6,4"/>
                        <line x1="100" y1="80" x2="130" y2="120" stroke="#2e7d32" stroke-width="2" stroke-dasharray="6,4"/>

                        <!-- 放大鏡 -->
                        <circle cx="140" cy="60" r="20" fill="none" stroke="#2e7d32" stroke-width="5"/>
                        <line x1="152" y1="72" x2="170" y2="90" stroke="#2e7d32" stroke-width="5" stroke-linecap="round"/>

                        <!-- 放大鏡內的點 -->
                        <circle cx="140" cy="60" r="5" fill="#2e7d32"/>
                      </svg>
                      <span class="text-2xl font-bold text-green-600 pl-4">BEST TRIP 旅遊指南</span>
                    </router-link>
                </div>

                <!-- 中間空間 - 使用flex-1增加這個空間 -->
                <div class="flex-1"></div>
                
                <!-- 導航鏈接區域 - 移除w-[500px]固定寬度，使用flex-shrink-0保持尺寸 -->
                <div class="flex-shrink-0 flex justify-evenly items-center space-x-8 pr-8">
                    <!-- 導航鏈接不變 -->
                    <router-link 
                        to="/" 
                        class="text-gray-700 hover:text-green-600 transition-colors font-medium px-5 py-2 rounded-md hover:bg-green-50"
                    >
                        首頁
                    </router-link>
                    <router-link 
                        to="/compare" 
                        class="text-gray-700 hover:text-green-600 transition-colors font-medium px-5 py-2 rounded-md hover:bg-green-50"
                    >
                        比比看
                    </router-link>
                    <router-link 
                        to="/advice" 
                        class="text-gray-700 hover:text-green-600 transition-colors font-medium px-5 py-2 rounded-md hover:bg-green-50"
                    >
                        聽建議
                    </router-link>
                    <router-link 
                        to="/photos" 
                        class="text-gray-700 hover:text-green-600 transition-colors font-medium px-5 py-2 rounded-md hover:bg-green-50"
                    >
                        照片牆
                    </router-link>
                </div>
            
                <!-- 登入/登出按鈕區域 -->
                <div class="flex-shrink-0">
                    <template v-if="isAuthenticated">
                        <div class="flex items-center space-x-4">
                        <span class="text-gray-700 text-sm pr-4">{{ userEmail }}</span>
                        <button 
                        @click="handleLogout" 
                        class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                        登出
                        </button>
                        </div>
                    </template>
                    <template v-else>
                        <router-link 
                        to="/login" 
                        class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                        登入
                        </router-link>
                    </template>
                </div>
            </div>
        </div>
    </nav>
</template>
  
<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { currentUser, isAuthenticated, logoutUser } from '../services/authService';
  
export default {
    setup() {
        const router = useRouter();
      
        // 從身份驗證服務獲取用戶電子郵件
        const userEmail = computed(() => {
            return currentUser.value ? currentUser.value.email : '';
        });
      
        // 處理登出
        const handleLogout = async () => {
            const result = await logoutUser();
            if (result.success) {
                router.push('/');
            }
        };
        
        return {
            isAuthenticated,
            userEmail,
            handleLogout
        };
    }
};
</script>
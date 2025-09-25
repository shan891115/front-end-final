<template>
    <nav class="bg-white shadow-md flex justify-center">        
        <div class="container mx-auto px-4 lg:px-10">
            <div class="flex items-center justify-between gap-60 py-4">
                <!-- Logo 區域 -->
                <div class="flex items-center">
                    <router-link to="/" class="flex items-center whitespace-nowrap">
                        <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="lg:w-[50px] lg:h-[50px]">
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
                        <span class="text-lg lg:text-2xl font-bold text-green-600 pl-2 lg:pl-4 hidden sm:block">BEST TRIP</span>
                        <span class="text-lg lg:text-2xl font-bold text-green-600 pl-2 lg:pl-4 block sm:hidden">旅遊</span>
                    </router-link>
                </div>

                <!-- 右側區域：導航欄和登入按鈕 -->
                <div class="flex items-center ml-auto space-x-8 gap-8 whitespace-nowrap">
                    <!-- 桌面版導航鏈接 -->
                    <div class="hidden lg:flex items-center space-x-8">
                        <router-link 
                            to="/" 
                            class="text-gray-700 hover:text-green-600 transition-colors font-medium px-4 py-2 rounded-md hover:bg-green-50"
                        >
                            首頁
                        </router-link>
                        <router-link 
                            to="/compare" 
                            class="text-gray-700 hover:text-green-600 transition-colors font-medium px-4 py-2 rounded-md hover:bg-green-50"
                        >
                            比比看
                        </router-link>
                        <router-link 
                            to="/advice" 
                            class="text-gray-700 hover:text-green-600 transition-colors font-medium px-4 py-2 rounded-md hover:bg-green-50"
                        >
                            聽建議
                        </router-link>
                        <router-link 
                            to="/photos" 
                            class="text-gray-700 hover:text-green-600 transition-colors font-medium px-4 py-2 rounded-md hover:bg-green-50"
                        >
                            照片牆
                        </router-link>
                    </div>

                    <!-- 登入/登出和漢堡選單區域 -->
                    <div class="flex items-center space-x-4">
                        <!-- 桌面版登入/登出按鈕 -->
                        <div class="hidden lg:block">
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

                        <!-- 手機版漢堡選單按鈕 -->
                        <button 
                            @click="toggleMobileMenu" 
                            class="lg:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-green-600"
                            aria-label="開啟選單"
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 手機版下拉選單 -->
            <div v-if="isMobileMenuOpen" class="lg:hidden border-t border-gray-200 py-4">
                <div class="flex flex-col space-y-2">
                    <router-link 
                        to="/" 
                        @click="closeMobileMenu"
                        class="text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors font-medium px-4 py-3 rounded-md"
                    >
                        首頁
                    </router-link>
                    <router-link 
                        to="/compare" 
                        @click="closeMobileMenu"
                        class="text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors font-medium px-4 py-3 rounded-md"
                    >
                        比比看
                    </router-link>
                    <router-link 
                        to="/advice" 
                        @click="closeMobileMenu"
                        class="text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors font-medium px-4 py-3 rounded-md"
                    >
                        聽建議
                    </router-link>
                    <router-link 
                        to="/photos" 
                        @click="closeMobileMenu"
                        class="text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors font-medium px-4 py-3 rounded-md"
                    >
                        照片牆
                    </router-link>
                    
                    <!-- 手機版登入/登出區域 -->
                    <div class="border-t border-gray-200 pt-4 mt-4">
                        <template v-if="isAuthenticated">
                            <div class="px-4 pb-2">
                                <span class="text-gray-600 text-sm">{{ userEmail }}</span>
                            </div>
                            <button 
                                @click="handleLogout" 
                                class="w-full text-left bg-emerald-600 text-white px-4 py-3 rounded-md hover:bg-emerald-700 transition-colors font-medium"
                            >
                                登出
                            </button>
                        </template>
                        <template v-else>
                            <router-link 
                                to="/login" 
                                @click="closeMobileMenu"
                                class="block w-full text-center bg-emerald-600 text-white px-4 py-3 rounded-md hover:bg-emerald-700 transition-colors font-medium"
                            >
                                登入
                            </router-link>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>
  
<script>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { currentUser, isAuthenticated, logoutUser } from '../services/authService';
  
export default {
    setup() {
        const router = useRouter();
        const isMobileMenuOpen = ref(false);
      
        // 從身份驗證服務獲取用戶電子郵件
        const userEmail = computed(() => {
            return currentUser.value ? currentUser.value.email : '';
        });
      
        // 處理登出
        const handleLogout = async () => {
            const result = await logoutUser();
            if (result.success) {
                isMobileMenuOpen.value = false; // 關閉手機選單
                router.push('/');
            }
        };

        // 切換手機選單
        const toggleMobileMenu = () => {
            isMobileMenuOpen.value = !isMobileMenuOpen.value;
        };

        // 關閉手機選單
        const closeMobileMenu = () => {
            isMobileMenuOpen.value = false;
        };
        
        return {
            isAuthenticated,
            userEmail,
            handleLogout,
            isMobileMenuOpen,
            toggleMobileMenu,
            closeMobileMenu
        };
    }
};
</script>
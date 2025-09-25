<template>
  <div class="min-h-screen">
    <!-- 英雄區段 -->
    <section class="flex justify-center bg-gradient-to-r from-green-500 to-teal-600 text-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-4 pb-2">探索世界的美麗之旅</h2>
        <p class="text-xl mb-8 pb-4">找到最適合你的旅遊目的地，創造難忘的回憶</p>        
        <button @click="scrollToDestinations" class="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-green-100 transition-colors">
          開始探索
        </button>
      </div>
    </section>      
    <!-- 熱門目的地區段 -->
    <section id="destinations" class="flex justify-center py-16 bg-gray-100 relative">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 pb-4 text-gray-600">熱門旅遊目的地</h2>
          <!-- 卡片容器 - 限制為固定寬度以顯示恰好3張卡片 -->
        <div class="destinations-group group relative overflow-hidden max-w-8xl mx-auto flex justify-center">
          <!-- 左側箭頭 -->
          <button @click="scrollLeft" class="destination-arrow absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all z-10 opacity-0 group-hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
            <!-- 固定顯示3張卡片的卷軸容器 -->
            <div ref="cardsContainer" class="flex gap-6 overflow-x-auto scrollbar-hide py-8 scroll-smooth snap-x justify-start">              <!-- 目的地卡片 1 -->
              <div class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex-shrink-0 w-[calc(33.333%-16px)] min-w-[280px] snap-center">
                <div class="h-56 overflow-hidden">
                  <img src="/images/destinations/海灘.jpg.webp" alt="海灘度假勝地" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-8">                  
                  <h3 class="font-bold text-xl mb-3 text-gray-600">海灘度假勝地</h3>
                  <p class="text-gray-700 pb-4">享受陽光、沙灘和海浪，放鬆身心的完美去處。</p>
                  <div class="flex justify-end mt-6">
                    <button @click="showDestinationDetail('beach')" class="bg-emerald-500 text-white px-5 py-2.5 rounded hover:bg-emerald-600 transition-colors">
                      查看詳情
                    </button>
                  </div>
                </div>
              </div>              
              <!-- 目的地卡片 2 -->
              <div class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex-shrink-0 w-[calc(33.333%-16px)] min-w-[280px] snap-center">
                <div class="h-56 overflow-hidden">
                  <img src="/images/destinations/山脈風景.jpg" alt="山區探險行程" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-8">                  
                  <h3 class="font-bold text-xl mb-3 text-gray-600">山區探險行程</h3>
                  <p class="text-gray-700 pb-4">探索壯麗的山脈風景，體驗刺激的戶外活動。</p>
                  <div class="flex justify-end mt-6">
                    <button @click="showDestinationDetail('mountain')" class="bg-emerald-500 text-white px-5 py-2.5 rounded hover:bg-emerald-600 transition-colors">
                      查看詳情
                    </button>
                  </div>
                </div>
              </div>              
              <!-- 目的地卡片 3 -->
              <div class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex-shrink-0 w-[calc(33.333%-16px)] min-w-[280px] snap-center">
                <div class="h-56 overflow-hidden">
                  <img src="/images/destinations/歷史博物館.png" alt="文化城市之旅" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-8">                  
                  <h3 class="font-bold text-xl mb-3 text-gray-600">文化城市之旅</h3>
                  <p class="text-gray-700 pb-4">沉浸在豐富的歷史和文化中，參觀博物館和歷史建築。</p>
                  <div class="flex justify-end mt-6">
                    <button @click="showDestinationDetail('city')" class="bg-emerald-500 text-white px-5 py-2.5 rounded hover:bg-emerald-600 transition-colors">
                      查看詳情
                    </button>
                  </div>
                </div>
              </div>
              <!-- 目的地卡片 4 (新增) -->
              <div class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex-shrink-0 w-[calc(33.333%-16px)] min-w-[280px] snap-center">
                <div class="h-56 overflow-hidden">
                  <img src="/images/destinations/古代遺跡.jpg" alt="古老神秘遺跡" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-8">                  
                  <h3 class="font-bold text-xl mb-3 text-gray-600">古老神秘遺跡</h3>
                  <p class="text-gray-700 pb-4">探索古代文明的遺跡，了解歷史文化的演變與故事。</p>
                  <div class="flex justify-end mt-6">
                    <button @click="showDestinationDetail('ruins')" class="bg-emerald-500 text-white px-5 py-2.5 rounded hover:bg-emerald-600 transition-colors">
                      查看詳情
                    </button>
                  </div>
                </div>
              </div>
              <!-- 目的地卡片 5 (新增) -->
              <div class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex-shrink-0 w-[calc(33.333%-16px)] min-w-[280px] snap-center">
                <div class="h-56 overflow-hidden">
                  <img src="/images/destinations/熱帶島嶼.jpg" alt="島嶼冒險之旅" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-8">
                  <h3 class="font-bold text-xl mb-3 text-gray-600">島嶼冒險之旅</h3>
                  <p class="text-gray-700 pb-4">探索熱帶島嶼的奇特風光，體驗獨特的自然景觀與文化。</p>
                  <div class="flex justify-end mt-6">
                    <button @click="showDestinationDetail('island')" class="bg-emerald-500 text-white px-5 py-2.5 rounded hover:bg-emerald-600 transition-colors">
                      查看詳情
                    </button>
                  </div>
                </div>
              </div>
            </div>
          
          <!-- 右側箭頭 -->
          <button @click="scrollRight" class="destination-arrow absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all z-10 opacity-0 group-hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- 特色服務區段 -->
    <section class="flex justify-center py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">我們的特色服務</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 服務 1 -->
          <div class="text-center p-6 flex flex-col items-center">
                          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin: 0 auto;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            <h3 class="text-xl font-bold mb-2 pt-4">量身定制</h3>
            <p class="text-gray-600">根據您的偏好和預算，打造您的專屬旅行計劃。</p>
          </div>

          <!-- 服務 2 -->
          <div class="text-center p-6 flex flex-col items-center">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin: 0 auto;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2 pt-4">最佳價格</h3>
            <p class="text-gray-600">提供最具競爭力的價格，讓您獲得最大的價值。</p>
          </div>

          <!-- 服務 3 -->
          <div class="text-center p-6 flex flex-col items-center">
                          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin: 0 auto;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            <h3 class="text-xl font-bold mb-2 pt-4">24h / 7d 支援</h3>
            <p class="text-gray-600">全天候客戶支援，確保您的旅行無憂無慮。</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 號召行動區段 -->
    <section class="flex justify-center bg-gradient-to-l from-green-500 to-teal-600 text-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4 pb-2">準備好開始您的冒險了嗎？</h2>
        <p class="text-xl mb-8 pb-4">立即登入，獲取客製化旅程</p>
        <router-link 
          to="/login" 
          class="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-yellow-400 hover:text-gray-800 border-2 border-transparent hover:border-white"
        >
          立即登入        
        </router-link>
      </div>
    </section>
      <!-- 詳情彈出視窗 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
      <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[95vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <!-- 關閉按鈕 -->
          <div class="flex justify-between items-center mb-4 pb-2">
            <h2 class="text-2xl font-bold text-gray-800">{{ selectedDestination.title }}</h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
            <!-- 目的地圖片 -->
          <div class="h-50 rounded-lg mb-6 overflow-hidden">
            <img :src="selectedDestination.image" :alt="selectedDestination.title" class="w-full h-full object-cover">
          </div>
          
          <!-- 詳細內容 -->
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2 text-green-600 pt-4">景點特色</h3>
              <p class="text-gray-700 text-sm">{{ selectedDestination.features }}</p>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-2 text-green-600 pt-4">推薦活動</h3>
              <ul class="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li v-for="activity in selectedDestination.activities" :key="activity">{{ activity }}</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-2 text-green-600 pt-4">最佳旅遊時間</h3>
              <p class="text-gray-700 text-sm">{{ selectedDestination.bestTime }}</p>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-2 text-green-600 pt-4">預估費用</h3>
              <p class="text-gray-700 text-sm">{{ selectedDestination.cost }}</p>
            </div>
          </div>
            <!-- 動作按鈕 -->
          <div class="flex justify-end mt-6 space-x-4 gap-4">
            <button @click="closeModal" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              關閉
            </button>
            <button @click="goToAdvice" class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              開始規劃行程
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showModal: false,
      selectedDestination: {},
      destinations: {        
        beach: {
          title: '海灘度假勝地',
          image: '/images/destinations/海灘.jpg.webp',
          bgColor: 'from-blue-400 to-blue-600',
          features: '擁有綿延數公里的潔白沙灘，清澈見底的海水，以及溫和的熱帶氣候。這裡是放鬆身心、遠離都市喧囂的理想場所，提供各種水上活動和豪華度假村住宿。',
          activities: [
            '浮潛和深潛探索海底世界',
            '沙灘排球和日光浴',
            '衝浪和帆船運動',
            '海鮮美食品嚐',
            'SPA按摩放鬆療程'
          ],
          bestTime: '4月至10月，氣候宜人，海水溫暖適合游泳',
          cost: 'NT$ 15,000 - 30,000 / 人（5天4夜）'
        },        
        mountain: {
          title: '山區探險行程',
          image: '/images/destinations/山脈風景.jpg',
          bgColor: 'from-green-500 to-green-700',
          features: '壯麗的高山景觀，豐富的野生動植物，清新的空氣和挑戰性的登山路線。適合喜愛戶外活動和自然風光的旅客，提供從輕鬆健行到專業登山的各種選擇。',
          activities: [
            '高山健行和登山',
            '野生動物觀察',
            '山區攝影',
            '露營體驗',
            '溫泉浴放鬆'
          ],
          bestTime: '5月至9月，天氣穩定，適合戶外活動',
          cost: 'NT$ 12,000 - 25,000 / 人（4天3夜）'
        },        
        city: {
          title: '文化城市之旅',
          image: '/images/destinations/歷史博物館.png',
          bgColor: 'from-purple-500 to-purple-700',
          features: '歷史悠久的古城區，世界級的博物館和美術館，精緻的建築藝術，以及豐富的文化活動。這裡完美結合了傳統與現代，提供深度的文化體驗。',
          activities: [
            '博物館和美術館參觀',
            '歷史建築導覽',
            '當地美食品嚐',
            '文化表演欣賞',
            '傳統工藝體驗'
          ],
          bestTime: '全年適宜，春秋季節氣候最佳',
          cost: 'NT$ 18,000 - 35,000 / 人（6天5夜）'
        },        
        ruins: {
          title: '古老神秘遺跡',
          image: '/images/destinations/古代遺跡.jpg',
          bgColor: 'from-orange-500 to-red-600',
          features: '千年歷史的古代遺跡，神秘的文明痕跡，考古學的重要發現地點。這裡讓您穿越時空，感受古代文明的智慧與神秘，是歷史愛好者的天堂。',
          activities: [
            '古蹟遺址探索',
            '考古導覽解說',
            '歷史文化講座',
            '古代文物參觀',
            '日出日落觀賞'
          ],
          bestTime: '10月至4月，避開雨季，氣候涼爽',
          cost: 'NT$ 20,000 - 40,000 / 人（7天6夜）'
        },        
        island: {
          title: '島嶼冒險之旅',
          image: '/images/destinations/熱帶島嶼.jpg',
          bgColor: 'from-teal-500 to-cyan-600',
          features: '原始自然的熱帶島嶼，獨特的生態系統，豐富的海洋生物，以及友善的當地文化。這裡提供真正的島嶼生活體驗，遠離現代文明的純淨天堂。',
          activities: [
            '島嶼跳躍探索',
            '海洋生態觀察',
            '獨木舟划行',
            '當地部落文化體驗',
            '海釣和烤魚'
          ],
          bestTime: '11月至3月，乾季期間風浪較小',
          cost: 'NT$ 25,000 - 45,000 / 人（8天7夜）'
        }
      }
    }
  },  
  methods: {
    showDestinationDetail(destinationType) {
      this.selectedDestination = this.destinations[destinationType];
      this.showModal = true;
      // 防止背景滾動
      document.body.style.overflow = 'hidden';
    },    closeModal() {
      this.showModal = false;
      this.selectedDestination = {};
      // 恢復背景滾動
      document.body.style.overflow = 'auto';
    },
    goToAdvice() {
      // 先關閉彈出視窗
      this.closeModal();
      // 導航到聽建議頁面
      this.$router.push('/advice');
    },
    scrollToDestinations() {
      const destinationsSection = document.getElementById('destinations');
      if (destinationsSection) {
        destinationsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    },
    scrollLeft() {
      const container = this.$refs.cardsContainer;
      // 找到一個卡片的寬度（包括間距）
      const card = container.querySelector('div');
      const cardWidth = card.offsetWidth + 24; // 24px為間距
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    },
    scrollRight() {
      const container = this.$refs.cardsContainer;
      // 找到一個卡片的寬度（包括間距）
      const card = container.querySelector('div');
      const cardWidth = card.offsetWidth + 24; // 24px為間距
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }  },
  mounted() {
    // 不需要額外的JavaScript來處理hover顯示/隱藏箭頭
    // 使用Tailwind的group/group-hover功能已經完成了這個功能
    // 如果需要更多控制可以在這裡添加代碼
  },
  beforeUnmount() {
    // 確保組件銷毀時恢復滾動
    document.body.style.overflow = 'auto';
  }
}
</script>

<style>
/* 隱藏滾動條但保留功能 */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* 確保按鈕在所有狀態下都保持綠色 */
.destination-arrow svg {
  color: #059669; /* Tailwind 的 text-green-600 顏色 */
}
.destination-arrow:focus {
  outline: none;
}
</style>

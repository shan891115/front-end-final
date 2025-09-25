<template>
  <div class="min-h-screen flex flex-col bg-green-50">
    <!-- 頁頭區域 - 使用綠色系背景 -->
    <section class="flex justify-center bg-gradient-to-r from-green-400 to-emerald-600 text-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-light mb-6 tracking-tight pb-2">旅遊建議</h2>
        <p class="text-xl font-light mb-4 opacity-90">獲取來自其他旅行者和AI的寶貴建議，規劃完美行程</p>
      </div>
    </section>

    <!-- 主要內容區域 -->
    <section class="flex-grow flex justify-center py-16 bg-green-50">
      <div class="container mx-auto px-4 max-w-6xl grid gap-4">
        <h2 class="text-3xl font-light text-center py-4 mb-16 text-emerald-800">獲取專屬旅遊建議</h2>
        
        <!-- 後端連線提示 - 使用更輕量的設計 -->
        <div class="bg-teal-50 border-l-4 border-teal-300 text-teal-700 px-6 py-4 rounded-md mb-16 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm pl-1">
            <strong>提示：</strong> 若後端伺服器未啟動，系統會自動使用模擬資料。若要使用真實AI服務，請先啟動後端伺服器。
          </span>
        </div>
        
        <!-- 其他使用者推薦 - 使用卡片式設計 -->
        <div class="bg-white rounded-xl shadow-sm p-8 mb-20">
          <h3 class="text-2xl font-light mb-10 text-emerald-700 pb-4">探索旅行者推薦</h3>
          
          <!-- 地區分類標籤 - 使用更簡約的按鈕設計 -->
          <div class="flex flex-wrap gap-4 mb-12 pb-4">
            <button 
              v-for="(region, index) in regions" 
              :key="index"
              @click="changeRegion(region.value)"
              :class="[
                'px-6 py-2 rounded-full transition-all text-sm font-medium',
                currentRegion === region.value 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'bg-green-100 text-emerald-700 hover:bg-green-200'
              ]"
            >
              {{ region.name }}
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6">
            <!-- 使用者推薦 - 更現代的卡片設計 -->
            <div 
              v-for="(recommendation, index) in filteredRecommendations" 
              :key="index"
              class="bg-white rounded-xl border border-green-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div class="flex items-start p-6 flex-grow">
                <div class="w-16 h-16 bg-green-200 rounded-full flex-shrink-0 mr-4 overflow-hidden">
                  <!-- 使用抽象圖案替代空白頭像 -->
                  <div class="w-full h-full bg-green-300"></div>
                </div>
                <div>
                  <h4 class="text-lg font-medium mb-2 text-emerald-800 pl-4">{{ recommendation.name }}</h4>
                  <p class="text-emerald-600 text-sm mb-3 pl-4">{{ recommendation.title }}</p>
                  <p class="text-gray-600 text-sm leading-relaxed pl-4">
                    {{ recommendation.description }}
                  </p>
                </div>
              </div>
              <div class="bg-green-50 p-4 border-t border-green-100 mt-auto">
                <button class="px-4 py-2 bg-emerald-500 text-white text-sm rounded-full hover:bg-emerald-600 transition-colors">
                  查看行程詳情
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI建議區 - 更現代的表單設計 -->
        <div class="bg-white rounded-xl shadow-sm p-10 mb-16">
          <h3 class="text-2xl font-light mb-10 text-emerald-700 pb-4">AI行程建議</h3>
          
          <form @submit.prevent="handleFormSubmit">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div class="mb-4">
                <label class="block text-emerald-700 text-sm mb-3 font-medium pb-1">旅遊區域</label>
                <select v-model="selectedRegion" @change="updateCountries" class="w-full rounded-lg border border-green-200 px-4 py-3 bg-green-50 text-gray-700 focus:border-emerald-500 focus:ring-0 transition-colors">
                  <option value="">請選擇區域</option>
                  <option value="asia">亞洲</option>
                  <option value="europe">歐洲</option>
                  <option value="america">美洲</option>
                  <option value="oceania">大洋洲</option>
                  <option value="africa">非洲</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-emerald-700 text-sm mb-3 font-medium pb-1">目的地國家</label>
                <select v-model="selectedCountry" class="w-full rounded-lg border border-green-200 px-4 py-3 bg-green-50 text-gray-700 focus:border-emerald-500 focus:ring-0 transition-colors">
                  <option value="">{{ countryPlaceholder }}</option>
                  <option v-for="country in availableCountries" :key="country" :value="country">{{ country }}</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-emerald-700 text-sm mb-3 font-medium pb-1">旅遊天數</label>
                <select v-model="travelDays" class="w-full rounded-lg border border-green-200 px-4 py-3 bg-green-50 text-gray-700 focus:border-emerald-500 focus:ring-0 transition-colors">
                  <option value="">請選擇天數</option>
                  <option value="3-5">3-5天</option>
                  <option value="6-8">6-8天</option>
                  <option value="9-12">9-12天</option>
                  <option value="13+">13天以上</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 py-4">
              <div class="mb-4">
                <label class="block text-emerald-700 text-sm mb-3 font-medium py-1">出發日期</label>
                <input type="date" v-model="departureDate" class="w-full rounded-lg border border-green-200 px-4 py-3 bg-green-50 text-gray-700 focus:border-emerald-500 focus:ring-0 transition-colors">
              </div>
              <div class="mb-4">
                <label class="block text-emerald-700 text-sm mb-3 font-medium py-1">旅遊類型</label>
                <select v-model="travelType" class="w-full rounded-lg border border-green-200 px-4 py-3 bg-green-50 text-gray-700 focus:border-emerald-500 focus:ring-0 transition-colors">
                  <option value="">請選擇旅遊類型</option>
                  <option value="family">家庭旅遊</option>
                  <option value="honeymoon">蜜月旅行</option>
                  <option value="adventure">冒險旅遊</option>
                  <option value="culture">文化體驗</option>
                  <option value="food">美食之旅</option>
                </select>
              </div>
            </div>            
            <div class="mb-12" ref="specialRequirementsSection">
              <label class="block text-emerald-700 text-sm mb-3 font-medium py-1">特別需求或偏好</label>
              <textarea 
                ref="specialRequirementsTextarea"
                v-model="specialRequirements" 
                class="w-full rounded-lg border border-green-200 px-4 py-3 bg-green-50 text-gray-700 focus:border-emerald-500 focus:ring-0 transition-colors h-32" 
                placeholder="請輸入您的特別需求或偏好..."
              ></textarea>              
              <!-- 快速選取按鈕 -->
              <div v-show="showQuickOptions" class="mt-4 flex flex-wrap gap-3 transition-all duration-300 ease-in-out">
                <span class="text-sm text-emerald-600 font-medium">快速選取：</span>
                <button
                  type="button"
                  @click="addQuickOption('加1天')"
                  class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm hover:bg-emerald-200 transition-colors flex items-center"
                  title="請基於原行程，幫我加1天"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  加1天
                </button>
                <button
                  type="button"
                  @click="addQuickOption('減1天')"
                  class="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors flex items-center"
                  title="請基於原行程，幫我減1天"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                  減1天
                </button>
              </div>
            </div>
            
            <div class="text-center py-4 pb-6">
              <button 
                type="submit" 
                class="bg-emerald-500 text-white px-10 py-4 rounded-full font-medium hover:bg-emerald-600 transition-all transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-4 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </span>
                <span v-else>生成AI行程建議</span>
              </button>
            </div>
          </form>
          
          <!-- 登入提示訊息 -->
          <div v-if="showLoginPrompt" class="mt-6 bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700 pl-1">
                  請先登入以使用AI行程建議功能，將在5秒後跳轉至登入頁面...
                </p>
              </div>
            </div>
          </div>
          
          <!-- AI回覆區域 - 更優雅的卡片設計 -->          
          <div v-if="aiResponse" class="mt-16 border border-green-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div class="bg-green-100 p-5 border-b border-green-200 flex justify-between items-center">
              <h4 class="text-xl font-medium text-emerald-800">您的專屬行程建議</h4>
              <div v-if="selectedCountry" class="text-sm text-emerald-700 bg-white px-3 py-1 rounded-full">
                {{ selectedCountry }}{{ actualDaysCount > 0 ? actualDaysCount : travelDays }}天行程
              </div>
            </div>
            <div class="p-8">              
              <!-- 行程天數警告 -->
              <div v-if="showDaysWarning" class="mb-6 rounded-lg" :class="actualDaysCount > requestedMaxDays ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-amber-50 border-l-4 border-amber-400'">
                <div class="flex items-start p-4">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5" :class="actualDaysCount > requestedMaxDays ? 'text-blue-400' : 'text-amber-400'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <!-- 天數不足警告 -->
                    <template v-if="actualDaysCount < requestedMinDays">
                      <p class="text-sm text-amber-700 font-medium">
                        您請求的是 {{ requestedDaysRange }}，但AI僅生成了 {{ actualDaysCount }} 天的行程
                      </p>
                      <p class="text-sm text-amber-700 mt-2">您可以嘗試下列方法完成行程：</p>
                      <ul class="text-sm text-amber-700 mt-1 ml-2 space-y-1.5 list-disc list-inside">
                        <li>點擊「修改建議」按鈕，在特別需求中加入：<br>
                          <span class="block ml-4 mt-1 italic text-amber-600 bg-amber-50 p-1 rounded border border-amber-200">"請繼續生成第{{ actualDaysCount + 1 }}天到第{{ requestedMinDays }}天的行程"</span>
                        </li>
                        <li>重新生成一次行程建議</li>
                        <li v-if="requestedMinDays > 8">將行程分開查詢：先查詢前{{ Math.ceil(requestedMinDays/2) }}天，再查詢後{{ Math.floor(requestedMinDays/2) }}天</li>
                      </ul>
                    </template>
                    
                    <!-- 天數超過警告 -->
                    <template v-else-if="actualDaysCount > requestedMaxDays">
                      <p class="text-sm text-blue-700 font-medium">
                        您請求的是 {{ requestedDaysRange }}，但AI實際生成了 {{ actualDaysCount }} 天的行程
                      </p>
                      <p class="text-sm text-blue-700 mt-2">
                        行程天數超出了請求範圍，但這可能提供了更豐富的旅遊建議，您可以：
                      </p>
                      <ul class="text-sm text-blue-700 mt-1 ml-2 space-y-1.5 list-disc list-inside">
                        <li>接受完整行程並保存</li>
                        <li>點擊「修改建議」按鈕，在特別需求中加入：<br>
                          <span class="block ml-4 mt-1 italic text-blue-600 bg-blue-50 p-1 rounded border border-blue-200">"請只提供{{ requestedMaxDays }}天的行程計劃"</span>
                        </li>
                        <li>重新生成一次行程建議</li>
                      </ul>
                    </template>
                  </div>
                </div>
              </div>
              <div class="space-y-4 itinerary-content text-gray-600">
                <div v-html="formattedAiResponse"></div>
              </div>
              <div class="mt-10 flex flex-wrap gap-4 pt-8">
                <button 
                  @click="modifyItinerary" 
                  class="px-6 py-3 bg-white border border-green-300 text-emerald-700 rounded-full hover:bg-green-50 transition-colors text-sm font-medium"
                >
                  修改建議
                </button>                  
                <button 
                  @click="saveItinerary" 
                  class="px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center"
                  title="儲存到瀏覽器本地，用於一般查看和管理"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 pr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  儲存到本地瀏覽器
                </button>                
                <button 
                  @click="confirmAndSaveToFirebase"
                  :disabled="isProcessing" 
                  class="px-6 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors text-sm font-medium flex items-center"
                  title="儲存至雲端資料庫，專供照片牆頁面使用以關聯照片"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 pr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  {{ isProcessing ? '儲存中...' : '儲存至雲端 (供照片牆使用)' }}
                </button>
              </div>
            </div>
          </div>
            <!-- 查看已儲存行程按鈕 -->
          <div class="mt-12 py-4 pt-6" :class="{ 'pt-4': showLoginPrompt }">
            <button 
              @click="loadSavedItineraries" 
              class="px-6 py-3 bg-white border border-green-300 text-emerald-700 rounded-full hover:bg-green-50 transition-colors text-sm font-medium"
              title="查看儲存在瀏覽器本地的行程"
            >
              查看本地儲存的行程
            </button>
          </div>
          
          <!-- 已儲存行程列表 - 更現代的卡片列表 -->
          <div v-if="showSavedItineraries" class="mt-16">
            <h4 class="text-xl font-medium mb-8 text-emerald-800 py-2">本地儲存的行程</h4>
            <div v-if="savedItineraries.length === 0" class="p-6 bg-green-50 rounded-lg text-center text-emerald-600">
              尚未在本地保存任何行程
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                v-for="itinerary in savedItineraries" 
                :key="itinerary.id" 
                class="p-6 border border-green-200 rounded-xl hover:shadow-md transition-shadow bg-white flex flex-col"
              >
                <div class="flex justify-between items-start flex-grow">
                  <div>
                    <h5 class="font-medium text-emerald-800">{{ itinerary.country }} {{ itinerary.days }}天行程</h5>
                    <p class="text-xs text-gray-500 mt-2">儲存日期: {{ itinerary.date }}</p>
                    <div class="flex gap-3 mt-3 py-2">
                      <span class="inline-block px-3 py-1 bg-green-100 text-emerald-700 text-xs rounded-full">{{ itinerary.region }}</span>
                      <span v-if="itinerary.type" class="inline-block px-3 py-1 bg-lime-100 text-emerald-700 text-xs rounded-full">{{ itinerary.type }}</span>
                    </div>
                  </div>
                  <button 
                    @click="deleteItinerary(itinerary.id)" 
                    class="text-emerald-400 hover:text-emerald-600 p-1.5 rounded-full hover:bg-green-50"
                    title="刪除行程"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div class="mt-6">
                  <button 
                    @click="loadItinerary(itinerary)" 
                    class="px-5 py-2 bg-emerald-500 text-white text-xs rounded-full hover:bg-emerald-600 transition-colors"
                  >
                    查看行程
                  </button>
                </div>
              </div>
            </div>
            <div class="mt-8 pt-4">
              <button 
                @click="showSavedItineraries = false" 
                class="px-6 py-3 bg-green-200 text-emerald-700 rounded-full hover:bg-green-300 transition-colors text-sm font-medium"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';
import { isAuthenticated, currentUser } from '../services/authService';
import aiService from '../services/aiService';

export default {
  data() {
    return {
      // 推薦區域相關
      currentRegion: 'asia',
      regions: [
        { name: '亞洲', value: 'asia' },
        { name: '歐洲', value: 'europe' },
        { name: '美洲', value: 'america' },
        { name: '大洋洲', value: 'oceania' },
        { name: '非洲', value: 'africa' }
      ],
      recommendations: [
        // 亞洲推薦
        { 
          region: 'asia', 
          name: '李明華', 
          title: '日本京都之旅',
          description: '我推薦日本京都作為文化體驗之旅。秋季楓葉或春季櫻花時節最為美麗，可以體驗傳統的日本文化，參觀寺廟和體驗茶道。'
        },
        { 
          region: 'asia', 
          name: '林小梅', 
          title: '新加坡家庭之旅',
          description: '新加坡是絕佳的家庭旅遊目的地，這裡安全、乾淨且有許多適合兒童的景點，如環球影城、水族館和動物園。全年都適合旅行，但避開雨季（11月至1月）。'
        },
        // 歐洲推薦
        { 
          region: 'europe', 
          name: '王美珍', 
          title: '義大利托斯卡納之旅',
          description: '義大利的托斯卡納地區有美麗的鄉村風光、世界級的美食和葡萄酒。最好的旅行季節是春季和秋季，避開炎熱的夏季。'
        },
        { 
          region: 'europe', 
          name: '張志明', 
          title: '法國巴黎浪漫之旅',
          description: '巴黎是浪漫之都，艾菲爾鐵塔、羅浮宮和聖母院等景點令人難忘。建議春季或秋季前往，避開夏季的遊客高峰期。'
        },
        // 美洲推薦
        { 
          region: 'america', 
          name: '黃建國', 
          title: '美國紐約城市探索',
          description: '紐約是一座充滿活力的城市，從中央公園到百老匯，從時代廣場到自由女神像，每個景點都值得一遊。建議春季或秋季前往，氣候宜人。'
        },
        { 
          region: 'america', 
          name: '劉美玲', 
          title: '加拿大落基山脈之旅',
          description: '加拿大落基山脈風景壯麗，班芙國家公園和賈斯珀國家公園的湖泊和冰川令人嘆為觀止。夏季是最佳旅遊季節。'
        },
        // 大洋洲推薦
        { 
          region: 'oceania', 
          name: '陳大衛', 
          title: '紐西蘭冒險之旅',
          description: '紐西蘭南島適合喜愛戶外活動和壯麗自然風光的旅行者。可以體驗徒步、皮划艇、跳傘等活動，最佳季節是當地的夏季（12月至2月）。'
        },
        { 
          region: 'oceania', 
          name: '吳雅芳', 
          title: '澳洲悉尼海岸之旅',
          description: '悉尼擁有美麗的海灘和標誌性的歌劇院，適合喜愛陽光和海灘的旅行者。建議在澳洲的夏季（12月至2月）前往。'
        },
        // 非洲推薦
        { 
          region: 'africa', 
          name: '鄭世豪', 
          title: '摩洛哥文化探索',
          description: '摩洛哥擁有豐富的文化和歷史，從馬拉喀什的市集到撒哈拉沙漠的營地，每個地方都有獨特的魅力。春季和秋季是最佳旅遊季節。'
        },
        { 
          region: 'africa', 
          name: '蔡佳玲', 
          title: '南非野生動物之旅',
          description: '南非的克魯格國家公園是觀賞野生動物的絕佳地點，可以看到非洲五大獸。建議在南非的冬季（5月至9月）前往，此時動物較容易被發現。'
        }
      ],
      
      // AI建議相關
      selectedRegion: '',
      selectedCountry: '',
      travelDays: '',
      departureDate: '',
      travelType: '',
      specialRequirements: '',
      countryPlaceholder: '請先選擇區域',
      availableCountries: [],      regionCountries: {
        asia: [
          '日本', '韓國', '中國', '台灣', '香港', '澳門', '新加坡', '馬來西亞', 
          '泰國', '越南', '印尼', '菲律賓', '印度', '斯里蘭卡', '尼泊爾', '馬爾地夫',
          '阿聯酋', '土耳其'
        ],
        europe: [
          '英國', '法國', '德國', '義大利', '西班牙', '葡萄牙', '瑞士', '奧地利', 
          '荷蘭', '比利時', '希臘', '捷克', '匈牙利', '波蘭', '丹麥', '瑞典', 
          '挪威', '芬蘭', '冰島', '愛爾蘭', '克羅埃西亞'
        ],
        america: [
          '美國', '加拿大', '墨西哥', '巴西', '阿根廷', '智利', '秘魯', '哥倫比亞', 
          '古巴', '牙買加', '巴哈馬', '哥斯大黎加'
        ],
        oceania: [
          '澳洲', '紐西蘭', '斐濟', '大溪地', '帛琉'
        ],
        africa: [
          '埃及', '摩洛哥', '南非', '肯亞', '坦尚尼亞', '模里西斯', '馬達加斯加', '塞席爾'
        ]      },      actualDaysCount: 0,
      detectedDaysCount: 0,
      showDaysWarning: false,
      requestedMinDays: 0,
      requestedMaxDays: 0,
      requestedDaysRange: '',      aiResponse: null,      isLoading: false,      isProcessing: false, // 處理保存到Firebase的狀態
      showQuickOptions: false, // 控制快速選取按鈕的顯示
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 
        (import.meta.env.MODE === 'development' ? 'http://localhost:3333/api' : 'https://final-project-backend-blond.vercel.app/api'), // 動態 API URL
      errorMessage: null,
      savedItineraries: [],
      showSavedItineraries: false,
      showLoginPrompt: false,
      router: useRouter()
    }
  },    computed: {
    currentUser() {
      return currentUser.value;
    },
    
    filteredRecommendations() {
      return this.recommendations.filter(rec => rec.region === this.currentRegion);
    },
    
    formattedAiResponse() {
      if (!this.aiResponse) return '';
      
      try {        // 檢查是否為Markdown格式
        const hasMarkdown = this.aiResponse.includes('**') || 
                           this.aiResponse.includes('##') || 
                           this.aiResponse.includes('*   ') ||
                           this.aiResponse.includes('---');
        
        if (hasMarkdown) {
          // 處理Markdown格式
          let formatted = this.aiResponse;
          
          // 移除Markdown代碼圍欄標記
          formatted = formatted.replace(/```markdown\s*/g, '');
          formatted = formatted.replace(/```\s*$/g, '');
          
          // 移除非預期的星號（但保留Markdown格式標記）
          formatted = formatted.replace(/^\* /gm, ''); // 移除行首的星號列表標記
          formatted = formatted.replace(/([^*])\*([^*])/g, '$1$2'); // 移除單獨的星號
              // 將所有景點名稱的Markdown粗體標記直接轉換為紅色加粗
          formatted = formatted.replace(/\*\*([^*]*?)\*\*/g, '<strong class="text-red-500 font-bold">$1</strong>');
          // 處理"第X天"為大標題 (更大的字體和顯著樣式) - 支持多種標頭格式
          // 模式1: # 第X天 (H1) - 修正正則表達式，避免匹配到後續的 ## 標題
          formatted = formatted.replace(/^# 第(\d+)天\s*(?:\(([^)]*)\))?(?:\s*[-–:：]?\s*([^#]*?))?(?=\n|$)/gm, 
            (match, day, location, desc) => {
              let title = `第${day}天`;
              if (location) title += ` (${location})`;
              if (desc && desc.trim() && !desc.includes('##')) title += ` - ${desc.trim()}`;
              return `<h1 class="text-3xl font-bold mt-12 pt-6 mb-6 py-3 border-b-2 border-emerald-500 text-emerald-800">${title}</h1>`;
            });
          
          // 模式2: ## 第X天 (H2轉成H1) - 同樣修正
          formatted = formatted.replace(/^## 第(\d+)天\s*(?:\(([^)]*)\))?(?:\s*[-–:：]?\s*([^#]*?))?(?=\n|$)/gm, 
            (match, day, location, desc) => {
              let title = `第${day}天`;
              if (location) title += ` (${location})`;
              if (desc && desc.trim() && !desc.includes('##')) title += ` - ${desc.trim()}`;
              return `<h1 class="text-3xl font-bold mt-12 pt-6 mb-6 py-3 border-b-2 border-emerald-500 text-emerald-800">${title}</h1>`;
            });
            
          // 處理中標題 - "行程"、"住宿建議"、"用餐推薦"等
          formatted = formatted.replace(/^## ([^#].*?)[:：]?(?=\n|$)/gm, 
            '<h2 class="text-2xl font-semibold my-4 text-emerald-700">$1</h2>');
            
          // 處理小標題 (如果有的話)
          formatted = formatted.replace(/^### ([^#].*?)(?=\n|$)/gm, 
            '<h3 class="text-xl font-medium my-3 text-emerald-600">$1</h3>');
            // 優化內容換行處理          
          // 處理時段，但不強制換行，讓交通等內容緊接在後面
          // 先處理帶粗體標記的時間段
          formatted = formatted.replace(/\*\*(早餐|午餐|上午|下午|早上|早晨|傍晚|中午|黃昏|晚餐|晚上)\*\*[:：]/g, 
            '<strong class="text-emerald-600">$1：</strong>');
          
          // 處理沒有粗體標記的時間段（只限定在行首或特定分隔符後）
          formatted = formatted.replace(/(?<![晚早午傍黃])(?:^|\n|\<br\>|\. |。)(早餐|午餐|上午|下午|早上|早晨|傍晚|中午|黃昏)[:：]/g, 
            '<br><strong class="text-emerald-600">$1：</strong>');
          
          // 特殊處理"晚餐"和"晚上"，避免切割"傍晚：前往...晚餐"這類句子
          formatted = formatted.replace(/(?<![傍黃])(?:^|\n|\<br\>|\. |。)(晚餐|晚上)[:：]/g, 
            '<br><strong class="text-emerald-600">$1：</strong>');
              // 處理住宿、注意事項等項目（但不包括交通，讓交通保持在時間描述中）
          formatted = formatted.replace(/(住宿|注意事項|小建議|建議)[:：]/g, 
            '<br><strong class="text-emerald-600">$1：</strong>');
          
          // 在句號、驚嘆號、問號後適當換行，但排除交通相關詞語
          formatted = formatted.replace(/([。！？])(\s*)(?<![晚傍黃])(早餐|午餐|上午|下午|早上|早晨|中午|住宿|注意事項)/g, 
            '$1<br><strong class="text-emerald-600">$3：</strong>');
            // 特別處理可能被錯誤分割的"晚餐"、"晚上"、"傍晚"
          formatted = formatted.replace(/([。！？])(\s*)(?<![傍黃])(晚餐|晚上)/g, 
            '$1<br><strong class="text-emerald-600">$3：</strong>');
          formatted = formatted.replace(/([。！？])(\s*)(傍晚|黃昏)/g, 
            '$1<br><strong class="text-emerald-600">$3：</strong>');
          
          // 額外修復：處理"傍晚：...晚餐"的情況，把誤加的標籤移除
          formatted = formatted.replace(/<strong class="text-emerald-600">傍晚：<\/strong>(.*?)<br><strong class="text-emerald-600">晚餐：<\/strong>/g, 
            '<strong class="text-emerald-600">傍晚：</strong>$1晚餐');
            
          // 添加：把行程中的重點景點轉換為綠色粗體字
          // 先找出行程部分，再處理內部的重點景點
          let inItinerarySection = false;
          const lines = formatted.split('\n');
          const resultLines = [];
          
          for (const line of lines) {
            // 檢查是否進入或離開行程部分
            if (line.includes('<h2 class="') && (line.includes('行程') || line.includes('itinerary'))) {
              inItinerarySection = true;
              resultLines.push(line);
              continue;
            } else if (line.includes('<h2 class="') || line.includes('<h1 class="')) {
              inItinerarySection = false;
              resultLines.push(line);
              continue;
            }
            
            // 如果在行程部分，額外處理未使用Markdown標記的景點名稱
            if (inItinerarySection) {
              let processedLine = line;
              
              // 檢查這一行是否已經包含紅色加粗的景點名稱
              const containsFormattedAttractions = processedLine.includes('<strong class="text-red-500 font-bold">');
              
              // 只有在沒有已標記的景點時，才使用關鍵詞識別未被標記的景點名稱
              if (!containsFormattedAttractions) {
                // 處理各種景點類型關鍵詞
                const attractionKeywords = '景點|古蹟|博物館|公園|寺廟|神社|城堡|宮殿|教堂|大廈|塔|湖泊|山脈|海灘|瀑布|廣場|橋|區|門|塔|街|路';
                
                // 把未被標記的景點名稱轉換為紅色加粗文字
                processedLine = processedLine.replace(
                  new RegExp(`([\\u4e00-\\u9fa5A-Za-z]+(?:${attractionKeywords})[\\u4e00-\\u9fa5A-Za-z]*)`, 'g'), 
                  '<strong class="text-red-500 font-bold">$1</strong>'
                );
                
                // 尋找外國景點名稱 (通常是大寫開頭的詞組，後面跟著一些景點關鍵詞)
                processedLine = processedLine.replace(
                  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Park|Museum|Castle|Palace|Cathedral|Tower|Square|Bridge|Gate|Temple|Church))/g,
                  '<strong class="text-red-500 font-bold">$1</strong>'
                );
                
                // 處理帶括號的雙語景點名稱
                processedLine = processedLine.replace(
                  /([^\s,，\.。:：(（]{2,}?)[（(]([^)）]+)[)）]/g,
                  '<strong class="text-red-500 font-bold">$&</strong>'
                );
              }
              
              resultLines.push(processedLine);            
            } else {
              // 對於非行程部分，不需要特別處理景點
              resultLines.push(line);
            }
          }
          
          formatted = resultLines.join('\n');
          return formatted;
          
        } else {
          // 處理非Markdown格式
          let formatted = this.aiResponse;
          
          // 移除非預期的星號
          formatted = formatted.replace(/^\* /gm, ''); // 秘除行首的星號
          formatted = formatted.replace(/([^*\s])\*([^*\s])/g, '$1$2'); // 移除內容中的單獨星號
            // 基本換行處理
          formatted = formatted.replace(/\n/g, '<br>');          // 處理景點名稱，將其轉換為紅色加粗文字
          const attractionKeywords = '景點|古蹟|博物館|公園|寺廟|神社|城堡|宮殿|教堂|大廈|塔|湖泊|山脈|海灘|瀑布|廣場|橋|區|門|塔|街|路';
          formatted = formatted.replace(
            new RegExp(`([\\u4e00-\\u9fa5A-Za-z]+(?:${attractionKeywords})[\\u4e00-\\u9fa5A-Za-z]*)`, 'g'), 
            '<strong class="text-red-500 font-bold">$1</strong>'
          );
          
          // 處理外國景點名稱
          formatted = formatted.replace(
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Park|Museum|Castle|Palace|Cathedral|Tower|Square|Bridge|Gate|Temple|Church))/g,
            '<strong class="text-red-500 font-bold">$1</strong>'
          );
          
          // 處理帶括號的雙語景點名稱
          formatted = formatted.replace(
            /([^\s,，\.。:：(（]{2,}?)[（(]([^)）]+)[)）]/g,
            '<strong class="text-red-500 font-bold">$&</strong>'
          );
              
          // "第X天"為大標題
          formatted = formatted.replace(/第(\d+)天/g, 
            '<h2 class="text-2xl font-bold mt-12 pt-6 mb-6 py-2 border-b-2 border-emerald-500 text-emerald-800">第$1天</h2>');
          
          // 將"行程"、"住宿"、"用餐"等詞語作為中標題處理
          formatted = formatted.replace(/(行程|住宿建議|住宿推薦|用餐建議|用餐推薦|景點推薦|小建議)：/g,
            '<h3 class="text-xl font-semibold mt-6 mb-3 text-emerald-700">$1</h3>');
            // 優化用餐時段的換行顯示
          formatted = formatted.replace(/(早餐|午餐|晚餐)[:：]/g, 
            '<br><div class="mt-2 mb-2"><strong class="text-emerald-600">$1：</strong></div>');
          
          // 只對時間段應用綠色樣式，並且不強制換行（讓交通方式等內容緊接在後面）
          formatted = formatted.replace(/\*\*(上午|下午|晚上|早上|早晨|傍晚|中午|黃昏)\*\*[:：]/g, 
            '<strong class="text-emerald-600">$1：</strong>');
          
          // 處理沒有粗體標記的時間段（作為備用）
          formatted = formatted.replace(/(?<!\*)(上午|下午|晚上|早上|早晨|傍晚|中午|黃昏)(?!\*)[:：]/g, 
            '<strong class="text-emerald-600">$1：</strong>');
          
          // 住宿、注意事項等項目換行（但不包括交通，因為交通應該在時間段描述中）
          formatted = formatted.replace(/(住宿|注意事項)[:：]/g, 
            '<br><div class="mt-2 mb-1"><strong class="text-emerald-600">$1：</strong></div>');
          
          // 在句號後適當增加換行，但排除交通相關詞語
          formatted = formatted.replace(/([。！？])(\s*)(早餐|午餐|晚餐|上午|下午|晚上|早上|住宿|注意事項)/g, 
            '$1<br><div class="mt-2 mb-1"><strong class="text-emerald-600">$3：</strong></div>');
          
          return formatted;
        }
      } catch (error) {
        console.error('格式化AI回應時發生錯誤:', error);
        // 發生錯誤時返回原始回應，並移除星號
        let fallback = this.aiResponse.replace(/^\* /gm, '').replace(/\n/g, '<br>');
        return fallback;
      }
    }
  },
  methods: {
    changeRegion(region) {
      this.currentRegion = region;
    },    
    updateCountries(preserveSelectedCountry = false) {
      if (this.selectedRegion) {
        this.availableCountries = this.regionCountries[this.selectedRegion];
        this.countryPlaceholder = '請選擇國家';
        
        // 如果不需要保留選中的國家，或者選中的國家不在新的列表中，則清空
        if (!preserveSelectedCountry || 
            !this.availableCountries.includes(this.selectedCountry)) {
          this.selectedCountry = '';
        }
      } else {
        this.availableCountries = [];
        this.countryPlaceholder = '請先選擇區域';
        if (!preserveSelectedCountry) {
          this.selectedCountry = '';
        }
      }
    },
    addQuickOption(option) {
      const quickPrompts = {
        '加1天': '請基於原行程，幫我加1天',
        '減1天': '請基於原行程，幫我減1天'
      };
      
      const prompt = quickPrompts[option];
      if (!prompt) return;
      
      // 如果 specialRequirements 已經有內容，添加換行
      let currentText = this.specialRequirements.trim();
      if (currentText && !currentText.endsWith('\n')) {
        currentText += '\n\n';
      } else if (currentText) {
        currentText += '\n';
      }
      
      // 添加提示詞
      this.specialRequirements = currentText + prompt;
      
      // 聚焦到 textarea 的末尾
      this.$nextTick(() => {
        if (this.$refs.specialRequirementsTextarea) {
          const textarea = this.$refs.specialRequirementsTextarea;
          textarea.focus();
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      });
    },
    async generateItinerary() {
      if (!this.selectedRegion || !this.selectedCountry || !this.travelDays) {
        alert('請至少選擇旅遊區域、目的地國家和旅遊天數');
        return;
      }        this.isLoading = true;
      this.errorMessage = null;
      this.aiResponse = null;
      this.detectedDaysCount = 0; // 重置檢測到的天數
      this.showQuickOptions = false; // 隱藏快速選取按鈕
      
      try {
        try {
          console.log('正在調用API生成行程...');
          
          // 在 generateItinerary 之前
          const daysToSend = this.getDefaultDays(this.travelDays);
          // 傳給API的 days: daysToSend
          
          const response = await axios.post(`${this.apiBaseUrl}/ai/itinerary`, {
            region: this.selectedRegion,
            country: this.selectedCountry,
            days: daysToSend,
            departureDate: this.departureDate,
            travelType: this.travelType,
            specialRequirements: this.specialRequirements,
            // 新增：要求完整回應的參數
            requestComplete: true,
            maxLength: 4000 // 建議後端設置合適的最大長度
          }, {
            timeout: 120000, // 增加到2分鐘
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          });
            console.log('API完整回應:', response.data);
          
          if (response.data && response.data.success) {
            // 處理新的API格式，data.data.itinerary包含行程內容
            const aiMessage = response.data.data?.itinerary || response.data.message;
            console.log('回應長度:', aiMessage?.length);
            
            // 保存元數據以供後續使用
            const metadata = response.data.data?.metadata || {};
            console.log('回應元數據:', metadata);
            
            // 檢查回應是否被截斷
            const isTruncated = this.checkIfTruncated(aiMessage);
            
            // 變數來儲存處理後的回應
            let processedResponse = aiMessage;
            
            if (isTruncated) {
              console.warn('檢測到AI回應被截断');
              
              // 嘗試請求繼續生成
              processedResponse = await this.requestContinuation(aiMessage);
            } else {
              console.log('AI回應看起來完整');
            }
            
            // 執行質量檢查
            const qualityCheck = this.validateResponseQuality(processedResponse);
            
            if (!qualityCheck.isValid) {
              console.warn('AI回應質量檢查發現問題:', qualityCheck.issues);
              
              // 根據質量問題調整回應
              if (qualityCheck.issues.includes('回應內容過短')) {
                console.log('回應過短，嘗試增加內容');
                // 如果回應過短，嘗試再次生成或增強現有內容
                processedResponse = this.enhanceShortResponse(processedResponse);
              }
              
              // 處理未閉合的Markdown標記
              if (qualityCheck.issues.some(issue => issue.includes('未閉合'))) {
                console.log('修復未閉合的Markdown標記');
                processedResponse = this.fixUnclosedMarkdown(processedResponse);
              }
            }              this.aiResponse = processedResponse;
            console.log('最終處理後的回應長度:', processedResponse.length);
            
            // 更新天數計算和警告狀態
            this.updateDaysCountAndWarning();
            
            return;
          } else {
            throw new Error('API回應格式不正確');
          }
        } catch (apiError) {
          console.error('API連線詳細錯誤:', apiError);
          this.handleApiError(apiError);
        }
        
        // 備選方案：使用模擬資料
        console.log('使用完整的模擬行程資料');
        await new Promise(resolve => setTimeout(resolve, 800));
        this.generateCompleteMockResponse();
        
      } catch (error) {
        console.error('生成行程時發生錯誤:', error);
        this.errorMessage = `生成行程時發生錯誤: ${error.message}`;
        alert(this.errorMessage);
      } finally {
        this.isLoading = false;
      }
    },    // 改進的截斷檢測方法 - 更寬鬆的檢測標準
    checkIfTruncated(response) {
      // 空回應或太短的回應視為截斷
      if (!response) {
        console.warn('回應為空，視為截斷');
        return true;
      }
      
      if (response.length < 100) { // 降低最小長度要求
        console.warn('回應長度不足，視為截斷');
        return true;
      }
        // 檢查回應中的天數是否與請求的天數匹配
      const dayRange = this.travelDays.split('-');
      const minDays = parseInt(dayRange[0]);
      const maxDays = dayRange.length > 1 ? 
        (dayRange[1].includes('+') ? 99 : parseInt(dayRange[1])) : minDays;
        // 計算回應中包含的天數 (擴大檢測範圍，包括多種可能的標題格式)
      // 標準Markdown天數標題格式
      const h1DayMatches = response.match(/# 第\d+天/g) || [];
      const h2DayMatches = response.match(/## 第\d+天/g) || [];
      
      // 擴展匹配更多可能的標題格式
      const extraFormats = [
        // 匹配英文格式 (Day X)
        ...( response.match(/# Day \d+/gi) || [] ),
        ...( response.match(/## Day \d+/gi) || [] ),
        
        // 匹配中文漢字 (第一天, 第二天, etc)
        ...( response.match(/# 第[一二三四五六七八九十]+天/g) || [] ),
        ...( response.match(/## 第[一二三四五六七八九十]+天/g) || [] ),
        
        // 匹配日文風格 (X日目)
        ...( response.match(/# \d+日目/g) || [] ),
        ...( response.match(/## \d+日目/g) || [] ),
        
        // 匹配數字後接天/日 (X天 / X日)
        ...( response.match(/# \d+\s*[天日]/g) || [] ),
        ...( response.match(/## \d+\s*[天日]/g) || [] ),
        
        // 匹配無空格的格式 (#第X天)
        ...( response.match(/#第\d+天/g) || [] ),
        ...( response.match(/##第\d+天/g) || [] ),
        
        // 匹配格式 (行程X / X行程)
        ...( response.match(/# 行程\s*\d+/g) || [] ),
        ...( response.match(/## 行程\s*\d+/g) || [] ),
        ...( response.match(/# \d+\s*行程/g) || [] ),
        ...( response.match(/## \d+\s*行程/g) || [] ),
      ];
      
      // 收集所有匹配到的標題
      const allDayMatches = [...h1DayMatches, ...h2DayMatches, ...extraFormats];
      
      // 提取所有天數值並去重
      const dayNumbers = new Set();
      
      allDayMatches.forEach(match => {
        // 從各種格式中提取數字
        const numberMatch = match.match(/\d+/);
        if (numberMatch) {
          dayNumbers.add(parseInt(numberMatch[0]));
        }
      });
        // 使用去重後的天數數量作為實際天數
      const totalDayMatches = dayNumbers.size;
      
      console.log('偵測到行程天數段落:', totalDayMatches, 
        '(標準H1格式:', h1DayMatches.length, 
        ', 標準H2格式:', h2DayMatches.length,
        ', 其他格式:', extraFormats.length, ')');
      if (extraFormats.length > 0) {
        console.log('其他標題格式:', extraFormats);
      }
      
      // 儲存實際偵測到的天數，供後續使用
      this.detectedDaysCount = totalDayMatches;
      
      // 更寬鬆的天數檢查 - 允許80%的完成度
      const minimumAcceptable = Math.ceil(minDays * 0.8);
      if (totalDayMatches < minimumAcceptable) {
        console.warn(`回應僅包含${totalDayMatches}天，低於最低要求${minimumAcceptable}天（${minDays}天的80%），可能被截斷`);        return true;
      } else if (maxDays < 30 && totalDayMatches > maxDays) {
        console.warn(`回應包含${totalDayMatches}天，超過了預期的${minDays}-${maxDays}天`);
        // 超過天數不視為截斷，但會在UI上顯示警告
      }
      
      // 簡化的內容完整性檢查
      if (totalDayMatches > 0) {
        // 基本檢查：確保有基本的行程結構
        const hasBasicStructure = response.includes('行程') || 
                                  response.includes('##') || 
                                  response.includes('上午') || 
                                  response.includes('下午');
        
        if (!hasBasicStructure) {
          console.warn('缺少基本的行程結構，可能被截斷');
          return true;
        }
        
        // 檢查最後一天是否看起來完整（簡化版本）
        const lastDayMatch = response.match(/# 第(\d+)天[^#]*$/s);
        if (lastDayMatch && lastDayMatch[0].length < 100) {
          console.warn('最後一天內容過短，可能被截斷');
          return true;
        }
      }
      
      // 明顯的截斷模式檢測（簡化版本）
      const trimmedResponse = response.trim();
      const last50Chars = trimmedResponse.slice(-50);
        const definitelyTruncatedPatterns = [
        /[這是一個彈]$/, // 文字在中間被切斷
        /\*\s*$/, // 列表項目開始但沒有內容
        /[:：]\s*$/, // 冒號後沒有內容
        /第\d+天[：:]*\s*$/, // "第X天："後沒有內容
        /##[^#\n]*$/, // 未閉合的標題
        /[前往|搭乘|建議][^。！？]*$/, // 動作詞後沒有完成
      ];
      
      const isTruncated = definitelyTruncatedPatterns.some(pattern => {
        const match = pattern.test(last50Chars);
        if (match) {
          console.log('匹配到截斷模式:', pattern.source);
        }
        return match;
      });
      
      if (isTruncated) {
        console.log('檢測到AI回應被截斷');
        return true;
      }
      
      console.log('回應看起來是完整的');
      return false;
    },// 請求繼續生成完整回應
    async requestContinuation(partialResponse) {
      try {
        console.log('嘗試請求繼續生成，已有內容長度:', partialResponse.length);
        
        // 確保有內容要繼續生成
        if (!partialResponse || partialResponse.trim().length < 10) {
          console.warn('沒有足夠的初始內容可繼續生成');
          return partialResponse;
        }
        
        // 保存原始請求信息，用於API重試
        const requestData = {
          partialContent: partialResponse, // 保持這個鍵名兼容後端
          content: partialResponse,        // 新增這個鍵名作為備用
          originalRequest: {               // 保持這個結構兼容後端
            region: this.selectedRegion,
            country: this.selectedCountry,
            days: this.travelDays,
            departureDate: this.departureDate,
            travelType: this.travelType,
            specialRequirements: this.specialRequirements
          },
          metadata: {                      // 新增這個結構作為備用
            region: this.selectedRegion,
            country: this.selectedCountry,
            days: this.travelDays,
            departureDate: this.departureDate,
            travelType: this.travelType
          }
        };
        
        if (this.specialRequirements) {
          requestData.metadata.specialRequirements = this.specialRequirements;
        }
        
        // 發送請求到繼續生成API
        const continueResponse = await axios.post(`${this.apiBaseUrl}/ai/continue`, requestData, {
          timeout: 90000  // 增加超時時間到90秒
        });
        
        console.log('繼續生成API響應:', continueResponse.status);
        
        if (continueResponse.data && continueResponse.data.success) {
          // 合併完整回應，處理新響應格式
          if (continueResponse.data.data && continueResponse.data.data.content) {
            // 新格式
            return partialResponse + continueResponse.data.data.content;
          } else if (continueResponse.data.message) {
            // 舊格式
            return partialResponse + continueResponse.data.message;
          }
        }
      } catch (error) {
        console.error('無法請求繼續生成:', error.response?.status || error.message);
        // 顯示錯誤到UI
        this.showError(`無法繼續生成內容: ${error.response?.data?.error || error.message}`);
      }
      
      // 如果無法繼續生成，嘗試手動補完
      return this.manuallyComplete(partialResponse);
    },

    // 更智能的手動補完方法
    manuallyComplete(partialResponse) {
      console.log('嘗試智能補完回應');
      
      let completed = partialResponse.trim();
      const lastPart = completed.slice(-100);
      
      // 根據不同的截斷情況進行補完
      
      // 1. 處理像"彈"這樣的字符截斷
      if (completed.match(/[這是一個彈]$/)) {
        completed = completed.slice(0, -1) + '彈性的行程安排，您可以根據個人喜好和實際情況進行調整。';
      }
      
      // 2. 處理注意事項截斷
      else if (lastPart.match(/注意事項\s*[：:]*\s*\*?\s*$/)) {
        completed += '\n';
        completed += '* 請提前確認各景點的開放時間和門票價格\n';
        completed += '* 建議購買旅遊保險以保障行程安全\n';
        completed += '* 準備適合當地氣候的服裝和用品\n';
        completed += '* 保持護照和重要文件的備份\n';
        completed += '* 學習一些基本的當地語言和禮儀';
      }
      
      // 3. 處理交通信息截斷
      else if (lastPart.match(/搭乘[^。]*$/)) {
        const transportMatch = lastPart.match(/搭乘([^。]*?)$/);
        if (transportMatch) {
          const transport = transportMatch[1];
          if (transport.includes('JR') || transport.includes('地鐵') || transport.includes('巴士')) {
            completed += '前往目的地，車程約30-60分鐘，請注意發車時間。';
          } else {
            completed += '前往下一個目的地，請提前確認交通時刻表。';
          }
        }
      }
      
      // 4. 處理動作詞截斷
      else if (lastPart.match(/[前往|參觀|可以|建議][^。]*$/)) {
        completed += '，詳細信息請根據當地實際情況進行確認。';
      }
      
      // 5. 處理列表項目截斷
      else if (lastPart.match(/\*\s*$/)) {
        completed += ' 請根據個人喜好選擇合適的活動';
      }
      
      // 6. 處理冒號後截斷
      else if (lastPart.match(/[：:]\s*$/)) {
        completed += ' 詳細安排請參考以上建議。';
      }
      
      // 7. 通用結尾處理
      if (!completed.trim().match(/[。！？.!?✈️🎉]$/)) {
        completed += '。';
      }
      
      // 添加友好的結尾
      if (!completed.includes('祝您旅途愉快') && !completed.includes('Have a nice trip')) {
        completed += '\n\n祝您旅途愉快！ 🎉✈️';
      }
      
      return completed;
    },
    
    // 額外的回應質量檢查
    validateResponseQuality(response) {
      const issues = [];
      
      // 檢查最短長度
      if (response.length < 500) {
        issues.push('回應內容過短');
      }
      
      // 檢查是否包含基本旅遊信息
      const essentialKeywords = ['天', '行程', '景點', '交通', '住宿'];
      const missingKeywords = essentialKeywords.filter(keyword => 
        !response.includes(keyword)
      );
      
      if (missingKeywords.length > 2) {
        issues.push(`缺少重要關鍵字: ${missingKeywords.join(', ')}`);
      }
      
      // 檢查Markdown格式
      const unclosedMarkdown = [
        { pattern: /\*\*[^*]*$/, name: '未閉合的粗體' },
        { pattern: /#{1,6}[^#\n]*$/, name: '未閉合的標題' },
        { pattern: /\[[^\]]*$/, name: '未閉合的連結' }
      ];
      
      unclosedMarkdown.forEach(({ pattern, name }) => {
        if (pattern.test(response)) {
          issues.push(name);
        }
      });
      
      return {
        isValid: issues.length === 0,
        issues: issues
      };
    },
    
    // 增強過短的回應
    enhanceShortResponse(shortResponse) {
      console.log('增強過短的回應');
      let enhanced = shortResponse;
      
      // 檢查是否已有行程結構
      const hasDays = shortResponse.includes('第1天') || shortResponse.includes('第一天');
      const hasIntro = shortResponse.includes('行程概述') || shortResponse.includes('行程準備');
      const hasSummary = shortResponse.includes('行程總結') || shortResponse.includes('總結');
      
      // 如果沒有行程結構，添加基本結構
      if (!hasDays && !hasIntro) {
        enhanced = `# ${this.selectedCountry}${this.travelDays}天旅遊行程\n\n` + enhanced;
      }
      
      // 添加行程準備部分（如果缺少）
      if (!hasIntro) {
        enhanced += `\n\n## 行程準備\n\n`;
        enhanced += `**目的地：** ${this.selectedCountry}\n`;
        enhanced += `**旅遊天數：** ${this.travelDays}\n`;
        enhanced += `**旅遊類型：** ${this.travelType || '一般觀光'}\n`;
        if (this.departureDate) {
          enhanced += `**出發日期：** ${this.departureDate}\n`;
        }
        if (this.specialRequirements) {
          enhanced += `**特別需求：** ${this.specialRequirements}\n`;
        }
      }
      
      // 添加行程總結（如果缺少）
      if (!hasSummary) {
        enhanced += `\n\n## 行程總結\n\n`;
        enhanced += `這個${this.travelDays}天的${this.selectedCountry}之旅將帶給您豐富的體驗和美好回憶。`;
        enhanced += `旅途中請保持彈性，根據當地情況適時調整行程。\n\n`;
        enhanced += `**祝您旅途愉快！** 🎉✈️`;
      }
      
      return enhanced;
    },
    
    // 修復未閉合的Markdown標記
    fixUnclosedMarkdown(response) {
      console.log('修復未閉合的Markdown標記');
      let fixed = response;
      
      // 修復未閉合的粗體標記
      const boldMatch = fixed.match(/\*\*([^*]*)$/);
      if (boldMatch) {
        fixed = fixed.replace(/\*\*([^*]*)$/, `**${boldMatch[1]}**`);
      }
      
      // 修復未閉合的斜體標記
      const italicMatch = fixed.match(/(?<!\*)\*([^*\n]*)$/);
      if (italicMatch) {
        fixed = fixed.replace(/(?<!\*)\*([^*\n]*)$/, `*${italicMatch[1]}*`);
      }
      
      // 修復未閉合的連結
      const linkTextMatch = fixed.match(/\[([^\]]*?)$/);
      if (linkTextMatch) {
        fixed = fixed.replace(/\[([^\]]*?)$/, `[${linkTextMatch[1]}](連結)`);
      }
      
      // 修復未閉合的代碼塊
      if (fixed.match(/```[^`]*$/)) {
        fixed += '\n```';
      }
      
      return fixed;
    },

    // 處理API錯誤
    handleApiError(apiError) {
      if (apiError.code === 'ECONNABORTED') {
        this.errorMessage = 'API請求超時，正在使用備選方案生成行程...';
      } else if (apiError.response?.status === 413) {
        this.errorMessage = '請求內容過大，正在簡化請求並重試...';
      } else if (apiError.response?.status === 429) {
        this.errorMessage = 'API請求頻率過高，請稍後再試...';
      } else {
        console.warn('API連線失敗，使用模擬資料:', apiError.message);
      }
    },

    // 顯示錯誤信息
    showError(errorMsg) {
      this.errorMessage = errorMsg;
      console.warn(errorMsg);
      // 顯示錯誤訊息3秒後自動清除
      setTimeout(() => {
        if (this.errorMessage === errorMsg) {
          this.errorMessage = null;
        }
      }, 3000);
    },    // 更新天數計算和警告狀態
    updateDaysCountAndWarning() {
      if (!this.aiResponse) {
        this.actualDaysCount = 0;
        this.showDaysWarning = false;
        return;
      }      
      // 擴展正則表達式以匹配更多可能的標題格式
      const h1DayHeaders = this.aiResponse.match(/# 第\d+天/g) || [];
      const h2DayHeaders = this.aiResponse.match(/## 第\d+天/g) || [];
      
      // 新增：匹配更多標題格式
      const extraFormats = [
        // 匹配英文格式 (Day X)
        ...( this.aiResponse.match(/# Day \d+/gi) || [] ),
        ...( this.aiResponse.match(/## Day \d+/gi) || [] ),
        
        // 匹配中文漢字 (第一天, 第二天, etc)
        ...( this.aiResponse.match(/# 第[一二三四五六七八九十]+天/g) || [] ),
        ...( this.aiResponse.match(/## 第[一二三四五六七八九十]+天/g) || [] ),
        
        // 匹配日文風格 (X日目)
        ...( this.aiResponse.match(/# \d+日目/g) || [] ),
        ...( this.aiResponse.match(/## \d+日目/g) || [] ),
        
        // 匹配數字後接天/日 (Day X / X天 / X日)
        ...( this.aiResponse.match(/# \d+\s*[天日]/g) || [] ),
        ...( this.aiResponse.match(/## \d+\s*[天日]/g) || [] ),
        
        // 匹配無空格的格式 (#第X天)
        ...( this.aiResponse.match(/#第\d+天/g) || [] ),
        ...( this.aiResponse.match(/##第\d+天/g) || [] ),
        
        // 匹配格式 (行程X / X行程)
        ...( this.aiResponse.match(/# 行程\s*\d+/g) || [] ),
        ...( this.aiResponse.match(/## 行程\s*\d+/g) || [] ),
        ...( this.aiResponse.match(/# \d+\s*行程/g) || [] ),
        ...( this.aiResponse.match(/## \d+\s*行程/g) || [] ),
      ];
      
      // 收集所有匹配到的標題
      const allDayMatches = [...h1DayHeaders, ...h2DayHeaders, ...extraFormats];
      
      // 提取所有天數值並去重
      const dayNumbers = new Set();
      const daysList = [];
      
      allDayMatches.forEach(match => {
        // 從各種格式中提取數字
        const numberMatch = match.match(/\d+/);
        if (numberMatch) {
          const dayNum = parseInt(numberMatch[0]);
          dayNumbers.add(dayNum);
          daysList.push({day: dayNum, title: match});
        }
      });
      
      // 使用去重後的天數數量作為實際天數
      const totalDayMatches = dayNumbers.size;
      
      // 調試輸出
      console.log(`實際偵測到${allDayMatches.length}個天數標題，去重後有${totalDayMatches}天：`, 
        Array.from(dayNumbers).sort((a, b) => a - b));
      if (allDayMatches.length > totalDayMatches) {
        console.log('發現重複的天數標題:', daysList.sort((a, b) => a.day - b.day));
      }
      
      // 調試輸出
      console.log(`偵測到${totalDayMatches}天的行程標題:
        - 標準H1格式(# 第X天): ${h1DayHeaders.length}
        - 標準H2格式(## 第X天): ${h2DayHeaders.length}
        - 其他格式: ${extraFormats.length}
        - 其他格式詳情:`, extraFormats);
      
      this.actualDaysCount = totalDayMatches;
      
      // 如果已經從其他地方檢測到確切天數，則使用該天數
      if (this.detectedDaysCount > 0 && this.detectedDaysCount > this.actualDaysCount) {
        this.actualDaysCount = this.detectedDaysCount;
      }
        // 判斷是否顯示天數不足或過多警告
      if (this.actualDaysCount === 0 || this.requestedMinDays === 0) {
        this.showDaysWarning = false;
      } else {
        // 檢查天數是否在請求範圍內
        const dayRange = this.travelDays.split('-');
        const minDays = parseInt(dayRange[0]);
        const maxDays = dayRange.length > 1 ? 
          (dayRange[1].includes('+') ? 30 : parseInt(dayRange[1])) : minDays;
          
        // 如果生成的天數小於最小請求天數或大於最大請求天數
        this.showDaysWarning = this.actualDaysCount < minDays || 
          (maxDays < 30 && this.actualDaysCount > maxDays);      }
      
      console.log('更新天數計算:', this.actualDaysCount, '請求天數範圍:', this.travelDays, '顯示警告:', this.showDaysWarning);
      
      // 更新行程介紹中的天數信息
      this.updateIntroduction();
    },
    
    // 生成完整的模擬回應
    generateCompleteMockResponse() {
      const daysNum = parseInt(this.travelDays.split('-')[0]) || 3;
      
      let mockResponse = `# ${this.selectedCountry}${this.travelDays}天深度之旅\n\n`;
      mockResponse += `**行程概述：** 這是一個專為${this.travelType || '一般遊客'}設計的${this.selectedCountry}旅遊行程，涵蓋了主要景點、文化體驗和美食享受。\n\n`;
      
      // 行程前準備
      mockResponse += `## 行程準備\n\n`;
      mockResponse += `**出發日期：** ${this.departureDate || '請確認您的出發日期'}\n`;
      mockResponse += `**旅遊天數：** ${this.travelDays}天\n`;
      mockResponse += `**旅遊類型：** ${this.travelType || '綜合旅遊'}\n\n`;
      
      if (this.specialRequirements) {
        mockResponse += `**特別需求：** ${this.specialRequirements}\n\n`;
      }
        // 詳細行程 - 確保生成的天數與用戶請求的一致，不多不少
      const actualDays = this.travelDays.includes('-') ? 
        parseInt(this.travelDays.split('-')[0]) : parseInt(this.travelDays);
      const daysToGenerate = actualDays || daysNum;
      
      console.log(`正在生成${daysToGenerate}天的行程...`);
      
      for (let day = 1; day <= daysToGenerate; day++) {
        mockResponse += this.getDetailedDayContent(day);
      }
      
      // 實用信息
      mockResponse += `## 實用信息\n\n`;
      mockResponse += `**交通：** 建議提前預訂機票和當地交通票券\n`;
      mockResponse += `**住宿：** 推薦選擇交通便利的市中心區域\n`;
      mockResponse += `**預算：** 根據您的消費習慣和旅遊天數制定合理預算\n`;
      mockResponse += `**必備物品：** 護照、簽證、旅遊保險、適合的服裝\n\n`;
      
      mockResponse += `## 行程總結\n\n`;
      mockResponse += `這個${this.travelDays}天的${this.selectedCountry}之旅將帶給您豐富的文化體驗和美好回憶。記得保持開放的心態，享受每一個精彩時刻！\n\n`;      mockResponse += `**祝您旅途愉快！** 🎉✈️`;
      
      this.aiResponse = mockResponse;
      
      // 更新天數計算和警告狀態，這會自動調用 updateIntroduction()
      this.updateDaysCountAndWarning();
      
      console.log('檢查模擬回應的截斷情況:', this.checkTruncation(mockResponse) ? '被截斷' : '完整');
    },

    getDetailedDayContent(day) {
      const destinations = {
        1: { title: `抵達${this.selectedCountry}`, activities: ['機場接送', '酒店入住', '市區初探', '歡迎晚餐'] },
        2: { title: '市中心觀光', activities: ['著名景點參觀', '文化體驗活動', '當地美食品嚐', '購物體驗'] },
        3: { title: '深度文化體驗', activities: ['歷史古蹟參觀', '傳統手工藝體驗', '當地人交流', '特色表演觀賞'] },
        4: { title: '自然風光探索', activities: ['自然景區遊覽', '戶外活動體驗', '風景攝影', '生態觀察'] },
        5: { title: '美食與購物', activities: ['市場探索', '烹飪課程', '購物天堂', '紀念品選購'] },
        6: { title: '周邊地區一日遊', activities: ['郊區景點', '鄉村體驗', '當地節慶', '特色活動'] },
        7: { title: '告別與返程', activities: ['最後購物', '行李整理', '機場送機', '回程準備'] }
      };
      
      const dayInfo = destinations[day] || destinations[1];
      
      let content = `## 第${day}天：${dayInfo.title}\n\n`;
      
      const timeSlots = ['上午', '下午', '晚上'];
      const activitiesPerSlot = Math.ceil(dayInfo.activities.length / timeSlots.length);
      
      timeSlots.forEach((time, index) => {
        content += `**${time}：**\n`;
        const startIdx = index * activitiesPerSlot;
        const endIdx = Math.min(startIdx + activitiesPerSlot, dayInfo.activities.length);
        
        for (let i = startIdx; i < endIdx; i++) {
          if (dayInfo.activities[i]) {
            content += `* ${dayInfo.activities[i]}\n`;
          }
        }
        content += '\n';
      });
      
      content += `**住宿建議：** 選擇靠近主要景點的舒適酒店\n`;
      content += `**餐飲推薦：** 品嚐當地特色料理和國際美食\n\n`;
      
      return content;
    },    modifyItinerary() {
      // 解析請求的天數範圍
      const dayRange = this.travelDays.split('-');
      const minDays = parseInt(dayRange[0]);
      const maxDays = dayRange.length > 1 ? 
        (dayRange[1].includes('+') ? 30 : parseInt(dayRange[1])) : minDays;
      
      // 檢查行程天數異常情況
      if (this.showDaysWarning) {
        // 情況1: 天數不足
        if (this.actualDaysCount < minDays) {
          const missingDays = minDays - this.actualDaysCount;
          const nextDay = this.actualDaysCount + 1;
          
          this.specialRequirements = `基於上述行程，請繼續生成第${nextDay}天至第${minDays}天的完整行程：\n\n特別說明：\n1. 需要生成${missingDays}天的額外行程（從第${nextDay}天到第${minDays}天）\n2. 請和前面${this.actualDaysCount}天保持相同的格式和風格\n3. 可以建議參觀以下景點或地點：[用戶可在此填入]\n`;
        } 
        // 情況2: 天數超過
        else if (this.actualDaysCount > maxDays) {
          this.specialRequirements = `請精簡上述行程，只提供${maxDays}天的行程規劃：\n\n特別說明：\n1. 當前行程有${this.actualDaysCount}天，需要精簡為${maxDays}天\n2. 請保留最重要和最具代表性的景點和活動\n3. 確保行程內容豐富但不過於緊湊\n4. 保持與原有風格一致的Markdown格式\n`;
        }      } else {
        // 若天數正常，則是一般修改
        this.specialRequirements = '基於目前行程，我希望修改：\n\n';
      }
      
      // 顯示快速選取按鈕
      this.showQuickOptions = true;
      
      // 滾動到特別需求輸入框
      this.$nextTick(() => {
        if (this.$refs.specialRequirementsSection) {
          this.$refs.specialRequirementsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
        if (this.$refs.specialRequirementsTextarea) {
          this.$refs.specialRequirementsTextarea.focus();
        }
      });
    },saveItinerary() {
      if (!this.aiResponse) return;
      
      const newItinerary = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        region: this.selectedRegion,
        country: this.selectedCountry,
        days: this.travelDays,
        type: this.travelType,
        departureDate: this.departureDate || '',
        specialRequirements: this.specialRequirements || '',
        content: this.aiResponse
      };
      
      // 從本地儲存獲取已有行程
      let savedItineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
      
      // 添加新行程
      savedItineraries.push(newItinerary);
      
      // 保存回本地儲存
      localStorage.setItem('savedItineraries', JSON.stringify(savedItineraries));
      
      // 更新組件中的資料
      this.savedItineraries = savedItineraries;
      
      alert('行程已儲存到您的瀏覽器本地！您可以點擊"查看本地儲存的行程"按鈕來查看。\n\n💡 提示：如果要在照片牆中關聯行程，請使用"儲存至雲端 (供照片牆使用)"按鈕將行程儲存至雲端資料庫。');
    },    async confirmAndSaveToFirebase() {
      if (!this.aiResponse) {
        alert('沒有行程內容可以儲存');
        return;
      }
      
      if (!isAuthenticated.value) {
        this.showLoginPrompt = true;
        setTimeout(() => {
          this.router.push('/login?redirect=/advice');
        }, 5000);
        return;
      }
      try {
        this.isProcessing = true;
        
        // 從行程內容中提取資訊 (類似爬蟲)
        const extractedInfo = this.extractInfoFromItinerary(this.aiResponse);
        
        // 自動更新表單字段，確保UI與提取的信息同步        // 首先設置區域，這會觸發國家列表更新
        if (!this.selectedRegion && extractedInfo.region) {
          this.selectedRegion = extractedInfo.region;
          this.updateCountries(true); // 保留選中的國家
        }
        
        // 然後設置國家（在區域設置後，國家列表已更新）
        if (!this.selectedCountry && extractedInfo.country) {
          this.selectedCountry = extractedInfo.country;
        }
        
        if (!this.travelDays && extractedInfo.days) {
          this.travelDays = extractedInfo.days;
        }
        
        if (!this.travelType && extractedInfo.type) {
          this.travelType = extractedInfo.type;
        }
        
        // 如果無法從內容中提取到國家和天數，則使用表單中的值
        let country = this.selectedCountry || extractedInfo.country;
        let days = this.travelDays || extractedInfo.days;
        let region = this.selectedRegion || extractedInfo.region || '未指定區域';
        let type = this.travelType || extractedInfo.type || '一般旅遊';
        
        // 如果仍然沒有國家資訊，嘗試從行程標題中提取
        if (!country) {
          // 嘗試尋找常見國家名稱
          const content = this.aiResponse;
          const commonCountries = [
            '日本', '韓國', '泰國', '台灣', '新加坡', '馬來西亞', '越南', 
            '印尼', '菲律賓', '中國', '香港', '澳門', '印度', '美國', '加拿大', 
            '墨西哥', '英國', '法國', '德國', '義大利', '西班牙', '葡萄牙', 
            '瑞士', '荷蘭', '比利時', '奧地利', '希臘', '澳洲', '紐西蘭'
          ];
          
          for (const possibleCountry of commonCountries) {
            if (content.includes(possibleCountry + '行程') || 
                content.includes(possibleCountry + '旅遊') || 
                content.includes(possibleCountry + '旅行') ||
                content.includes(possibleCountry + ' ') ||
                content.includes('前往' + possibleCountry) ||
                content.match(new RegExp(`${possibleCountry}\\d+天`))) {
              country = possibleCountry;
              break;
            }
          }
        }

        // 如果仍然沒有天數資訊，嘗試從行程中查找常見的天數模式
        if (!days) {
          const content = this.aiResponse;
          const daysMatch = content.match(/(\d+[-+]?\d*)天/);
          if (daysMatch) {
            days = daysMatch[1];
          } else if (content.includes('3-5天') || content.includes('3到5天')) {
            days = '3-5';
          } else if (content.includes('6-8天') || content.includes('6到8天')) {
            days = '6-8';
          } else if (content.includes('9-12天') || content.includes('9到12天')) {
            days = '9-12';
          } else if (content.includes('13天') || content.includes('兩週')) {
            days = '13+';
          }
        }
        
        // 嘗試從行程內容推斷區域
        if (!region || region === '未指定區域') {
          const content = this.aiResponse;
          const regionPatterns = {
            'asia': /亞洲|東亞|東南亞|南亞/i,
            'europe': /歐洲|西歐|東歐|南歐|北歐/i,
            'america': /美洲|北美|南美|拉丁美洲/i,
            'oceania': /大洋洲|澳洲/i,
            'africa': /非洲/i
          };
          
          for (const [regionKey, pattern] of Object.entries(regionPatterns)) {
            if (pattern.test(content)) {
              region = regionKey;
              break;
            }
          }
          
          // 如果仍然沒有區域，根據國家推測區域
          if ((!region || region === '未指定區域') && country) {
            const countryToRegion = {
              '日本': 'asia', '韓國': 'asia', '泰國': 'asia', '台灣': 'asia', '新加坡': 'asia', 
              '馬來西亞': 'asia', '越南': 'asia', '印尼': 'asia', '菲律賓': 'asia', '印度': 'asia',
              '中國': 'asia', '香港': 'asia', '澳門': 'asia',
              '英國': 'europe', '法國': 'europe', '德國': 'europe', '義大利': 'europe', 
              '西班牙': 'europe', '葡萄牙': 'europe', '瑞士': 'europe',
              '美國': 'america', '加拿大': 'america', '墨西哥': 'america',
              '澳洲': 'oceania', '紐西蘭': 'oceania',
              '埃及': 'africa', '摩洛哥': 'africa', '南非': 'africa'
            };
            
            if (countryToRegion[country]) {
              region = countryToRegion[country];
            }
          }
        }
        
        // 確認是否有足夠資訊儲存行程
        if (!country) {
          alert('無法儲存：系統無法確定目的地國家，請在表單中選擇國家');
          this.isProcessing = false;
          return;
        }
        
        if (!days) {
          alert('無法儲存：系統無法確定旅遊天數，請在表單中選擇天數');
          this.isProcessing = false;
          return;
        }
        
        // 自動提取天數數字（如果是範圍，取第一個數字）
        let daysNumber = days;
        if (typeof days === 'string') {
          if (days.includes('-')) {
            daysNumber = days.split('-')[0];
          } else if (days.includes('+')) {
            daysNumber = days.replace('+', '');
          }
        }
          // 提取每日景點亮點
        const dailyHighlights = this.extractDailyHighlights(this.aiResponse);
        
        // 準備行程資料（確保所有欄位都有值）
        const itineraryData = {
          title: `${country} ${daysNumber}天行程`,
          region: region,
          country: country,
          days: days,
          type: type,
          departureDate: this.departureDate || '',
          content: this.aiResponse,
          createdAt: new Date().toISOString(),
          specialRequirements: this.specialRequirements || '',
          dailyHighlights: dailyHighlights // 添加每日行程亮點
        };
          console.log('正在儲存行程至Firebase:', {
          title: itineraryData.title,
          country: itineraryData.country,
          days: itineraryData.days,
          region: itineraryData.region,
          dailyHighlights: itineraryData.dailyHighlights
        });
          // 添加用戶 ID 到行程資料中
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        const userItineraryData = {
          ...itineraryData,
          userId: userInfo.uid || currentUser.value?.uid, // 確保有用戶 ID
          userEmail: userInfo.email || currentUser.value?.email // 額外保存用戶郵箱以便識別
        };

        // 儲存到 Firebase，按用戶分離
        const result = await aiService.saveItineraryToFirebase(userItineraryData);
          if (result.success) {
          alert(`行程已成功儲存至雲端資料庫！\n行程ID: ${result.id}\n\n此行程已專門儲存供照片牆頁面使用。\n您可以前往照片牆頁面上傳照片並關聯此行程。`);
        } else {
          alert('儲存失敗：' + (result.error || '未知錯誤'));
        }
      } catch (error) {
        console.error('儲存行程至 Firebase 失敗:', error);
        alert('儲存至雲端失敗：' + (error.message || '伺服器錯誤'));
      } finally {
        this.isProcessing = false;
      }
    },
    
    // 從行程內容提取必要資訊（國家、天數等）
    extractInfoFromItinerary(content) {
      if (!content) return {};
      
      const result = {
        country: null,
        days: null,
        region: null,
        type: null
      };
      
      try {
        // 嘗試提取國家名稱（多種模式）
        // 模式1: 標題匹配 - "# 日本7天行程"
        let titleMatch = content.match(/(?:^|\n)#\s*([^#\n]+?)(?:\d+|\s*日|\s*天)(?:旅遊|之旅|行程|遊記|深度|遊|攻略)/i);
        
        // 模式2: 標題匹配2 - "# 日本旅遊行程"，然後在內容中尋找天數
        if (!titleMatch) {
          titleMatch = content.match(/(?:^|\n)#\s*([^#\n]+?)(?:旅遊|之旅|行程|遊記|深度|遊|攻略)/i);
        }
        
        // 模式3: 目的地說明 - "目的地: 日本"
        const destinationMatch = content.match(/(?:目的地|旅遊地|地點|國家)(?:\s*[：:]\s*)([^\n,，、]+)/);
        
        // 模式4: 常見的行程標題 - "第一天: 抵達東京"，從中提取國家城市
        const dayMatch = content.match(/第一[天日](?:\s*[：:])?\s*抵達([^\n,，、]+)/);
        
        if (titleMatch && titleMatch[1]) {
          let countryName = titleMatch[1].trim();
          // 清理文本中可能有的特殊符號
          countryName = countryName.replace(/[【】\[\]「」『』（）()]/g, '').trim();
          result.country = countryName;
        } else if (destinationMatch && destinationMatch[1]) {
          result.country = destinationMatch[1].trim();
        } else if (dayMatch && dayMatch[1]) {
          // 從第一天描述中提取可能的國家或城市
          const location = dayMatch[1].trim();
            // 城市到國家的映射（擴展版）
          const cityToCountry = {
            // 亞洲
            '東京': '日本', '大阪': '日本', '京都': '日本', '橫濱': '日本', '神戶': '日本', '福岡': '日本', '名古屋': '日本',
            '首爾': '韓國', '釜山': '韓國', '濟州島': '韓國', '大邱': '韓國',
            '曼谷': '泰國', '普吉島': '泰國', '清邁': '泰國', '芭堤雅': '泰國',
            '台北': '台灣', '高雄': '台灣', '台中': '台灣', '台南': '台灣',
            '吉隆坡': '馬來西亞', '檳城': '馬來西亞',
            '新加坡': '新加坡',
            '河內': '越南', '胡志明市': '越南', '峴港': '越南',
            '雅加達': '印尼', '峇里島': '印尼',
            '馬尼拉': '菲律賓', '宿霧': '菲律賓',
            '北京': '中國', '上海': '中國', '廣州': '中國', '深圳': '中國', '杭州': '中國', '成都': '中國',
            '香港': '香港',
            '澳門': '澳門',
            '孟買': '印度', '新德里': '印度', '加爾各答': '印度',
            '迪拜': '阿聯酋', '阿布達比': '阿聯酋',
            '伊斯坦布爾': '土耳其', '安卡拉': '土耳其',
            
            // 歐洲
            '倫敦': '英國', '愛丁堡': '英國', '曼徹斯特': '英國',
            '巴黎': '法國', '里昂': '法國', '馬賽': '法國', '尼斯': '法國',
            '柏林': '德國', '慕尼黑': '德國', '漢堡': '德國', '科隆': '德國',
            '羅馬': '義大利', '米蘭': '義大利', '威尼斯': '義大利', '佛羅倫斯': '義大利', '那不勒斯': '義大利',
            '馬德里': '西班牙', '巴塞羅那': '西班牙', '塞維亞': '西班牙',
            '里斯本': '葡萄牙', '波爾圖': '葡萄牙',
            '蘇黎世': '瑞士', '日內瓦': '瑞士', '伯爾尼': '瑞士',
            '維也納': '奧地利', '薩爾茨堡': '奧地利',
            '阿姆斯特丹': '荷蘭', '海牙': '荷蘭',
            '布魯塞爾': '比利時',
            '雅典': '希臘', '聖托里尼': '希臘',
            '布拉格': '捷克',
            '布達佩斯': '匈牙利',
            '華沙': '波蘭', '克拉科夫': '波蘭',
            '哥本哈根': '丹麥',
            '斯德哥爾摩': '瑞典',
            '奧斯陸': '挪威',
            '赫爾辛基': '芬蘭',
            '雷克雅維克': '冰島',
            '都柏林': '愛爾蘭',
            '札格拉布': '克羅埃西亞',
            
            // 美洲
            '紐約': '美國', '洛杉磯': '美國', '舊金山': '美國', '芝加哥': '美國', '拉斯維加斯': '美國', 
            '邁阿密': '美國', '西雅圖': '美國', '波士頓': '美國', '華盛頓': '美國',
            '溫哥華': '加拿大', '多倫多': '加拿大', '蒙特婁': '加拿大', '卡爾加里': '加拿大',
            '墨西哥城': '墨西哥', '坎昆': '墨西哥',
            '聖保羅': '巴西', '里約熱內盧': '巴西',
            '布宜諾斯艾利斯': '阿根廷',
            '聖地亞哥': '智利',
            '利馬': '秘魯',
            '波哥大': '哥倫比亞',
            '哈瓦那': '古巴',
            
            // 大洋洲
            '雪梨': '澳洲', '墨爾本': '澳洲', '布里斯班': '澳洲', '伯斯': '澳洲', '阿得雷德': '澳洲',
            '奧克蘭': '紐西蘭', '威靈頓': '紐西蘭', '基督城': '紐西蘭',
            '蘇瓦': '斐濟',
            
            // 非洲
            '開羅': '埃及', '亞歷山大': '埃及',
            '卡薩布蘭卡': '摩洛哥', '馬拉喀什': '摩洛哥', '拉巴特': '摩洛哥',
            '開普敦': '南非', '約翰尼斯堡': '南非',
            '奈洛比': '肯亞',
            '達累斯薩拉姆': '坦尚尼亞'
          };
          
          if (cityToCountry[location]) {
            result.country = cityToCountry[location];
          } else {
            // 可能直接是國家名
            result.country = location;
          }
        }
          // 如果仍然沒有找到國家，嘗試在整個文本中更智能地搜索國家名稱
        if (!result.country) {
          const commonCountries = [
            '日本', '韓國', '泰國', '台灣', '新加坡', '馬來西亞', '越南', 
            '印尼', '菲律賓', '中國', '香港', '澳門', '印度', '美國', '加拿大', 
            '墨西哥', '英國', '法國', '德國', '義大利', '西班牙', '葡萄牙', 
            '瑞士', '荷蘭', '比利時', '奧地利', '希臘', '澳洲', '紐西蘭',
            '埃及', '摩洛哥', '南非', '阿聯酋', '土耳其', '巴西', '阿根廷', '智利',
            '秘魯', '哥倫比亞', '古巴', '斐濟', '肯亞', '坦尚尼亞', '捷克', '匈牙利',
            '波蘭', '丹麥', '瑞典', '挪威', '芬蘭', '冰島', '愛爾蘭', '克羅埃西亞'
          ];
          
          // 第一優先級：尋找 "XXX行程" 或 "XXX旅遊" 等明確的模式
          for (const country of commonCountries) {
            const patterns = [
              `${country}行程`,
              `${country}旅遊`,
              `${country}之旅`,
              `${country}遊記`,
              `${country}攻略`,
              `${country}深度遊`,
              `前往${country}`,
              `到${country}`,
              `${country}\\s*\\d+\\s*天`,
              `${country}\\s*\\d+\\s*日`
            ];
            
            for (const pattern of patterns) {
              if (content.match(new RegExp(pattern))) {
                result.country = country;
                break;
              }
            }
            
            if (result.country) break;
          }
          
          // 第二優先級：尋找在標題或重要位置出現的國家名稱
          if (!result.country) {
            for (const country of commonCountries) {
              // 檢查是否在標題行（以#開頭）中出現
              const titleMatch = content.match(new RegExp(`^#[^\\n]*${country}[^\\n]*$`, 'm'));
              if (titleMatch) {
                result.country = country;
                break;
              }
              
              // 檢查是否在文檔開頭附近出現
              const firstParagraph = content.substring(0, 200);
              if (firstParagraph.includes(country)) {
                result.country = country;
                break;
              }
            }
          }
          
          // 第三優先級：尋找出現頻率最高的國家名稱
          if (!result.country) {
            let maxCount = 0;
            let mostMentioned = null;
            
            for (const country of commonCountries) {
              // 使用更精確的正則表達式來避免誤匹配
              const regex = new RegExp(`(?:^|[^\\p{L}])${country}(?=[^\\p{L}]|$)`, 'gu');
              const matches = content.match(regex);
              const count = matches ? matches.length : 0;
              
              if (count > maxCount) {
                maxCount = count;
                mostMentioned = country;
              }
            }
            
            // 只有當國家名稱出現次數足夠多時才採用（降低門檻）
            if (maxCount >= 1) {
              result.country = mostMentioned;
            }
          }
        }
        
        // 嘗試從文本中提取旅遊天數
        // 模式1: "X天" 直接匹配
        const daysMatch1 = content.match(/(?:^|\n)#[^\n]*?(\d+)\s*(?:天|日)[^\d]/);
        // 模式2: "旅遊天數: X天" 格式匹配
        const daysMatch2 = content.match(/(?:旅遊|行程)(?:天數|日數)(?:\s*[：:]\\s*)(\d+[\-\+]?\d*)/i);
        // 模式3: "X日遊" 格式匹配
        const daysMatch3 = content.match(/(\d+)(?:\s*天|\s*日)(?:遊|行程|旅行|旅遊)/);
        // 模式4: 直接尋找 "X天行程" 或類似模式
        const daysMatch4 = content.match(/(\d+(?:-\d+)?(?:\+)?)(?:\s*天|\s*日)(?:行程|旅程|旅遊|遊玩|遊覽|旅行)/i);
        
        // 根據匹配結果獲取天數
        if (daysMatch1 && daysMatch1[1]) {
          result.days = daysMatch1[1];
        } else if (daysMatch2 && daysMatch2[1]) {
          result.days = daysMatch2[1];
        } else if (daysMatch3 && daysMatch3[1]) {
          result.days = daysMatch3[1];
        } else if (daysMatch4 && daysMatch4[1]) {
          result.days = daysMatch4[1];
        }
        
        // 如果仍然找不到天數，尋找可能有的最後一天標記
        if (!result.days) {
          // 尋找 "Day X" 或 "第X天" 的最大值
          const dayPattern = /(?:Day|day|第)(\d+)(?:天|日|\s|：|:)/g;
          let match;
          let maxDay = 0;
          
          while ((match = dayPattern.exec(content)) !== null) {
            const day = parseInt(match[1]);
            if (day > maxDay) maxDay = day;
          }
          
          if (maxDay > 0) {
            result.days = maxDay.toString();
          }
        }
        
        // 如果還是找不到天數，嘗試匹配預設的天數範圍
        if (!result.days) {
          if (content.includes('3-5天') || content.includes('3到5天')) {
            result.days = '3-5';
          } else if (content.includes('6-8天') || content.includes('6到8天')) {
            result.days = '6-8';
          } else if (content.includes('9-12天') || content.includes('9到12天')) {
            result.days = '9-12';
          } else if (content.includes('13天以上') || content.includes('兩週') || content.includes('两周')) {
            result.days = '13+';
          }
        }
          // 嘗試判斷地區
        const regionPatterns = {
          'asia': /亞洲|東亞|東南亞|南亞/i,
          'europe': /歐洲|西歐|東歐|南歐|北歐/i,
          'america': /美洲|北美|南美|拉丁美洲/i,
          'oceania': /大洋洲|澳洲/i,
          'africa': /非洲/i
        };
        
        for (const [region, pattern] of Object.entries(regionPatterns)) {
          if (pattern.test(content)) {
            result.region = region;
            break;
          }
        }
        
        // 如果沒有直接找到地區，根據國家推測區域
        if (!result.region && result.country) {
          const countryToRegion = {
            '日本': 'asia', '韓國': 'asia', '泰國': 'asia', '台灣': 'asia', '新加坡': 'asia', 
            '馬來西亞': 'asia', '越南': 'asia', '印尼': 'asia', '菲律賓': 'asia', '印度': 'asia',
            '中國': 'asia', '香港': 'asia', '澳門': 'asia',
            '英國': 'europe', '法國': 'europe', '德國': 'europe', '義大利': 'europe', 
            '西班牙': 'europe', '葡萄牙': 'europe', '瑞士': 'europe', '荷蘭': 'europe',
            '比利時': 'europe', '奧地利': 'europe', '希臘': 'europe',
            '美國': 'america', '加拿大': 'america', '墨西哥': 'america',
            '澳洲': 'oceania', '紐西蘭': 'oceania',
            '埃及': 'africa', '摩洛哥': 'africa', '南非': 'africa'
          };
          
          if (countryToRegion[result.country]) {
            result.region = countryToRegion[result.country];
          }
        }
        
        // 尋找旅遊類型
        const typePatterns = {
          'family': /家庭旅遊|親子|家人|帶小孩/i,
          'honeymoon': /蜜月|情侶|浪漫/i,
          'adventure': /冒險|探險|極限|挑戰|登山|潛水/i,
          'culture': /文化|歷史|古蹟|藝術|節慶/i,
          'food': /美食|餐廳|料理|小吃|飲食/i
        };
        
        for (const [type, pattern] of Object.entries(typePatterns)) {
          if (pattern.test(content)) {
            result.type = type;
            break;
          }
        }
        console.log('從行程中提取的資訊:', result);
        console.log('提取詳情 - 標題匹配:', titleMatch, '目的地匹配:', destinationMatch, '第一天匹配:', dayMatch);
        return result;
      } catch (error) {
        console.warn('從行程提取資訊時發生錯誤:', error);
        return result;
      }
    },
    
    // 從行程內容提取每日行程亮點
    extractDailyHighlights(content) {
      if (!content) return [];
      
      const dailyHighlights = [];
      const dayPatterns = [
        // 匹配 "第X天：地點" 或 "第X日：地點" 或 "Day X：地點" 格式
        /(?:第\s*(\d+)\s*[天日]|[Dd]ay\s*(\d+))(?:\s*[：:]\s*)([^\n]+)/g,
        // 匹配 "X天：地點" 或 "X日：地點" 格式
        /(?:(\d+)\s*[天日])(?:\s*[：:]\s*)([^\n]+)/g,
        // 匹配 "**第X天：地點**" Markdown格式
        /\*\*(?:第\s*(\d+)\s*[天日]|[Dd]ay\s*(\d+))(?:\s*[：:]\s*)([^\n]+)\*\*/g,
        // 匹配 "### 第X天：地點" 或 "### Day X：地點" 格式 (Markdown標題)
        /###\s*(?:第\s*(\d+)\s*[天日]|[Dd]ay\s*(\d+))(?:\s*[：:]\s*)([^\n]+)/g
      ];
      
      // 對每種模式嘗試匹配
      for (const pattern of dayPatterns) {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
          // 重置結果並處理當前匹配
          dailyHighlights.length = 0;
          
          for (const match of matches) {
            // 提取日期和描述
            let day, description;
            if (match[1] !== undefined) {
              day = match[1];
              description = match[3] || match[2]; // 不同格式的描述位置不同
            } else if (match[2] !== undefined) {
              day = match[2];
              description = match[3];
            } else {
              continue; // 跳過無法解析的匹配
            }
            
            // 清理描述文本
            if (description) {
              description = description.trim()
                .replace(/\*\*/g, '') // 移除Markdown粗體標記
                .replace(/<[^>]+>/g, '') // 秮除HTML標籤
                .trim();
            }
            
            // 限制描述長度，只保留主要地點
            const shortDescription = description?.split(/[,，、]/)[0] || '未指定';
            
            dailyHighlights.push({
              day: parseInt(day),
              highlight: shortDescription
            });
          }
          
          // 找到有效匹配後，按天數排序並返回
          if (dailyHighlights.length > 0) {
            return dailyHighlights.sort((a, b) => a.day - b.day);
          }
        }
      }
      
      // 如果上述模式都沒有匹配，尋找更簡單的模式
      const simpleDayRegex = /(?:第\s*(\d+)\s*[天日]|[Dd]ay\s*(\d+))[^\n]*/g;
      const simpleMatches = [...content.matchAll(simpleDayRegex)];
      
      if (simpleMatches.length > 0) {
        for (const match of simpleMatches) {
          const day = match[1] || match[2];
          if (!day) continue;
          
          // 嘗試從該行提取重要地點
          const line = match[0];
          const location = line.split(/[：:]/)[1]?.trim() || 
                          line.replace(/(?:第\s*\d+\s*[天日]|[Dd]ay\s*\d+)/, '').trim() ||
                          '日程安排';
          
          dailyHighlights.push({
            day: parseInt(day),
            highlight: location
          });
        }
        
        // 找到有效匹配後，按天數排序並返回
        if (dailyHighlights.length > 0) {
          return dailyHighlights.sort((a, b) => a.day - b.day);
        }
      }
      
      return []; // 如果無法提取任何每日行程資訊
    },    loadSavedItineraries() {
      // 從本地儲存加載已保存的行程 (用於一般查看和管理)
      this.savedItineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
      this.showSavedItineraries = true;
      
      if (this.savedItineraries.length === 0) {
        alert('您尚未在本地儲存任何行程');
      }
    },loadItinerary(itinerary) {
      // 將選定的行程載入到當前視圖
      this.aiResponse = itinerary.content;
      
      // 更新天數計算和警告狀態
      this.updateDaysCountAndWarning();
        
      // 同時更新表單欄位以便能夠儲存至雲端
      if (itinerary.country) {
        this.selectedCountry = itinerary.country;
      }
      
      if (itinerary.days) {
        this.travelDays = itinerary.days;
      }
      if (itinerary.region) {
        this.selectedRegion = itinerary.region;
        this.updateCountries(true); // 保留現有的國家選擇
      }
      
      if (itinerary.type) {
        this.travelType = itinerary.type;
      }
      
      // 加載出發日期（如果有）
      if (itinerary.departureDate) {
        this.departureDate = itinerary.departureDate;
      }
      
      // 加載特別需求或偏好（如果有）
      if (itinerary.specialRequirements) {
        this.specialRequirements = itinerary.specialRequirements;
      }
        // 如果沒有表單欄位資訊，嘗試從內容中提取
      let missingFields = [];
      let needsExtracting = false;
      
      if (!this.selectedCountry) {
        missingFields.push('國家');
        needsExtracting = true;
      }
      
      if (!this.travelDays) {
        missingFields.push('旅遊天數');
        needsExtracting = true;
      }
      
      if (!this.selectedRegion) {
        missingFields.push('區域');
        needsExtracting = true;
      }
      if (needsExtracting) {
        const extractedInfo = this.extractInfoFromItinerary(itinerary.content);
          // 首先設置區域，這會觸發國家列表更新
        if (!this.selectedRegion && extractedInfo.region) {
          this.selectedRegion = extractedInfo.region;
          this.updateCountries(true); // 保留選中的國家
          missingFields = missingFields.filter(field => field !== '區域');
        }
        
        // 然後設置國家（在區域設置後，國家列表已更新）
        if (!this.selectedCountry && extractedInfo.country) {
          this.selectedCountry = extractedInfo.country;
          missingFields = missingFields.filter(field => field !== '國家');
        }
        
        if (!this.travelDays && extractedInfo.days) {
          this.travelDays = extractedInfo.days;
          missingFields = missingFields.filter(field => field !== '旅遊天數');
        }
        
        if (!this.travelType && extractedInfo.type) {
          this.travelType = extractedInfo.type;
        }
      }
        // 顯示提示訊息
      setTimeout(() => {
        let message = '行程已載入！\n\n';
        
        if (missingFields.length > 0) {
          message += `系統已嘗試自動填充必要資訊，但仍缺少以下欄位: ${missingFields.join('、')}\n`;
          message += '請在表單中手動選擇這些資訊，以確保能夠成功儲存到雲端。\n\n';
        } else {
          message += '系統已成功自動填充所有必要資訊！\n\n';
        }
        
        message += '如果您希望將此行程儲存至雲端以便在照片牆中關聯，請點擊"儲存至雲端 (供照片牆使用)"按鈕。';
        
        // 添加調試信息（開發階段）
        if (needsExtracting) {
          message += `\n\n[調試] 自動提取結果:\n區域: ${this.selectedRegion}\n國家: ${this.selectedCountry}\n天數: ${this.travelDays}`;
        }
        
        alert(message);
      }, 500);
      
      this.showSavedItineraries = false;
    },    deleteItinerary(id) {
      if (!confirm('確定要刪除這個行程嗎？此操作無法復原。')) {
        return;
      }

      // 從本地儲存刪除指定行程
      let savedItineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
      savedItineraries = savedItineraries.filter(item => item.id !== id);
      localStorage.setItem('savedItineraries', JSON.stringify(savedItineraries));
      this.savedItineraries = savedItineraries;
      
      alert('行程已從本地儲存中刪除');
    },

    // 處理表單提交
    handleFormSubmit(event) {
      event.preventDefault();
      
      if (!isAuthenticated.value) {
        this.showLoginPrompt = true;
        // 5秒後跳轉到登入頁面
        setTimeout(() => {
          this.router.push('/login?redirect=/advice');
        }, 5000);
        return;
      }
      
      // 重置天數計數，避免累積計數問題
      this.actualDaysCount = 0;
      this.detectedDaysCount = 0;
      this.showDaysWarning = false;
      
      // 繼續生成行程
      this.generateItinerary();
    },
      /**
     * 檢查行程內容是否被截斷
     * @param {string} content 完整行程內容
     * @returns {boolean} 是否被截斷
     */
    checkTruncation(content) {
      // 需要檢查的中主題
      const requiredSubtopics = ["行程", "用餐推薦", "住宿推薦", "小建議"];
      
      // 提取所有大主題 (第X天)
      // 改進：擴展正則表達式以匹配更多可能的第X天標題格式
      const mainTopicPatterns = [
        /第\s*\d+\s*天/g,           // 標準中文格式
        /Day\s*\d+/gi,              // 英文格式
        /第[一二三四五六七八九十]+天/g,  // 中文數字格式
        /\d+日目/g,                 // 日文風格
        /\d+\s*[天日]/g,            // 數字後接天/日
        /#第\d+天/g,               // 無空格的格式
        /##第\d+天/g,              // 無空格的H2格式
        /行程\s*\d+/g,             // 行程X格式
        /\d+\s*行程/g              // X行程格式
      ];
      
      // 收集所有匹配到的大主題
      let allMainTopics = [];
      
      for (const pattern of mainTopicPatterns) {
        const matches = Array.from(content.matchAll(pattern));
        allMainTopics = [...allMainTopics, ...matches.map(match => ({
          topic: match[0],
          index: match.index
        }))];
      }
      
      // 按出現位置排序
      allMainTopics.sort((a, b) => a.index - b.index);
      
      // 去重 (兩個主題內容相近且間隔非常近的情況)
      const uniqueMainTopics = [];
      let lastIndex = -100; // 初始化為一個足夠小的值
      
      for (const topic of allMainTopics) {
        if (topic.index - lastIndex > 30) { // 如果間隔超過30個字符則視為不同主題
          uniqueMainTopics.push(topic);
          lastIndex = topic.index;
        } else {
          console.log(`忽略過近的重複主題: ${topic.topic} at ${topic.index}`);
        }
      }
      
      // 如果沒有找到大主題，可能內容被截斷
      if (uniqueMainTopics.length === 0) {
        console.log('未找到任何天數標題，內容可能被截斷');
        return true;
      }
      
      console.log(`找到${uniqueMainTopics.length}個日程主題:`, uniqueMainTopics.map(t => t.topic));
      
      // 檢查每個大主題
      for (let i = 0; i < uniqueMainTopics.length; i++) {
        const currentTopic = uniqueMainTopics[i];
        const nextTopicIndex = (i < uniqueMainTopics.length - 1) ? uniqueMainTopics[i + 1].index : content.length;
        
        // 提取當前大主題的內容區塊
        const topicContent = content.substring(currentTopic.index, nextTopicIndex);
        
        console.log(`檢查 ${currentTopic.topic} 內容，長度為 ${topicContent.length} 字符`);
        
        // 檢查是否包含所有必要的中主題
        let missingSubtopics = [];
        let insufficientSubtopics = [];
        
        for (const subtopic of requiredSubtopics) {
          // 匹配更多可能的中主題格式
          const subtopicPatterns = [
            new RegExp(`${subtopic}[：:]`, 'i'),           // 標準格式
            new RegExp(`${subtopic}(?:\\s*推薦)?[：:]`, 'i'), // 帶"推薦"可選詞的格式
            new RegExp(`\\*\\*${subtopic}[：:]\\*\\*`, 'i'), // Markdown粗體格式
            new RegExp(`## ${subtopic}`, 'i'),            // Markdown H2格式
            new RegExp(`### ${subtopic}`, 'i')            // Markdown H3格式
          ];
          
          // 檢查中主題是否存在
          let subtopicMatch = null;
          let matchedRegex = null;
          
          for (const pattern of subtopicPatterns) {
            const match = topicContent.match(pattern);
            if (match) {
              subtopicMatch = match;
              matchedRegex = pattern;
              break;
            }
          }
          
          if (!subtopicMatch) {
            console.log(`${currentTopic.topic} 缺少 "${subtopic}" 中主題`);
            missingSubtopics.push(subtopic);
            continue;
          }
          
          // 檢查中主題是否有內容
          const subtopicIndex = subtopicMatch.index + subtopicMatch[0].length;
          let subtopicContent = "";
          
          // 找到下一個中主題或大主題的開始位置
          const nextSubtopicMatch = this.findNextSubtopic(topicContent, subtopicIndex, requiredSubtopics);
          
          if (nextSubtopicMatch) {
            subtopicContent = topicContent.substring(subtopicIndex, subtopicIndex + nextSubtopicMatch.index).trim();
          } else {
            subtopicContent = topicContent.substring(subtopicIndex).trim();
          }
          
          // 檢查中主題內容是否為空或過短
          if (!subtopicContent || subtopicContent.length < 10) { // 設置更合理的最小內容長度
            console.log(`${currentTopic.topic} 的 "${subtopic}" 中主題缺少內容或內容不足 (${subtopicContent.length} 字符)`);
            insufficientSubtopics.push(subtopic);
          }
        }
        
        // 如果有缺失或內容不足的中主題，則判定為截斷
        if (missingSubtopics.length > 0 || insufficientSubtopics.length > 0) {
          console.log(`${currentTopic.topic} 被判定為截斷：`);
          if (missingSubtopics.length > 0) {
            console.log(`- 缺少中主題: ${missingSubtopics.join(', ')}`);
          }
          if (insufficientSubtopics.length > 0) {
            console.log(`- 內容不足的中主題: ${insufficientSubtopics.join(', ')}`);
          }
          return true;
        }
      }
      
      console.log('所有大主題都包含完整的子主題內容，未檢測到截斷');
      return false;
    },    /**
     * 查找下一個中主題的位置
     * @param {string} text 文本內容
     * @param {number} startIndex 開始搜索的位置
     * @param {string[]} subtopics 所有中主題列表
     * @returns {object|null} 下一個中主題的匹配信息或null
     */
    findNextSubtopic(text, startIndex, subtopics) {
      const searchText = text.substring(startIndex);
      
      // 建立多種可能的中主題格式
      const subtopicPatterns = [];
      for (const subtopic of subtopics) {
        subtopicPatterns.push(
          `${subtopic}[：:]`,                // 標準格式
          `${subtopic}(?:\\s*推薦)?[：:]`,    // 帶"推薦"可選詞的格式
          `\\*\\*${subtopic}[：:]\\*\\*`,    // Markdown粗體格式
          `## ${subtopic}`,                 // Markdown H2格式
          `### ${subtopic}`                 // Markdown H3格式
        );
      }
      
      // 構建正則表達式來匹配任何中主題
      const subtopicPattern = subtopicPatterns.join('|');
      const regex = new RegExp(`(${subtopicPattern})`, 'i');
      
      const match = searchText.match(regex);
      
      // 建立多種主題標題格式
      const mainTopicPatterns = [
        /第\s*\d+\s*天/,          // 標準中文格式
        /Day\s*\d+/i,            // 英文格式
        /第[一二三四五六七八九十]+天/, // 中文數字格式
        /\d+日目/,                // 日文風格
        /\d+\s*[天日]/,           // 數字後接天/日
        /#第\d+天/,              // 無空格的格式
        /##第\d+天/,             // 無空格的H2格式
        /行程\s*\d+/,            // 行程X格式
        /\d+\s*行程/             // X行程格式
      ];
      
      // 尋找下一個大主題（找到最早出現的）
      let nextMainTopicMatch = null;
      let nextMainTopicIndex = Infinity;
      
      for (const pattern of mainTopicPatterns) {
        const mainMatch = searchText.match(pattern);
        if (mainMatch && mainMatch.index < nextMainTopicIndex) {
          nextMainTopicMatch = mainMatch;
          nextMainTopicIndex = mainMatch.index;
        }
      }
      
      // 判斷下一個中主題或大主題
      if (match && (!nextMainTopicMatch || match.index < nextMainTopicMatch.index)) {
        return match; // 下一個是中主題
      } else if (nextMainTopicMatch) {
        return { index: nextMainTopicMatch.index, subtopic: "下一天" }; // 下一個是大主題
      }
      
      // 另外檢查是否有Markdown標題格式的標記
      const markdownHeadingMatch = searchText.match(/#{1,3}\s+/);
      if (markdownHeadingMatch) {
        return { index: markdownHeadingMatch.index, subtopic: "Markdown標題" };
      }
      
      return null; // 沒有找到下一個主題
    },    /**
     * 更新行程開頭的天數信息，但不修改"第X天"的標題
     */
    updateIntroduction() {
      if (!this.aiResponse) return;
      
      // 獲取實際天數
      const actualDays = this.actualDaysCount > 0 ? this.actualDaysCount : this.travelDays;
      console.log(`準備更新行程天數：從 ${this.travelDays} 更新為 ${actualDays}`);
      
      // 只處理前500個字符，避免影響到日行程標題
      const introSection = this.aiResponse.substring(0, 500);
      const restContent = this.aiResponse.substring(500);
      
      // 匹配多種可能的旅遊天數信息格式，但只在開頭介紹部分尋找
      const dayInfoPatterns = [
        /((?:\*\*旅遊天數：\*\*|\*\*旅遊天數：\*\*\s*|旅遊天數：\s*))\d+([^\d])/,
        /((?:旅遊|旅行|行程)(?:天數|日數)(?:\s*[：:]\s*))(\d+[+-]?\d*)/i,
        /((?:\*\*(?:旅遊|旅行|行程)(?:天數|日數)(?:\s*[：:]\s*)\*\*\s*))\d+([^\d])/i,
        /((?:行程安排：\s*))\d+(\s*天)/i,
        /((?:預計|共|總共)\s*)\d+(\s*(?:天|日)(?:行程|遊程|旅行))/i
      ];
      
      // 更新行程開頭的天數信息 - 嘗試所有匹配模式
      let updatedIntro = introSection;
      let dayInfoUpdated = false;
      
      // 更新正文中的天數信息（僅開頭部分）
      for (const pattern of dayInfoPatterns) {
        if (pattern.test(updatedIntro)) {
          updatedIntro = updatedIntro.replace(pattern, `$1${actualDays}$2`);
          dayInfoUpdated = true;
          console.log('已更新行程開頭部分的天數資訊');
          break;
        }
      }
      
      // 只匹配文檔最開頭的主標題（不包含"第X天"這類標題）
      const titlePatterns = [
        /^# ([^#\n第]{1,30})(\d+)(\s*天[^#\n]*)/m,                     // 排除含"第"字的標題
        /^# ([^#\n第]{1,30})(\d+)((?:\s*日|天)[^#\n]*)/m,              // 排除含"第"字的標題
        /^# ([^#\n第]{1,30})(\d+)(-\d+)(\s*(?:日|天)[^#\n]*)/m,        // 排除含"第"字的標題
        /^# ([^#\n]*?行程概述：[^#\n]*?)(\d+)([^#\n]*?天[^#\n]*)/m,    // 特別匹配"行程概述"部分
        /^# ([^#\n]*?深度遊[^#\n]*?)(\d+)([^#\n]*?天[^#\n]*)/m,        // 特別匹配"深度遊"部分
        /^# ([^#\n]*?之旅[^#\n]*?)(\d+)([^#\n]*?天[^#\n]*)/m           // 特別匹配"之旅"部分
      ];
      
      // 更新行程標題中的天數（僅開頭標題，不包含"第X天"）
      let titleUpdated = false;
      for (const pattern of titlePatterns) {
        if (pattern.test(updatedIntro)) {
          if (pattern.source.includes('-\\d+')) {
            // 處理包含範圍的標題 (例如：3-5天行程)
            updatedIntro = updatedIntro.replace(pattern, `# $1${actualDays}$4`);
          } else {
            updatedIntro = updatedIntro.replace(pattern, `# $1${actualDays}$3`);
          }
          titleUpdated = true;
          console.log('已更新行程開頭標題中的天數');
          break;
        }
      }
      
      if (dayInfoUpdated || titleUpdated) {
        this.aiResponse = updatedIntro + restContent;
        console.log('行程開頭天數資訊已更新');
      } else {
        console.log('未找到可更新的開頭天數資訊');
      }
    },
    // 當用戶選擇天數範圍時，自動選中中間值
    getDefaultDays(daysRange) {
      if (daysRange.includes('-')) {
        const [min, max] = daysRange.split('-').map(Number);
        return Math.round((min + max) / 2);
      }
      if (daysRange.endsWith('+')) {
        const min = parseInt(daysRange);
        return min + 1; // 例如13+，預設14天
      }
      return parseInt(daysRange);
    }
  }
}
</script>

<style scoped>
/* 可以添加一些自定義樣式 */
.error-message {
  color: #e53e3e;
  margin-top: 1.5rem;
  padding: 0.75rem;
  background-color: #fff5f5;
  border-radius: 0.375rem;
  border: 1px solid #fc8181;
}

/* 行程內容樣式 */
.itinerary-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 400;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #a7f3d0;
  color: #065f46;
  letter-spacing: -0.025em;
}

.itinerary-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 500;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  color: #047857;
  letter-spacing: -0.025em;
}

.itinerary-content :deep(strong) {
  font-weight: 500;
  color: #047857;
}

.itinerary-content :deep(strong.text-red-500) {
  color: #ef4444 !important;
}

.itinerary-content :deep(li) {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
  position: relative;
  color: #4b5563;
}

.itinerary-content :deep(li)::before {
  content: "•";
  position: absolute;
  left: -1rem;
  color: #10b981;
}

.itinerary-content :deep(hr) {
  margin: 2rem 0;
  border-top: 1px solid #d1fae5;
}

.itinerary-content :deep(p) {
  margin-bottom: 1.25rem;
  color: #4b5563;
  line-height: 1.7;
}

.itinerary-content :deep(em) {
  font-style: italic;
  color: #34d399;
}
</style>

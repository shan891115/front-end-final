<template>
  <div class="min-h-screen flex flex-col">
    <!-- 頁頭區域 -->
    <section class="flex justify-center bg-gradient-to-r from-green-500 to-teal-600 text-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-4 pb-2">旅遊照片牆</h2>
        <p class="text-xl mb-4">透過美麗的照片探索世界各地的風景</p>
      </div>
    </section>

    <!-- 主要內容區域 -->
    <section class="flex-grow flex justify-center py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 pb-4">記錄您的旅途風景</h2>        <!-- 照片分類選項 -->
        <div class="flex flex-wrap justify-center gap-4 mb-10 pb-4">
          <button 
            v-for="category in photoCategories" 
            :key="category.id" 
            @click="selectCategory(category.id)"
            class="px-6 py-2 rounded-full hover:bg-green-600 text-slate-600 transition-colors"
            :class="selectedCategoryId === category.id 
              ? 'bg-green-500 text-white' 
              : 'bg-white text-stone-400 border border-gray-300 hover:bg-emerald-700 hover:text-slate-200'"
          >
            {{ category.name }}
          </button>
        </div>
        
        <!-- 照片管理工具列 -->
        <div class="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div class="text-sm text-gray-600">
            <span v-if="photos.length > 0">目前顯示 {{ photos.length }} 張照片</span>
            <span v-else>尚無照片</span>
          </div>
          <div class="flex gap-2">
            <button 
              @click="showPhotoManagement = true" 
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              title="管理照片"
            >
              ⚙️ 管理
            </button>
            <button 
              @click="refreshPhotos" 
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              title="重新整理照片"
            >
              🔄 重新整理
            </button>
          </div>
        </div>
        
        <!-- 照片牆 - 資料載入提示 -->
        <div v-if="isLoadingPhotos" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p class="mt-4 text-gray-600">正在載入照片...</p>
        </div>
        
        <!-- 空狀態提示 -->
        <div v-else-if="photos.length === 0" class="text-center py-20 bg-gray-50 rounded-xl">
          <div class="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">沒有找到照片</h3>
          <p class="text-gray-500 mb-6">目前尚未上傳任何{{ selectedCategoryName }}照片</p>
          <button 
            @click="handleUploadClick"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            上傳新照片
          </button>
        </div>
        
        <!-- 照片牆 -->
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
          <!-- 照片卡片 -->
          <div 
            v-for="photo in photos" 
            :key="photo.id" 
            class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
          >
            <div class="h-48 bg-gray-100 overflow-hidden relative">
              <img 
                :src="photo.imageUrl" 
                :alt="photo.title || '旅行照片'" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />              
              <!-- 照片懸浮詳情層 -->
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button class="p-2 bg-white rounded-full mr-2 hover:bg-red-100" @click="toggleLike(photo)">
                  <svg class="w-5 h-5" :class="photo.isLiked ? 'text-red-500' : 'text-gray-400'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button class="p-2 bg-white rounded-full ml-2 hover:bg-green-100" @click="viewPhotoDetails(photo)">
                  <svg class="w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>            
            <div class="p-4">
              <!-- 景點名稱作為主標題 -->
              <h4 class="font-bold text-gray-800 mb-2">
                {{ photo.attraction ? photo.attraction.name : (photo.title || '美麗景色') }}
              </h4>              
              <!-- 行程和天數標籤 -->
              <div class="flex flex-wrap gap-2 mb-2 pt-4 pb-2">
                <!-- 主要標籤：國家/行程 -->
                <span v-if="photo.primaryTag" class="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {{ photo.primaryTag }}
                </span>
                
                <!-- 次要標籤：天數 -->
                <span v-if="photo.secondaryTag" class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {{ photo.secondaryTag }}
                </span>
                
                <!-- 分類標籤（保留原有的） -->
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {{ getCategoryName(photo.category) }}
                </span>
              </div>
              
              <!-- 移除心得預覽，只在點擊眼睛後顯示 -->
            </div>
          </div>
        </div>
        
        <!-- 加載更多按鈕 -->
        <div v-if="hasMore && !isLoadingPhotos" class="mt-10 text-center py-4">
          <button 
            @click="loadMorePhotos" 
            class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            載入更多照片
          </button>
        </div>
        
        <!-- 上傳照片按鈕 -->
        <div class="mt-16 bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-2xl font-bold mb-6 text-center">編輯您的照片牆</h3>
          <p class="text-gray-600 mb-6 text-center">～ 紀錄旅途的精彩時刻和美麗風景 ～</p>
          <div class="text-center py-4">
            <button @click="handleUploadClick" class="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-700 transition-colors">
              上傳照片
            </button>
          </div>
            <!-- 登入提示訊息 -->
          <div v-if="showLoginPrompt" class="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  請先登入以上傳照片，將在5秒後跳轉至登入頁面...
                </p>
              </div>
            </div>
          </div>
          
          <!-- 行程選擇界面 -->
          <div v-if="showItinerarySelector" class="mt-6 bg-white border border-green-200 rounded-lg p-4 shadow-sm">
            <h4 class="text-lg font-medium mb-4 text-green-700 pb-2">請選擇相關行程</h4>
            
            <div v-if="isLoading" class="py-4 text-center text-green-600">
              <p>正在載入行程列表...</p>
            </div>
            
            <div v-else-if="errorMessage" class="py-3 text-center text-red-600">
              <p>{{ errorMessage }}</p>
            </div>
            
            <div v-else-if="itineraries.length === 0" class="py-3 text-center text-gray-600">
              <p>您還沒有儲存任何行程。請先在「旅遊建議」頁面建立行程。</p>
            </div>
            
            <div v-else class="space-y-3 max-h-60 overflow-y-auto">
              <div 
                v-for="itinerary in itineraries" 
                :key="itinerary.id" 
                class="p-3 border border-green-100 rounded hover:bg-green-50 cursor-pointer"
                @click="selectItinerary(itinerary)"
              >
                <h5 class="font-medium">{{ itinerary.title || `${itinerary.country}${itinerary.days}天行程` }}</h5>
                <div class="flex justify-between text-sm text-gray-500">
                  <span>{{ new Date(itinerary.timestamp).toLocaleDateString() }}</span>
                  <span>{{ itinerary.type || '一般旅遊' }}</span>
                </div>
              </div>
            </div>
            
            <div class="mt-4 flex justify-between pt-4">
              <button 
                @click="showItinerarySelector = false" 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                取消
              </button>
              <button 
                @click="showItinerarySelector = false" 
                class="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                :disabled="!selectedItinerary"
              >
                不選擇行程，直接上傳
              </button>
            </div>
          </div>
          
          <!-- 上傳照片界面 -->
          <div v-if="showUploadInterface" class="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold mb-4">上傳照片與心得</h3>
            
            <!-- 行程天數選擇 -->
            <div class="mb-4">
              <h4 class="font-semibold text-gray-800 mb-2 pt-2">選擇旅行日</h4>
              <div class="grid grid-cols-2 pb-4 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <div 
                  v-for="day in itineraryDays" 
                  :key="day.day" 
                  @click="selectDay(day)"
                  class="p-3 border rounded-lg transition-all duration-200 cursor-pointer"
                  :class="{
                    'border-green-500 bg-green-50 shadow-md': selectedDay && selectedDay.day === day.day,
                    'border-gray-200 hover:border-green-400 hover:bg-green-50': !(selectedDay && selectedDay.day === day.day)
                  }"
                >
                  <p class="font-bold text-center">{{ day.title }}</p>
                  <p v-if="day.highlight" class="text-sm text-gray-600 text-center truncate">{{ day.highlight }}</p>
                </div>
              </div>
            </div>
              <!-- 當天景點選擇 -->
            <div v-if="selectedDay" class="mb-6">
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-semibold text-gray-800">選擇景點</h4>
                <span class="text-sm text-gray-500">第{{ selectedDay.day }}天</span>
              </div>
              <div class="grid grid-cols-1 pb-4 sm:grid-cols-2 gap-3">
                <div 
                  v-for="attraction in dayAttractions" 
                  :key="attraction.id" 
                  @click="selectAttraction(attraction)"
                  class="p-4 border rounded-lg cursor-pointer attraction-card"
                  :class="{
                    'border-green-500 bg-green-50': selectedAttraction && selectedAttraction.id === attraction.id,
                    'border-gray-200 hover:border-green-300 hover:bg-green-50': !(selectedAttraction && selectedAttraction.id === attraction.id)
                  }"
                >
                  <p class="font-medium">{{ attraction.name }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ attraction.description }}</p>
                </div>
              </div>
            </div>              
            <!-- 照片上傳區域 -->
            <div v-if="selectedAttraction" class="mb-6 bg-green-50 p-5 rounded-lg border border-green-100">
              <div class="flex justify-between items-center mb-4 pb-2">
                <h4 class="font-semibold text-gray-800">照片與心得</h4>
                <span class="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">{{ selectedAttraction.name }}</span>
              </div>
              
              <!-- 照片分類選擇 -->
              <div class="mb-5 p-4 bg-white rounded-lg border border-gray-200">
                <h5 class="text-sm font-medium text-gray-700 mb-3">📸 照片類型分類</h5>
                <p class="text-xs text-gray-500 mb-3">系統會根據景點自動判斷，但你可以手動調整照片的分類類型</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label 
                    v-for="category in photoCategories.filter(c => c.id !== 'all')" 
                    :key="category.id"
                    class="flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                    :class="{
                      'border-green-500 bg-green-50': selectedPhotoCategory === category.id,
                      'border-gray-200': selectedPhotoCategory !== category.id
                    }"
                  >
                    <input 
                      type="radio" 
                      :value="category.id" 
                      v-model="selectedPhotoCategory" 
                      class="sr-only"
                    />
                    <div class="flex flex-col items-center text-center w-full">
                      <span class="text-lg mb-1">{{ getCategoryIcon(category.id) }}</span>
                      <span class="text-xs font-medium">{{ category.name }}</span>
                    </div>
                  </label>
                </div>
                <div class="mt-2 text-xs text-gray-500">
                  <span v-if="selectedPhotoCategory">
                    已選擇：{{ getCategoryName(selectedPhotoCategory) }}
                    <span v-if="autoDetectedCategory !== selectedPhotoCategory" class="text-orange-600">
                      (系統建議：{{ getCategoryName(autoDetectedCategory) }})
                    </span>
                  </span>
                </div>
              </div>
              
              <!-- 已選照片預覽 -->
              <div class="mb-5">
                <div class="flex items-center justify-between mb-3 pt-2">
                  <p class="text-sm font-medium text-gray-700">照片 <span class="text-gray-500">(不限張數)</span></p>
                  <span class="text-xs text-green-700">已選擇 {{ uploadPhotos.length }} 張</span>
                </div>
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4 photo-preview-container">
                    <div 
                      v-for="photo in uploadPhotos" 
                      :key="photo.id" 
                      class="relative rounded-lg overflow-hidden aspect-square"
                    >
                      <img :src="photo.preview" class="w-full h-full object-cover" />
                      <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          @click="removePhoto(photo.id)" 
                          class="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                          title="移除照片"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- 上傳照片按鈕 -->
                    <label class="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-green-500 transition-colors photo-upload-button bg-gray-50">
                      <input type="file" accept="image/*" class="hidden" @change="handlePhotoSelect" multiple />
                      <svg class="w-10 h-10 text-gray-400 photo-upload-icon mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"></path>
                      </svg>
                      <span class="text-xs text-gray-500">選擇照片</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- 照片說明文字 -->
              <div>
                <p class="text-sm font-medium text-gray-700 mb-2 pt-2">旅行心得</p>
                <textarea 
                  v-model="photoNotes" 
                  class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
                  rows="4"
                  placeholder="在這裡記錄下您的旅行心得、感想或推薦..."
                ></textarea>
              </div>
            </div>
              <!-- 上傳按鈕和導航區域 -->
            <div class="flex flex-col space-y-4 items-center mt-8 py-4">
              <!-- 上傳按鈕 -->
              <button 
                v-if="selectedAttraction"
                @click="uploadPhotoAndNotes" 
                class="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center shadow-sm"
                :disabled="isLoading"
              >
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                {{ isLoading ? '正在上傳...' : '上傳' }}
              </button>
              
              <!-- 導航按鈕 -->
              <div class="flex gap-3 flex-wrap justify-center pt-4">
                <!-- 返回選擇景點按鈕 -->
                <button 
                  v-if="selectedAttraction"
                  @click="selectAttraction(null)" 
                  class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                >
                  返回景點
                </button>
                
                <!-- 返回選擇天數按鈕 -->
                <button 
                  v-if="selectedDay"
                  @click="backToDaySelection" 
                  class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                >
                  返回旅行日
                </button>
                
                <!-- 關閉上傳介面按鈕 -->
                <button 
                  @click="closeUploadInterface" 
                  class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors text-sm"
                >
                  返回照片牆
                </button>
              </div>
            </div>
          </div>        </div>
      </div>
    </section>    <!-- 照片詳情彈窗 -->
    <div v-if="selectedPhotoForDetail" class="fixed inset-0 bg-teal-900 bg-opacity-75 flex items-center justify-center z-50 p-4" @click="closePhotoDetail">
      <div class="bg-white rounded-2xl max-w-4xl max-h-full overflow-auto" @click.stop>
        <div class="relative">
          <!-- 關閉按鈕 -->
          <button @click="closePhotoDetail" class="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
            <svg class="w-6 h-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- 照片 -->
          <div class="w-full">
            <img :src="selectedPhotoForDetail.imageUrl" :alt="selectedPhotoForDetail.attraction?.name || '旅行照片'" class="w-full h-auto max-h-96 object-cover rounded-t-lg">
          </div>

          <!-- 詳情內容 -->
          <div class="p-6">
            <!-- 標題和標籤 -->
            <div class="mb-4">
              <h2 class="text-2xl font-bold text-gray-800 mb-3">
                {{ selectedPhotoForDetail.attraction?.name || '美麗景色' }}
              </h2>

              <!-- 標籤組 -->
              <div class="flex flex-wrap gap-2 mb-4 pt-2">
                <span v-if="selectedPhotoForDetail.primaryTag" class="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  🌍 {{ selectedPhotoForDetail.primaryTag }}
                </span>

                <span v-if="selectedPhotoForDetail.secondaryTag" class="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                   {{ selectedPhotoForDetail.secondaryTag }}
                </span>

                <span class="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full">
                  🏷️ {{ getCategoryName(selectedPhotoForDetail.category) }}
                </span>
              </div>
            </div>

            <!-- 心得內容 -->
            <div v-if="selectedPhotoForDetail.notes" class="mb-4 py-2">
              <h3 class="text-lg font-semibold text-gray-700 mb-2 py-2">📝 旅行心得</h3>
              <p class="text-gray-600 leading-relaxed whitespace-pre-wrap pl-4 pb-2">{{ selectedPhotoForDetail.notes }}</p>
            </div>

            <!-- 照片資訊 -->
            <div class="border-t pt-4 mt-4">
              <h3 class="text-base font-semibold text-gray-700 mb-2 pb-2">📷 照片資訊</h3>
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span class="font-medium">◎ 上傳時間：</span>
                  {{ formatDate(selectedPhotoForDetail.uploadDate) }}
                </div>
                <div>
                  <span class="font-medium">◎ 檔案大小：</span>
                  {{ formatFileSize(selectedPhotoForDetail.fileSize) }}
                </div>
              </div>
            </div>

            <!-- 動作按鈕 -->
            <div class="flex justify-end items-center mt-2">
              <button @click="toggleLike(selectedPhotoForDetail)" class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg class="w-6 h-6" :class="selectedPhotoForDetail.isLiked ? 'text-red-500' : 'text-gray-400'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700 pl-2">{{ selectedPhotoForDetail.isLiked ? '已喜歡' : '喜歡' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 照片管理彈窗 -->
    <div v-if="showPhotoManagement" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="showPhotoManagement = false">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-full overflow-auto" @click.stop>
        <div class="p-6">
          <!-- 標題 -->
          <div class="flex justify-between items-center mb-6 pb-4">
            <h2 class="text-2xl font-bold text-gray-800">🛠️ 照片管理</h2>
            <button @click="showPhotoManagement = false" class="p-2 hover:bg-gray-100 rounded-full">
              <svg class="w-6 h-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 照片統計 -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold text-blue-800 mb-2 pb-2">📊 照片統計</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>總照片數：{{ photos.length }} 張</div>
              <div>測試照片：{{ testPhotoCount }} 張</div>
              <div>用戶照片：{{ userPhotoCount }} 張</div>
              <div>本地儲存：{{ localPhotoCount }} 張</div>
            </div>
          </div>

          <!-- 管理操作 -->
          <div class="space-y-4 pb-4">
            <!-- 清除測試照片 -->
            <div class="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h4 class="font-semibold text-orange-800 mb-2">🧪 清除測試照片</h4>
              <p class="text-sm text-orange-700 mb-3">移除系統自動添加的範例照片，只保留你上傳的照片。</p>
              <button 
                @click="clearTestPhotos" 
                class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                :disabled="testPhotoCount === 0"
              >
                清除 {{ testPhotoCount }} 張測試照片
              </button>
            </div>

            <!-- 重新載入範例照片 -->
            <div class="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 class="font-semibold text-green-800 mb-2">📸 重新載入範例照片</h4>
              <p class="text-sm text-green-700 mb-3">如果你想重新體驗範例照片，可以點擊這裡。</p>
              <button 
                @click="reloadSamplePhotos" 
                class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                載入範例照片
              </button>
            </div>

            <!-- 清空所有照片 -->
            <div class="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 class="font-semibold text-red-800 mb-2">⚠️ 清空所有照片</h4>
              <p class="text-sm text-red-700 mb-3">這會刪除所有照片，包括你上傳的照片。請謹慎操作！</p>
              <button 
                @click="clearAllPhotos" 
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                清空所有照片
              </button>
            </div>
          </div>

          <!-- 關閉按鈕 -->
          <div class="mt-6 text-center">
            <button 
              @click="showPhotoManagement = false" 
              class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { isAuthenticated } from '../services/authService';
import aiService from '../services/aiService';
import photoService from '../services/photoService';
import { extractAttractionsFromItinerary } from '../attraction-extractor-final.js';

export default {  setup() {
    const router = useRouter();
    const showLoginPrompt = ref(false);
    const showItinerarySelector = ref(false);
    const itineraries = ref([]);
    const selectedItinerary = ref(null);
    const isLoading = ref(false);
    const errorMessage = ref('');
    
    // 顯示上傳照片界面的狀態
    const showUploadInterface = ref(false);
    // 行程天數和每天的亮點信息
    const itineraryDays = ref([]);
    // 選中的天數
    const selectedDay = ref(null);
    // 當天的景點
    const dayAttractions = ref([]);    // 照片上傳相關狀態
    const uploadPhotos = ref([]);
    const photoNotes = ref("");
    // 當前查看的景點
    const selectedAttraction = ref(null);
    
    // 照片分類相關狀態
    const selectedPhotoCategory = ref('');
    const autoDetectedCategory = ref('');// 照片牆相關狀態
    const photoCategories = ref(photoService.getPhotoCategories());
    const selectedCategoryId = ref('all');
    const photos = ref([]);
    const isLoadingPhotos = ref(false);
    const currentPage = ref(1);
    const hasMore = ref(false);
      // 照片詳情彈窗相關狀態
    const selectedPhotoForDetail = ref(null);
    
    // 照片管理相關狀態
    const showPhotoManagement = ref(false);
    
    // 計算各種照片數量
    const testPhotoCount = computed(() => {
      return photos.value.filter(photo => 
        photo.id.startsWith('singapore_') || photo.id.startsWith('sample_')
      ).length;
    });
    
    const userPhotoCount = computed(() => {
      return photos.value.filter(photo => 
        !photo.id.startsWith('singapore_') && !photo.id.startsWith('sample_')
      ).length;
    });
    
    const localPhotoCount = computed(() => {
      return photos.value.filter(photo => photo.isLocal).length;
    });
    
    // 計算當前選擇的分類名稱
    const selectedCategoryName = computed(() => {
      const category = photoCategories.value.find(c => c.id === selectedCategoryId.value);
      return category ? category.name : '';
    });    // 在組件掛載時獲取行程列表和照片列表
    onMounted(async () => {
      // 先載入照片看看是否有用戶資料
      await loadPhotos();
      
      // 檢查是否為開發或測試環境
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      const shouldLoadTestPhotos = localStorage.getItem('loadTestPhotos') === 'true';
      
      // 只在開發環境或用戶明確要求時載入測試照片
      if (photos.value.length === 0 && (isDevelopment || shouldLoadTestPhotos)) {
        console.log('沒有找到用戶照片，檢查是否需要載入測試照片...');
        
        // 詢問用戶是否要載入測試照片
        const userChoice = confirm('照片牆目前是空的。\n\n是否要載入一些範例照片來體驗功能？\n\n點擊「確定」載入範例照片\n點擊「取消」保持空白狀態');
        
        if (userChoice) {
          console.log('用戶選擇載入測試照片');
          localStorage.setItem('loadTestPhotos', 'true');
          
          // 載入新加坡測試照片
          photoService.addSingaporeTestPhotos();
          await loadPhotos();
          
          // 如果還是沒有照片，載入範例照片
          if (photos.value.length === 0) {
            console.log('載入範例照片作為備案');
            photoService.addSamplePhotos();
            await loadPhotos();
          }
          
          // 顯示說明訊息
          setTimeout(() => {
            alert('已載入範例照片！\n\n這些是演示用的照片，包含：\n• 新加坡景點照片\n• 各種類型的旅遊照片\n\n你可以隨時在照片牆右上角找到清除按鈕來移除這些範例照片。');
          }, 1000);
          
        } else {
          console.log('用戶選擇不載入測試照片，保持空白狀態');
          localStorage.setItem('loadTestPhotos', 'false');
        }
      } else if (photos.value.length > 0) {
        console.log('已找到現有照片，跳過測試照片載入');
      }
      
      if (isAuthenticated.value) {
        await loadItineraries();
      }
    });
      // 加載照片列表
    const loadPhotos = async () => {
      try {
        console.log('=== 載入照片 ===');
        console.log('目標分類 ID:', selectedCategoryId.value);
        console.log('目標頁面:', currentPage.value);
        
        isLoadingPhotos.value = true;
        const result = await photoService.getPhotos(selectedCategoryId.value, currentPage.value);
        
        console.log('照片載入結果:', result);
        
        if (result.success) {
          // 如果是第一頁，替換照片列表；否則添加到現有列表
          if (currentPage.value === 1) {
            photos.value = result.photos;
          } else {
            photos.value = [...photos.value, ...result.photos];
          }
          
          console.log('最終照片列表:', photos.value.length, '張照片');
          console.log('照片分類分佈:', photos.value.reduce((acc, photo) => {
            acc[photo.category] = (acc[photo.category] || 0) + 1;
            return acc;
          }, {}));
          
          hasMore.value = result.hasMore;
        }
      } catch (error) {
        console.error('獲取照片失敗:', error);
      } finally {
        isLoadingPhotos.value = false;
      }
    };
    
    // 加載更多照片
    const loadMorePhotos = () => {
      currentPage.value++;
      loadPhotos();
    };
      // 選擇照片分類
    const selectCategory = (categoryId) => {
      console.log('=== 分類選擇 ===');
      console.log('選擇的分類 ID:', categoryId);
      console.log('之前的分類 ID:', selectedCategoryId.value);
      
      selectedCategoryId.value = categoryId;
      currentPage.value = 1;
      
      console.log('開始載入照片...');
      loadPhotos();
    };      // 獲取分類名稱
    const getCategoryName = (categoryId) => {
      const category = photoCategories.value.find(c => c.id === categoryId);
      return category ? category.name : '其他';
    };
    
    // 獲取分類圖示
    const getCategoryIcon = (categoryId) => {
      const icons = {
        'nature': '🌿',
        'city': '🏙️',
        'food': '🍽️',
        'culture': '🏛️'
      };
      return icons[categoryId] || '📸';
    };
    
    // 查看照片詳情
    const viewPhotoDetails = (photo) => {
      selectedPhotoForDetail.value = { ...photo };
      console.log('查看照片詳情:', photo);
    };
    
    // 關閉照片詳情
    const closePhotoDetail = () => {
      selectedPhotoForDetail.value = null;
    };
    
    // 切換喜歡狀態
    const toggleLike = (photo) => {
      photo.isLiked = !photo.isLiked;
      if (photo.isLiked) {
        photo.likes = (photo.likes || 0) + 1;
      } else {
        photo.likes = Math.max((photo.likes || 1) - 1, 0);
      }
      console.log(`${photo.isLiked ? '喜歡' : '取消喜歡'}照片:`, photo.attraction?.name);
    };
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('zh-TW') + ' ' + d.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
      // 格式化檔案大小
    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return '未知';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    // 重新整理照片
    const refreshPhotos = async () => {
      currentPage.value = 1;
      await loadPhotos();
    };
    
    // 清除測試照片
    const clearTestPhotos = async () => {
      const confirmMessage = `確定要清除 ${testPhotoCount.value} 張測試照片嗎？\n\n這會移除系統自動添加的範例照片，只保留你上傳的照片。`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      try {
        const result = await photoService.clearTestPhotos();
        if (result.success) {
          alert(`✅ 成功清除 ${result.removedCount} 張測試照片！`);
          showPhotoManagement.value = false;
          currentPage.value = 1;
          await loadPhotos();
        } else {
          alert('❌ 清除測試照片失敗：' + result.message);
        }
      } catch (error) {
        console.error('清除測試照片失敗:', error);
        alert('❌ 清除測試照片時發生錯誤：' + error.message);
      }
    };
    
    // 重新載入範例照片
    const reloadSamplePhotos = async () => {
      if (!confirm('確定要重新載入範例照片嗎？')) {
        return;
      }
      
      try {
        // 清除現有的測試照片
        await photoService.clearTestPhotos();
        
        // 重新添加範例照片
        photoService.addSingaporeTestPhotos();
        
        alert('✅ 已重新載入範例照片！');
        showPhotoManagement.value = false;
        currentPage.value = 1;
        await loadPhotos();
      } catch (error) {
        console.error('重新載入範例照片失敗:', error);
        alert('❌ 重新載入範例照片時發生錯誤：' + error.message);
      }
    };
    
    // 清空所有照片
    const clearAllPhotos = async () => {
      const confirmMessage = `⚠️ 危險操作！\n\n確定要清空所有 ${photos.value.length} 張照片嗎？\n\n這會刪除所有照片，包括你上傳的照片。\n此操作無法復原！\n\n請再次確認：`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      const doubleConfirm = confirm('🚨 最後確認！\n\n真的要清空所有照片嗎？\n這個操作無法復原！');
      if (!doubleConfirm) {
        return;
      }
      
      try {
        const result = await photoService.clearAllPhotos();
        if (result.success) {
          alert('✅ 已清空所有照片');
          showPhotoManagement.value = false;
          currentPage.value = 1;
          await loadPhotos();
        } else {
          alert('❌ 清空照片失敗：' + result.message);
        }
      } catch (error) {
        console.error('清空照片失敗:', error);
        alert('❌ 清空照片時發生錯誤：' + error.message);
      }
    };
    
    // 獲取行程列表
    const loadItineraries = async () => {
      try {
        isLoading.value = true;
        const response = await aiService.getItineraries();
        
        if (response.success && response.itineraries) {
          itineraries.value = response.itineraries;
        } else {
          errorMessage.value = '無法獲取行程列表';
        }
      } catch (error) {
        console.error('獲取行程列表失敗:', error);
        errorMessage.value = '載入行程列表出錯';
      } finally {
        isLoading.value = false;
      }
    };
    
    // 選擇行程
    const selectItinerary = async (itinerary) => {
      selectedItinerary.value = itinerary;
      showItinerarySelector.value = false;
      console.log('已選擇行程:', itinerary.title, '(ID:', itinerary.id, ')');
      
      // 獲取行程詳細資訊
      await getItineraryDetails(itinerary.id);
    };
    
    // 獲取行程詳細資訊
    const getItineraryDetails = async (itineraryId) => {
      try {
        isLoading.value = true;
        const response = await aiService.getItineraryById(itineraryId);
        
        if (response.success && response.itinerary) {
          const itinerary = response.itinerary;
          console.log('取得行程詳細資料:', itinerary);
          
          // 處理行程天數
          let days = parseInt(itinerary.days);
          if (isNaN(days)) {
            // 處理範圍形式的天數 (如 "3-5", "7+")
            if (itinerary.days.includes('-')) {
              days = parseInt(itinerary.days.split('-')[1]);
            } else if (itinerary.days.includes('+')) {
              days = parseInt(itinerary.days.replace('+', ''));
            } else {
              days = 1;
            }
          }
          
          // 創建天數卡片資料
          const daysArray = [];
          for (let day = 1; day <= days; day++) {
            let title = `第${day}天`;
            let highlight = '';
            
            // 從dailyHighlights取得該天的亮點（如果有）
            if (itinerary.dailyHighlights && Array.isArray(itinerary.dailyHighlights)) {
              const dayHighlight = itinerary.dailyHighlights.find(h => h.day === day);
              if (dayHighlight) {
                highlight = dayHighlight.highlight;
              }
            }
            
            daysArray.push({
              day,
              title,
              highlight
            });
          }
          
          itineraryDays.value = daysArray;
          showUploadInterface.value = true;
          
        } else {
          errorMessage.value = '無法獲取行程詳細資料';
        }
      } catch (error) {
        console.error('獲取行程詳細資料失敗:', error);
        errorMessage.value = '載入行程詳細資料出錯';
      } finally {
        isLoading.value = false;
      }    };    
    
    // 選擇天數
    const selectDay = (day) => {
      selectedDay.value = day;
      console.log(`選擇了第${day.day}天`);
      
      // 獲取當前選擇的行程內容
      if (!selectedItinerary.value || !selectedItinerary.value.content) {
        // 如果沒有行程內容，使用備用的模擬景點
        const fallbackAttractions = [
          { id: `${day.day}_1`, name: '上午行程', description: '早上的觀光活動' },
          { id: `${day.day}_2`, name: '下午行程', description: '下午的觀光活動' },
          { id: `${day.day}_3`, name: '晚上行程', description: '晚上的觀光活動' }
        ];
        
        if (day.day === 1) {
          fallbackAttractions[0].name = '抵達與入住';
          fallbackAttractions[1].name = '環境探索';
        }
        
        if (day.highlight) {
          fallbackAttractions[0].name = day.highlight;
        }
        
        dayAttractions.value = fallbackAttractions;
        console.log('使用備用景點：', fallbackAttractions.map(attr => attr.name).join(', '));
        return;
      }
        // 從行程內容中提取景點
      const extractedAttractions = extractAttractionsFromItinerary(day.day, selectedItinerary.value.content);
      
      // 記錄提取到的景點
      console.log(`第${day.day}天提取到的景點：`, 
        extractedAttractions.length > 0 
          ? extractedAttractions.map(attr => attr.name).join(', ')
          : '未找到景點'
      );
      
      // 如果提取到了景點，使用提取的景點；否則使用亮點作為第一個景點
      if (extractedAttractions.length > 0) {
        dayAttractions.value = extractedAttractions;
        console.log(`成功為第${day.day}天設置了${extractedAttractions.length}個景點卡片`);
      } else if (day.highlight) {
        dayAttractions.value = [
          { id: `${day.day}_highlight`, name: day.highlight, description: `第${day.day}天的主要亮點` },
          { id: `${day.day}_2`, name: '其他景點', description: '當天的其他景點' }
        ];
        console.log(`未找到景點，使用亮點 "${day.highlight}" 代替`);
      } else {
        dayAttractions.value = [
          { id: `${day.day}_1`, name: '主要行程', description: `第${day.day}天的主要行程` },
          { id: `${day.day}_2`, name: '次要行程', description: `第${day.day}天的次要行程` }
        ];
        console.log('未找到景點，使用默認景點卡片');
      }
    };
      // 選擇景點
    const selectAttraction = (attraction) => {
      selectedAttraction.value = attraction;
      
      // 重置上傳區域
      uploadPhotos.value = [];
      photoNotes.value = '';
      
      // 自動檢測景點分類並設定預設值
      if (attraction) {
        const detectedCategory = photoService.determineCategoryFromAttraction(attraction.name);
        autoDetectedCategory.value = detectedCategory;
        selectedPhotoCategory.value = detectedCategory;
        
        console.log('景點分類自動檢測:', {
          景點名稱: attraction.name,
          檢測結果: detectedCategory,
          分類名稱: getCategoryName(detectedCategory)
        });
      } else {
        // 清除選擇時重置分類
        autoDetectedCategory.value = '';
        selectedPhotoCategory.value = '';
      }
    };
    
    // 處理照片選擇
    const handlePhotoSelect = (event) => {
      const files = event.target.files;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadPhotos.value.push({
              id: Date.now() + i,
              preview: e.target.result,
              file: file
            });
          };
          reader.readAsDataURL(file);
        }
      }
    };
    
    // 移除已選照片
    const removePhoto = (photoId) => {
      uploadPhotos.value = uploadPhotos.value.filter(photo => photo.id !== photoId);
    };      // 上傳照片和記錄
    const uploadPhotoAndNotes = async () => {
      try {
        if (uploadPhotos.value.length === 0) {
          alert('請至少選擇一張照片');
          return;
        }
        
        if (!photoNotes.value.trim()) {
          const confirm = window.confirm('您尚未填寫心得，確定要繼續上傳嗎？');
          if (!confirm) return;
        }
        
        isLoading.value = true;
        
        console.log('開始上傳流程...');        console.log('照片數量:', uploadPhotos.value.length);
        console.log('景點:', selectedAttraction.value.name);
        console.log('旅行日:', selectedDay.value.day);
        console.log('心得:', photoNotes.value);
        console.log('用戶選擇的分類:', selectedPhotoCategory.value);        // 使用 photoService 上傳照片，傳入行程資訊和用戶選擇的分類
        console.log('準備上傳，行程資訊:', selectedItinerary.value);
        const result = await photoService.uploadPhotos(
          uploadPhotos.value,
          photoNotes.value,
          selectedItinerary.value.id,
          selectedDay.value.day,
          selectedAttraction.value,
          selectedItinerary.value, // 傳入完整的行程資訊
          selectedPhotoCategory.value // 傳入用戶選擇的分類
        );
          if (result.success) {          // 成功後重置
          uploadPhotos.value = [];
          photoNotes.value = '';
          selectedAttraction.value = null;
          selectedPhotoCategory.value = '';
          autoDetectedCategory.value = '';
          
          // 根據是否使用 Firebase 顯示不同訊息
          const hasFirebasePhotos = result.photos.some(p => !p.isLocal);
          const hasLocalPhotos = result.photos.some(p => p.isLocal);
          
          let successMessage = `照片和心得已成功處理！\n上傳了 ${result.photos.length} 張照片\n\n`;
          
          if (hasFirebasePhotos && hasLocalPhotos) {
            successMessage += `✅ ${result.photos.filter(p => !p.isLocal).length} 張照片已上傳到雲端\n⚠️ ${result.photos.filter(p => p.isLocal).length} 張照片暫存在本地\n\n本地照片將在網路恢復後自動同步到雲端。`;
          } else if (hasFirebasePhotos) {
            successMessage += `✅ 所有照片已成功上傳到 Firebase 雲端儲存`;
          } else {
            successMessage += `⚠️ 照片暫時儲存在本地\n\n目前 Firebase 服務暫時無法連接，照片已安全儲存在瀏覽器中。\n請稍後重試或聯絡技術支援。`;
          }
          
          alert(successMessage);
          
          // 重新載入照片牆
          currentPage.value = 1;
          loadPhotos();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('上傳失敗:', error);
        
        // 根據錯誤類型顯示不同的訊息
        let errorMessage = '上傳失敗: ';
        if (error.message.includes('Firebase')) {
          errorMessage += 'Firebase 服務連接失敗，請檢查網路連接或聯絡技術支援。';
        } else if (error.message.includes('Storage')) {
          errorMessage += '照片上傳失敗，請確認檔案大小不超過 5MB 且為有效的圖片格式。';
        } else if (error.message.includes('Firestore')) {
          errorMessage += '資料儲存失敗，請稍後再試。';
        } else {
          errorMessage += error.message || '未知錯誤，請稍後再試。';
        }
        
        alert(errorMessage);
      } finally {
        isLoading.value = false;
      }
    };
    
    // 關閉上傳界面，返回天數選擇
    const backToDaySelection = () => {
      selectedAttraction.value = null;
      selectedDay.value = null;
    };
    
    // 關閉整個上傳界面
    const closeUploadInterface = () => {
      showUploadInterface.value = false;
      selectedItinerary.value = null;
      selectedDay.value = null;
      selectedAttraction.value = null;
    };
    
    const handleUploadClick = () => {
      if (!isAuthenticated.value) {
        showLoginPrompt.value = true;
        setTimeout(() => {
          router.push('/login?redirect=/photos');
        }, 5000);
        return;
      }
      
      // 顯示行程選擇界面
      showItinerarySelector.value = true;
      loadItineraries();
      
      // 這裡是上傳照片的邏輯
      console.log('準備上傳照片');
    };      return {
      handleUploadClick,
      showLoginPrompt,
      showItinerarySelector,
      itineraries,
      selectedItinerary,
      isLoading,
      errorMessage,
      selectItinerary,
      // 新增的狀態與方法
      showUploadInterface,
      itineraryDays,
      selectedDay,
      dayAttractions,
      selectedAttraction,
      uploadPhotos,
      photoNotes,
      selectDay,
      selectAttraction,
      handlePhotoSelect,
      removePhoto,
      uploadPhotoAndNotes,
      backToDaySelection,
      closeUploadInterface,      // 照片牆相關狀態與方法
      photoCategories,
      selectedCategoryId,
      selectedCategoryName,
      photos,
      isLoadingPhotos,
      hasMore,
      loadMorePhotos,
      selectCategory,
      getCategoryName,      // 照片詳情相關
      selectedPhotoForDetail,
      viewPhotoDetails,
      closePhotoDetail,
      toggleLike,
      formatDate,
      formatFileSize,
      // 照片分類相關
      selectedPhotoCategory,
      autoDetectedCategory,
      getCategoryIcon,
      // 照片管理相關
      showPhotoManagement,
      testPhotoCount,
      userPhotoCount,
      localPhotoCount,
      refreshPhotos,
      clearTestPhotos,
      reloadSamplePhotos,
      clearAllPhotos
    };
  }
}
</script>

<style scoped>
/* 自定義樣式 */
.travel-day-card {
  transition: all 0.3s;
  transform: translateY(0);
}

.travel-day-card:hover {
  transform: translateY(-2px);
}

.travel-day-card.selected {
  box-shadow: 0 0 0 2px #10b981;
}

.travel-day-highlight {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 心得文字截斷樣式 */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.photo-upload-area {
  transition: all 0.3s;
}

.photo-upload-area:hover .photo-upload-icon {
  color: #10b981;
}

.attraction-card {
  transition: all 0.2s;
}

.attraction-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.photo-preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.photo-upload-button {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.photo-upload-button input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>

<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 使用新的導航欄組件 -->
    <NavBar />

    <!-- 主要內容 -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- 頁尾 -->
    <footer class="flex justify-center bg-emerald-700 text-white py-8">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap justify-between items-center">
          <div class="w-full md:w-auto text-center md:text-left mb-6 md:mb-0">
            <h3 class="text-xl font-bold mb-2 text-green-200">Best Trip</h3>
            <p class="text-green-100">探索世界，創造回憶</p>
          </div>
          
          <div class="w-full md:w-auto text-center">
            <p class="text-green-100">© 2025 <a href="https://self-introduction-alpha.vercel.app/" target="_blank" class="text-green-200 hover:text-white underline">YU-SHAN 的網站</a>. 版權所有.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* 全局樣式會從Tailwind中獲得 */
</style>

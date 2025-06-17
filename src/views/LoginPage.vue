<template>
  <div class="min-h-screen flex justify-center items-center bg-teal-50 py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div class="px-6 py-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800">{{ isLogin ? '登入帳號' : '註冊帳號' }}</h2>
          <p class="text-gray-600 mt-2 pt-2">{{ isLogin ? '歡迎回來！請登入您的帳號' : '創建一個新帳號開始您的旅程' }}</p>
        </div>

        <div v-if="errorMessage" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2 pb-1 pt-2">電子郵件</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="您的電子郵件地址"
            />
          </div>
          
          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2 pb-1 pt-2">密碼</label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="您的密碼"
            />
          </div>
          
          <div class="flex items-center justify-center mb-6 py-6">
            <button
              type="submit"
              class="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              :disabled="isLoading"
            >
              {{ isLoading ? '處理中...' : (isLogin ? '登入' : '註冊') }}
            </button>
          </div>
          
          <div class="text-center">
            <button
              type="button"
              @click="toggleMode"
              class="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              {{ isLogin ? '還沒有帳號？立即註冊' : '已有帳號？立即登入' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser, registerUser } from '../services/authService';

export default {
  setup() {
    const router = useRouter();
    const isLogin = ref(true);
    const isLoading = ref(false);
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const toggleMode = () => {
      isLogin.value = !isLogin.value;
      errorMessage.value = '';
    };

    const handleSubmit = async () => {
      errorMessage.value = '';
      isLoading.value = true;

      try {
        let result;
        
        if (isLogin.value) {
          result = await loginUser(email.value, password.value);
        } else {
          result = await registerUser(email.value, password.value);
        }

        if (result.error) {
          errorMessage.value = result.error;
        } else {
          // 登入或註冊成功，導向首頁
          router.push('/');
        }
      } catch (error) {
        errorMessage.value = error.message || '發生錯誤，請稍後再試';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isLogin,
      isLoading,
      email,
      password,
      errorMessage,
      toggleMode,
      handleSubmit
    };
  }
};
</script> 
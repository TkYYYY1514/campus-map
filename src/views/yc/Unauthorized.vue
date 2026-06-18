<template>
    <div class="error-container">
      <div class="error-card">
        <div class="error-header">
          <h2>401</h2>
          <p>未授权</p>
        </div>
        <div class="error-description">
          抱歉，您尚未登录，请先登录后再访问
        </div>
        <div class="error-actions">
          <el-button type="primary" @click="goLogin">去登录</el-button>
          <!-- <el-button @click="goBack">返回上一页</el-button> -->
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const goLogin = () => {
    router.push('/login');
  };
  
  const goBack = () => {
    router.back();
  };
  </script>
  
  <style scoped>
  .error-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #fff7e6;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .error-card {
    width: 420px;
    padding: 40px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .error-header {
    text-align: center;
    margin-bottom: 24px;
  }
  
  .error-header h2 {
    font-size: 64px;
    font-weight: bold;
    color: #e6a23c;
    margin-bottom: 8px;
  }
  
  .error-header p {
    font-size: 20px;
    color: #333;
    margin: 0;
  }
  
  .error-description {
    text-align: center;
    color: #666;
    font-size: 14px;
    margin-bottom: 32px;
    padding: 0 16px;
  }
  
  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  .error-actions .el-button--primary {
    background-color: #e6a23c;
    border-color: #e6a23c;
  }
  
  .error-actions .el-button--primary:hover {
    background-color: #ebb563;
    border-color: #ebb563;
  }
  </style>
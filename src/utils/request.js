import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',  // 根据你的实际代理配置调整
  timeout: 10000,   // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 loading 状态
    console.log('📤 请求:', config.method?.toUpperCase(), config.url, config.data);
    
    // 从 localStorage 获取 token（如果需要认证）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 可以在这里关闭 loading
    console.log('📥 响应:', response.status, response.config.url);
    
    // 如果后端返回的数据结构有 code 字段，可以统一处理
    // if (response.data.code && response.data.code !== 200) {
    //   console.error('业务错误:', response.data.message);
    //   return Promise.reject(new Error(response.data.message));
    // }
    
    return response.data; // 直接返回数据，不用再 .data.data
  },
  (error) => {
    console.error('❌ 响应错误:', error);
    
    // 统一错误处理
    let errorMessage = '网络请求失败';
    
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          // 清除本地 token 并跳转到登录页
          localStorage.removeItem('token');
          // window.location.href = '/login';
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = data?.message || '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接失败，请检查网络';
    } else {
      // 请求配置出错
      errorMessage = error.message || '请求配置错误';
    }
    
    // 可以在这里使用全局提示组件
    // Toast.error(errorMessage);
    console.error('错误提示:', errorMessage);
    
    return Promise.reject({
      ...error,
      message: errorMessage
    });
  }
);

export default request;
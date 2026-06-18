<template>
  <div class="weather-widget" v-if="!loading">
    <!-- 日期时间 + 天气合并区域 -->
    <div class="info-section">
      <div class="datetime">
        <div class="date">{{ currentDate }}</div>
        <div class="time">{{ currentTime }}</div>
        <div class="week">{{ currentWeek }}</div>
      </div>
      <div class="weather-main">
        <div class="weather-row-top">
          <div class="weather-icon">{{ currentWeather.icon }}</div>
          <div class="weather-desc">{{ currentWeather.desc }}</div>
        </div>
        <div class="weather-row-bottom">
          <div class="weather-temp">{{ currentWeather.temp }}°</div>
          <div class="weather-location">{{ location }}</div>
        </div>
      </div>
    </div>

    <!-- 用户名 + 上下滚动弹幕 -->
    <!-- 用户名 + 弹幕（上下分布） -->
    <div class="right-section">
      <div class="username-label">{{ greeting }} ! {{ username }}</div>
      <div class="marquee-container">
        <div class="marquee-wrapper">
          <div 
            v-for="(tip, index) in tipList" 
            :key="index"
            class="marquee-item"
            :class="{ 'active': currentTipIndex === index }"
          >
            {{ tip }}
          </div>
        </div>
      </div>
    </div>

  </div>
  <div class="weather-widget loading" v-else>
    <el-icon class="is-loading"><Loading /></el-icon>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Loading, Refresh } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';

// 高德 API Key
const AMAP_KEY = '425bc4d605647cda1f1f438f7d31177c';

const userStore = useUserStore();
const loading = ref(true);
const location = ref('加载中...');

// 用户名
const username = computed(() => {
  return userStore.user?.username || '游客';
});

// 日期时间相关
const currentDate = ref('');
const currentTime = ref('');
const currentWeek = ref('');
let timeInterval = null;

// 当前天气
const currentWeather = ref({
  temp: '--',
  desc: '--',
  icon: '☀️'
});

// 提示语列表
const tipList = ref([]);
const currentTipIndex = ref(0);


// 根据时间段返回问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return '早上好';
  } else if (hour >= 12 && hour < 14) {
    return '中午好';
  } else if (hour >= 14 && hour < 18) {
    return '下午好';
  } else {
    return '晚上好';
  }
});

// 更新日期时间
const updateDateTime = () => {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  currentDate.value = `${year}.${month}.${day}`;
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;
  
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  currentWeek.value = weekdays[now.getDay()];
};

// 根据温度生成提示语
const getTipsByTemperature = (temp) => {
  const tempNum = parseInt(temp);
  if (isNaN(tempNum)) return [];
  
  if (tempNum >= 35) {
    return ['🥵 酷暑高温，注意防暑降温', '💧 多喝水，避免长时间暴晒', '❄️ 室内开启空调，注意温差'];
  } else if (tempNum >= 30) {
    return ['🔥 天气炎热，注意防晒', '🧴 涂抹防晒霜，戴好遮阳帽', '💦 及时补充水分'];
  } else if (tempNum >= 25) {
    return ['🌞 天气温暖舒适，适合出行', '👕 建议穿轻薄衣物', '🚗 适合自驾游玩'];
  } else if (tempNum >= 20) {
    return ['🍃 温度适宜，体感舒适', '👚 早晚温差不大，穿衣轻松', '🚶 适合散步运动'];
  } else if (tempNum >= 15) {
    return ['🍂 天气凉爽，注意添衣', '🧥 建议带件薄外套', '🍵 喝杯热饮更舒适'];
  } else if (tempNum >= 10) {
    return ['🧣 天气偏凉，注意保暖', '🧤 早晚温差大，多穿一件', '🔥 适合吃火锅暖身'];
  } else if (tempNum >= 5) {
    return ['❄️ 天气寒冷，注意防寒', '🧥 穿厚外套，戴好围巾', '☕ 喝杯热饮暖暖身'];
  } else if (tempNum >= 0) {
    return ['🥶 天气很冷，注意保暖', '🧤 戴好手套帽子', '🏠 减少户外活动'];
  } else {
    return ['⛄ 零下低温，严寒天气', '🧥 穿最厚的衣服', '⚠️ 路面可能结冰，注意防滑', '🏠 尽量减少外出'];
  }
};

// 根据天气描述生成提示语
const getTipsByWeather = (desc, temp) => {
  const tips = [];
  
  if (desc.includes('晴')) {
    tips.push('☀️ 阳光明媚，适合出行');
    tips.push('🕶️ 注意防晒，佩戴墨镜');
    tips.push('🌡️ 紫外线较强，做好防护');
  } else if (desc.includes('多云')) {
    tips.push('⛅ 天气舒适，适合户外活动');
    tips.push('🌬️ 微风拂面，惬意出行');
    tips.push('👀 注意云层变化，可能转阴');
  } else if (desc.includes('阴')) {
    tips.push('☁️ 天气阴沉，带好雨具备用');
    tips.push('🌫️ 能见度较低，注意减速慢行');
    tips.push('🧥 体感较凉，适当添衣');
  } else if (desc.includes('雨') || desc.includes('阵雨')) {
    tips.push('🌧️ 雨天路滑，小心慢行');
    tips.push('☔ 记得带伞，注意防滑');
    tips.push('🚗 减速慢行，保持车距');
    tips.push('💧 道路湿滑，注意安全');
  } else if (desc.includes('雷阵雨')) {
    tips.push('⚡ 雷雨天气，注意防雷');
    tips.push('⚠️ 避免在树下避雨');
    tips.push('🏠 建议室内活动');
    tips.push('🔌 注意电器安全');
  } else if (desc.includes('雪')) {
    tips.push('❄️ 雪天路滑，小心慢行');
    tips.push('🧤 注意保暖，防寒防冻');
    tips.push('🚗 减速慢行，保持车距');
    tips.push('⛄ 路面可能结冰');
  } else if (desc.includes('雾')) {
    tips.push('🌫️ 大雾天气，能见度低');
    tips.push('🚗 打开雾灯，减速慢行');
    tips.push('⚠️ 注意行车安全');
    tips.push('🛑 建议减少外出');
  } else if (desc.includes('大风')) {
    tips.push('💨 大风天气，注意防风');
    tips.push('🚗 减速慢行，注意横风');
    tips.push('🏠 关好门窗');
  }
  
  return tips;
};

// 根据时间和温度生成额外提示
const getTimeBasedTips = (temp) => {
  const now = new Date();
  const hour = now.getHours();
  const tempNum = parseInt(temp);
  
  if (hour >= 22 || hour < 5) {
    return ['🌙 深夜时段，注意休息', '🚗 夜间行车注意安全', '😴 早点休息，晚安'];
  } else if (hour >= 5 && hour < 8) {
    return ['🌅 清晨时分，空气清新', '🏃 适合晨练运动', '🥣 记得吃早餐'];
  } else if (hour >= 11 && hour < 13) {
    return ['🍜 午餐时间，记得吃饭', '😴 午休片刻，精力充沛'];
  } else if (hour >= 18 && hour < 20) {
    return ['🌆 傍晚时分，夕阳很美', '🍽️ 晚餐时间，享受美食', '🚶 饭后散步，有益健康'];
  }
  
  return [];
};

// 更新提示语列表
const updateTipList = () => {
  const desc = currentWeather.value.desc;
  const temp = currentWeather.value.temp;
  
  let tips = [];
  
  const tempTips = getTipsByTemperature(temp);
  tips = [...tips, ...tempTips];
  
  const weatherTips = getTipsByWeather(desc, temp);
  tips = [...tips, ...weatherTips];
  
  const timeTips = getTimeBasedTips(temp);
  tips = [...tips, ...timeTips];
  
  if (tips.length < 3) {
    tips.push('🚗 出行注意安全，祝您一路顺风');
  }
  
  tips = [...new Set(tips)];
  
  tipList.value = tips;
  currentTipIndex.value = 0;
};

// 切换下一条提示语
let tipInterval;
const startTipRotation = () => {
  tipInterval = setInterval(() => {
    if (tipList.value.length > 0) {
      currentTipIndex.value = (currentTipIndex.value + 1) % tipList.value.length;
    }
  }, 5000);
};

// 获取当前位置的城市编码
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('浏览器不支持定位');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoUrl = `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${longitude},${latitude}&key=${AMAP_KEY}&radius=1000&extensions=all`;
          const response = await fetch(geoUrl);
          const data = await response.json();
          if (data.status === '1' && data.regeocode) {
            const adcode = data.regeocode.addressComponent.adcode;
            resolve(adcode);
          } else {
            reject('获取位置失败');
          }
        } catch (err) {
          reject(err);
        }
      },
      (err) => {
        console.error('定位失败:', err);
        reject('定位失败');
      },
      { timeout: 10000 }
    );
  });
};

// 根据天气获取图标
const getWeatherIcon = (weatherDesc) => {
  if (weatherDesc.includes('晴')) return '☀️';
  if (weatherDesc.includes('多云')) return '⛅';
  if (weatherDesc.includes('阴')) return '☁️';
  if (weatherDesc.includes('雨')) return '🌧️';
  if (weatherDesc.includes('雪')) return '❄️';
  if (weatherDesc.includes('雾')) return '🌫️';
  if (weatherDesc.includes('雷')) return '⚡';
  return '🌡️';
};

// 获取天气数据
const fetchWeather = async () => {
  loading.value = true;
  
  try {
    let cityCode = '110000';
    
    try {
      const currentCode = await getCurrentLocation();
      if (currentCode) {
        cityCode = currentCode;
      }
    } catch (locErr) {
      console.log('定位失败，使用默认城市:', locErr);
    }
    
    const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${cityCode}&key=${AMAP_KEY}&extensions=base`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1' && data.lives && data.lives.length > 0) {
      const live = data.lives[0];
      currentWeather.value = {
        temp: live.temperature || '--',
        desc: live.weather || '--',
        icon: getWeatherIcon(live.weather || '')
      };
      location.value = live.city || '余杭区';
    } else {
      currentWeather.value = {
        temp: '--',
        desc: '获取失败',
        icon: '🌡️'
      };
      location.value = '余杭区';
    }
    
    updateTipList();
  } catch (err) {
    console.error('获取天气失败:', err);
    currentWeather.value = {
      temp: '--',
      desc: '网络错误',
      icon: '🌡️'
    };
    location.value = '余杭区';
    updateTipList();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  updateDateTime();
  timeInterval = setInterval(updateDateTime, 1000);
  
  fetchWeather();
  startTipRotation();
  setInterval(fetchWeather, 1800000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (tipInterval) {
    clearInterval(tipInterval);
  }
});
</script>

<style scoped>
.weather-widget {
  position: absolute;
  width: 360px;
  height: 70px;
  top: 20px;
  left: 20px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(0px);
  padding: 8px 16px;
  border-radius: 4px;
  color: #000000;
  font-size: 12px;
  pointer-events: auto;
}

/* 信息区域（日期时间 + 天气）*/
.info-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 日期时间区域 */
.datetime {
  display: flex;
  flex-direction: column;
  align-items: flex-start;  
  justify-content: center;
  width: 50px;
}

.date {
  font-size: 11px;
  font-weight: 500;
  color: #000000;
  letter-spacing: 0.5px;
}

.time {
  font-size: 18px;
  font-weight: bold;
  color: #000000;
  font-family: monospace;
  margin: 2px 0;
}

.week {
  font-size: 10px;
  color: #000000;
}

/* 天气主体 */
.weather-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 20px;
}

.weather-row-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-row-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weather-icon {
  font-size: 24px;
}

.weather-desc {
  font-size: 12px;
  color: #000000;
}

.weather-temp {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
}

.weather-location {
  font-size: 11px;
  color: #000000;
  padding-left: 8px;
  border-left: 1px solid rgba(0, 0, 0, 0.2);
}

/* 用户名 + 弹幕区域 */
/* 右侧区域：上下分布 */
.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  height: 44px;
  overflow: hidden;
}

.username-label {
  font-size: 15px;
  font-weight: 500;
  /* color: #ff9800; */
  /* background: rgba(255, 152, 0, 0.1); */
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
  text-align: center;
  width: fit-content;
  align-self: center;
}

.marquee-container {
  flex: 1;
  height: 24px;
  overflow: hidden;
}

.marquee-wrapper {
  position: relative;
  height: 100%;
}

.marquee-item {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  font-size: 10px;
  color: #0432ff;
  text-align: center;
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marquee-item.active {
  opacity: 1;
  transform: translateY(-50%);
}

.marquee-item:not(.active) {
  transform: translateY(calc(-50% + 20px));
}

/* 加载状态 */
.weather-widget.loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.weather-widget.loading .el-icon {
  font-size: 20px;
  color: #000000;
}
</style>
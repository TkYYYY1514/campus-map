<template>
    <div class="building-detail">
      <div class="header">
        <h5>建筑评价</h5>
        <el-button type="primary" text @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
  
      <!-- 建筑信息（精简版） -->
      <div class="building-info">
        <div class="building-name">{{ building.name }}</div>
        <div class="building-type" :style="{ color: getTypeColor(building.type) }">
          {{ getTypeLabel(building.type) }}
        </div>
      </div>
  
      <!-- 评论列表区域 -->
      <div class="comment-section">
        <div class="comment-header">
          <span>用户评价</span>
          <span class="comment-count">{{ comments.length }}条评价</span>
        </div>
  
        <!-- 评论列表 -->
        <div class="comment-list">
          <div 
            v-for="(item, index) in comments" 
            :key="item.id" 
            class="comment-item" 
            :class="{ 'pinned-item': item.is_pinned }"
          >
            <div class="comment-user">
              <span class="floor-num">
                <span v-if="item.is_pinned" class="pinned-tag">📌 置顶</span>
                <span v-else>{{ getFloorNumber(item.id) }}</span>
              </span>
              <span class="username">{{ item.username }}</span>
              <span v-if="item.role === 'admin'" class="admin-badge">管理员</span>
              <span class="time">{{ formatTime(item.created_at) }}</span>
            </div>
            <div class="comment-content">{{ item.content }}</div>
            <div class="comment-actions-bar">
              <!-- 点赞按钮 -->
              <span class="like-btn" @click="handleLike(item.id)">
                <span v-if="isLiked(item.id)">❤️</span>
                <span v-else>🤍</span>
                {{ item.likes || 0 }}
              </span>
              <!-- 置顶按钮（仅管理员） -->
              <span v-if="userStore.isAdmin" class="pin-btn" @click="handlePin(item.id, item.is_pinned)">
                {{ item.is_pinned ? '取消置顶' : '置顶' }}
              </span>
              <!-- 删除按钮（管理员或本人） -->
              <span v-if="canDelete(item)" class="delete-btn" @click="handleDelete(item.id)">
                删除
              </span>
            </div>
          </div>
          
          <div v-if="comments.length === 0" class="empty-comment">
            暂无评价，快来发表第一条吧~
          </div>
        </div>
      </div>
  
      <!-- 底部发表评论区域 -->
      <div class="comment-footer" v-if="userStore.isLoggedIn">
        <el-input
          v-model="newComment"
          type="text"
          placeholder="写下你对这个建筑的评价..."
          maxlength="200"
          show-word-limit
          class="comment-input"
        />
        <el-button type="primary" @click="submitComment" :loading="submitting">发表</el-button>
      </div>
  
      <!-- 未登录提示 -->
      <div class="login-tip-footer" v-else>
        <el-button type="text" @click="goLogin">登录后发表评价</el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft } from '@element-plus/icons-vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { useUserStore } from '@/stores/userStore';
  import { getBuildingComments, addBuildingComment, deleteBuildingComment, likeComment, pinComment } from '@/api/comment';
  import { POI_TYPE_LABELS, POI_TYPE_COLORS } from '@/data/poiData';
  
  const props = defineProps({
    building: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['back']);
  
  const router = useRouter();
  const userStore = useUserStore();
  
  const comments = ref([]);
  const userLikes = ref([]);
  const newComment = ref('');
  const submitting = ref(false);
  
  const getTypeLabel = (type) => POI_TYPE_LABELS[type] || type;
  const getTypeColor = (type) => POI_TYPE_COLORS[type] || '#909399';
  const goBack = () => emit('back');
  
  // 获取楼层号（基于数据库ID顺序，删除后不变）
  // 获取楼层号（按发布时间正序，最早的为1楼，删除后后面的楼层不变）
const getFloorNumber = (commentId) => {
  // 获取所有普通评论（非置顶），按发布时间正序排列（最早的在前）
  const normalComments = [...comments.value]
    .filter(c => !c.is_pinned)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  // 找到当前评论的位置
  const index = normalComments.findIndex(c => c.id === commentId);
  if (index === -1) return '';
  return `${index + 1}楼`;
};
  
  // 判断是否已点赞
  const isLiked = (commentId) => {
    return userLikes.value.includes(commentId);
  };
  
  // 获取评论列表
  const fetchComments = async () => {
    const res = await getBuildingComments(props.building.id);
    if (res.success) {
      comments.value = res.data;
      userLikes.value = res.userLikes || [];
    }
  };
  
  // 发表评论
  const submitComment = async () => {
    if (!newComment.value.trim()) {
      ElMessage.warning('请输入评价内容');
      return;
    }
    
    submitting.value = true;
    const res = await addBuildingComment(props.building.id, newComment.value);
    submitting.value = false;
    
    if (res.success) {
      ElMessage.success('评价成功');
      newComment.value = '';
      fetchComments();
    } else {
      ElMessage.error(res.message || '评价失败');
    }
  };
  
  // 点赞
  const handleLike = async (id) => {
    const res = await likeComment(id);
    if (res.success) {
      fetchComments();
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  };
  
  // 置顶（管理员）
  const handlePin = async (id, isPinned) => {
    const res = await pinComment(id);
    if (res.success) {
      ElMessage.success(res.message);
      fetchComments();
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  };
  
  // 删除评论
  const handleDelete = async (id) => {
    try {
      await ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      const res = await deleteBuildingComment(id);
      if (res.success) {
        ElMessage.success('删除成功');
        fetchComments();
      }
    } catch (error) {}
  };
  
  const canDelete = (comment) => {
    return userStore.isLoggedIn && (userStore.isAdmin || comment.username === userStore.user?.username);
  };
  
  const formatTime = (time) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  const goLogin = () => router.push('/login');
  
  onMounted(() => {
    fetchComments();
  });
  </script>
  
  <style scoped>
  .building-detail {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0px 10px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
  }
  
  .header h5 {
    margin: 0 0 4px 0 ;
    font-size: 16px;
  }
  
  .back-btn {
    margin-left: auto;
    padding: 0;
  }
  
  .building-info {
    padding: 10px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .building-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
  
  .building-type {
    font-size: 12px;
    padding: 2px 8px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 12px;
  }
  
  .comment-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 12px;
    padding-bottom: 0;
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
  }
  
  .comment-header span:first-child {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
  
  .comment-count {
    font-size: 12px;
    color: #999;
  }
  
  .comment-list {
    flex: 1;
    overflow-y: auto;
  }
  
  .comment-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .pinned-item {
    background: #fffbe6;
    margin: 0px;
    padding: 12px;
    border-radius: 8px;
  }
  
  .comment-user {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }
  
  .floor-num {
    font-size: 11px;
    color: #ff9800;
    background: rgba(255, 152, 0, 0.1);
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 500;
  }
  
  .pinned-tag {
    color: #ff9800;
    font-size: 11px;
    font-weight: 500;
  }
  
  .username {
    font-size: 13px;
    font-weight: 500;
    color: #409eff;
  }
  
  .admin-badge {
    font-size: 10px;
    background: #f56c6c;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 500;
  }
  
  .time {
    font-size: 11px;
    color: #999;
  }
  
  .comment-content {
    font-size: 13px;
    color: #333;
    line-height: 1.5;
    word-break: break-all;
    padding-left: 4px;
    margin-bottom: 6px;
  }
  
  .comment-actions-bar {
    display: flex;
    gap: 16px;
    padding-left: 4px;
  }
  
  .like-btn, .pin-btn, .delete-btn {
    font-size: 12px;
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
  }
  
  .like-btn:hover {
    color: #ff4757;
  }
  
  .pin-btn:hover {
    color: #ff9800;
  }
  
  .delete-btn:hover {
    color: #f56c6c;
  }
  
  .empty-comment {
    text-align: center;
    padding: 24px;
    color: #999;
    font-size: 12px;
  }
  
  /* 底部发表评论区域 */
  .comment-footer {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border-top: 1px solid #eee;
    background: #fff;
    flex-shrink: 0;
    align-items: center;
  }
  
  .comment-input {
    flex: 1;
  }
  
  .comment-footer :deep(.el-input__wrapper) {
    border-radius: 20px;
  }
  
  .login-tip-footer {
    padding: 12px;
    text-align: center;
    border-top: 1px solid #eee;
    background: #fff;
    flex-shrink: 0;
  }
  </style>
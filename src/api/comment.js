import { db } from '@/utils/db';

const authMiddleware = async (token) => {
  if (!token || !token.startsWith('Bearer ')) {
    throw new Error('未提供认证令牌');
  }
  
  const tokenData = token.substring(7);
  try {
    const decoded = JSON.parse(atob(tokenData));
    
    if (decoded.exp < Date.now()) {
      throw new Error('令牌已过期');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('无效的认证令牌');
  }
};

export const getBuildingComments = async (poiId) => {
  try {
    const comments = await db.comments
      .where('poi_id')
      .equals(parseInt(poiId))
      .reverse()
      .sortBy('is_pinned');
    
    const sortedComments = [...comments].sort((a, b) => {
      if (b.is_pinned !== a.is_pinned) return b.is_pinned - a.is_pinned;
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    let userLikes = [];
    const authHeader = localStorage.getItem('token');
    if (authHeader) {
      try {
        const decoded = JSON.parse(atob(authHeader));
        if (decoded.id) {
          const likeRows = await db.comment_likes
            .where('user_id')
            .equals(decoded.id)
            .toArray();
          userLikes = likeRows.map(r => r.comment_id);
        }
      } catch (e) {}
    }
    
    return {
      success: true,
      data: sortedComments,
      userLikes
    };
  } catch (error) {
    return { success: false, message: '获取评论失败' };
  }
};

export const addBuildingComment = async (poiId, content) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const user = await authMiddleware(`Bearer ${token}`);
    
    if (!poiId || !content) {
      return { success: false, message: '参数不完整' };
    }
    
    if (content.length > 500) {
      return { success: false, message: '评论内容不能超过500字' };
    }
    
    const poiExists = await db.poi_data.get(parseInt(poiId));
    
    if (!poiExists) {
      return { success: false, message: '建筑不存在' };
    }
    
    const now = new Date().toISOString();
    const maxId = await db.comments.orderBy('id').reverse().first();
    const nextId = maxId ? maxId.id + 1 : 1;
    
    const newComment = {
      id: nextId,
      poi_id: parseInt(poiId),
      user_id: user.id,
      username: user.username,
      content,
      created_at: now,
      likes: 0,
      is_pinned: 0
    };
    
    await db.comments.add(newComment);
    
    return {
      success: true,
      message: '评论成功',
      data: newComment
    };
  } catch (error) {
    console.error('添加评论错误:', error);
    return { success: false, message: error.message || '添加评论失败' };
  }
};

export const deleteBuildingComment = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const user = await authMiddleware(`Bearer ${token}`);
    
    const existing = await db.comments.get(parseInt(id));
    
    if (!existing) {
      return { success: false, message: '评论不存在' };
    }
    
    if (user.role !== 'admin' && existing.user_id !== user.id) {
      return { success: false, message: '无权限删除' };
    }
    
    await db.comment_likes.where('comment_id').equals(parseInt(id)).delete();
    await db.comments.delete(parseInt(id));
    
    return {
      success: true,
      message: '删除成功',
      deletedId: parseInt(id)
    };
  } catch (error) {
    return { success: false, message: '删除评论失败' };
  }
};

export const likeComment = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const user = await authMiddleware(`Bearer ${token}`);
    
    const comment = await db.comments.get(parseInt(id));
    if (!comment) {
      return { success: false, message: '评论不存在' };
    }
    
    const existing = await db.comment_likes
      .where('[comment_id+user_id]')
      .equals([parseInt(id), user.id])
      .toArray();
    
    if (existing.length > 0) {
      await db.comment_likes.delete(existing[0].id);
      comment.likes = (comment.likes || 0) - 1;
      await db.comments.put(comment);
      return { success: true, message: '取消点赞', liked: false };
    } else {
      const now = new Date().toISOString();
      const maxId = await db.comment_likes.orderBy('id').reverse().first();
      const nextId = maxId ? maxId.id + 1 : 1;
      await db.comment_likes.add({
        id: nextId,
        comment_id: parseInt(id),
        user_id: user.id,
        created_at: now
      });
      comment.likes = (comment.likes || 0) + 1;
      await db.comments.put(comment);
      return { success: true, message: '点赞成功', liked: true };
    }
  } catch (error) {
    return { success: false, message: '操作失败' };
  }
};

export const pinComment = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const user = await authMiddleware(`Bearer ${token}`);
    
    if (user.role !== 'admin') {
      return { success: false, message: '无权限' };
    }
    
    const comment = await db.comments.get(parseInt(id));
    
    if (!comment) {
      return { success: false, message: '评论不存在' };
    }
    
    comment.is_pinned = comment.is_pinned ? 0 : 1;
    await db.comments.put(comment);
    
    return { 
      success: true, 
      message: comment.is_pinned ? '置顶成功' : '取消置顶',
      is_pinned: comment.is_pinned
    };
  } catch (error) {
    return { success: false, message: '操作失败' };
  }
};
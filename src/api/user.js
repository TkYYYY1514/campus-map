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

export const register = async (username, password) => {
  try {
    if (!username || !password) {
      return { success: false, message: '用户名和密码不能为空' };
    }
    
    const existing = await db.users.where('username').equals(username).toArray();
    
    if (existing.length > 0) {
      return { success: false, message: '用户名已存在' };
    }
    
    const now = new Date().toISOString();
    await db.users.add({
      username,
      password,
      role: 'user',
      created_at: now
    });
    
    return { success: true, message: '注册成功' };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const login = async (username, password) => {
  try {
    const users = await db.users.where('username').equals(username).toArray();
    
    if (users.length === 0) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    const user = users[0];
    
    if (user.password !== password) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    const tokenData = JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    });
    const token = btoa(tokenData);
    
    return {
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const user = await authMiddleware(`Bearer ${token}`);
    
    const users = await db.users.where('id').equals(user.id).toArray();
    
    if (users.length === 0) {
      return { success: false, message: '用户不存在' };
    }
    
    return {
      success: true,
      data: users[0]
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const currentUser = await authMiddleware(`Bearer ${token}`);
    
    if (currentUser.role !== 'admin') {
      return { success: false, message: '无权限访问' };
    }
    
    const users = await db.users.orderBy('id').toArray();
    
    return {
      success: true,
      data: users
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const currentUser = await authMiddleware(`Bearer ${token}`);
    
    if (!newPassword) {
      return { success: false, message: '新密码不能为空' };
    }
    
    if (newPassword.length < 3) {
      return { success: false, message: '新密码长度不能少于3位' };
    }
    
    const user = await db.users.get(currentUser.id);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    user.password = newPassword;
    await db.users.put(user);
    
    return { success: true, message: '密码修改成功' };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const currentUser = await authMiddleware(`Bearer ${token}`);
    
    if (currentUser.role !== 'admin') {
      return { success: false, message: '无权限访问' };
    }
    
    if (currentUser.id === userId) {
      return { success: false, message: '不能删除自己的账号' };
    }
    
    const users = await db.users.where('id').equals(userId).toArray();
    
    if (users.length === 0) {
      return { success: false, message: '用户不存在' };
    }
    
    if (users[0].role === 'admin') {
      return { success: false, message: '不能删除管理员账号' };
    }
    
    await db.users.delete(userId);
    
    return { success: true, message: '删除成功' };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const currentUser = await authMiddleware(`Bearer ${token}`);
    
    if (currentUser.role !== 'admin') {
      return { success: false, message: '无权限访问' };
    }
    
    const user = await db.users.get(userId);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    user.role = role;
    await db.users.put(user);
    
    return { success: true, message: '角色更新成功' };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
};
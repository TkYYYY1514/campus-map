import request from '../utils/request';

const poiService = {
  // 获取所有
  getList() {
    return request.get('/pois');
  },
  
  // 模糊搜索
  search(name) {
    return request.get('/pois/search', { params: { name } });
  },
  
  // 获取单个
  getById(id) {
    return request.get(`/pois/${id}`);
  },
  
  // 新增
  create(data) {
    return request.post('/pois', data);
  },
  
  // 更新（可修改 is_visible）
  update(id, data) {
    return request.put(`/pois/${id}`, data);
  },
  
  // 删除
  delete(id) {
    return request.delete(`/pois/${id}`);
  },
  
  // 快捷方法：切换显示/隐藏
  toggleVisibility(id, isVisible) {
    return this.update(id, { is_visible: isVisible ? 1 : 0 });
  }
};

export default poiService;
import api from './api';

// Get all menu items
export const getMenuItems = async (category = null) => {
  const params = category ? { category } : {};
  const response = await api.get('/menu', { params });
  return response.data;
};

// Get menu categories
export const getMenuCategories = async () => {
  const response = await api.get('/menu/categories');
  return response.data;
};

// Get single menu item
export const getMenuItem = async (id) => {
  const response = await api.get(`/menu/${id}`);
  return response.data;
};

// Create menu item (Admin only)
export const createMenuItem = async (menuItemData) => {
  const response = await api.post('/menu', menuItemData);
  return response.data;
};

// Update menu item (Admin only)
export const updateMenuItem = async (id, menuItemData) => {
  const response = await api.put(`/menu/${id}`, menuItemData);
  return response.data;
};

// Delete menu item (Admin only)
export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/menu/${id}`);
  return response.data;
};

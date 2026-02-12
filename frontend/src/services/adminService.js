import api from './api';

// Get admin dashboard statistics
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Get all reservations (Admin)
export const getAllReservations = async () => {
  const response = await api.get('/admin/reservations');
  return response.data;
};

// Get all orders (Admin)
export const getAllOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

// Get all customers (Admin)
export const getCustomers = async () => {
  const response = await api.get('/admin/customers');
  return response.data;
};

// Block or unblock customer
export const updateCustomerBlock = async (id, blocked) => {
  const response = await api.put(`/admin/customers/${id}/block`, { blocked });
  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await api.get('/admin/categories');
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await api.post('/admin/categories', payload);
  return response.data;
};

export const updateCategory = async (id, payload) => {
  const response = await api.put(`/admin/categories/${id}`, payload);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};

// Offers
export const getOffers = async () => {
  const response = await api.get('/admin/offers');
  return response.data;
};

export const createOffer = async (payload) => {
  const response = await api.post('/admin/offers', payload);
  return response.data;
};

export const updateOffer = async (id, payload) => {
  const response = await api.put(`/admin/offers/${id}`, payload);
  return response.data;
};

export const deleteOffer = async (id) => {
  const response = await api.delete(`/admin/offers/${id}`);
  return response.data;
};

// Delivery
export const getDeliveries = async () => {
  const response = await api.get('/admin/deliveries');
  return response.data;
};

export const createDelivery = async (payload) => {
  const response = await api.post('/admin/deliveries', payload);
  return response.data;
};

export const updateDelivery = async (id, payload) => {
  const response = await api.put(`/admin/deliveries/${id}`, payload);
  return response.data;
};

export const deleteDelivery = async (id) => {
  const response = await api.delete(`/admin/deliveries/${id}`);
  return response.data;
};

// Settings
export const getSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSettings = async (payload) => {
  const response = await api.put('/admin/settings', payload);
  return response.data;
};

// Reports
export const getReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};

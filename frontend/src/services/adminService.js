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

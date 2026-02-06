import api from './api';

// Create order
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Get user's orders or all (admin)
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// Get single order
export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Update order status (Admin only)
export const updateOrderStatus = async (id, orderStatus) => {
  const response = await api.put(`/orders/${id}/status`, { orderStatus });
  return response.data;
};

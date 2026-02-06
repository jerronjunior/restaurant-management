import api from './api';

// Create payment
export const createPayment = async (paymentData) => {
  const response = await api.post('/payments', paymentData);
  return response.data;
};

// Get user's payments or all (admin)
export const getPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

// Get single payment
export const getPayment = async (id) => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

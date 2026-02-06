import api from './api';

// Create reservation
export const createReservation = async (reservationData) => {
  const response = await api.post('/reservations', reservationData);
  return response.data;
};

// Get user's reservations or all (admin)
export const getReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};

// Get single reservation
export const getReservation = async (id) => {
  const response = await api.get(`/reservations/${id}`);
  return response.data;
};

// Cancel reservation
export const cancelReservation = async (id) => {
  const response = await api.put(`/reservations/${id}/cancel`);
  return response.data;
};

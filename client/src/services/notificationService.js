import API from './api';

export const fetchNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

export const markNotificationReadApi = async (id) => {
  const response = await API.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await API.put('/notifications/read-all');
  return response.data;
};

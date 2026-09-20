import API from './api';

export const loginUser = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await API.post('/auth/register', { name, email, password });
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await API.put('/auth/profile', profileData);
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

export const searchUsersApi = async (query) => {
  const response = await API.get(`/auth/users?q=${encodeURIComponent(query)}`);
  return response.data;
};

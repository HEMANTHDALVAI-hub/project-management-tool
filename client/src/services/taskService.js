import API from './api';

export const fetchTasks = async (params = {}) => {
  const response = await API.get('/tasks', { params });
  return response.data;
};

export const createTaskApi = async (taskData) => {
  const response = await API.post('/tasks', taskData);
  return response.data;
};

export const fetchTaskById = async (id) => {
  const response = await API.get(`/tasks/${id}`);
  return response.data;
};

export const updateTaskApi = async (id, taskData) => {
  const response = await API.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTaskApi = async (id) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};

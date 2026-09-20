import API from './api';

export const fetchTaskComments = async (taskId) => {
  const response = await API.get(`/tasks/${taskId}/comments`);
  return response.data;
};

export const addCommentApi = async (taskId, content) => {
  const response = await API.post(`/tasks/${taskId}/comments`, { content });
  return response.data;
};

export const updateCommentApi = async (commentId, content) => {
  const response = await API.put(`/comments/${commentId}`, { content });
  return response.data;
};

export const deleteCommentApi = async (commentId) => {
  const response = await API.delete(`/comments/${commentId}`);
  return response.data;
};

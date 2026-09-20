import API from './api';

export const fetchProjects = async () => {
  const response = await API.get('/projects');
  return response.data;
};

export const createProjectApi = async (projectData) => {
  const response = await API.post('/projects', projectData);
  return response.data;
};

export const fetchProjectById = async (id) => {
  const response = await API.get(`/projects/${id}`);
  return response.data;
};

export const updateProjectApi = async (id, projectData) => {
  const response = await API.put(`/projects/${id}`, projectData);
  return response.data;
};

export const deleteProjectApi = async (id) => {
  const response = await API.delete(`/projects/${id}`);
  return response.data;
};

export const addProjectMemberApi = async (projectId, email, role) => {
  const response = await API.post(`/projects/${projectId}/members`, { email, role });
  return response.data;
};

export const removeProjectMemberApi = async (projectId, userId) => {
  const response = await API.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
};

export const fetchProjectActivities = async (projectId) => {
  const response = await API.get(`/projects/${projectId}/activity`);
  return response.data;
};

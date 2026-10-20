import { api } from './client.js';

export const listTasks = (params) => api.get('/tasks', { params }).then((r) => r.data);
export const getTask = (id) => api.get(`/tasks/${id}`).then((r) => r.data.data);
export const createTask = (body) => api.post('/tasks', body).then((r) => r.data);
export const updateTask = (id, body) => api.put(`/tasks/${id}`, body).then((r) => r.data);
export const updateTaskStatus = (id, status) => api.put(`/tasks/${id}/status`, { status }).then((r) => r.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then((r) => r.data);
export const exportTasksCsv = (params) => api.get('/tasks/export', { params, responseType: 'blob' }).then((r) => r.data);
export const getDashboard = () => api.get('/dashboard').then((r) => r.data.data);

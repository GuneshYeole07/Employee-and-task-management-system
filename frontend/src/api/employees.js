import { api } from './client.js';

export const listEmployees = (params) => api.get('/employees', { params }).then((r) => r.data);
export const listEmployeeOptions = () => api.get('/employees/options').then((r) => r.data.data);
export const getEmployee = (id) => api.get(`/employees/${id}`).then((r) => r.data.data);
export const createEmployee = (body) => api.post('/employees', body).then((r) => r.data);
export const updateEmployee = (id, body) => api.put(`/employees/${id}`, body).then((r) => r.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`).then((r) => r.data);

import http, { readHeaderToken } from './http';

export const authApi = {
  async login(payload) {
    const response = await http.post('/Auth/login', payload);
    const { authHeader, expiry } = readHeaderToken(response);
    return { user: response.data, token: authHeader, expiry };
  },
  async register(payload) {
    const response = await http.post('/Auth/register', payload);
    const { authHeader, expiry } = readHeaderToken(response);
    return { user: response.data, token: authHeader, expiry };
  },
};

export const departmentsApi = {
  getAll: () => http.get('/Departments').then((r) => r.data),
  getById: (id) => http.get(`/Departments/${id}`).then((r) => r.data),
  create: (payload) => http.post('/Departments', payload).then((r) => r.data),
  update: (id, payload) => http.put(`/Departments/${id}`, payload),
  remove: (id) => http.delete(`/Departments/${id}`),
};

export const projectsApi = {
  getAll: () => http.get('/Projects').then((r) => r.data),
  getById: (id) => http.get(`/Projects/${id}`).then((r) => r.data),
  create: (payload) => http.post('/Projects', payload).then((r) => r.data),
  update: (id, payload) => http.put(`/Projects/${id}`, payload),
  remove: (id) => http.delete(`/Projects/${id}`),
};

export const employeesApi = {
  getAll: () => http.get('/Employees').then((r) => r.data),
  getById: (id) => http.get(`/Employees/${id}`).then((r) => r.data),
  create: (payload) => http.post('/Employees', payload).then((r) => r.data),
  update: (id, payload) => http.put(`/Employees/${id}`, payload),
  remove: (id) => http.delete(`/Employees/${id}`),
};

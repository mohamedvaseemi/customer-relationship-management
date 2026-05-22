import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            const sampleData = localStorage.getItem('sampleDataEnabled');
            if (sampleData === 'true') {
                config.headers['x-sample-data'] = 'true';
            } else if (sampleData === 'false') {
                config.headers['x-sample-data'] = 'false';
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/auth/me'),
    googleAuth: (credential) => api.post('/auth/google', { credential })
};

// Contacts API
export const contactsAPI = {
    getAll: (params) => api.get('/contacts', { params }),
    getById: (id) => api.get(`/contacts/${id}`),
    create: (data) => api.post('/contacts', data),
    update: (id, data) => api.put(`/contacts/${id}`, data),
    delete: (id, permanent = false) => api.delete(`/contacts/${id}${permanent ? '?permanent=true' : ''}`),
    getDeleted: () => api.get('/contacts/deleted'),
    restore: (id) => api.post(`/contacts/${id}/restore`)
};

// Leads API
export const leadsAPI = {
    getAll: (params) => api.get('/leads', { params }),
    getById: (id) => api.get(`/leads/${id}`),
    create: (data) => api.post('/leads', data),
    update: (id, data) => api.put(`/leads/${id}`, data),
    delete: (id) => api.delete(`/leads/${id}`),
    getStats: () => api.get('/leads/stats')
};

// Deals API
export const dealsAPI = {
    getAll: (params) => api.get('/deals', { params }),
    getById: (id) => api.get(`/deals/${id}`),
    create: (data) => api.post('/deals', data),
    update: (id, data) => api.put(`/deals/${id}`, data),
    delete: (id) => api.delete(`/deals/${id}`)
};

// Companies API (Accounts)
export const companiesAPI = {
    getAll: (params) => api.get('/companies', { params }),
    getById: (id) => api.get(`/companies/${id}`),
    create: (data) => api.post('/companies', data),
    update: (id, data) => api.put(`/companies/${id}`, data),
    delete: (id) => api.delete(`/companies/${id}`)
};

// Activities API
export const activitiesAPI = {
    getAll: (params) => api.get('/activities', { params }),
    getById: (id) => api.get(`/activities/${id}`),
    create: (data) => api.post('/activities', data),
    update: (id, data) => api.put(`/activities/${id}`, data),
    delete: (id) => api.delete(`/activities/${id}`)
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats')
};

// Users API
export const usersAPI = {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`)
};

export const customFieldsAPI = {
    getByModule: (module) => api.get(`/custom-fields/${module}`),
    create: (data) => api.post('/custom-fields', data),
    update: (id, data) => api.put(`/custom-fields/${id}`, data),
    delete: (id) => api.delete(`/custom-fields/${id}`)
};

export const workflowsAPI = {
    getAll: () => api.get('/workflows'),
    create: (data) => api.post('/workflows', data),
    toggle: (id, isActive) => api.patch(`/workflows/${id}`, { is_active: isActive }),
    delete: (id) => api.delete(`/workflows/${id}`)
};

// Tickets API
export const ticketsAPI = {
    getAll: (params) => api.get('/tickets', { params }),
    create: (data) => api.post('/tickets', data),
    update: (id, data) => api.put(`/tickets/${id}`, data)
};

// Chat API
export const chatAPI = {
    getChannels: () => api.get('/chat/channels'),
    getMessages: (channelId) => api.get(`/chat/channels/${channelId}/messages`),
    sendMessage: (data) => api.post('/chat/messages', data)
};

// Intelligence API
export const intelligenceAPI = {
    getTimeline: (leadId) => api.get(`/intelligence/timeline/${leadId}`),
    logActivity: (data) => api.post('/intelligence/log', data)
};

// Automation API
export const automationAPI = {
    getTemplates: () => api.get('/automation/templates'),
    getTemplateTasks: (templateId) => api.get(`/automation/templates/${templateId}/tasks`),
    trigger: (data) => api.post('/automation/trigger', data)
};

export default api;

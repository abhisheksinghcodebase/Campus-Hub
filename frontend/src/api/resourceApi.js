import api from './authApi';

export const getResources = (params) => api.get('/resources', { params });

export const getBucketPdfs = (cursor) =>
  api.get('/resources/stored-files', { params: cursor ? { cursor } : {} });

export const uploadResourcePdf = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/resources/upload', formData, {
    headers: { 'Content-Type': undefined },
  });
};

export const createResource = (resource) => api.post('/resources', resource);

export const updateResource = (id, resource) =>
  api.patch(`/resources/${id}`, resource);

export const deleteResource = (id) => api.delete(`/resources/${id}`);

export const getResourceDownload = (id) =>
  api.get(`/resources/${id}/download`, { responseType: 'blob' });

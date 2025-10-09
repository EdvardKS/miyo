import api from './api';

export const photoService = {
  uploadPhoto: async (partyCode, formData) => {
    const response = await api.post(`/photos/${partyCode}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPartyPhotos: async (partyCode, page = 1) => {
    const response = await api.get(`/photos/party/${partyCode}`, {
      params: { page },
    });
    return response.data;
  },

  likePhoto: async (photoId) => {
    const response = await api.post(`/photos/${photoId}/like`);
    return response.data;
  },

  commentPhoto: async (photoId, text) => {
    const response = await api.post(`/photos/${photoId}/comment`, { text });
    return response.data;
  },

  getPhotoComments: async (photoId, page = 1) => {
    const response = await api.get(`/photos/${photoId}/comments`, {
      params: { page },
    });
    return response.data;
  },

  hidePhoto: async (photoId) => {
    const response = await api.patch(`/photos/${photoId}/hide`);
    return response.data;
  },

  getMyPhotos: async (page = 1) => {
    const response = await api.get('/photos/my/photos', { params: { page } });
    return response.data;
  },
};
import api from './api';

export const partyService = {
  createParty: async (partyData) => {
    const response = await api.post('/parties', partyData);
    return response.data;
  },

  getParty: async (code) => {
    const response = await api.get(`/parties/${code}`);
    return response.data;
  },

  joinParty: async (code) => {
    const response = await api.post(`/parties/${code}/join`);
    return response.data;
  },

  leaveParty: async (code) => {
    const response = await api.delete(`/parties/${code}/leave`);
    return response.data;
  },

  getMyParties: async (status = 'all', page = 1) => {
    const response = await api.get('/parties/my/parties', {
      params: { status, page },
    });
    return response.data;
  },

  getFeed: async (page = 1) => {
    const response = await api.get('/parties/feed', { params: { page } });
    return response.data;
  },

  inviteUsers: async (code, emails) => {
    const response = await api.post(`/parties/${code}/invite`, { emails });
    return response.data;
  },

  joinByInvite: async (inviteCode) => {
    const response = await api.post(`/parties/join/${inviteCode}`);
    return response.data;
  },
};
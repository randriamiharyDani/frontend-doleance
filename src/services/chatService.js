import api from './api';

const chatService = {
  getContacts: () => api.get('/chat/contacts'),
  getMessages: (userId, sinceId = 0) => api.get(`/chat/messages/${userId}?since_id=${sinceId}`),
  sendMessage: (data) => {
    if (data instanceof FormData) {
      return api.post('/chat/messages/send', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/chat/messages/send', data);
  },
  markRead: (senderId) => api.post(`/chat/messages/mark-read/${senderId}`),
  startCall: (calleeId, callType) => api.post('/chat/calls/start', { callee_id: calleeId, call_type: callType }),
  callAction: (callId, action) => api.post('/chat/calls/action', { call_id: callId, action }),
  getCallStatus: (callId) => api.get(`/chat/calls/status${callId ? `?call_id=${callId}` : ''}`),
  getCallHistory: () => api.get('/chat/calls/history'),
  sendSignal: (callId, receiverId, signalType, signalData) => api.post('/chat/signals', {
    call_id: callId, receiver_id: receiverId, signal_type: signalType, signal_data: signalData
  }),
  getSignals: (callId, sinceId = 0) => api.get(`/chat/signals?call_id=${callId}&since_id=${sinceId}`),
};

export default chatService;

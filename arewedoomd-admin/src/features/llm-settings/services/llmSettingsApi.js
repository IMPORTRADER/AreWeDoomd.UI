import client from '../../../api/client';

export const llmSettingsApi = {
  getSettings: () => client.get('/api/admin/llm-settings'),
  updateSettings: (settings) => client.put('/api/admin/llm-settings', settings),
};

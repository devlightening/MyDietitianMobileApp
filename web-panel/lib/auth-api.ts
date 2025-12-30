import api from './api';

export async function dietitianRegister(data: {
  fullName: string;
  clinicName: string;
  email: string;
  password: string;
}) {
  const res = await api.post('/api/auth/dietitian/register', data);
  return res.data;
}

export async function dietitianLogin(data: {
  email: string;
  password: string;
}) {
  const res = await api.post('/api/auth/dietitian/login', data);
  return res.data;
}

export async function clientAccessKeyLogin(data: { accessKey: string }) {
  const res = await api.post('/api/auth/client/access-key', data);
  return res.data;
}

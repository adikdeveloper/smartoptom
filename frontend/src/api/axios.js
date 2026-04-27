import axios from 'axios';

// Local muhitda localhost ishlaydi, Vercel'da esa env fayldagi manzil yoki /api ishlaydi
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : '/api'),
  headers: { 'Content-Type': 'application/json' },
});

export default api;

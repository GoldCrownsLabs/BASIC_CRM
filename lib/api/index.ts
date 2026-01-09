import axios from "axios";

const api = axios.create({
  baseURL: "https://your-domain.com/api/v1",
  timeout: 10000,
});

api.interceptors.request.use(config => {
  return config;
});

export default api;

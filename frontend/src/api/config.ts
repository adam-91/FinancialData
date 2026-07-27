import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const isMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCKS === "true";
};

export default api;

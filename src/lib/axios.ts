import axios from "axios";
import { getApiBaseUrl } from "./runtime-config";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

import axios from "axios";
import { getApiUrl } from "./runtime-config";

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

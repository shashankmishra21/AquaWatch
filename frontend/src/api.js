import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const analyzeWater = (villages) => API.post("/api/analyze", villages);
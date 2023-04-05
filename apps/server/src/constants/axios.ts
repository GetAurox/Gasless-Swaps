import axios from "axios";

export const bullExpressServer = axios.create({
  baseURL: process.env.BULL_SERVER || "http://localhost:8000/",
});

// // ARQUIVO: apps/mobile/libs/api/api.ts
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage"; 

// const API_URL = "http://10.0.2.2:4000";

// const api = axios.create({
//   baseURL: API_URL,
// });

// api.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem("@token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// export default api;

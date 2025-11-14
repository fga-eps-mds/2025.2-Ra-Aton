import axios from "axios";

export const api_route = axios.create({
    // Coloque seu IP aqui
    baseURL: "http://192.168.3.187:4000",
    timeout: 5000
})
// Coloque seu IP aqui
export const IP: string = "http://192.168.3.187:4000";

import axios from "axios";

export const api_route = axios.create({
    // Coloque seu IP aqui
    baseURL: "http://XXX.XXX.XXX.XXX:4000",
    timeout: 5000
})
// Coloque seu IP aqui
export const IP: string = "http://XXX.XXX.XXX.XXX:4000";

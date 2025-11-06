import axios from "axios";

export const api_route = axios.create({
    baseURL:"http://localhost:4000",
    timeout:5000 
})  
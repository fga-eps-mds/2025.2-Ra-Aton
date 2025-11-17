import { AxiosError } from "axios";
import { Icomment } from "../interfaces/Icomments";
import { api_route } from "./api";


type CommentsArgs = {
    postId: string,
    content: string,
    authorId: string,
}

export async function getComments(postId:string){
    try{
        const response = await api_route.get<Icomment[]>(`/posts/${postId}/comments`)
        return response.data;
    }
    catch(error){
        const err = error as AxiosError;
        console.error("Erro ao puxar os comentários", err.response?.data || err.message);
        throw error;
    }   
}

export async function postComment({postId, authorId, content}: CommentsArgs){
    try{
        const response = await api_route.post<Icomment>(`/posts/${postId}/comments`, {authorId, content});
        return response.data;
    }
    catch(error){
        const err = error as AxiosError;
        console.error("Erro ao criar comentário", err.response?.data || err.message);
        throw error;
    }

}
import { api_route } from "./api";
import { IPost } from "../interfaces/Ipost";

export type FeedItem = {

    id: string,
    title?: string
    nickname?:string;
}

export type Meta = {
    page:number,
    limit:number,
    totalCount:number,
    totalPages:number,
    hasNextPage:boolean,
    hasPrevPage:boolean
    userLiked:boolean,
    userGoing:boolean
}

export type FeedResponse = {
    data: IPost[];
    meta:Meta
}

export async function getFeed(params: {page:number, limit?:number, signal?: AbortSignal}):Promise<FeedResponse> {
    const {page,limit=10, signal} = params;
    const res = await api_route.get<FeedResponse>("/posts", {params:{page,limit},signal})
    return res.data;   
}
import { api_route } from "./api";
import { IPost } from "@/libs/interfaces/Ipost";

interface ReportParams {
    postId: string;
    reason: string;
    reporterId: string;
    type?: "post" | "comment";
}

interface ReportResponse {
    id: string;
    postId: string | null;
    reporterId: string;
    reason: string;
    commentId: string | null;
    createdAt: string;
}

export async function handleReport(
    params: ReportParams
): Promise<ReportResponse> {
    const { postId, reason, reporterId } = params;
    try {
        const url = `/posts/${postId}/report`;
        //const url = `/report/post/${postId}`;
        const body = {
            reporterId: reporterId,
            reason: reason,
            type: "post",
        };
        const response = await api_route.post<ReportResponse>(url, body);
        console.log(`Post ${postId} reportado com sucesso`);
        return response.data;
    } catch (err: any) {
        if (err.response) {
            let type_message = err.response.data;
            let data: any = {}
            if (typeof type_message === "string") {
                try {
                    data = JSON.parse(type_message);
                } catch {
                    data = { message: type_message };
                }
            } else {
                data = type_message || {};
            }
            const serverMessage = data?.message || data?.error || "Erro ao reportar o post";
            console.log("Mensagem de erro do servidor: ", serverMessage);
            throw new Error(serverMessage);
        }
        throw new Error("Não foi possível conectar ao servidor");
    }
}
import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function loadGroups(token: string, userId: string) {
  try {
    const res = await api_route.get(`/group/?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (e) {
    console.log("Error loading groups:", e);

    const status = (e as AxiosError)?.response?.status;

    if (status === 400 || status === 404) {
      return [];
    }

    throw e;
  }
}

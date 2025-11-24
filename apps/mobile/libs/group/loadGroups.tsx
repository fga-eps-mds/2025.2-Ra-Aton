import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function loadGroups() {
  try {
    const res = await api_route.get("/group/");
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

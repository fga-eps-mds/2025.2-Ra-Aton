import { api_route } from "@/libs/auth/api";

export async function removeMember(membershipId: string): Promise<void> {
  try {
    await api_route.delete(`/member/${membershipId}`);
  } catch (error: any) {
    const msg = error.response?.data?.message || "Erro ao remover membro.";
    throw new Error(msg);
  }
}
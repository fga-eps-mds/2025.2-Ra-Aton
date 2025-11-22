// ARQUIVO: apps/mobile/libs/interfaces/Igroup.ts

export type GroupType = "ATHLETIC" | "AMATEUR";

export interface IGroup {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  sport?: string; // O requisito pede "esporte", vamos incluir como opcional por enquanto
  leaderId: string;
  createdAt: string;
  updatedAt: string;

  // Campos visuais que podem vir no futuro
  logoUrl?: string;
  bannerUrl?: string;
}

// Interface para o Payload de Criação (O que enviamos para a API)
export interface CreateGroupPayload {
  name: string;
  description: string;
  type: GroupType;
  // sport: string; // Descomente se o backend exigir este campo no body
}

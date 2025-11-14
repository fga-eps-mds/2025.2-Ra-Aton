// ARQUIVO: apps/mobile/src/interfaces/Ipost.ts

// Tipo para os detalhes do Evento (AC6)
interface IEvent {
  id: string;
  location: string;
  date: string; // O Prisma retorna datas como strings ISO (ex: "2025-11-10T14:00:00.000Z")
  // Adicione outros campos do evento se necessário (data de término, etc.)
}

// Tipo para o Autor (Grupo ou Usuário)
interface IAuthor {
  id: string;
  name: string;
  profilePicture?: string; // URL do ícone do grupo
}

// Interface principal do Post
export interface IPost {
  id: string;
  content: string; // O texto do post
  mediaUrl: string | null; // A imagem do post (opcional)
  type: "EVENT" | "INFO"; // Tipo do post
  author: IAuthor; // Informações do grupo que postou
  event: IEvent | null; // Detalhes do evento (null se for 'INFO')
  createdAt: string;

  // Contagens para os botões (AC5)
  _count: {
    likes: number;
    comments: number;
  };
  // Informação se o usuário atual já curtiu (para o ícone do coração)
  isLiked: boolean;
  // Informação se o usuário atual vai (para o botão "Eu vou!")
  isAttending: boolean;
}

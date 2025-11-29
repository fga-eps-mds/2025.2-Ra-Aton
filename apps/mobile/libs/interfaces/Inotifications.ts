export interface NotificationAPI {
  id: string;
  title: string;
  content: string; // O backend manda 'content'
  type: string;    // 'GROUP_JOIN_REQUEST', etc.
  readAt: string | null; // Data ISO ou null
  createdAt: string;
  resourceId?: string;
  resourceType?: string;
}
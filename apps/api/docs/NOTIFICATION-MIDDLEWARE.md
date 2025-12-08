# Middleware de Notificações - Guia de Uso

Este documento explica como usar os middlewares de notificação no backend.

## 📋 Middlewares Disponíveis

### 1. `notifyGroupMembers`
Middleware genérico para notificar todos os membros de um grupo.

**Exemplo 1: Nova publicação em um grupo**

```typescript
// Em group.routes.ts ou post.routes.ts
import { notifyGroupMembers } from '../../middlewares/notificationMiddleware';

router.post(
  "/groups/:groupId/posts",
  auth,
  validateRequest(createPostSchema),
  catchAsync(postController.createPost),
  notifyGroupMembers({
    getGroupId: (req) => req.params.groupId,
    getTitle: () => '📝 Nova Publicação',
    getBody: (req) => {
      const userName = req.user?.userName || 'Alguém';
      return `${userName} criou uma nova publicação no grupo!`;
    },
    getData: (req, res) => ({
      type: 'new_post',
      postId: res.locals.newPostId,
      groupId: req.params.groupId,
      screen: 'post_detail',
    }),
    excludeUserId: (req) => req.user?.userId, // Não notifica o autor
  })
);
```

**Exemplo 2: Novo membro entra no grupo**

```typescript
// Em groupMembership.routes.ts
router.post(
  "/groups/:groupId/members",
  auth,
  validateRequest(addMemberSchema),
  catchAsync(memberController.addMember),
  notifyGroupMembers({
    getGroupId: (req) => req.params.groupId,
    getTitle: () => '👥 Novo Membro',
    getBody: (req, res) => {
      const newMemberName = res.locals.newMemberName || 'Um novo membro';
      return `${newMemberName} entrou no grupo!`;
    },
    getData: (req, res) => ({
      type: 'new_member',
      memberId: res.locals.newMemberId,
      groupId: req.params.groupId,
      screen: 'group_detail',
    }),
  })
);
```

**Exemplo 3: Partida marcada no grupo**

```typescript
// Em match.routes.ts
router.post(
  "/groups/:groupId/matches",
  auth,
  validateRequest(createMatchSchema),
  catchAsync(matchController.createMatch),
  notifyGroupMembers({
    getGroupId: (req) => req.params.groupId,
    getTitle: () => '🏀 Nova Partida Marcada!',
    getBody: (req) => {
      const date = req.body.date;
      const location = req.body.location;
      return `Partida marcada para ${date} em ${location}`;
    },
    getData: (req, res) => ({
      type: 'new_match',
      matchId: res.locals.newMatchId,
      groupId: req.params.groupId,
      screen: 'match_detail',
    }),
    excludeUserId: (req) => req.user?.userId,
  })
);
```

---

### 2. `notifyUser`
Middleware genérico para notificar um usuário específico.

**Exemplo 1: Convite para grupo**

```typescript
// Em groupJoinRequest.routes.ts
router.post(
  "/groups/:groupId/invite",
  auth,
  validateRequest(inviteUserSchema),
  catchAsync(inviteController.sendInvite),
  notifyUser({
    getUserId: (req) => req.body.userId, // ID do usuário convidado
    getTitle: () => '📩 Convite para Grupo',
    getBody: (req, res) => {
      const groupName = res.locals.groupName || 'um grupo';
      return `Você foi convidado para entrar em ${groupName}!`;
    },
    getData: (req, res) => ({
      type: 'group_invite',
      groupId: req.params.groupId,
      inviteId: res.locals.inviteId,
      screen: 'group_invite',
    }),
  })
);
```

**Exemplo 2: Comentário em publicação**

```typescript
// Em comment.routes.ts
router.post(
  "/posts/:postId/comments",
  auth,
  validateRequest(createCommentSchema),
  catchAsync(commentController.createComment),
  notifyUser({
    getUserId: (req, res) => res.locals.postAuthorId, // Autor do post
    getTitle: () => '💬 Novo Comentário',
    getBody: (req) => {
      const commenterName = req.user?.userName || 'Alguém';
      return `${commenterName} comentou na sua publicação`;
    },
    getData: (req, res) => ({
      type: 'new_comment',
      postId: req.params.postId,
      commentId: res.locals.newCommentId,
      screen: 'post_detail',
    }),
  })
);
```

**Exemplo 3: Like em publicação**

```typescript
// Em postLike.routes.ts
router.post(
  "/posts/:postId/like",
  auth,
  catchAsync(likeController.likePost),
  notifyUser({
    getUserId: (req, res) => res.locals.postAuthorId,
    getTitle: () => '❤️ Curtida',
    getBody: (req) => {
      const userName = req.user?.userName || 'Alguém';
      return `${userName} curtiu sua publicação`;
    },
    getData: (req) => ({
      type: 'post_like',
      postId: req.params.postId,
      screen: 'post_detail',
    }),
  })
);
```

---

## 🔧 Configuração do Controller

Para que os middlewares funcionem, o **controller** precisa armazenar informações em `res.locals`:

### Exemplo: Post Controller

```typescript
async createPost(req: Request, res: Response) {
  const newPost = await postService.createPost(req.body);
  
  // ✅ Armazena dados para o middleware usar
  res.locals.newPostId = newPost.id;
  res.locals.postAuthorId = newPost.authorId;
  
  res.status(HttpStatus.CREATED).json(newPost);
}
```

### Exemplo: Comment Controller

```typescript
async createComment(req: Request, res: Response) {
  const postId = req.params.postId;
  
  // Busca o post para pegar o autor
  const post = await postService.getPostById(postId);
  
  const newComment = await commentService.createComment(req.body);
  
  // ✅ Armazena dados para o middleware usar
  res.locals.newCommentId = newComment.id;
  res.locals.postAuthorId = post.authorId; // Quem vai receber a notificação
  
  res.status(HttpStatus.CREATED).json(newComment);
}
```

---

## 📱 Tipos de Notificação no Mobile

No app mobile, as notificações podem incluir `data` para navegação:

```typescript
// Tipos de notificação e suas telas correspondentes
const notificationTypes = {
  'new_post': 'post_detail',
  'new_comment': 'post_detail',
  'post_like': 'post_detail',
  'new_member': 'group_detail',
  'group_invite': 'group_invite',
  'new_match': 'match_detail',
};
```

---

## ⚡ Características Importantes

1. **Assíncronas**: Notificações são enviadas de forma assíncrona e não bloqueiam a resposta da API
2. **Tolerantes a falhas**: Se a notificação falhar, a requisição continua normalmente
3. **Logs automáticos**: Todas as notificações são logadas no console
4. **Filtros**: É possível excluir usuários específicos (ex: o autor da ação)

---

## 🚀 Próximos Passos

1. ✅ Implementado: Notificação de boas-vindas no cadastro
2. 🔜 Implementar: Notificação em nova publicação de grupo
3. 🔜 Implementar: Notificação em novos comentários
4. 🔜 Implementar: Notificação em convites de grupo
5. 🔜 Implementar: Notificação em novas partidas

---

## 🧪 Como Testar

1. Cadastre um novo usuário no app mobile
2. Certifique-se de que o token de notificação foi registrado
3. Verifique se a notificação de boas-vindas chegou no dispositivo
4. Cheque os logs do backend: `✅ Notificação de boas-vindas enviada para user {userId}`

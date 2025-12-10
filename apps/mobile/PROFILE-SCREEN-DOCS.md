# Tela de Perfil - Documentação

## Visão Geral

A tela de perfil foi implementada seguindo os padrões do projeto, com suporte para perfis de **usuários** e **grupos**. A tela é estilo LinkedIn, com banner, foto de perfil centralizada e sistema de abas.

## Arquivos Criados

### Interfaces e Tipos
- **`/libs/interfaces/Iprofile.ts`**: Define todas as interfaces para perfis de usuário e grupo, incluindo dados das abas.

### APIs
- **`/libs/auth/handleProfile.ts`**: Funções para buscar perfis e seguir/desseguir usuários e grupos.

### Hooks
- **`/libs/hooks/useProfile.ts`**: Hook personalizado para gerenciar estado do perfil, loading, seguir/desseguir.

### Componentes
- **`/components/ProfileHeaderComp.tsx`**: Banner + foto de perfil + informações básicas.
- **`/components/FollowButtonComp.tsx`**: Botão de seguir/seguindo com loading.
- **`/components/ProfileTabsComp.tsx`**: Sistema de abas com conteúdo para usuário e grupo.

### Tela Principal
- **`/app/(DashBoard)/(tabs)/Perfil.tsx`**: Tela completa de perfil.

## Como Usar

### Navegação para Perfil de Usuário

```typescript
import { useRouter } from "expo-router";

const router = useRouter();

// Navegar para perfil de usuário
router.push({
  pathname: "/(DashBoard)/(tabs)/Perfil",
  params: {
    identifier: "nomeDoUsuario", // userName
    type: "user"
  }
});
```

### Navegação para Perfil de Grupo

```typescript
import { useRouter } from "expo-router";

const router = useRouter();

// Navegar para perfil de grupo
router.push({
  pathname: "/(DashBoard)/(tabs)/Perfil",
  params: {
    identifier: "nomeDoGrupo", // groupName
    type: "group"
  }
});
```

## Estrutura da Tela

### 1. Banner e Foto de Perfil
- Banner no topo (150px de altura)
- Foto de perfil (100px) sobreposta ao banner
- Botão de voltar no canto superior esquerdo

### 2. Informações do Perfil
- Nome do perfil
- Identificador (@username ou nome do grupo)
- Bio (até 3 linhas)
- Contador de seguidores

### 3. Botão de Seguir
- Apenas para grupos
- Não aparece se for o próprio perfil do usuário
- Estados: "Seguir" e "Seguindo"
- Loading durante a ação

### 4. Sistema de Abas

#### Para Usuários (3 abas):
- **Partidas**: Lista de partidas que o usuário se inscreveu
- **Grupos Seguidos**: Grupos que o usuário segue
- **Grupos Participando**: Grupos que o usuário é membro

#### Para Grupos (2 abas):
- **Postagens**: Posts e eventos do grupo
- **Membros**: Lista de membros do grupo

## Endpoints Esperados pela API

A implementação espera os seguintes endpoints no backend:

### Perfil de Usuário
```
GET /profile/user/:userName
Response:
{
  profile: {
    id: string,
    userName: string,
    name: string,
    bio?: string,
    profilePicture?: string,
    bannerImage?: string,
    followersCount?: number,
    isFollowing?: boolean,
    isOwner?: boolean,
    ...
  },
  tabs: {
    matches: Imatches[],
    followedGroups: IGroup[],
    memberGroups: IGroup[]
  }
}
```

### Perfil de Grupo
```
GET /profile/group/:groupName
Response:
{
  profile: {
    id: string,
    name: string,
    description: string,
    bio?: string,
    logoUrl?: string,
    bannerUrl?: string,
    membersCount?: number,
    followersCount?: number,
    isFollowing?: boolean,
    isMember?: boolean,
    isLeader?: boolean,
    ...
  },
  tabs: {
    members: IUserProfile[],
    posts: IPost[]
  }
}
```

### Seguir/Desseguir
```
POST /groups/:groupId/follow
DELETE /groups/:groupId/unfollow

POST /users/:userId/follow
DELETE /users/:userId/unfollow
```

## Customização

### Cores
As cores seguem o tema do projeto definido em `/constants/Colors.ts`:
- Banner placeholder: `theme.orange`
- Botão seguir: `theme.orange`
- Botão seguindo: `theme.gray`
- Abas ativas: borda `theme.orange`

### Tamanhos
Constantes definidas em `ProfileHeaderComp.tsx`:
```typescript
const BANNER_HEIGHT = 150;
const PROFILE_IMAGE_SIZE = 100;
```

## Exemplo Completo

```typescript
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

function MeuComponente() {
  const router = useRouter();

  const abrirPerfilUsuario = (userName: string) => {
    router.push({
      pathname: "/(DashBoard)/(tabs)/Perfil",
      params: {
        identifier: userName,
        type: "user"
      }
    });
  };

  const abrirPerfilGrupo = (groupName: string) => {
    router.push({
      pathname: "/(DashBoard)/(tabs)/Perfil",
      params: {
        identifier: groupName,
        type: "group"
      }
    });
  };

  return (
    <>
      <TouchableOpacity onPress={() => abrirPerfilUsuario("joaosilva")}>
        <Text>Ver perfil de João Silva</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => abrirPerfilGrupo("futsal-unb")}>
        <Text>Ver perfil do Grupo Futsal UnB</Text>
      </TouchableOpacity>
    </>
  );
}
```

## Observações Importantes

1. **Validação de Tipo**: A tela aceita `type: "user" | "group"` via parâmetros de navegação.

2. **Loading States**: A tela mostra um ActivityIndicator enquanto carrega os dados.

3. **Erro Handling**: Erros são mostrados via Alert do React Native.

4. **Tema Dinâmico**: A tela respeita o tema claro/escuro do app.

5. **Próprio Perfil**: O botão de seguir não aparece quando o usuário está vendo seu próprio perfil.

6. **Recarregamento**: O hook expõe `reloadProfile()` para atualizar os dados.

## Próximos Passos (Sugestões)

- [ ] Adicionar pull-to-refresh nas abas
- [ ] Implementar paginação nas listas das abas
- [ ] Adicionar botão de editar perfil (quando for o próprio perfil)
- [ ] Implementar cache de imagens
- [ ] Adicionar compartilhamento de perfil
- [ ] Implementar busca dentro das abas
- [ ] Adicionar estatísticas adicionais

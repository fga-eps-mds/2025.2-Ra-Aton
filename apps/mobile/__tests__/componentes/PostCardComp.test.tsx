// ARQUIVO: apps/mobile/__tests__/components/PostCardComp.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostCardComp from '../../components/PostCardComp';
import { TouchableOpacity, Text } from 'react-native';
import { useUser } from '@/libs/storage/UserContext';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { input: '#fff', text: '#000', gray: '#ccc' },
    dark: { input: '#000', text: '#fff', gray: '#333' },
  },
}));

// Mock dos Hooks e Contexto
jest.mock('@/libs/storage/UserContext', () => ({
  useUser: jest.fn(),
}));

const mockLikeMutate = jest.fn();
jest.mock('@/libs/hooks/useToggleLike', () => ({
  useToggleLike: () => ({ mutateAsync: mockLikeMutate }),
}));

const mockAttendanceMutate = jest.fn();
jest.mock('@/libs/hooks/useToggleAttendance', () => ({
  useToggleAttendance: () => ({ mutateAsync: mockAttendanceMutate }),
}));

// Mocks dos Componentes Filhos
jest.mock('../../components/ProfileThumbnailComp', () => 'ProfileThumbnail');
jest.mock('../../components/SpacerComp', () => 'Spacer');

// --- AQUI ESTÁ O SEGREDO ---
// O Mock do botão agora captura o erro que o componente lança (re-throw)
// Isso impede que o teste quebre com "Unhandled Promise Rejection"
jest.mock('../../components/LikeButtonComp', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity 
      onPress={() => {
        const result = props.onLike(!props.initialLiked);
        // Se retornar uma promessa (async), capturamos o erro para não quebrar o teste
        if (result && typeof result.catch === 'function') {
          result.catch(() => {}); 
        }
      }} 
      testID="btn-like"
    >
      <Text>Like</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../components/ImGoingButtonComp', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity 
      onPress={() => {
        const result = props.onToggleGoing(!props.initialGoing);
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
      }} 
      testID="btn-going"
    >
      <Text>Eu Vou</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../components/CommentButtonComp', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-comment">
      <Text>Comment</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../components/OptionsButtonComp', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-options">
      <Text>Options</Text>
    </TouchableOpacity>
  );
});

describe('PostCardComp', () => {
  const mockPost = {
    id: 'post-1',
    author: { userName: 'Autor Teste' },
    title: 'Título do Post',
    content: 'Conteúdo do post...',
    likesCount: 10,
    commentsCount: 5,
    type: 'POST',
    userLiked: false,
  };

  const mockOnPressComment = jest.fn();
  const mockOnPressOptions = jest.fn();
  const mockOnReloadFeed = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup padrão do usuário logado
    (useUser as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });
  });

  // --- TESTES DE RENDERIZAÇÃO ---

  it('deve renderizar os dados do post corretamente', () => {
    const { getByText } = render(
      <PostCardComp 
        post={mockPost as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
      />
    );

    expect(getByText('Autor Teste')).toBeTruthy();
    expect(getByText('Título do Post')).toBeTruthy();
    expect(getByText('Conteúdo do post...')).toBeTruthy();
    expect(getByText('10')).toBeTruthy(); 
    expect(getByText('5')).toBeTruthy(); 
  });

  it('NÃO deve renderizar o título se ele for vazio ou nulo', () => {
    const postSemTitulo = { ...mockPost, title: '' };
    const { queryByText } = render(
      <PostCardComp 
        post={postSemTitulo as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
      />
    );

    expect(queryByText('Título do Post')).toBeNull();
    expect(queryByText('Conteúdo do post...')).toBeTruthy();
  });

  // --- TESTES DE INTERAÇÃO (LIKE) ---

  it('deve chamar a função de Like e Reload ao clicar no botão', async () => {
    mockLikeMutate.mockResolvedValue({ data: 'ok' });

    const { getByTestId } = render(
      <PostCardComp 
        post={mockPost as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
        onReloadFeed={mockOnReloadFeed}
      />
    );

    fireEvent.press(getByTestId('btn-like'));

    await waitFor(() => {
      expect(mockLikeMutate).toHaveBeenCalledWith({
        postId: 'post-1',
        authorId: 'user-1',
      });
      expect(mockOnReloadFeed).toHaveBeenCalled();
    });
  });

  it('NÃO deve chamar Like se usuário não estiver logado', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    const { getByTestId } = render(
      <PostCardComp 
        post={mockPost as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
      />
    );

    fireEvent.press(getByTestId('btn-like'));

    await waitFor(() => {
      expect(mockLikeMutate).not.toHaveBeenCalled();
    });
  });

  it('deve tratar erro na API de Like (Logar erro)', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Força erro na API
    mockLikeMutate.mockRejectedValue(new Error('Erro API Like'));

    const { getByTestId } = render(
      <PostCardComp 
        post={mockPost as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
      />
    );

    fireEvent.press(getByTestId('btn-like'));

    await waitFor(() => {
      expect(mockLikeMutate).toHaveBeenCalled();
      // Verificamos se o console.log foi chamado com a mensagem esperada
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao tentar dar o like', 'Erro API Like');
    });

    consoleSpy.mockRestore();
  });

  // --- TESTES DE INTERAÇÃO (EU VOU / ATTENDANCE) ---

  it('deve mostrar botão "Eu Vou" apenas se for evento', () => {
    const mockEvent = { ...mockPost, type: 'EVENT' };
    const { getByTestId } = render(
      <PostCardComp 
        post={mockEvent as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
      />
    );

    expect(getByTestId('btn-going')).toBeTruthy();
  });

  it('deve chamar função de Presença ao clicar em "Eu Vou"', async () => {
    const mockEvent = { ...mockPost, type: 'EVENT' };
    mockAttendanceMutate.mockResolvedValue({ data: 'ok' });

    const { getByTestId } = render(
      <PostCardComp 
        post={mockEvent as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
        onReloadFeed={mockOnReloadFeed}
      />
    );

    fireEvent.press(getByTestId('btn-going'));

    await waitFor(() => {
      expect(mockAttendanceMutate).toHaveBeenCalledWith({
        postId: 'post-1',
        authorId: 'user-1',
      });
      expect(mockOnReloadFeed).toHaveBeenCalled();
    });
  });

  it('deve tratar erro na API de Presença', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockEvent = { ...mockPost, type: 'EVENT' };
    
    mockAttendanceMutate.mockRejectedValue(new Error('Erro API Going'));

    const { getByTestId } = render(
      <PostCardComp 
        post={mockEvent as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
      />
    );

    fireEvent.press(getByTestId('btn-going'));

    await waitFor(() => {
      expect(mockAttendanceMutate).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro na hora de confirmar a presença',
        'Erro API Going'
      );
    });

    consoleSpy.mockRestore();
  });

  // --- TESTES DE INTERAÇÃO (OUTROS) ---

  it('deve chamar onPressComment ao clicar', () => {
    const { getByTestId } = render(
      <PostCardComp 
        post={mockPost as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
      />
    );

    fireEvent.press(getByTestId('btn-comment'));
    expect(mockOnPressComment).toHaveBeenCalledWith('post-1');
  });

  it('deve chamar onPressOptions ao clicar', () => {
    const { getByTestId } = render(
      <PostCardComp 
        post={mockPost as any} 
        onPressComment={mockOnPressComment}
        onPressOptions={mockOnPressOptions}
      />
    );

    fireEvent.press(getByTestId('btn-options'));
    expect(mockOnPressOptions).toHaveBeenCalledWith('post-1');
  });
});
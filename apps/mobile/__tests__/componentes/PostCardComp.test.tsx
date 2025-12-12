import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostCardComp from '../../components/PostCardComp';
import { View, Text, TouchableOpacity } from 'react-native';

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
  useUser: () => ({ user: { id: 'user-1' } }),
}));

const mockLikeMutate = jest.fn();
jest.mock('@/libs/hooks/useToggleLike', () => ({
  useToggleLike: () => ({ mutateAsync: mockLikeMutate }),
}));

const mockAttendanceMutate = jest.fn();
jest.mock('@/libs/hooks/useToggleAttendance', () => ({
  useToggleAttendance: () => ({ mutateAsync: mockAttendanceMutate }),
}));

// Mocks dos Componentes Filhos (Transformamos em botões simples para testar clique)
jest.mock('../../components/ProfileThumbnailComp', () => 'ProfileThumbnail');
jest.mock('../../components/SpacerComp', () => 'Spacer');

jest.mock('../../components/LikeButtonComp', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={() => props.onLike(!props.initialLiked)} testID="btn-like">
      <Text>Like</Text>
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

jest.mock('../../components/ImGoingButtonComp', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={() => props.onToggleGoing(!props.initialGoing)} testID="btn-going">
      <Text>Eu Vou</Text>
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
  });

  it('deve renderizar os dados do post', () => {
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
    expect(getByText('10')).toBeTruthy(); // Likes count
    expect(getByText('5')).toBeTruthy();  // Comments count
  });

  it('deve chamar a função de Like ao clicar no botão', async () => {
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
    });
  });
});
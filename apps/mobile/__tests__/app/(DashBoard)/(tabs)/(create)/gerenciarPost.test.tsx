import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// Ajuste o caminho se necessário (ex: ../../../../../app/...)
import GerenciarPostScreen from '../../../../../app/(DashBoard)/(tabs)/(create)/gerenciarPost'; 
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

// --- MOCK DO REACT NATIVE (FlatList e Modal) ---
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');

  // FlatList Mock: Renderiza a lista ou o componente vazio
  const MockFlatList = (props: any) => (
    <RN.View testID="flatlist-mock">
      {(!props.data || props.data.length === 0) ? props.ListEmptyComponent : null}
      {props.data?.map((item: any) => (
        <RN.View key={item.id}>
          {props.renderItem({ item })}
        </RN.View>
      ))}
    </RN.View>
  );

  // Modal Mock: Renderiza children apenas se visible=true
  // Removemos a camada de portal nativa para facilitar o teste
  const MockModal = (props: any) => {
    if (!props.visible) return null;
    return <RN.View testID="modal-mock">{props.children}</RN.View>;
  };

  return {
    ...RN,
    FlatList: MockFlatList,
    Modal: MockModal,
  };
});

// --- MOCKS GERAIS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    dark: { orange: 'orange', input: '#333', text: '#fff' },
    light: { orange: 'orange', input: '#eee', text: '#000' },
  },
}));

// Mock do Hook Lógico (Coração do Teste)
jest.mock('@/libs/hooks/useGerenciarPostsLogica', () => ({
  useGerenciarPostsLogic: jest.fn(),
}));

import { useGerenciarPostsLogic } from '@/libs/hooks/useGerenciarPostsLogica';

// --- MOCKS VISUAIS ---

jest.mock('@/components/BackGroundComp', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: "bg-comp" }, props.children);
});

jest.mock('@/components/AppText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: any) => React.createElement(Text, props, props.children);
});

// Mock do Card de Post (Expõe as ações para teste)
jest.mock('@/components/CardHandlePostsComp', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    CardHandlePostComp: (props: any) => (
      <View testID="card-post">
        <Text>{props.title}</Text>
        {/* Botão para simular abrir o menu */}
        <TouchableOpacity testID="btn-open-menu" onPress={props.onOpenMenu}>
          <Text>Menu</Text>
        </TouchableOpacity>
        {/* Botão para simular clique no card (gerenciar comentários) */}
        <TouchableOpacity testID="btn-manage-comments" onPress={props.onPressCard}>
          <Text>Comentários</Text>
        </TouchableOpacity>
      </View>
    )
  };
});

// Mocks dos Modais Auxiliares
jest.mock('@/components/CommentsModalComp', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => props.isVisible ? <View testID="comments-modal" /> : null;
});

jest.mock('@/components/CustomAlertModalComp', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CustomAlertModalComp: (props: any) => props.visible ? <View testID="alert-modal" /> : null
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Ionicons: (props: any) => <View testID="icon" /> };
});

describe('Screen: GerenciarPost', () => {
  const mockUseLogic = useGerenciarPostsLogic as jest.Mock;
  
  // Spies para as funções
  const mockOnRefresh = jest.fn();
  const mockSetMenuVisible = jest.fn();
  const mockOpenActionMenu = jest.fn();
  const mockHandleEditPost = jest.fn();
  const mockConfirmDeletePost = jest.fn();
  const mockHandleOpenManageComments = jest.fn();

  const defaultState = {
    myPosts: [],
    selectedPost: null,
    postComments: [],
    isLoading: false,
    isRefreshing: false,
    menuVisible: false,
    commentsModalVisible: false,
    loadingComments: false,
    alertConfig: { visible: false },
    onRefresh: mockOnRefresh,
    setMenuVisible: mockSetMenuVisible,
    setCommentsModalVisible: jest.fn(),
    closeAlert: jest.fn(),
    openActionMenu: mockOpenActionMenu,
    handleEditPost: mockHandleEditPost,
    confirmDeletePost: mockConfirmDeletePost,
    handleOpenManageComments: mockHandleOpenManageComments,
    handleDeleteComment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLogic.mockReturnValue(defaultState);
  });

  it('deve renderizar loading inicial', () => {
    mockUseLogic.mockReturnValue({ ...defaultState, isLoading: true });
    
    // Usamos UNSAFE_getByType para garantir busca do componente nativo
    const { UNSAFE_getByType } = render(<GerenciarPostScreen />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve renderizar lista vazia', () => {
    const { getByText } = render(<GerenciarPostScreen />);
    expect(getByText('Nada por aqui ainda...')).toBeTruthy();
  });

  it('deve renderizar posts e interagir com o card', () => {
    const mockPost = { id: '1', title: 'Meu Post Legal', attendancesCount: 0 };
    mockUseLogic.mockReturnValue({ 
      ...defaultState, 
      myPosts: [mockPost] 
    });

    const { getByText, getByTestId } = render(<GerenciarPostScreen />);
    
    expect(getByText('Meu Post Legal')).toBeTruthy();

    // Testa abrir menu
    fireEvent.press(getByTestId('btn-open-menu'));
    expect(mockOpenActionMenu).toHaveBeenCalledWith(mockPost);

    // Testa abrir comentários
    fireEvent.press(getByTestId('btn-manage-comments'));
    expect(mockHandleOpenManageComments).toHaveBeenCalledWith(mockPost);
  });

  it('deve renderizar o menu de opções quando visible=true e permitir ações', () => {
    const mockPost = { id: '1', title: 'Post' };
    mockUseLogic.mockReturnValue({ 
      ...defaultState, 
      myPosts: [mockPost],
      menuVisible: true, // Menu Aberto
      selectedPost: mockPost // Post selecionado
    });

    const { getByTestId, getByText } = render(<GerenciarPostScreen />);

    // Graças ao mock do Modal, o conteúdo está visível na árvore
    expect(getByText('Opções do Post')).toBeTruthy();

    // Testa Editar
    const btnEdit = getByTestId('btn-edit-post'); // O componente original tem testID? Se não, precisamos confiar no texto ou estrutura
    // Nota: No seu código original não havia testID nos botões do modal.
    // Como mockamos o Modal mas NÃO o conteúdo interno dele (View, Text), 
    // precisamos garantir que conseguimos clicar.
    // O seu código usa TouchableOpacity com Ionicons e AppText dentro.
    
    // Se não tiver testID no código original, buscamos pelo texto:
    fireEvent.press(getByText('Editar Post'));
    expect(mockHandleEditPost).toHaveBeenCalledWith(mockPost);

    // Testa Deletar
    fireEvent.press(getByText('Deletar Post'));
    expect(mockConfirmDeletePost).toHaveBeenCalledWith('1');
  });

  it('deve renderizar modal de comentários e alerta quando ativos', () => {
    mockUseLogic.mockReturnValue({ 
      ...defaultState, 
      commentsModalVisible: true,
      alertConfig: { visible: true }
    });

    const { getByTestId } = render(<GerenciarPostScreen />);
    
    expect(getByTestId('comments-modal')).toBeTruthy();
    expect(getByTestId('alert-modal')).toBeTruthy();
  });
});
import React from 'react';
import InviteMemberModal from "@/components/InviteMemberModalComp";
import { render, fireEvent, waitFor } from "../test-utils";
import { searchUsers } from '@/libs/user/searchUsers';
import { sendInvite } from '@/libs/groupMembership/sendInvite';
import { Alert } from 'react-native';

jest.mock('@/libs/user/searchUsers');
jest.mock('@/libs/groupMembership/sendInvite');

const mockSearchUsers = searchUsers as jest.MockedFunction<typeof searchUsers>;
const mockSendInvite = sendInvite as jest.MockedFunction<typeof sendInvite>;

describe('InviteMemberModal', () => {
  const mockOnClose = jest.fn();
  const groupId = 'group-123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve renderizar o modal quando visible é true', () => {
    const { getByText } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    expect(getByText('Convidar Membros')).toBeTruthy();
    expect(getByText('Digite para buscar.')).toBeTruthy();
  });

  it('não deve renderizar o modal quando visible é false', () => {
    const { queryByText } = render(
      <InviteMemberModal visible={false} onClose={mockOnClose} groupId={groupId} />
    );

    expect(queryByText('Convidar Membros')).toBeNull();
  });

  it('deve chamar onClose ao clicar no botão de fechar', () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    // O primeiro ícone deve ser o botão de fechar (close icon)
    const closeButton = icons[0];
    
    fireEvent.press(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve atualizar o texto de busca ao digitar', () => {
    const { getByPlaceholderText } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    const searchInput = getByPlaceholderText('Nome ou username...');
    fireEvent.changeText(searchInput, 'João');

    expect(searchInput.props.value).toBe('João');
  });

  it('deve buscar usuários ao digitar mais de 2 caracteres', async () => {
    const mockUsers = [
      { id: '1', name: 'João Silva', username: 'joao', profilePicture: null },
      { id: '2', name: 'João Pedro', username: 'jpedro', profilePicture: null },
    ];
    mockSearchUsers.mockResolvedValue(mockUsers);

    const { getByPlaceholderText, getByText } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    const searchInput = getByPlaceholderText('Nome ou username...');
    fireEvent.changeText(searchInput, 'João');

    await waitFor(() => {
      expect(mockSearchUsers).toHaveBeenCalledWith('João');
    }, { timeout: 1000 });

    await waitFor(() => {
      expect(getByText('João Silva')).toBeTruthy();
      expect(getByText('João Pedro')).toBeTruthy();
    });
  });

  it('deve mostrar mensagem quando nenhum usuário é encontrado', async () => {
    mockSearchUsers.mockResolvedValue([]);

    const { getByPlaceholderText, getByText } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    const searchInput = getByPlaceholderText('Nome ou username...');
    fireEvent.changeText(searchInput, 'Inexistente');

    await waitFor(() => {
      expect(getByText('Nenhum usuário encontrado.')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('deve enviar convite ao clicar no botão Convidar', async () => {
    const mockUsers = [
      { id: '1', name: 'João Silva', username: 'joao', profilePicture: null },
    ];
    mockSearchUsers.mockResolvedValue(mockUsers);
    mockSendInvite.mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    const searchInput = getByPlaceholderText('Nome ou username...');
    fireEvent.changeText(searchInput, 'João');

    await waitFor(() => {
      expect(getByText('João Silva')).toBeTruthy();
    }, { timeout: 1000 });

    const inviteButton = getByText('Convidar');
    fireEvent.press(inviteButton);

    await waitFor(() => {
      expect(mockSendInvite).toHaveBeenCalledWith({
        groupId,
        targetUserId: '1',
      });
    });
  });

  it('deve mostrar "Enviado" após enviar convite com sucesso', async () => {
    const mockUsers = [
      { id: '1', name: 'João Silva', username: 'joao', profilePicture: null },
    ];
    mockSearchUsers.mockResolvedValue(mockUsers);
    mockSendInvite.mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    const searchInput = getByPlaceholderText('Nome ou username...');
    fireEvent.changeText(searchInput, 'João');

    await waitFor(() => {
      expect(getByText('João Silva')).toBeTruthy();
    }, { timeout: 1000 });

    const inviteButton = getByText('Convidar');
    fireEvent.press(inviteButton);

    await waitFor(() => {
      expect(getByText('Enviado')).toBeTruthy();
    });
  });

  it('deve mostrar alerta quando usuário já foi convidado', async () => {
    const mockUsers = [
      { id: '1', name: 'João Silva', username: 'joao', profilePicture: null },
    ];
    mockSearchUsers.mockResolvedValue(mockUsers);
    mockSendInvite.mockRejectedValue(new Error('User already invited'));

    const { getByPlaceholderText, getByText } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    const searchInput = getByPlaceholderText('Nome ou username...');
    fireEvent.changeText(searchInput, 'João');

    await waitFor(() => {
      expect(getByText('João Silva')).toBeTruthy();
    }, { timeout: 1000 });

    const inviteButton = getByText('Convidar');
    fireEvent.press(inviteButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Aviso', 'Usuário já convidado.');
    });
  });

  it('deve limpar estado ao fechar o modal', async () => {
    const mockUsers = [
      { id: '1', name: 'João Silva', username: 'joao', profilePicture: null },
    ];
    mockSearchUsers.mockResolvedValue(mockUsers);

    const { getByPlaceholderText, rerender, queryByText } = render(
      <InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />
    );

    const searchInput = getByPlaceholderText('Nome ou username...');
    fireEvent.changeText(searchInput, 'João');

    await waitFor(() => {
      expect(queryByText('João Silva')).toBeTruthy();
    }, { timeout: 1000 });

    // Fecha o modal
    rerender(<InviteMemberModal visible={false} onClose={mockOnClose} groupId={groupId} />);
    
    // Abre novamente
    rerender(<InviteMemberModal visible={true} onClose={mockOnClose} groupId={groupId} />);

    // Verifica que o estado foi limpo
    expect(getByPlaceholderText('Nome ou username...').props.value).toBe('');
    expect(queryByText('João Silva')).toBeNull();
  });
});


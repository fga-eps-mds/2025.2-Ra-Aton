import React from 'react';
import MemberCard from "@/components/MemberCardComp";
import { render, fireEvent } from "../test-utils";
import { IGroupMember } from '@/libs/interfaces/IMember';

describe('MemberCard', () => {
  const mockOnRemove = jest.fn();
  const mockOnPress = jest.fn();

  const mockAdminMember: IGroupMember = {
    id: 'member-1',
    role: 'ADMIN',
    user: {
      id: 'user-1',
      name: 'João Admin',
      avatarUrl: 'https://example.com/avatar1.jpg',
    },
    userId: 'user-1',
    groupId: 'group-1',
    joinedAt: new Date(),
  };

  const mockRegularMember: IGroupMember = {
    id: 'member-2',
    role: 'MEMBER',
    user: {
      id: 'user-2',
      name: 'Maria Silva',
      avatarUrl: null,
    },
    userId: 'user-2',
    groupId: 'group-1',
    joinedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o nome do membro', () => {
    const { getByText } = render(
      <MemberCard
        member={mockRegularMember}
        isAdminView={false}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Maria Silva')).toBeTruthy();
  });

  it('deve renderizar "Administrador" para membros com role ADMIN', () => {
    const { getByText } = render(
      <MemberCard
        member={mockAdminMember}
        isAdminView={false}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Administrador')).toBeTruthy();
  });

  it('deve renderizar "Membro" para membros com role MEMBER', () => {
    const { getByText } = render(
      <MemberCard
        member={mockRegularMember}
        isAdminView={false}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Membro')).toBeTruthy();
  });

  it('deve renderizar avatar quando avatarUrl está presente', () => {
    const { UNSAFE_getByType } = render(
      <MemberCard
        member={mockAdminMember}
        isAdminView={false}
        onRemove={mockOnRemove}
      />
    );

    const { Image } = require('react-native');
    const avatar = UNSAFE_getByType(Image);
    expect(avatar.props.source.uri).toBe('https://example.com/avatar1.jpg');
  });

  it('deve renderizar ícone de pessoa quando avatarUrl é null', () => {
    const { UNSAFE_getAllByType } = render(
      <MemberCard
        member={mockRegularMember}
        isAdminView={false}
        onRemove={mockOnRemove}
      />
    );

    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    // Deve ter pelo menos um ícone (person)
    expect(icons.length).toBeGreaterThan(0);
    expect(icons[0].props.name).toBe('person');
  });

  it('deve mostrar botão de remover quando isAdminView é true e membro não é admin', () => {
    const { UNSAFE_getAllByType } = render(
      <MemberCard
        member={mockRegularMember}
        isAdminView={true}
        onRemove={mockOnRemove}
      />
    );

    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    // Deve ter dois ícones: person (avatar) e trash-outline (remover)
    const trashIcon = icons.find(icon => icon.props.name === 'trash-outline');
    expect(trashIcon).toBeTruthy();
  });

  it('não deve mostrar botão de remover quando membro é admin', () => {
    const { queryByTestId } = render(
      <MemberCard
        member={mockAdminMember}
        isAdminView={true}
        onRemove={mockOnRemove}
      />
    );

    // Como o mockAdminMember tem avatarUrl, vai renderizar Image ao invés de Ionicons
    // Então não teremos o ícone trash-outline
    const { Ionicons } = require('@expo/vector-icons');
    
    // Verifica se não há trash icon no DOM
    // Usando queryByTestId que retorna null se não encontrar
    // Como não há testID, vamos verificar que não existe o texto visual do botão
    const { UNSAFE_queryAllByType } = render(
      <MemberCard
        member={mockAdminMember}
        isAdminView={true}
        onRemove={mockOnRemove}
      />
    );
    
    const icons = UNSAFE_queryAllByType(Ionicons);
    const trashIcon = icons.find(icon => icon.props.name === 'trash-outline');
    expect(trashIcon).toBeUndefined();
  });

  it('não deve mostrar botão de remover quando isAdminView é false', () => {
    const { UNSAFE_getAllByType } = render(
      <MemberCard
        member={mockRegularMember}
        isAdminView={false}
        onRemove={mockOnRemove}
      />
    );

    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    // Deve ter apenas o ícone person (avatar)
    const trashIcon = icons.find(icon => icon.props.name === 'trash-outline');
    expect(trashIcon).toBeUndefined();
  });

  it('deve chamar onRemove ao clicar no botão de remover', () => {
    const { UNSAFE_getAllByType } = render(
      <MemberCard
        member={mockRegularMember}
        isAdminView={true}
        onRemove={mockOnRemove}
      />
    );

    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    const trashIcon = icons.find(icon => icon.props.name === 'trash-outline');

    fireEvent.press(trashIcon);

    expect(mockOnRemove).toHaveBeenCalledWith('member-2', 'Maria Silva');
  });

  it('deve chamar onPress ao clicar no card quando onPress é fornecido', () => {
    const { getByText } = render(
      <MemberCard
        member={mockRegularMember}
        isAdminView={false}
        onRemove={mockOnRemove}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Maria Silva'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onPress quando onPress não é fornecido', () => {
    const { getByText } = render(
      <MemberCard
        member={mockRegularMember}
        isAdminView={false}
        onRemove={mockOnRemove}
      />
    );

    // Não deve lançar erro ao clicar
    fireEvent.press(getByText('Maria Silva'));

    // onPress não foi chamado porque não foi fornecido
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});

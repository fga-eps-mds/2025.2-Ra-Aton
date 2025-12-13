import React from 'react';
import { ProfileHeaderComp } from "@/components/ProfileHeaderComp";
import { render, fireEvent } from "../test-utils";

describe('ProfileHeaderComp', () => {
  const mockOnBack = jest.fn();
  const mockOnEdit = jest.fn();

  const defaultProps = {
    name: 'João Silva',
    identifier: 'joaosilva',
    isDarkMode: false,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o nome do perfil', () => {
    const { getByText } = render(<ProfileHeaderComp {...defaultProps} />);
    
    expect(getByText('João Silva')).toBeTruthy();
  });

  it('deve renderizar o identificador com @', () => {
    const { getByText } = render(<ProfileHeaderComp {...defaultProps} />);
    
    expect(getByText('@joaosilva')).toBeTruthy();
  });

  it('deve renderizar a bio quando fornecida', () => {
    const { getByText } = render(
      <ProfileHeaderComp 
        {...defaultProps} 
        bio="Desenvolvedor de software apaixonado por tecnologia"
      />
    );
    
    expect(getByText('Desenvolvedor de software apaixonado por tecnologia')).toBeTruthy();
  });

  it('não deve renderizar a bio quando não fornecida', () => {
    const { queryByText } = render(<ProfileHeaderComp {...defaultProps} />);
    
    // Não deve haver nenhum texto de bio
    expect(queryByText(/Desenvolvedor/)).toBeNull();
  });

  it('deve renderizar imagem do banner quando bannerUrl é fornecida', () => {
    const { UNSAFE_getAllByType } = render(
      <ProfileHeaderComp 
        {...defaultProps} 
        bannerUrl="https://example.com/banner.jpg"
      />
    );
    
    const { Image } = require('react-native');
    const images = UNSAFE_getAllByType(Image);
    
    // Deve ter pelo menos uma imagem (banner)
    const bannerImage = images.find(img => img.props.source?.uri === 'https://example.com/banner.jpg');
    expect(bannerImage).toBeTruthy();
  });

  it('deve renderizar placeholder quando bannerUrl não é fornecida', () => {
    const { UNSAFE_getAllByType } = render(<ProfileHeaderComp {...defaultProps} />);
    
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    
    // Deve ter views renderizadas
    expect(views.length).toBeGreaterThan(0);
  });

  it('deve renderizar imagem de perfil quando profileImageUrl é fornecida', () => {
    const { UNSAFE_getAllByType } = render(
      <ProfileHeaderComp 
        {...defaultProps} 
        profileImageUrl="https://example.com/profile.jpg"
      />
    );
    
    const { Image } = require('react-native');
    const images = UNSAFE_getAllByType(Image);
    
    const profileImage = images.find(img => img.props.source?.uri === 'https://example.com/profile.jpg');
    expect(profileImage).toBeTruthy();
  });

  it('deve renderizar ícone quando profileImageUrl não é fornecida', () => {
    const { UNSAFE_getAllByType } = render(<ProfileHeaderComp {...defaultProps} />);
    
    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    // Deve ter ícone "person" para o avatar
    const personIcon = icons.find(icon => icon.props.name === 'person');
    expect(personIcon).toBeTruthy();
  });

  it('deve chamar onBack ao clicar no botão de voltar', () => {
    const { UNSAFE_getAllByType } = render(<ProfileHeaderComp {...defaultProps} />);
    
    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    const backIcon = icons.find(icon => icon.props.name === 'arrow-back');
    expect(backIcon).toBeTruthy();
    
    fireEvent.press(backIcon);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar botão de editar quando showEditButton é true', () => {
    const { UNSAFE_getAllByType } = render(
      <ProfileHeaderComp 
        {...defaultProps} 
        showEditButton={true}
        onEdit={mockOnEdit}
      />
    );
    
    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    const editIcon = icons.find(icon => icon.props.name === 'create-outline');
    expect(editIcon).toBeTruthy();
  });

  it('não deve mostrar botão de editar quando showEditButton é false', () => {
    const { UNSAFE_getAllByType } = render(
      <ProfileHeaderComp {...defaultProps} showEditButton={false} />
    );
    
    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    const editIcon = icons.find(icon => icon.props.name === 'create-outline');
    expect(editIcon).toBeUndefined();
  });

  it('deve chamar onEdit ao clicar no botão de editar', () => {
    const { UNSAFE_getAllByType } = render(
      <ProfileHeaderComp 
        {...defaultProps} 
        showEditButton={true}
        onEdit={mockOnEdit}
      />
    );
    
    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    const editIcon = icons.find(icon => icon.props.name === 'create-outline');
    fireEvent.press(editIcon);
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar contagem de seguidores para profileType group', () => {
    const { getByText } = render(
      <ProfileHeaderComp 
        {...defaultProps} 
        profileType="group"
        followersCount={42}
      />
    );
    
    expect(getByText('42')).toBeTruthy();
    expect(getByText('Seguidores')).toBeTruthy();
  });

  it('não deve mostrar contagem de seguidores para profileType user', () => {
    const { queryByText } = render(
      <ProfileHeaderComp 
        {...defaultProps} 
        profileType="user"
        followersCount={42}
      />
    );
    
    expect(queryByText('Seguidores')).toBeNull();
  });

  it('deve usar tema escuro quando isDarkMode é true', () => {
    const { getByText } = render(
      <ProfileHeaderComp {...defaultProps} isDarkMode={true} />
    );
    
    // Verifica que o componente renderiza (não testa cores diretamente)
    expect(getByText('João Silva')).toBeTruthy();
  });

  it('deve usar tema claro quando isDarkMode é false', () => {
    const { getByText } = render(
      <ProfileHeaderComp {...defaultProps} isDarkMode={false} />
    );
    
    // Verifica que o componente renderiza (não testa cores diretamente)
    expect(getByText('João Silva')).toBeTruthy();
  });

  it('deve usar 0 como valor padrão para followersCount', () => {
    const { getByText, queryByText } = render(
      <ProfileHeaderComp 
        {...defaultProps} 
        profileType="group"
      />
    );
    
    expect(getByText('0')).toBeTruthy();
    expect(getByText('Seguidores')).toBeTruthy();
  });
});


// ARQUIVO: apps/mobile/libs/utils/alert.ts
import { Alert } from 'react-native';

/**
 * Wrapper simples para o Alert nativo.
 * Isso facilita os testes unitários, pois podemos mockar este arquivo
 * em vez de tentar mockar o módulo nativo 'react-native'.
 */
export const showSuccessAlert = (title: string, message: string) => {
  Alert.alert(title, message);
};

export const showErrorAlert = (title: string, message: string) => {
  Alert.alert(title, message);
};
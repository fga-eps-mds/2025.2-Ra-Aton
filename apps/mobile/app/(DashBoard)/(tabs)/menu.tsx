import { View } from "react-native";

/**
 * Este componente é um placeholder (dummy).
 * Ele só existe para que o Expo Router encontre o arquivo
 * e renderize o ícone "menu" na TabBar.
 * * O clique é interceptado em (tabs)/_layout.tsx,
 * então esta tela nunca é de fato navegada.
 */
export default function MenuScreenPlaceholder() {
  return <View />;
}

import React, { useState } from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import { useTheme } from "@/constants/Theme"; // Usando alias @
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/constants/Fonts";

// Estendemos as props do TextInput padrão
interface SearchInputProps extends TextInputProps {
  onSearch?: (query: string) => void;
}

const SearchInputComp: React.FC<SearchInputProps> = ({
  onSearch,
  ...props
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      // TODO: Criar requisição na pasta libs/search, importar, usar neste componente e testá-la. (CA5)
      // Por enquanto, apenas chama a função local
      onSearch(query);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.input }]}>
      <Ionicons
        name="search"
        size={24}
        color={theme.text}
        style={styles.icon}
      />
      <TextInput
        style={[
          styles.input,
          { color: theme.text, fontFamily: Fonts.mainFont.dongleRegular },
        ]}
        placeholder="Pesquisar..."
        placeholderTextColor={theme.gray}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch} // Permite pesquisar com "Enter"
        returnKeyType="search"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: Colors.light.gray, // Borda sutil
    height: 50,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 24, // Ajuste de fonte "Dongle"
  },
});

export default SearchInputComp;

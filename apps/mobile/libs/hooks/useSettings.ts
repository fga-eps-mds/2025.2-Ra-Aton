import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useUser } from "@/libs/storage/UserContext";
import { api_route } from "@/libs/auth/api";
import { sendRatting } from "@/libs/Avaliacoes/sendRatting";

export const useSettings = () => {
  const { user, setUser, logout, confirmDelete } = useUser();

  // Tabs
  const [selectedTab, setSelectedTab] = useState<"perfil" | "feedback">("perfil");

  // Notificações
  const [isEnabled, setIsEnabled] = useState(user?.notificationsAllowed ?? true);
  const [isLoading, setIsLoading] = useState(false);

  // Feedback
  const [rating, setRating] = useState(0);
  const [message, setmessage] = useState("");

  // Atualiza isEnabled caso user mude
  useEffect(() => {
    if (user) {
      setIsEnabled(user.notificationsAllowed ?? true);
    }
  }, [user]);

  // Toggle de notificação
  const toggleSwitch = async () => {
    if (!user) return;

    const newValue = !isEnabled;
    setIsEnabled(newValue);
    setIsLoading(true);

    try {
      await api_route.patch(`/users/${user.userName}`, {
        notificationsAllowed: newValue,
      });

      setUser({ ...user, notificationsAllowed: newValue });
    } catch (error) {
      console.error("Erro ao mudar preferência:", error);
      setIsEnabled(!newValue);
      Alert.alert("Erro", "Não foi possível atualizar sua preferência.");
    } finally {
      setIsLoading(false);
    }
  };

  const enviarAvaliacao = () => {
    console.log("Feedback sendo enviado:", { rating, message });
    sendRatting({
      rating,
      message,
      token: user.token,
    });

  };

  return {
    // Perfil
    isEnabled,
    isLoading,
    toggleSwitch,
    logout,
    confirmDelete,

    // Tabs
    selectedTab,
    setSelectedTab,

    // Feedback
    rating,
    setRating,
    message,
    setmessage,
    enviarAvaliacao,
  };
};

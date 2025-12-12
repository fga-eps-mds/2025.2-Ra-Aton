import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { useRouter } from "expo-router";
import { useTheme } from "@/constants/Theme";
import  SecondaryButton  from "@/components/SecondaryButton"
import  PrimaryButton  from "@/components/PrimaryButton"

import { aceitarSolicitacao } from "@/libs/solicitacoes/aceitarSolicitacao";
import { rejeitarSolicitacao } from "@/libs/solicitacoes/rejeitarSolicitacao";

interface CardNotificationCompProps {
  title: string;
  description: string;
  isRead: boolean;
  inviteId: string;
  onMarkAsRead: () => void;
  onView?: () => void; // <--- 1. Tornar opcional (?)
}

const CardNotificationComp: React.FC<CardNotificationCompProps> = ({
  title,
  description,
  isRead,
  inviteId,
  onMarkAsRead,
  onView,
}) => {
   const extractNameFromDescription = (desc: string): string | null => {
    const regex = /(\w+)\s+solicitou/; // Captura o nome antes de "solicitou"
    const match = desc.match(regex);
    return match ? match[1] : null;
  };
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();

  // Extrair o nome e gerar a URL
  const userName = extractNameFromDescription(description);


  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>

      
    <View style={styles.actions}>

  {/* ----------- ESQUERDA ----------- */}
  <View style={styles.leftButtons}>

    {title === "Solicitação de Entrada" ? (
      // Botão Perfil
      <SecondaryButton
        onPress={() =>
          router.push({
            pathname: "/(DashBoard)/(tabs)/Perfil",
            params: { identifier: userName, type: "user" },
          })
        }
        style={{ backgroundColor: theme.input, height: 40, width: 90 }}
      >
        Perfil
      </SecondaryButton>
    ) : (
      // Marcar como lida (só aparece se NÃO for solicitação)
      !isRead && (
        <Pressable style={styles.btn} onPress={onMarkAsRead}>
          <Text style={styles.btnText}>Marcar como lida</Text>
        </Pressable>
      )
    )}

  </View>

  {/* ----------- DIREITA ----------- */}
  <View style={styles.rightButtons}>
    {title === "Solicitação de Entrada" && (
      <>

        <PrimaryButton
          onPress={async () => {
            await rejeitarSolicitacao(inviteId);
            onMarkAsRead(); 
          }}
          style={{ width: "40%", height: 40 }}
        >
          Recusar
        </PrimaryButton>

        <PrimaryButton onPress={async () => { await aceitarSolicitacao(inviteId);
                                              onMarkAsRead();
                                            }}
                                             style={{ width: "40%", height: 40 }}>
          Aceitar
        </PrimaryButton>
      </>
    )}
  </View>

</View>



    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.dark.gray,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
  },
  desc: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
  },
actions: {
  flexDirection: "row",
  justifyContent: "space-between", // <-- empurra esquerda e direita
  alignItems: "center",
  marginTop: 12,
  height: 40,
  // backgroundColor: 'red',
},

leftButtons: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

rightButtons: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  flex:1,
  gap: 10,
},

  btn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.input,
        height:"100%",
  },
  btnText: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
  },
  viewBtn: {
    backgroundColor: Colors.light.orange,
  },
});

export default CardNotificationComp;
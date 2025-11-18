import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator, TouchableOpacityProps , View, Text, Platform} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
interface ImGoingButtonProps {
  initialCount?:number,
  initialGoing?: boolean;
  onToggleGoing: (isGoing: boolean) => Promise<void>;
}

const ImGoingButtonComp: React.FC<ImGoingButtonProps> = ({
  initialGoing = false,
  initialCount=0,
  onToggleGoing,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [isGoing, setIsGoing] = useState(initialGoing);
  const [isLoading, setIsLoading] = useState(false);
  const  [count,setCount] = useState(0);
  
  
  const handlePress = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    const wasGoing = isGoing;
    const newGoingState = !wasGoing;
    setIsGoing(newGoingState);

    setCount((prev) =>{
      if(!wasGoing){
        return prev +1; 
      }
      else{
        return prev > 0 ? prev -1 : 0;  
      }

    })
      
    try {
      await onToggleGoing(newGoingState);
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);

      
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="small"
        color={theme.orange}
      />
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.containerEuVou}>
    <View style={styles.boxButtonEuVou}>
      <Text style={{fontFamily:Fonts.mainFont.dongleRegular, fontSize:25, marginTop:3}}>Eu vou!</Text>
      <View style={styles.euVouCount}>
      <Ionicons name="hand-right-outline" size={20} color='black'/>
      <Text style={styles.countBtn}>{count}</Text>
      </View>
    </View>
     
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerEuVou: {
    width: 140,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.input.iconColor,
    alignItems: "center",
    justifyContent: "center",
  },

  boxButtonEuVou: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  euVouCount: {
    height: 26,              
    minWidth: 50,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",     
    justifyContent: "center", 
  },

  countBtn: {
    fontFamily: Fonts.mainFont.dongleRegular,
    fontSize: 22,
    lineHeight: 22,          
    marginLeft: 4,
    color: "black",
    includeFontPadding: false,  // Essa parte ta servindo                                  
    ...Platform.select({        // para corrigir o "errinhos" que o android proporciona nas dimensões de tela 
      android: { textAlignVertical: "center" as const },
      web: { transform: [{ translateY: 1 }] },   // Ai meio que só define estilos diferentes para a tela, o web foi adicionado só por causa do expo mesmo. 
    }),
  },
});


export default ImGoingButtonComp;

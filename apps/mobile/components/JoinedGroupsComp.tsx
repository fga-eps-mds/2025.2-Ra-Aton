import { View, TouchableOpacity } from "react-native";
import AppText from "./AppText";
import PrimaryButton from "@/components/PrimaryButton";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import ProfileThumbnailComp from "./ProfileThumbnailComp";
import { useRouter } from "expo-router";

interface JoinedGroupsCompProps {
  name: string;
  logoUrl?: string; 
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
}

export const JoinedGroupsComp = ({
  name,
  logoUrl,
  onPrimaryPress,
  onSecondaryPress,
}: JoinedGroupsCompProps) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 110,
        backgroundColor: theme.input,
        borderWidth: 1,
        borderColor: theme.background,
        marginBottom: 20,
        borderRadius: 10,
        padding: 15,
        shadowColor: "black",
        shadowOffset: {
          width: -2,
          height: 2,
        },
        shadowOpacity: 0.55,
        shadowRadius: 3.5,
        elevation: 5,
      }}
    >
      <ProfileThumbnailComp 
        size={60} 
        userName={name} 
        imageUrl={logoUrl} 
        profileType="group" 
      />
      
      <View
        style={{ flexDirection: "column", flex: 1, marginLeft: 15 }}
      >
        <AppText style={{ fontSize: 24, color: theme.text, fontWeight: "500" }} numberOfLines={1}>
          {name}
        </AppText>

      </View>
      <View
        style={{
          width: "25%",
          height: "100%",
          justifyContent: "space-around",
        }}
      >
        <PrimaryButton 
          textWeight={500} 
          textSize={20} 
          style={{ width: "100%", height: 35 }}
          onPress={() => router.push({
            pathname: "/(DashBoard)/(tabs)/Perfil",
            params: { identifier: name, type: "group" }
          })}
        >
          Perfil
        </PrimaryButton>

      </View>
    </View>
  );
};
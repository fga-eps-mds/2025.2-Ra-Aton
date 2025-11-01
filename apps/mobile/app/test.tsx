import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Fonts";

// Imagens
import NamedLogo from "@/assets/img/Logo_1_Atom.png";

// Componentes
import BackGroundComp from "@/components/BackGroundComp";
import Spacer from "@/components/SpacerComp";
import Button1Comp from "@/components/PrimaryButton";
import Button2Comp from "@/components/SecondaryButton";
import InputComp from "@/components/InputComp";
import ImGoingButtonComp from "@/components/ImGoingButtonComp";
import CommentButtonComp from "@/components/CommentButtonComp";
import CommentsModalComp from "@/components/CommentsModalComp";
import LikeButtonComp from "@/components/LikeButtonComp";
import MoreOptionsModalComp from "@/components/MoreOptionsModalComp";
// import navbar from "@/components/navbar";
import OptionsButtonComp from "@/components/OptionsButtonComp";
import ProfileThumbnailComp from "@/components/ProfileThumbnailComp";
import SearchInputComp from "@/components/SearchInputComp";

const Test: React.FC = () => {
    return <TestInner />;
}

const TestInner: React.FC = () => {
      const { isDarkMode, toggleDarkMode } = useTheme();
      const theme = isDarkMode ? Colors.dark : Colors.light;
      const styles = makeStyles(theme);

    return(
        <BackGroundComp style={{justifyContent:"center", alignItems:"center"}}>

            {/* <ImGoingButtonComp
            initialGoing={false}
            onToggleGoing={async (isGoing) => {
                console.log("Usuário alterou para:", isGoing ? "indo" : "não indo");
            }}
            /> */}

            {/* <CommentsModalComp></CommentsModalComp> */}
            {/* <CommentButtonComp></CommentButtonComp> */}
            {/* <LikeButtonComp></LikeButtonComp> */}
            {/* <MoreOptionsModalComp></MoreOptionsModalComp> */}
            {/* <OptionsButtonComp></OptionsButtonComp> */}
            {/* <ProfileThumbnailComp></ProfileThumbnailComp> */}
            {/* <SearchInputComp></SearchInputComp> */}
            
        </BackGroundComp>
    );
};
export default Test;
const makeStyles = (theme: any) =>
  StyleSheet.create({
  
});
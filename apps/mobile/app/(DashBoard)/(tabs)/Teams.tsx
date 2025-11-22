import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import Button1Comp from "../../../components/PrimaryButton";
import Button2Comp from "../../../components/SecondaryButton";
import { useRouter } from "expo-router";
import Spacer from "../../../components/SpacerComp";
import { useTheme } from "../../../constants/Theme";
import { Colors } from "../../../constants/Colors";
import BackGroundComp from "@/components/BackGroundComp";
import AppText from "@/components/AppText";
const Teams = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);
  const router = useRouter();

  return (
    <BackGroundComp style={styles.container}>
      <ScrollView contentContainerStyle={{padding: 0,paddingBottom: 0,backgroundColor: 'blue', alignItems: 'center', flex:1}}keyboardShouldPersistTaps="handled">  
      {/* Scroll principal (azul) */}
      <SafeAreaView style={[{height:"40%", width: "100%", backgroundColor: 'red', flexGrow: 1}]}>
          <AppText style={[{alignSelf: 'center'},styles.txt]}>Seus times</AppText>
        <ScrollView contentContainerStyle={{backgroundColor: 'green', width: "100%", height: "100%", alignItems: 'center', padding: 20}}keyboardShouldPersistTaps="handled">
          <Text>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias iusto dolore reiciendis, maiores vel suscipit tempora sunt iure veniam culpa quisquam dignissimos, fugit saepe sed, eos corrupti pariatur quis debitis!
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa officia neque fugiat? Beatae ad quis voluptatibus! Deserunt facilis ducimus totam nemo nisi nobis fuga dolore eum laboriosam! Reprehenderit, illo adipisci!
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet nulla modi magnam corporis iure. Illum eius, laudantium, nemo iste quis voluptatum tempore aliquam eum sapiente expedita explicabo laboriosam, a sed.
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, recusandae itaque? Commodi, architecto cumque aliquid veniam aperiam nesciunt officiis provident velit iure vitae consequuntur nisi temporibus quod itaque omnis consectetur.
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Adipisci odio sit, tenetur laborum doloribus iste quibusdam tempore quis fugit possimus impedit ut vero dolorum aspernatur tempora sequi, non cum cumque.
          </Text>
        </ScrollView>
      </SafeAreaView>
      <Spacer height={"5%"} />
      <Button2Comp style={{width: "80%", height: 50}} onPress={() => {}}>
        botão de amadores/atletica
      </Button2Comp>
      <Spacer height={"5%"} />
      <SafeAreaView style={[{height: "40%", width: "100%", backgroundColor: 'red'}]}>
          <AppText style={[{alignSelf: 'center'},styles.txt]}>outras equipes</AppText>
        <ScrollView contentContainerStyle={{backgroundColor: 'green', width: "100%", height: "100%", alignItems: 'center', padding: 20}}keyboardShouldPersistTaps="handled">
          <Text>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias iusto dolore reiciendis, maiores vel suscipit tempora sunt iure veniam culpa quisquam dignissimos, fugit saepe sed, eos corrupti pariatur quis debitis!
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa officia neque fugiat? Beatae ad quis voluptatibus! Deserunt facilis ducimus totam nemo nisi nobis fuga dolore eum laboriosam! Reprehenderit, illo adipisci!
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet nulla modi magnam corporis iure. Illum eius, laudantium, nemo iste quis voluptatum tempore aliquam eum sapiente expedita explicabo laboriosam, a sed.
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, recusandae itaque? Commodi, architecto cumque aliquid veniam aperiam nesciunt officiis provident velit iure vitae consequuntur nisi temporibus quod itaque omnis consectetur.
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Adipisci odio sit, tenetur laborum doloribus iste quibusdam tempore quis fugit possimus impedit ut vero dolorum aspernatur tempora sequi, non cum cumque.
          </Text>
        </ScrollView>
      </SafeAreaView>

      <Spacer height={20} />
      <SafeAreaView style={[{height: 200, width: "100%", backgroundColor: 'red'}]}>
        <AppText style={styles.txt}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex in labore asperiores vero quisquam dignissimos, ducimus ipsa quia itaque. At fuga modi consectetur cupiditate tempore architecto hic porro recusandae? Eveniet. Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis laborum minima possimus ex? Veritatis ducimus similique beatae at excepturi nesciunt illum numquam? Vel qui recusandae dolore voluptatibus minima minus dolor?</AppText>
      </SafeAreaView>
      </ScrollView>      
    </BackGroundComp>
  );
};

export default Teams;

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      // padding: 16,
    },
    txt: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 24,
    },

    inputBox: {
      width: "100%",
      height: 40,
      borderRadius: 34,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.orange,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: 34,
    },
  });

import {
    StyleSheet,
    View,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button1Comp from "../../../components/PrimaryButton";
import Button2Comp from "../../../components/SecondaryButton";
import Spacer from "../../../components/SpacerComp";
import BackGroundComp from "@/components/BackGroundComp";
import AppText from "@/components/AppText";
import TwoOptionButton from "@/components/TwoOptionButton";
import TwoOptionSwitch from "@/components/TwoOptionButton";
import { useTheme } from "../../../constants/Theme";
import { Colors } from "../../../constants/Colors";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { CreateGroupComp } from "@/components/CreateGroupComp";
import { useUser } from "@/libs/storage/UserContext";
import { useSolicitacoes } from "@/libs/hooks/getSolicitacoes";
import { cancelarSolicitacao} from "@/libs/solicitacoes/cancelarSolicitacao";
import { aceitarSolicitacao } from "@/libs/solicitacoes/aceitarSolicitacao";
import { rejeitarSolicitacao } from "@/libs/solicitacoes/rejeitarSolicitacao";

import SecondaryButton from "../../../components/SecondaryButton";
import PrimaryButton from "../../../components/PrimaryButton";
import { SolicitacoesComp } from "@/components/SolicitacoesComp";


const Solicitacoes = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;
    const styles = makeStyles(theme);
    const router = useRouter();
    const { user } = useUser();

     const {
        solicitacoes,
        loading,
        error,
        refetch,
      } = useSolicitacoes();

    const enviadas = solicitacoes.filter(s => s.madeBy === "USER")
    const recebidas = solicitacoes.filter(s => s.madeBy === "GROUP")


    const enviadasPendentes = enviadas.filter(s => s.status === "PENDING");
    const enviadasRespondidas = enviadas.filter(
    s => s.status === "APPROVED" || s.status === "REJECTED"
    );

    const recebidasPendentes = recebidas.filter(s => s.status === "PENDING");
    const recebidasRespondidas = recebidas.filter(
    s => s.status === "APPROVED" || s.status === "REJECTED"
    );

    const [selectedTab, setSelectedTab] = useState<"LEFT" | "RIGHT">("LEFT");
    if (loading) {
    return (
                <BackGroundComp style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={theme.orange} />
        </BackGroundComp >
    );
    }

    return (
        <BackGroundComp style={styles.container}>
            <ScrollView
                contentContainerStyle={{
                    padding: 0,
                    paddingBottom: 0,
                    paddingHorizontal: 20,
                    backgroundColor: theme.background,
                    alignItems: "center",
                    flex: 1,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <Spacer height={"5%"} />

                <TwoOptionSwitch
                    optionLeft="Enviadas"
                    optionRight="Recebidas"
                    selected={selectedTab}
                    onChange={(value) => setSelectedTab(value)}
                />


                {/*  ABA ENVIADAS  */}
                {selectedTab === "LEFT" && (
                    <>
                                            <Spacer height={30} />

                        {/* Pendentes */}
                        <SafeAreaView style={{ width: "100%", height: "42%" }}>
                            <AppText
                                style={[
                                    { alignSelf: "center", marginBottom: 10 },
                                    styles.txt,
                                ]}
                            >
                                Solicitações enviadas
                            </AppText>

                            <ScrollView
                                contentContainerStyle={{
                                    width: "100%",
                                    alignItems: "center",
                                    paddingHorizontal: 20,
                                }}
                                keyboardShouldPersistTaps="handled"
                            >
                                {enviadasPendentes.length === 0 ? (
                                    <AppText style={styles.txt}>
                                        Nenhuma solicitação pendente.
                                    </AppText>
                                ) : (
                                    enviadasPendentes.map(s => (
                                        <SolicitacoesComp
                                            key={s.id}
                                            name={s.group.name}
                                            status={s.status}
                                            onPrimaryPress={async () => {await cancelarSolicitacao(s.id);
                                                                        refetch();
                                            }}
                                        />
                                    ))
                                )}
                            </ScrollView>
                        </SafeAreaView>

                        <Spacer height={30} />

                        {/* Respondidas */}
                        <SafeAreaView style={{ width: "100%", height: "90%" }}>
                            <AppText
                                style={[
                                    { alignSelf: "center", marginBottom: 10 },
                                    styles.txt,
                                ]}
                            >
                                Solicitações Aceitas/Rejeitadas
                            </AppText>

                            <ScrollView
                                contentContainerStyle={{
                                    width: "100%",
                                    alignItems: "center",
                                    paddingHorizontal: 20,
                                }}
                                keyboardShouldPersistTaps="handled"
                            >
                                {enviadasRespondidas.length === 0 ? (
                                    <AppText style={styles.txt}>
                                        Nenhuma solicitação respondida.
                                    </AppText>
                                ) : (
                                    enviadasRespondidas.map(s => (
                                        <SolicitacoesComp
                                            key={s.id}
                                            name={s.group.name}
                                            status={s.status}
                                        />
                                    ))
                                )}
                            </ScrollView>
                        </SafeAreaView>
                    </>
                )}

                {/*  ABA RECEBIDAS  */}
                {selectedTab === "RIGHT" && (
                    <>
                        <Spacer height={30} />

                        <SafeAreaView style={{ width: "100%" }}>
                            <AppText
                                style={[
                                    { alignSelf: "center", marginBottom: 10 },
                                    styles.txt,
                                ]}
                            >
                                Convites recebidos
                            </AppText>

                            <ScrollView
                                contentContainerStyle={{
                                    width: "100%",
                                    alignItems: "center",
                                    paddingHorizontal: 20,
                                }}
                                keyboardShouldPersistTaps="handled"
                            >
                                {recebidasPendentes.length === 0 ? (
                                    <AppText style={styles.txt}>
                                        Nenhum convite recebido.
                                    </AppText>
                                ) : (
                                    recebidasPendentes.map(s => (
                                        <SolicitacoesComp
                                            key={s.id}
                                            name={s.group.name}
                                            status={s.status}
                                            autor={s.madeBy}
                                            onPrimaryPress={async () => {
                                                await aceitarSolicitacao(s.id);
                                                refetch();
                                            }}
                                            onSecondaryPress={async () => {
                                                await rejeitarSolicitacao(s.id);
                                                refetch();
                                            }}
                                        />
                                    ))
                                )}
                            </ScrollView>
                        </SafeAreaView>

                        <Spacer height={30} />

                        {/* Respondidas */}
                        <SafeAreaView style={{ width: "100%", height: "90%" }}>
                            <AppText
                                style={[
                                    { alignSelf: "center", marginBottom: 10 },
                                    styles.txt,
                                ]}
                            >
                                Solicitações Aceitas/Rejeitadas
                            </AppText>

                            <ScrollView
                                contentContainerStyle={{
                                    width: "100%",
                                    alignItems: "center",
                                    paddingHorizontal: 20,
                                }}
                                keyboardShouldPersistTaps="handled"
                            >
                                {recebidasRespondidas.length === 0 ? (
                                    <AppText style={styles.txt}>
                                        Nenhuma solicitação respondida.
                                    </AppText>
                                ) : (
                                    recebidasRespondidas.map(s => (
                                        <SolicitacoesComp
                                            key={s.id}
                                            name={s.group.name}
                                            status={s.status}
                                        />
                                    ))
                                )}
                            </ScrollView>
                        </SafeAreaView>
                    </>
                )}

            </ScrollView>
        </BackGroundComp >
    );
};

export default Solicitacoes;

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

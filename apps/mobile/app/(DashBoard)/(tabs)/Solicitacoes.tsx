import {
    StyleSheet,
    View,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spacer from "../../../components/SpacerComp";
import BackGroundComp from "@/components/BackGroundComp";
import AppText from "@/components/AppText";
import TwoOptionSwitch from "@/components/TwoOptionButton";
import { useTheme } from "../../../constants/Theme";
import { Colors } from "../../../constants/Colors";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/libs/storage/UserContext";
import { useSolicitacoes } from "@/libs/hooks/getSolicitacoes";
import { cancelarSolicitacao } from "@/libs/solicitacoes/cancelarSolicitacao";
import { aceitarSolicitacao } from "@/libs/solicitacoes/aceitarSolicitacao";
import { rejeitarSolicitacao } from "@/libs/solicitacoes/rejeitarSolicitacao";

import { SolicitacoesComp } from "@/components/SolicitacoesComp";

const Solicitacoes = () => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? Colors.dark : Colors.light;
    const styles = makeStyles(theme);
    const router = useRouter();
    const { user } = useUser();

    const { solicitacoes, loading, refetch } = useSolicitacoes();

    const enviadas = solicitacoes.filter(s => s.madeBy === "USER");
    const recebidas = solicitacoes.filter(s => s.madeBy === "GROUP");

    const enviadasPendentes = enviadas.filter(s => s.status === "PENDING");
    const enviadasRespondidas = enviadas.filter(s => s.status !== "PENDING");

    const recebidasPendentes = recebidas.filter(s => s.status === "PENDING");
    const recebidasRespondidas = recebidas.filter(s => s.status !== "PENDING");

    const [selectedTab, setSelectedTab] = useState<"LEFT" | "RIGHT">("LEFT");

    if (loading) {
        return (
            <BackGroundComp style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={theme.orange} />
            </BackGroundComp>
        );
    }

    return (
        <BackGroundComp style={styles.container}>
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 50,
                    backgroundColor: theme.background,
                    alignItems: "center",
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


                {selectedTab === "LEFT" && (
                    <>
                        <Spacer height={30} />

                        <SafeAreaView style={{ width: "100%" }}>
                            <AppText style={[{ alignSelf: "center", marginBottom: 10 }, styles.txt]}>
                                Solicitações enviadas
                            </AppText>

                            <View style={styles.sectionContainer}>
                                {enviadasPendentes.length === 0 ? (
                                    <AppText style={styles.txt}>Nenhuma solicitação pendente.</AppText>
                                ) : (
                                    enviadasPendentes.map(s => (
                                        <SolicitacoesComp
                                            key={s.id}
                                            name={s.group.name}
                                            status={s.status}
                                            onPrimaryPress={async () => {
                                                await cancelarSolicitacao(s.id);
                                                refetch();
                                            }}
                                        />
                                    ))
                                )}
                            </View>
                        </SafeAreaView>

                        <Spacer height={30} />

                        <SafeAreaView style={{ width: "100%" }}>
                            <AppText style={[{ alignSelf: "center", marginBottom: 10 }, styles.txt]}>
                                Solicitações Aceitas/Rejeitadas
                            </AppText>

                            <View style={styles.sectionContainer}>
                                {enviadasRespondidas.length === 0 ? (
                                    <AppText style={styles.txt}>Nenhuma solicitação respondida.</AppText>
                                ) : (
                                    enviadasRespondidas.map(s => (
                                        <SolicitacoesComp
                                            key={s.id}
                                            name={s.group.name}
                                            status={s.status}
                                        />
                                    ))
                                )}
                            </View>
                        </SafeAreaView>
                    </>
                )}


                {selectedTab === "RIGHT" && (
                    <>
                        <Spacer height={30} />

                        <SafeAreaView style={{ width: "100%" }}>
                            <AppText style={[{ alignSelf: "center", marginBottom: 10 }, styles.txt]}>
                                Convites recebidos
                            </AppText>

                            <View style={styles.sectionContainer}>
                                {recebidasPendentes.length === 0 ? (
                                    <AppText style={styles.txt}>Nenhum convite recebido.</AppText>
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
                            </View>
                        </SafeAreaView>

                        <Spacer height={30} />

                        <SafeAreaView style={{ width: "100%" }}>
                            <AppText style={[{ alignSelf: "center", marginBottom: 10 }, styles.txt]}>
                                Solicitações Aceitas/Rejeitadas
                            </AppText>

                            <View style={styles.sectionContainer}>
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
                            </View>
                        </SafeAreaView>
                    </>
                )}
            </ScrollView>
        </BackGroundComp>
    );
};

export default Solicitacoes;

const makeStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        txt: {
            color: theme.text,
            fontWeight: "500",
            fontSize: 22,
            textAlign: "center",
        },
        sectionContainer: {
            width: "100%",
            alignItems: "center",
            paddingHorizontal: 20,
            gap: 10,
        },
    });

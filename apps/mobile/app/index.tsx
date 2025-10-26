import { Redirect } from "expo-router";

// So pra garantir que a pagina inicial vai ser a do cadastro
export default function Index() {
  return <Redirect href="/(Auth)/cadastro" />;
}

export async function handleLogin(email: string, password: string) {
  const response = await fetch("http://localhost:4000/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.log("Mensagem de erro: " + data.message);
    throw new Error(data.message || "Login failed");
  }
  console.log("Login successful:", data);
  return data;
}
/*
body = {
    email: "email",
    password: "senha"
}
const data = {
    response: 200, // deu certo
    token: fnkfjs137418fjk
}

*/

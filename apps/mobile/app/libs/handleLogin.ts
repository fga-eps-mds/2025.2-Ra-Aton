export async function handleLogin(email: string, password: string) {
  const response = await fetch("http://localhost:4000/auth/login", {
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


// Caso de certo o BackEnd vai responder:
// if (user.profileType == null) {
//       warns.push("Configuração de perfil pendente.");
//     }

//     return res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//       warns: warns,
//     });
// }

// (Encontrado em C:\MDS\clone3\2025.2-Ra-Aton\apps\api\src\routes\auth.routes.ts)

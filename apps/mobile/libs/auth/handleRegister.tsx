
export async function registerUser({
  name,
  userName,
  email,
  password,
}: {
  name: string;
  userName: string;
  email: string;
  password: string;
}) {
  try {
    const response = await fetch("http://localhost:4000/users/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        userName,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao cadastrar.");
    }

    return data;
  } catch (error: any) {
    console.error("Erro ao registrar usuário:", error);
    throw new Error("Não foi possível conectar ao servidor.");
  }
}


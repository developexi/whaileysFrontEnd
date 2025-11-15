/**
 * Script para criar usuário padrão
 * Email: marcosgunha@gmail.com
 * Senha: @MeuPrimeiroAcesso
 */

import { registerUser } from "./server/auth-local";

async function seedDefaultUser() {
  console.log("🌱 Criando usuário padrão...");

  const result = await registerUser({
    email: "marcosgunha@gmail.com",
    password: "@MeuPrimeiroAcesso",
    name: "Marcos Gunha",
    role: "admin",
  });

  if (result.success) {
    console.log("✅ Usuário padrão criado com sucesso!");
    console.log("   Email: marcosgunha@gmail.com");
    console.log("   Senha: @MeuPrimeiroAcesso");
    console.log("   Role: admin");
  } else {
    if (result.error?.includes("já cadastrado")) {
      console.log("ℹ️  Usuário padrão já existe");
    } else {
      console.error("❌ Erro ao criar usuário padrão:", result.error);
      process.exit(1);
    }
  }
}

seedDefaultUser()
  .then(() => {
    console.log("✅ Seed concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  });

import bcrypt from "bcrypt";
import { getUserByEmail, createUser } from "./db";

const SALT_ROUNDS = 10;

/**
 * Hash de senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verificar senha
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash);
}

/**
 * Autenticar usuário com email e senha
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    if (!user.passwordHash) {
      return { success: false, error: "Usuário sem senha configurada" };
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: "Senha incorreta" };
    }

    // Não retornar o hash da senha
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("[Auth] Erro ao autenticar:", error);
    return { success: false, error: "Erro ao autenticar" };
  }
}

/**
 * Registrar novo usuário
 */
export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
  role?: "user" | "admin";
}): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Verificar se email já existe
    const existing = await getUserByEmail(data.email);
    if (existing) {
      return { success: false, error: "Email já cadastrado" };
    }

    // Hash da senha
    const passwordHash = await hashPassword(data.password);

    // Criar usuário
    const user = await createUser({
      email: data.email,
      passwordHash,
      name: data.name || data.email.split("@")[0],
      role: data.role || "user",
      loginMethod: "local",
    });

    if (!user) {
      return { success: false, error: "Erro ao criar usuário" };
    }

    // Não retornar o hash da senha
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("[Auth] Erro ao registrar:", error);
    return { success: false, error: "Erro ao criar usuário" };
  }
}

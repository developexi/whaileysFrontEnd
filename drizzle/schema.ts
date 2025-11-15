import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  /** Hash da senha para autenticação local (bcrypt) */
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de logs de atividades do sistema
 * Registra ações dos usuários (criação/exclusão de sessões, logins, etc)
 */
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // create_session, delete_session, login, etc
  entityType: varchar("entity_type", { length: 50 }), // session, user, etc
  entityId: varchar("entity_id", { length: 255 }), // ID da entidade afetada
  details: text("details"), // JSON com detalhes adicionais
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 ou IPv6
  userAgent: text("user_agent"), // Navegador/dispositivo
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Configurações da API Whaileys
 * Armazena a URL base e token de autenticação para conectar à API externa
 */
export const apiConfig = pgTable("api_config", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  apiUrl: varchar("apiUrl", { length: 255 }).notNull(),
  apiToken: text("apiToken"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ApiConfig = typeof apiConfig.$inferSelect;
export type InsertApiConfig = typeof apiConfig.$inferInsert;

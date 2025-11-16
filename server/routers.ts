import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { authenticateUser, registerUser } from "./auth-local";
import { getUserByOpenId } from "./db";
import { listSessions, createSession, deleteSession, getSessionQRCode } from "./whaileys-api";
import { createActivityLog, getActivityLogs } from "./activity-logs";
import { systemRouter } from "./_core/systemRouter";
import { broadcastSessionUpdate } from "./websocket";

export const appRouter = router({
  system: systemRouter,
  
  // ============================================================================
  // Autenticação Local (sem Manus OAuth)
  // ============================================================================
  auth: router({
    /**
     * Login com email e senha
     */
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await authenticateUser(input.email, input.password);

        if (!result.success || !result.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.error || "Credenciais inválidas",
          });
        }

        // Criar sessão (cookie)
        // Aqui você pode implementar JWT ou session cookie
        // Por enquanto, retornamos o usuário

        return {
          success: true,
          user: result.user,
        };
      }),

    /**
     * Registrar novo usuário
     */
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await registerUser({
          email: input.email,
          password: input.password,
          name: input.name,
          role: "user",
        });

        if (!result.success || !result.user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "Erro ao criar usuário",
          });
        }

        return {
          success: true,
          user: result.user,
        };
      }),

    /**
     * Obter usuário atual
     */
    me: publicProcedure.query(({ ctx }) => ctx.user),

    /**
     * Logout
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      // Limpar cookie de sessão
      return { success: true };
    }),
  }),

  // ============================================================================
  // Sessões WhatsApp
  // ============================================================================
  sessions: router({
    /**
     * Listar todas as sessões
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        const sessions = await listSessions();
        return sessions;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao listar sessões",
        });
      }
    }),

    /**
     * Criar nova sessão
     */
    create: protectedProcedure
      .input(
        z.object({
          sessionId: z.string().min(1, "Session ID é obrigatório"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await createSession(input.sessionId);

          // Log de atividade
          await createActivityLog({
            userId: ctx.user.id,
            action: "create_session",
            entityType: "session",
            entityId: input.sessionId,
            details: JSON.stringify({ sessionId: input.sessionId }),
          });

          // Notificar via WebSocket
          broadcastSessionUpdate({
            type: "session_created",
            sessionId: input.sessionId,
          });

          return result;
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao criar sessão",
          });
        }
      }),

    /**
     * Deletar sessão
     */
    delete: protectedProcedure
      .input(
        z.object({
          sessionId: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await deleteSession(input.sessionId);

          // Log de atividade
          await createActivityLog({
            userId: ctx.user.id,
            action: "delete_session",
            entityType: "session",
            entityId: input.sessionId,
            details: JSON.stringify({ sessionId: input.sessionId }),
          });

          // Notificar via WebSocket
          broadcastSessionUpdate({
            type: "session_deleted",
            sessionId: input.sessionId,
          });

          return result;
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao deletar sessão",
          });
        }
      }),

    /**
     * Obter QR Code de uma sessão
     */
    getQRCode: protectedProcedure
      .input(
        z.object({
          sessionId: z.string(),
        })
      )
      .query(async ({ input }) => {
        try {
          const qrCode = await getSessionQRCode(input.sessionId);
          return { qrCode };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao obter QR Code",
          });
        }
      }),

    /**
     * Health check
     */
    health: publicProcedure.query(() => {
      return { status: "ok", healthy: true, timestamp: new Date().toISOString() };
    }),
  }),

  // ============================================================================
  // Logs de Atividades
  // ============================================================================
  activityLogs: router({
    /**
     * Listar logs de atividades
     */
    list: protectedProcedure
      .input(
        z.object({
          userId: z.number().optional(),
          action: z.string().optional(),
          entityType: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        try {
          const logs = await getActivityLogs({
            ...input,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
          });
          return logs;
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao listar logs",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

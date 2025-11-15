import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  sessions: router({
    list: protectedProcedure.query(async () => {
      const { listSessions } = await import('./whaileys-api');
      return listSessions();
    }),
    get: protectedProcedure.input(z.object({ sessionId: z.string() })).query(async ({ input }) => {
      const { getSession } = await import('./whaileys-api');
      return getSession(input.sessionId);
    }),
    create: protectedProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input, ctx }) => {
      const { createSession } = await import('./whaileys-api');
      const result = await createSession(input.sessionId);
      // Registrar log de atividade
      const { logActivity } = await import('./activity-logs');
      await logActivity({
        userId: ctx.user.id,
        action: 'create_session',
        entityType: 'session',
        entityId: input.sessionId,
        details: JSON.stringify({ sessionId: input.sessionId }),
      });
      // Emitir evento WebSocket
      const { emitSessionCreated } = await import('./websocket');
      emitSessionCreated(input.sessionId);
      return result;
    }),
    delete: protectedProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input, ctx }) => {
      const { deleteSession } = await import('./whaileys-api');
      const result = await deleteSession(input.sessionId);
      if (!result) {
        throw new Error('Falha ao deletar sessão');
      }
      // Registrar log de atividade
      const { logActivity } = await import('./activity-logs');
      await logActivity({
        userId: ctx.user.id,
        action: 'delete_session',
        entityType: 'session',
        entityId: input.sessionId,
        details: JSON.stringify({ sessionId: input.sessionId }),
      });
      // Emitir evento WebSocket
      const { emitSessionDeleted } = await import('./websocket');
      emitSessionDeleted(input.sessionId);
      return { success: true };
    }),
    health: publicProcedure.query(async () => {
      const { checkHealth } = await import('./whaileys-api');
      return { healthy: await checkHealth() };
    }),
    getQrCode: protectedProcedure.input(z.object({ sessionId: z.string() })).query(async ({ input }) => {
      const { getSession } = await import('./whaileys-api');
      const session = await getSession(input.sessionId);
      return session?.qrCode || null;
    }),
  }),
  
  activityLogs: router({
    list: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional().default(100),
      }).optional())
      .query(async ({ input, ctx }) => {
        const { getActivityLogs } = await import('./activity-logs');
        // Se não for admin, só pode ver seus próprios logs
        const filters = ctx.user.role === 'admin' ? input : { ...input, userId: ctx.user.id };
        return await getActivityLogs(filters);
      }),
  }),
});

export type AppRouter = typeof appRouter;

import { getDb } from "./db";
import { activityLogs, InsertActivityLog } from "../drizzle/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";

/**
 * Registrar atividade do usuário
 */
export async function logActivity(data: Omit<InsertActivityLog, "createdAt">) {
  const db = await getDb();
  if (!db) {
    console.warn("[ActivityLogs] Cannot log activity: database not available");
    return;
  }

  try {
    await db.insert(activityLogs).values(data);
  } catch (error) {
    console.error("[ActivityLogs] Failed to log activity:", error);
  }
}

// Alias para compatibilidade com routers.ts
export const createActivityLog = logActivity;

/**
 * Buscar logs de atividades com filtros opcionais
 */
export async function getActivityLogs(filters?: {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[ActivityLogs] Cannot get logs: database not available");
    return [];
  }

  try {
    let query = db.select().from(activityLogs);

    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(activityLogs.userId, filters.userId));
    }
    
    if (filters?.action) {
      conditions.push(eq(activityLogs.action, filters.action));
    }
    
    if (filters?.entityType) {
      conditions.push(eq(activityLogs.entityType, filters.entityType));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(activityLogs.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(activityLogs.createdAt, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    query = query.orderBy(desc(activityLogs.createdAt)) as typeof query;

    if (filters?.limit) {
      query = query.limit(filters.limit) as typeof query;
    }

    return await query;
  } catch (error) {
    console.error("[ActivityLogs] Failed to get logs:", error);
    return [];
  }
}

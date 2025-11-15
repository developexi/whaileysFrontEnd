import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function initWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Em produção, especifique o domínio correto
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
    });

    // Evento para se inscrever em atualizações de sessões
    socket.on("subscribe:sessions", () => {
      socket.join("sessions");
      console.log(`[WebSocket] Cliente ${socket.id} inscrito em sessions`);
    });

    // Evento para cancelar inscrição
    socket.on("unsubscribe:sessions", () => {
      socket.leave("sessions");
      console.log(`[WebSocket] Cliente ${socket.id} desinscrito de sessions`);
    });
  });

  console.log("[WebSocket] Servidor WebSocket iniciado");
  return io;
}

/**
 * Broadcast de atualização de sessão (genérico)
 */
export function broadcastSessionUpdate(data: any) {
  if (!io) return;
  io.to("sessions").emit("session:update", { ...data, timestamp: new Date() });
  console.log(`[WebSocket] Broadcast session:update emitido`);
}

/**
 * Emitir evento de sessão criada
 */
export function emitSessionCreated(sessionId: string) {
  if (!io) return;
  io.to("sessions").emit("session:created", { sessionId, timestamp: new Date() });
  console.log(`[WebSocket] Evento session:created emitido para ${sessionId}`);
}

/**
 * Emitir evento de sessão deletada
 */
export function emitSessionDeleted(sessionId: string) {
  if (!io) return;
  io.to("sessions").emit("session:deleted", { sessionId, timestamp: new Date() });
  console.log(`[WebSocket] Evento session:deleted emitido para ${sessionId}`);
}

/**
 * Emitir evento de status de sessão atualizado
 */
export function emitSessionStatusChanged(sessionId: string, status: string) {
  if (!io) return;
  io.to("sessions").emit("session:status_changed", { sessionId, status, timestamp: new Date() });
  console.log(`[WebSocket] Evento session:status_changed emitido para ${sessionId}: ${status}`);
}

/**
 * Emitir notificação genérica
 */
export function emitNotification(message: string, type: "info" | "success" | "warning" | "error" = "info") {
  if (!io) return;
  io.emit("notification", { message, type, timestamp: new Date() });
  console.log(`[WebSocket] Notificação emitida: ${message}`);
}

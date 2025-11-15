import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface WebSocketEvents {
  "session:created": (data: { sessionId: string; timestamp: Date }) => void;
  "session:deleted": (data: { sessionId: string; timestamp: Date }) => void;
  "session:status_changed": (data: { sessionId: string; status: string; timestamp: Date }) => void;
  "notification": (data: { message: string; type: "info" | "success" | "warning" | "error"; timestamp: Date }) => void;
}

export function useWebSocket(onRefresh?: () => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar ao WebSocket
    const socket = io(window.location.origin, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WebSocket] Conectado");
      // Inscrever-se em atualizações de sessões
      socket.emit("subscribe:sessions");
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Desconectado");
    });

    // Eventos de sessões
    socket.on("session:created", (data: { sessionId: string; timestamp: Date }) => {
      console.log("[WebSocket] Sessão criada:", data);
      toast.success(`Nova sessão criada: ${data.sessionId}`);
      onRefresh?.();
    });

    socket.on("session:deleted", (data: { sessionId: string; timestamp: Date }) => {
      console.log("[WebSocket] Sessão deletada:", data);
      toast.info(`Sessão deletada: ${data.sessionId}`);
      onRefresh?.();
    });

    socket.on("session:status_changed", (data: { sessionId: string; status: string; timestamp: Date }) => {
      console.log("[WebSocket] Status alterado:", data);
      toast.info(`Sessão ${data.sessionId}: ${data.status}`);
      onRefresh?.();
    });

    // Notificações genéricas
    socket.on("notification", (data: { message: string; type: "info" | "success" | "warning" | "error"; timestamp: Date }) => {
      console.log("[WebSocket] Notificação:", data);
      switch (data.type) {
        case "success":
          toast.success(data.message);
          break;
        case "error":
          toast.error(data.message);
          break;
        case "warning":
          toast.warning(data.message);
          break;
        default:
          toast.info(data.message);
      }
    });

    // Cleanup
    return () => {
      socket.emit("unsubscribe:sessions");
      socket.disconnect();
    };
  }, [onRefresh]);

  return socketRef.current;
}

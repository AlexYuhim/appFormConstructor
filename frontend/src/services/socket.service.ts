import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../types/socket.types";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export const socketService = {
  connect: (token?: string): TypedSocket => {
    if (socket?.connected) return socket;

    socket = io(WS_URL, {
      ...(token ? { auth: { token } } : {}),
      transports: ["websocket", "polling"],
    }) as TypedSocket;

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
    });

    return socket;
  },

  disconnect: (): void => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: (): TypedSocket | null => {
    return socket;
  },

  joinForm: (formId: string): void => {
    socket?.emit("join:form", { formId });
  },

  leaveForm: (formId: string): void => {
    socket?.emit("leave:form", { formId });
  },

  joinAdmin: (token: string): void => {
    socket?.emit("join:admin", { token });
  },
};

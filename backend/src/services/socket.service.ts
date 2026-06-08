import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

export class SocketService {
  private io: SocketServer;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.setupListeners();
    console.log("[Socket] Socket.io initialized");
  }

  private setupListeners(): void {
    this.io.on("connection", (socket) => {
      console.log(`[Socket] Client connected: ${socket.id}`);

      socket.on("join:form", (data: { formId: string }) => {
        const room = `form:${data.formId}`;
        socket.join(room);
        console.log(`[Socket] ${socket.id} joined room ${room}`);
      });

      socket.on("leave:form", (data: { formId: string }) => {
        const room = `form:${data.formId}`;
        socket.leave(room);
        console.log(`[Socket] ${socket.id} left room ${room}`);
      });

      socket.on("join:admin", (data: { token: string }) => {
        try {
          const secret = process.env.JWT_SECRET || "default-secret";
          const decoded = jwt.verify(data.token, secret) as any;
          const adminRoom = `admin:${decoded.adminId}`;
          socket.join(adminRoom);
          console.log(`[Socket] Admin ${decoded.adminId} joined admin room`);
        } catch {
          socket.emit("error", {
            message: "Невалидный токен",
            code: "AUTH_ERROR",
          });
        }
      });

      socket.on("disconnect", () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
      });
    });
  }

  emitItemStatusChanged(
    formId: string,
    data: {
      itemId: string;
      currentQuantity: number;
      requiredQuantity: number;
      status: "available" | "limited" | "full";
    },
  ): void {
    this.io.to(`form:${formId}`).emit("item:statusChanged", data);
  }

  emitSectionFilled(
    formId: string,
    data: { sectionId: string; formId: string },
  ): void {
    this.io.to(`form:${formId}`).emit("section:filled", data);
  }

  emitFormUpdated(
    formId: string,
    data: { formId: string; action: "published" | "updated" | "deleted" },
  ): void {
    this.io.to(`form:${formId}`).emit("form:updated", data);
  }

  emitNewSubmission(
    formId: string,
    data: { userName: string; itemLabels: string[] },
  ): void {
    this.io.to(`form:${formId}`).emit("submission:new", data);
  }

  getIO(): SocketServer {
    return this.io;
  }
}

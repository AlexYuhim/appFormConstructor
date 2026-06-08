import { Server as HttpServer } from "http";
import { SocketService } from "../services/socket.service";

let socketService: SocketService;

export const initSocket = (httpServer: HttpServer): SocketService => {
  socketService = new SocketService(httpServer);
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error("Socket service not initialized");
  }
  return socketService;
};

import {
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets"

import { Server } from "socket.io"

// Socket.IO needs its own CORS config; it does not inherit app.enableCors().
// CORS_ORIGINS is a comma-separated allowlist ("*" in local dev if unset).
const socketOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : "*"

@WebSocketGateway({
  cors: {
    origin: socketOrigins,
    credentials: true
  }
})
export class TaskGateway {

  @WebSocketServer()
  server: Server

  notifyTaskUpdate(task: any) {

    this.server.emit("taskUpdated", task)

  }

}
import {
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets"

import { Server } from "socket.io"

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class TaskGateway {

  @WebSocketServer()
  server: Server

  notifyTaskUpdate(task: any) {

    this.server.emit("taskUpdated", task)

  }

}
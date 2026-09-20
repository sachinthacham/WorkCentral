import { io } from "socket.io-client"
import { API_BASE_URL } from "./config"

// autoConnect stays on, but reconnection is bounded so a cold-started API
// (App Service F1 has no Always On) does not spin forever on first load.
export const socket = io(API_BASE_URL, {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
})
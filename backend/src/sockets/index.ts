import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id)

    // Permet de s'identifier par rôle
    socket.on('join', (role: string) => {
      socket.join(role)
      console.log(`🟢 ${socket.id} joined room: ${role}`)
    })

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id)
    })
  })
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

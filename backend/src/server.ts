import app from './app'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { initCronJobs } from './cron'; // NOUVEAU


// Créer le serveur HTTP
const server = createServer(app)

// Initialiser Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Socket.io global exportable
export const getIO = () => io

// Gérer les connexions Socket
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`)

  socket.on('join', (role: string) => {
    socket.join(role)
    console.log(`🟢 ${socket.id} joined room: ${role}`)
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})
initCronJobs(); // NOUVEAU

// Lancer le serveur
const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

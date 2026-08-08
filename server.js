const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const { Chat, Orders } = require('./lib/models');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, { path: '/socket.io' });

  // ---- Live support chat ----
  const chatNs = io.of('/chat');
  chatNs.on('connection', (socket) => {
    socket.on('join', ({ roomId }) => {
      socket.join(roomId);
      socket.emit('history', Chat.history(roomId));
    });

    socket.on('message', ({ roomId, userId, sender, message }) => {
      if (!roomId || !message || !message.trim()) return;
      const saved = Chat.save({ roomId, userId, sender, message: message.trim() });
      chatNs.to(roomId).emit('message', saved);
    });

    socket.on('typing', ({ roomId, sender }) => {
      socket.to(roomId).emit('typing', { sender });
    });
  });

  // ---- Live order tracking ----
  const orderNs = io.of('/orders');
  orderNs.on('connection', (socket) => {
    socket.on('track', ({ orderId }) => {
      socket.join(`order:${orderId}`);
      const order = Orders.byId(orderId);
      if (order) socket.emit('status', { status: order.status, updatedAt: order.updatedAt });
    });
  });

  // Expose io globally so API routes (admin status updates) can broadcast
  global.__io = io;

  httpServer.listen(port, () => {
    console.log(`> GadgetBD ready on http://localhost:${port}`);
  });
});

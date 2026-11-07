import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { gameManager } from './src/game/serverManager';
import { ClientAction, ServerMessage } from './src/types/game';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'Get Out! Escape the Fortress' });
  });

  app.get('/api/game/:roomId', (req, res) => {
    const game = gameManager.getOrCreateGame(req.params.roomId);
    res.json(game);
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  interface ClientMeta {
    ws: WebSocket;
    roomId: string;
    playerId: string;
  }

  const clients = new Map<WebSocket, ClientMeta>();

  function broadcastToRoom(roomId: string, message: ServerMessage) {
    const data = JSON.stringify(message);
    for (const [ws, meta] of clients.entries()) {
      if (meta.roomId === roomId && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  wss.on('connection', (ws, req) => {
    let currentRoomId = 'fortress-escape';
    let currentPlayerId = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      if (req.url) {
        const parsedUrl = new URL(req.url, 'http://localhost:3000');
        const roomParam = parsedUrl.searchParams.get('room');
        if (roomParam) currentRoomId = roomParam;
        const playerParam = parsedUrl.searchParams.get('playerId');
        if (playerParam) currentPlayerId = playerParam;
      }
    } catch {
      // ignore url parsing error
    }

    clients.set(ws, { ws, roomId: currentRoomId, playerId: currentPlayerId });

    const game = gameManager.getOrCreateGame(currentRoomId);
    const initMsg: ServerMessage = {
      type: 'INIT_STATE',
      state: game,
      yourPlayerId: currentPlayerId,
    };
    ws.send(JSON.stringify(initMsg));

    ws.on('message', (raw) => {
      try {
        const action = JSON.parse(raw.toString()) as ClientAction;
        const meta = clients.get(ws);
        if (!meta) return;

        if (action.type === 'JOIN' && action.roomId) {
          meta.roomId = action.roomId;
        }

        const updatedState = gameManager.handleAction(meta.roomId, meta.playerId, action);

        broadcastToRoom(meta.roomId, {
          type: 'STATE_UPDATE',
          state: updatedState,
        });
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      const meta = clients.get(ws);
      if (meta) {
        const game = gameManager.getGame(meta.roomId);
        if (game) {
          const player = game.players.find((p) => p.id === meta.playerId);
          if (player) {
            player.connected = false;
            broadcastToRoom(meta.roomId, {
              type: 'STATE_UPDATE',
              state: game,
            });
          }
        }
        clients.delete(ws);
      }
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🏰 "Get Out! Escape the Fortress" server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

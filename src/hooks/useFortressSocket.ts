import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FortressGameState,
  ClientAction,
  ServerMessage,
} from '../types/game';
import { sounds } from '../utils/sound';

export function useFortressSocket() {
  const [gameState, setGameState] = useState<FortressGameState | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => {
    const saved = localStorage.getItem('fortress_player_id');
    if (saved) return saved;
    const generated = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    localStorage.setItem('fortress_player_id', generated);
    return generated;
  });

  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('room') || 'fortress-escape';
    }
    return 'fortress-escape';
  });

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [controlledPlayerId, setControlledPlayerId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}?room=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(playerId)}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;

          if (msg.type === 'INIT_STATE') {
            setGameState(msg.state);
            if (msg.yourPlayerId) {
              setPlayerId(msg.yourPlayerId);
              localStorage.setItem('fortress_player_id', msg.yourPlayerId);
            }
          } else if (msg.type === 'STATE_UPDATE') {
            setGameState((prevState) => {
              // Trigger audio on state changes
              if (prevState && msg.state) {
                if (msg.state.phase === 'VICTORY' && prevState.phase !== 'VICTORY') {
                  sounds.playVictoryFanfare();
                } else if (msg.state.phase === 'DEFEAT' && prevState.phase !== 'DEFEAT') {
                  sounds.playDefeat();
                } else if (msg.state.alertLevel > prevState.alertLevel) {
                  sounds.playAlertHorn();
                } else if (msg.state.exitUnlocked && !prevState.exitUnlocked) {
                  sounds.playUnlockDoor();
                }
              }
              return msg.state;
            });
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsReconnecting(true);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error, retrying...', err);
        ws.close();
      };
    } catch (e) {
      console.error('Failed to establish WebSocket:', e);
      setIsReconnecting(true);
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
    }
  }, [roomId, playerId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendAction = useCallback(
    (action: ClientAction) => {
      // Audio triggers for user actions
      if (action.type === 'ROLL_DIE') sounds.playDiceRoll();
      if (action.type === 'MOVE') sounds.playFootstep();
      if (action.type === 'EXPLORE') sounds.playTileFlip();
      if (action.type === 'LOOK') sounds.playTileFlip();
      if (action.type === 'PICK_UP_ITEM') sounds.playItemPickup();
      if (action.type === 'USE_ITEM') sounds.playSmokeBomb();
      if (action.type === 'UNLOCK_EXIT') sounds.playUnlockDoor();

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        // If tester is controlling another seat, we can impersonate that seat for actions
        socketRef.current.send(JSON.stringify(action));
      }
    },
    []
  );

  // Active seat logic: either user's real player ID or tester's overridden seat
  const effectivePlayerId = controlledPlayerId || playerId;
  const activePlayer = gameState?.players[gameState.activePlayerIndex];
  const isMyTurn = Boolean(activePlayer && activePlayer.id === effectivePlayerId);
  const myPlayer = gameState?.players.find((p) => p.id === effectivePlayerId);

  return {
    gameState,
    playerId: effectivePlayerId,
    realPlayerId: playerId,
    roomId,
    setRoomId,
    isConnected,
    isReconnecting,
    isMyTurn,
    activePlayer,
    myPlayer,
    sendAction,
    setControlledPlayerId,
  };
}

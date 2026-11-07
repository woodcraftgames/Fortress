import React, { useState } from 'react';
import { useFortressSocket } from './hooks/useFortressSocket';
import { FortressBoard } from './components/FortressBoard';
import { DiceTray } from './components/DiceTray';
import { PlayerRoster } from './components/PlayerRoster';
import { FortressAlert } from './components/FortressAlert';
import { EventLog } from './components/EventLog';
import { ChamberInspector } from './components/ChamberInspector';
import { LobbyModal } from './components/LobbyModal';
import { RulesModal } from './components/RulesModal';
import { GameOverModal } from './components/GameOverModal';
import { sounds } from './utils/sound';
import { CHARACTERS } from './game/engine';
import {
  Castle,
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  Wifi,
  WifiOff,
  Copy,
  Check,
  PlusCircle,
} from 'lucide-react';

export default function App() {
  const {
    gameState,
    playerId,
    realPlayerId,
    roomId,
    setRoomId,
    isConnected,
    isReconnecting,
    isMyTurn,
    myPlayer,
    sendAction,
    setControlledPlayerId,
  } = useFortressSocket();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ x: number; y: number } | null>({
    x: 2,
    y: 6,
  });

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleCopyInvite = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleJoinGame = (name: string, characterId: string) => {
    sendAction({
      type: 'JOIN',
      name,
      characterId,
      roomId,
    });
  };

  const handleStartSolo = () => {
    sendAction({
      type: 'JOIN',
      name: 'Valen (Solo)',
      characterId: CHARACTERS[0].id,
      roomId,
    });
  };

  const handleAddTestAlly = () => {
    if (!gameState) return;
    const currentCount = gameState.players.length;
    if (currentCount >= 4) return;

    const char = CHARACTERS[currentCount % CHARACTERS.length];
    // In our websocket engine, joining with a distinct synthetic ID
    sendAction({
      type: 'JOIN',
      name: `${char.name.split(' ')[0]} (Ally)`,
      characterId: char.id,
      roomId,
    });
  };

  const handleTileAction = (actionType: 'MOVE' | 'LOOK' | 'EXPLORE', x: number, y: number) => {
    setSelectedCoords({ x, y });
    if (actionType === 'MOVE') {
      sendAction({ type: 'MOVE', targetX: x, targetY: y });
    } else if (actionType === 'LOOK') {
      sendAction({ type: 'LOOK', targetX: x, targetY: y });
    } else if (actionType === 'EXPLORE') {
      sendAction({ type: 'EXPLORE', targetX: x, targetY: y });
    }
  };

  const selectedTile =
    gameState && selectedCoords
      ? gameState.tiles[selectedCoords.y]?.[selectedCoords.x] || null
      : null;

  const isUserInGame = Boolean(gameState && gameState.players.some((p) => p.id === playerId));

  return (
    <div className="min-h-screen bg-[#110d0a] text-stone-200 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Medieval Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1b1511]/95 backdrop-blur-md border-b-2 border-[#3d2c1e] px-4 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/60 shadow flex items-center justify-center text-amber-200">
              <Castle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-black text-amber-200 text-base sm:text-lg tracking-wide uppercase drop-shadow">
                  Get Out! Escape the Fortress
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-700/50 text-[10px] font-mono text-amber-400">
                  2D Board Game
                </span>
              </div>
              <p className="text-[10px] text-stone-400 hidden sm:block font-serif">
                Co-op Escape for 1–4 Players • 5×7 Medieval Fortress
              </p>
            </div>
          </div>

          {/* Controls & Connection Status */}
          <div className="flex items-center gap-2">
            {/* Connection Pill */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border ${
                isConnected
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                  : 'bg-amber-950/70 border-amber-800 text-amber-400'
              }`}
              title={isConnected ? 'Connected to Multiplayer Server' : 'Connecting/Reconnecting...'}
            >
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 animate-pulse" />}
              <span className="hidden md:inline">{isConnected ? 'Synced' : 'Connecting'}</span>
            </div>

            {/* Invite Button */}
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#281e16] hover:bg-[#382b20] border border-amber-700/40 text-amber-300 rounded text-xs font-serif cursor-pointer shadow transition-colors"
              title="Copy session link for other players to join"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Invite'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 bg-[#281e16] hover:bg-[#382b20] border border-[#443324] text-stone-300 hover:text-amber-200 rounded cursor-pointer"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>

            {/* Rules Codex */}
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#281e16] hover:bg-[#382b20] border border-amber-700/50 text-amber-200 rounded text-xs font-serif cursor-pointer shadow"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {/* Reset Game */}
            <button
              onClick={() => sendAction({ type: 'RESTART_GAME' })}
              className="p-1.5 bg-[#281e16] hover:bg-rose-950/80 border border-[#443324] hover:border-rose-700 text-stone-400 hover:text-rose-300 rounded cursor-pointer"
              title="Reset Fortress Board"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {gameState ? (
        <main className="max-w-7xl mx-auto w-full p-2 sm:p-4 flex-1 flex flex-col lg:flex-row gap-4 items-start justify-center">
          
          {/* Left Column: Roster & Alert Tracker */}
          <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0 order-2 lg:order-1">
            <PlayerRoster
              gameState={gameState}
              myPlayerId={playerId}
              onSelectSeat={(seatId) => setControlledPlayerId(seatId)}
              onAddTestAlly={handleAddTestAlly}
            />

            <FortressAlert gameState={gameState} />
          </div>

          {/* Center Column: The 5x7 Board & Action Tray */}
          <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-2xl order-1 lg:order-2">
            <FortressBoard
              gameState={gameState}
              myPlayer={myPlayer}
              isMyTurn={isMyTurn}
              selectedTile={selectedCoords}
              onSelectTile={(x, y) => setSelectedCoords({ x, y })}
              onActionClick={handleTileAction}
            />

            <DiceTray
              gameState={gameState}
              myPlayer={myPlayer}
              isMyTurn={isMyTurn}
              onRollDie={() => sendAction({ type: 'ROLL_DIE' })}
              onEndTurn={() => sendAction({ type: 'END_TURN' })}
              onPickupItem={(itemId) => sendAction({ type: 'PICK_UP_ITEM', itemId })}
              onUseItem={(itemId) => sendAction({ type: 'USE_ITEM', itemId })}
              onUnlockExit={() => sendAction({ type: 'UNLOCK_EXIT' })}
              onEscape={() => sendAction({ type: 'ESCAPE' })}
            />
          </div>

          {/* Right Column: Chamber Survey & Chronicle Logs */}
          <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0 order-3">
            <ChamberInspector
              tile={selectedTile}
              gameState={gameState}
            />

            <EventLog events={gameState.events} />
          </div>
        </main>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-stone-400 font-serif">
          <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mb-4" />
          <p className="text-sm">Assembling fortress chambers...</p>
        </div>
      )}

      {/* Lobby / Join Modal (if not yet joined) */}
      {gameState && !isUserInGame && (
        <LobbyModal
          roomId={roomId}
          onJoin={handleJoinGame}
          onStartSolo={handleStartSolo}
          onOpenRules={() => setShowRules(true)}
        />
      )}

      {/* Rules Codex Modal */}
      {showRules && (
        <RulesModal
          onClose={() => setShowRules(false)}
          settings={gameState?.settings}
          onUpdateSettings={(newSettings) =>
            sendAction({ type: 'UPDATE_SETTINGS', settings: newSettings })
          }
        />
      )}

      {/* Victory / Defeat Modal */}
      {gameState && (gameState.phase === 'VICTORY' || gameState.phase === 'DEFEAT') && (
        <GameOverModal
          gameState={gameState}
          onRestart={() => sendAction({ type: 'RESTART_GAME' })}
        />
      )}

      {/* Footer Info */}
      <footer className="py-2.5 px-4 text-center border-t border-[#2d2117] text-[11px] text-stone-500 font-serif">
        "Get Out! Escape the Fortress" • Turn-based 2D Medieval Cooperative Board Game for 1–4 Players
      </footer>
    </div>
  );
}

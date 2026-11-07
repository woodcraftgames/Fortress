import React, { useState } from 'react';
import {
  FortressGameState,
  Player,
  GameItem,
} from '../types/game';
import {
  Dices,
  Footprints,
  Eye,
  Compass,
  Key,
  Wind,
  Bone,
  Wrench,
  CheckCircle2,
  Unlock,
  Award,
  Zap,
} from 'lucide-react';

interface DiceTrayProps {
  gameState: FortressGameState;
  myPlayer?: Player;
  isMyTurn: boolean;
  onRollDie: () => void;
  onEndTurn: () => void;
  onPickupItem: (itemId: string) => void;
  onUseItem: (itemId: string) => void;
  onUnlockExit: () => void;
  onEscape: () => void;
}

export const DiceTray: React.FC<DiceTrayProps> = ({
  gameState,
  myPlayer,
  isMyTurn,
  onRollDie,
  onEndTurn,
  onPickupItem,
  onUseItem,
  onUnlockExit,
  onEscape,
}) => {
  const { phase, currentDie, apRemaining, apTotal, activePlayerIndex, players, tiles, exitUnlocked } = gameState;
  const activePlayer = players[activePlayerIndex];

  const [isRollingAnim, setIsRollingAnim] = useState(false);

  const handleRollClick = () => {
    setIsRollingAnim(true);
    setTimeout(() => {
      setIsRollingAnim(false);
    }, 600);
    onRollDie();
  };

  const currentTile = myPlayer && myPlayer.y < tiles.length && myPlayer.x < tiles[0].length
    ? tiles[myPlayer.y][myPlayer.x]
    : null;

  const hasKeyInPack = myPlayer?.inventory.some((i) => i.type === 'IRON_KEY');
  const isAtExit = myPlayer && myPlayer.x === 2 && myPlayer.y === 0;

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl bg-gradient-to-b from-[#241d17] to-[#171310] border-2 border-[#543e2c] p-4 shadow-xl text-stone-200">
      {/* Top Banner: Turn Status */}
      <div className="flex items-center justify-between pb-3 border-b border-[#3d2c1e]">
        <div className="flex items-center gap-2.5">
          {activePlayer ? (
            <>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow border"
                style={{
                  backgroundColor: activePlayer.character.bgHex,
                  borderColor: activePlayer.character.borderHex,
                  color: activePlayer.character.accentHex,
                }}
              >
                {activePlayer.character.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-amber-200 text-sm">
                    {activePlayer.name}
                  </span>
                  {isMyTurn && (
                    <span className="px-1.5 py-0.5 bg-emerald-600/80 text-white rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                      Your Turn
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400">
                  {phase === 'PLAYER_ROLL'
                    ? 'Awaiting Action Die Roll...'
                    : phase === 'PLAYER_ACTION'
                    ? `${apRemaining} AP left to spend`
                    : phase === 'FORTRESS_PHASE'
                    ? 'Guards & Hounds are patrolling!'
                    : 'Turn in progress'}
                </p>
              </div>
            </>
          ) : (
            <span className="text-stone-400 text-sm font-serif">Awaiting players to gather...</span>
          )}
        </div>

        {/* Phase Pill */}
        <div className="px-2 py-1 rounded bg-[#100d0b] border border-[#3d2c1e] text-[11px] font-mono text-amber-400">
          TURN {gameState.currentTurn} • ROUND {Math.ceil(gameState.currentTurn / Math.max(1, players.length))}
        </div>
      </div>

      {/* Main Dice & AP Action Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 items-center">
        {/* Felt-Lined Dice Tray */}
        <div className="relative p-3 rounded-lg bg-[#0e1d15] border-2 border-[#234330] shadow-inner flex flex-col items-center justify-center min-h-[120px]">
          <span className="text-[9px] uppercase tracking-widest text-emerald-400/60 font-mono mb-1">
            ROYAL ACTION DIE
          </span>

          <div className="flex items-center justify-center gap-3">
            {/* 3D Die Rendering */}
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br from-[#f8f5ee] via-[#e5ded0] to-[#c2b9a7] text-stone-900 border-2 border-[#8c7b64] shadow-lg flex flex-col items-center justify-center font-bold text-2xl transition-transform duration-300 ${
                isRollingAnim ? 'rotate-[360deg] scale-110' : 'hover:scale-105'
              }`}
            >
              {currentDie ? (
                <span className="font-serif font-black">{currentDie.value}</span>
              ) : (
                <Dices className="w-7 h-7 text-stone-600" />
              )}
            </div>

            {/* Die Breakdown */}
            <div className="text-left">
              {currentDie ? (
                <>
                  <p className="text-xs font-serif font-bold text-amber-200">
                    {currentDie.label}
                  </p>
                  <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                    Granted +{currentDie.actionPoints} Action Points
                  </p>
                </>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  Roll the D6 to obtain Action Points for moving, peeking, and exploring!
                </p>
              )}
            </div>
          </div>

          {/* Roll Button */}
          {isMyTurn && phase === 'PLAYER_ROLL' && (
            <button
              onClick={handleRollClick}
              disabled={isRollingAnim}
              className="mt-3 w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-bold text-sm rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ring-1 ring-amber-300"
            >
              <Dices className="w-4 h-4 animate-spin" />
              <span>ROLL ACTION DIE</span>
            </button>
          )}
        </div>

        {/* Action Points Pip Tracker & Quick Controls */}
        <div className="flex flex-col justify-between h-full space-y-2">
          {/* AP Pips */}
          <div className="p-2.5 rounded-lg bg-[#14100d] border border-[#3d2c1e]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-serif font-semibold text-amber-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Action Points (AP)
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {apRemaining} / {apTotal}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.max(apTotal, 5) }).map((_, idx) => {
                const isActive = idx < apRemaining;
                const isMax = idx < apTotal;
                return (
                  <div
                    key={`pip-${idx}`}
                    className={`h-3 flex-1 rounded transition-all ${
                      isActive
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : isMax
                        ? 'bg-[#2b221a] border border-[#4a392b]'
                        : 'bg-[#181310] opacity-40'
                    }`}
                  />
                );
              })}
            </div>

            <div className="mt-2 text-[10px] text-stone-400 flex justify-between">
              <span>• Move: 1 AP</span>
              <span>• Look: 1 AP</span>
              <span>• Explore: 1 AP</span>
            </div>
          </div>

          {/* Contextual Actions (Pick up, Unlock, Escape) */}
          <div className="flex flex-wrap gap-2">
            {/* Pick up item */}
            {isMyTurn && currentTile && currentTile.items.length > 0 && (
              <div className="w-full flex gap-1.5">
                {currentTile.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onPickupItem(item.id)}
                    className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Take {item.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Unlock Exit */}
            {isMyTurn && isAtExit && !exitUnlocked && hasKeyInPack && (
              <button
                onClick={onUnlockExit}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg animate-bounce"
              >
                <Unlock className="w-4 h-4" />
                <span>UNLOCK FORTRESS EXIT (USE IRON KEY)</span>
              </button>
            )}

            {/* Escape! */}
            {isMyTurn && isAtExit && exitUnlocked && (
              <button
                onClick={onEscape}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-400 hover:brightness-110 text-stone-950 rounded-lg text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl ring-2 ring-emerald-300 animate-pulse"
              >
                <Award className="w-5 h-5" />
                <span>ESCAPE THE FORTRESS!</span>
              </button>
            )}

            {/* End Turn */}
            {isMyTurn && phase === 'PLAYER_ACTION' && (
              <button
                onClick={onEndTurn}
                className="w-full py-1.5 bg-[#3a2c20] hover:bg-[#4d3b2b] text-stone-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
                <span>End My Turn</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Player Inventory Tray */}
      {myPlayer && (
        <div className="pt-2.5 border-t border-[#3d2c1e] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-200/90 font-serif">
            <span>Pack ({myPlayer.inventory.length}/4):</span>
          </div>

          <div className="flex items-center gap-2">
            {myPlayer.inventory.length === 0 ? (
              <span className="text-[11px] text-stone-500 italic">No equipment carried</span>
            ) : (
              myPlayer.inventory.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center gap-1 px-2 py-1 bg-[#1a1410] border border-amber-700/50 rounded text-[11px] font-medium text-stone-300"
                >
                  {item.type === 'IRON_KEY' && <Key className="w-3.5 h-3.5 text-amber-400" />}
                  {item.type === 'SMOKE_BOMB' && <Wind className="w-3.5 h-3.5 text-stone-300" />}
                  {item.type === 'MEAT_CHUNK' && <Bone className="w-3.5 h-3.5 text-rose-300" />}
                  {item.type === 'LOCKPICK' && <Wrench className="w-3.5 h-3.5 text-stone-400" />}
                  <span>{item.name}</span>

                  {/* Use Item Button if actionable */}
                  {(item.type === 'SMOKE_BOMB' || item.type === 'MEAT_CHUNK' || item.type === 'LOCKPICK') && (
                    <button
                      onClick={() => onUseItem(item.id)}
                      className="ml-1 px-1 py-0.5 bg-amber-700 hover:bg-amber-600 text-[9px] text-white rounded font-bold cursor-pointer"
                      title="Use now"
                    >
                      Use
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

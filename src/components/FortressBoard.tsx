import React from 'react';
import {
  BoardTile,
  Enemy,
  Player,
  FortressGameState,
} from '../types/game';
import { isAdjacent } from '../game/engine';
import {
  Key,
  Shield,
  Eye,
  Compass,
  Footprints,
  Flame,
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle,
  Skull,
  Award,
  CircleDot,
  Bone,
  Wind,
} from 'lucide-react';

interface FortressBoardProps {
  gameState: FortressGameState;
  myPlayer?: Player;
  isMyTurn: boolean;
  selectedTile: { x: number; y: number } | null;
  onSelectTile: (x: number, y: number) => void;
  onActionClick: (actionType: 'MOVE' | 'LOOK' | 'EXPLORE', x: number, y: number) => void;
}

export const FortressBoard: React.FC<FortressBoardProps> = ({
  gameState,
  myPlayer,
  isMyTurn,
  selectedTile,
  onSelectTile,
  onActionClick,
}) => {
  const { boardWidth, boardHeight, tiles, players, enemies, apRemaining, phase } = gameState;

  const canAct = isMyTurn && phase === 'PLAYER_ACTION' && apRemaining > 0 && myPlayer && !myPlayer.isEscaped;

  return (
    <div className="relative select-none flex flex-col items-center">
      {/* Decorative Board Frame */}
      <div className="relative p-3 md:p-6 rounded-2xl bg-gradient-to-b from-[#241c15] via-[#1a1410] to-[#120e0c] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-[#523d2b] ring-1 ring-[#8c6744]/40">
        
        {/* Brass Corner Brackets */}
        <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-amber-500/70 pointer-events-none rounded-tl" />
        <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-amber-500/70 pointer-events-none rounded-tr" />
        <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-amber-500/70 pointer-events-none rounded-bl" />
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-amber-500/70 pointer-events-none rounded-br" />

        {/* Board Header Banner */}
        <div className="flex items-center justify-between pb-3 px-2 border-b border-[#3d2c1e] text-xs font-serif tracking-wider text-amber-200/70">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            HIGH FORTRESS BATTLEMENTS (NORTH)
          </span>
          <span className="font-mono text-[10px] text-amber-400/50">5 × 7 STONE CHAMBERS</span>
          <span className="flex items-center gap-1.5">
            DEEP CELL DUNGEONS (SOUTH)
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </span>
        </div>

        {/* The 5x7 Grid */}
        <div
          className="grid grid-cols-5 gap-2 md:gap-3.5 pt-3"
          style={{ width: 'fit-content' }}
        >
          {tiles.map((row, y) =>
            row.map((tile, x) => {
              const tilePlayers = players.filter((p) => p.x === x && p.y === y);
              const tileEnemies = enemies.filter((e) => e.x === x && e.y === y);
              const isSelected = selectedTile?.x === x && selectedTile?.y === y;
              const isMyTile = myPlayer && myPlayer.x === x && myPlayer.y === y;
              const isTileAdjacent = myPlayer ? isAdjacent(myPlayer.x, myPlayer.y, x, y) : false;

              const isExitTile = x === 2 && y === 0;
              const isJailTile = x === 2 && y === 6;

              return (
                <div
                  key={`tile-${x}-${y}`}
                  onClick={() => onSelectTile(x, y)}
                  className={`relative w-16 h-18 sm:w-20 sm:h-22 md:w-24 md:h-28 rounded-lg transition-all duration-200 cursor-pointer flex flex-col justify-between p-1.5 overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] z-20 scale-[1.02]'
                      : 'hover:border-amber-700/60'
                  } ${
                    tile.revealed
                      ? isExitTile
                        ? 'bg-gradient-to-b from-[#2b1b17] to-[#1a1110] border-2 border-amber-600/80 shadow-inner'
                        : isJailTile
                        ? 'bg-gradient-to-b from-[#1b1c24] to-[#0e0f14] border-2 border-indigo-700/80 shadow-inner'
                        : 'bg-gradient-to-b from-[#2c2621] to-[#1a1714] border border-[#4a3b2f] shadow-inner'
                      : tile.peeked
                      ? 'bg-gradient-to-b from-[#28211b] to-[#1c1612] border border-dashed border-amber-500/60'
                      : 'bg-gradient-to-b from-[#1e1b18] to-[#141210] border border-[#33271c] hover:border-[#523d2b]'
                  }`}
                >
                  {/* Fog of war / Carved Stone Back */}
                  {!tile.revealed && !tile.peeked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1 opacity-70 pointer-events-none">
                      <div className="w-8 h-8 rounded-full border border-[#443324] flex items-center justify-center bg-[#171412] shadow-inner">
                        <span className="text-[#6d5138] text-xs font-serif font-black">†</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#5c4634] mt-1 tracking-widest">
                        {x},{y}
                      </span>
                    </div>
                  )}

                  {/* Peeked Parchment Style */}
                  {!tile.revealed && tile.peeked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-1 bg-amber-950/20 backdrop-blur-[1px] pointer-events-none">
                      <div className="flex items-center gap-1 w-full justify-between">
                        <span className="text-[8px] font-mono text-amber-400/80 bg-amber-950/80 px-1 rounded">
                          PEEKED
                        </span>
                        <Eye className="w-3 h-3 text-amber-400 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-serif text-amber-200 font-semibold line-clamp-1">
                          {tile.name}
                        </p>
                        {tile.items.length > 0 && (
                          <span className="text-[8px] text-amber-400 flex items-center justify-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> Item Inside
                          </span>
                        )}
                      </div>
                      <span className="text-[8px] font-mono text-stone-500">{x},{y}</span>
                    </div>
                  )}

                  {/* Revealed Tile Contents */}
                  {tile.revealed && (
                    <>
                      {/* Top Header of Tile */}
                      <div className="flex items-center justify-between w-full z-10">
                        <span className="text-[8px] sm:text-[9px] font-mono text-stone-400 font-medium">
                          {x},{y}
                        </span>

                        {/* Special Room Badges */}
                        {isExitTile && (
                          <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold ${
                            gameState.exitUnlocked ? 'bg-emerald-950 text-emerald-400 border border-emerald-500' : 'bg-rose-950 text-rose-400 border border-rose-600'
                          }`}>
                            {gameState.exitUnlocked ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                            {gameState.exitUnlocked ? 'EXIT OPEN' : 'EXIT LOCKED'}
                          </div>
                        )}

                        {isJailTile && (
                          <span className="px-1 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-700 rounded text-[8px] font-semibold">
                            JAIL CELL
                          </span>
                        )}

                        {tile.type === 'WARDEN_OFFICE' && !isExitTile && !isJailTile && (
                          <span className="text-[8px] text-amber-400 font-serif font-bold">WARDEN</span>
                        )}

                        {tile.type === 'ARMORY' && (
                          <span className="text-[8px] text-stone-300 font-serif">ARMORY</span>
                        )}

                        {tile.type === 'KENNEL' && (
                          <span className="text-[8px] text-amber-300 font-serif">KENNEL</span>
                        )}
                      </div>

                      {/* Middle Illustration / Room Name */}
                      <div className="flex flex-col items-center justify-center my-auto z-10 text-center">
                        {isExitTile ? (
                          <div className="relative">
                            <Lock className={`w-5 h-5 md:w-6 md:h-6 ${gameState.exitUnlocked ? 'text-emerald-400' : 'text-amber-500'}`} />
                          </div>
                        ) : isJailTile ? (
                          <div className="text-indigo-400 font-serif text-[11px] font-bold tracking-tight">
                            DUNGEON BARS
                          </div>
                        ) : (
                          <p className="text-[9px] sm:text-[10px] md:text-[11px] font-serif font-medium text-stone-300 leading-tight line-clamp-1">
                            {tile.name.replace(/Hallway \(\d+, \d+\)/, 'Corridor')}
                          </p>
                        )}

                        {/* Item on Tile */}
                        {tile.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold animate-bounce shadow-sm ${
                              item.type === 'IRON_KEY'
                                ? 'bg-amber-500 text-stone-950 ring-1 ring-amber-300'
                                : 'bg-stone-800 text-amber-200 border border-amber-600/50'
                            }`}
                          >
                            {item.type === 'IRON_KEY' && <Key className="w-2.5 h-2.5 shrink-0" />}
                            {item.type === 'SMOKE_BOMB' && <Wind className="w-2.5 h-2.5 shrink-0" />}
                            {item.type === 'MEAT_CHUNK' && <Bone className="w-2.5 h-2.5 shrink-0" />}
                            {item.type === 'TORCH' && <Flame className="w-2.5 h-2.5 shrink-0 text-orange-400" />}
                            <span className="truncate max-w-[50px]">{item.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Room Decor Hint */}
                      <div className="w-full flex justify-between items-center text-[8px] text-stone-500 font-serif">
                        <span className="truncate max-w-[65px]">{tile.decor}</span>
                        {tile.hazard && <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />}
                      </div>
                    </>
                  )}

                  {/* TOKENS LAYER (Players & Enemies) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 p-1">
                    <div className="flex flex-wrap items-center justify-center gap-1 max-w-full">
                      {/* Enemy Tokens */}
                      {tileEnemies.map((enemy) => (
                        <div
                          key={enemy.id}
                          title={`${enemy.name} (${enemy.type})`}
                          className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-lg border-2 ring-1 transition-transform ${
                            enemy.type === 'CAPTAIN'
                              ? 'bg-gradient-to-br from-amber-600 to-amber-950 border-amber-400 ring-amber-300 text-amber-100'
                              : enemy.type === 'HOUND'
                              ? 'bg-gradient-to-br from-stone-800 to-stone-950 border-rose-600 ring-rose-500 text-rose-300'
                              : 'bg-gradient-to-br from-red-800 to-red-950 border-red-500 ring-red-400 text-white'
                          } ${enemy.isStunned ? 'opacity-60 grayscale' : 'animate-pulse'}`}
                        >
                          {enemy.type === 'CAPTAIN' ? (
                            <Shield className="w-3.5 h-3.5" />
                          ) : enemy.type === 'HOUND' ? (
                            <Bone className="w-3.5 h-3.5" />
                          ) : (
                            <Skull className="w-3.5 h-3.5" />
                          )}

                          {enemy.isStunned && (
                            <span className="absolute -top-1 -right-1 text-[8px] bg-indigo-600 text-white font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                              Z
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Player Tokens */}
                      {tilePlayers.map((player) => {
                        const isThisMe = myPlayer && player.id === myPlayer.id;
                        return (
                          <div
                            key={player.id}
                            title={`${player.name} (${player.character.name})${player.isCaptured ? ' [CAPTURED]' : ''}${player.isEscaped ? ' [ESCAPED]' : ''}`}
                            className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xl border-2 ring-2 transition-transform hover:scale-110 ${
                              isThisMe ? 'scale-110 ring-amber-300 z-10' : 'ring-black/40'
                            }`}
                            style={{
                              backgroundColor: player.character.bgHex,
                              borderColor: player.character.borderHex,
                              color: player.character.accentHex,
                            }}
                          >
                            <span className="text-[10px] font-black uppercase">
                              {player.character.name.charAt(0)}
                            </span>

                            {player.isCaptured && (
                              <div className="absolute -top-1.5 -right-1.5 bg-rose-700 text-white rounded-full p-0.5 shadow">
                                <Lock className="w-2.5 h-2.5" />
                              </div>
                            )}

                            {player.isEscaped && (
                              <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-stone-950 rounded-full p-0.5 shadow">
                                <Award className="w-2.5 h-2.5" />
                              </div>
                            )}

                            {isThisMe && (
                              <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ADJACENCY ACTION OVERLAYS FOR ACTIVE PLAYER */}
                  {canAct && isTileAdjacent && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] z-40 flex items-center justify-center gap-1 p-0.5 pointer-events-auto">
                      {tile.revealed ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onActionClick('MOVE', x, y);
                          }}
                          className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded text-[9px] font-bold shadow flex items-center gap-0.5 cursor-pointer"
                          title="Move to this chamber (Costs 1 AP)"
                        >
                          <Footprints className="w-3 h-3" />
                          <span>Move</span>
                        </button>
                      ) : (
                        <div className="flex flex-col gap-1 w-full px-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onActionClick('LOOK', x, y);
                            }}
                            className="w-full py-1 bg-amber-700 hover:bg-amber-600 active:scale-95 text-white rounded text-[8px] font-bold shadow flex items-center justify-center gap-0.5 cursor-pointer"
                            title="Look: Peek without moving (Costs 1 AP)"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>Look</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onActionClick('EXPLORE', x, y);
                            }}
                            className="w-full py-1 bg-indigo-700 hover:bg-indigo-600 active:scale-95 text-white rounded text-[8px] font-bold shadow flex items-center justify-center gap-0.5 cursor-pointer"
                            title="Explore: Step into darkness & reveal (Costs 1 AP)"
                          >
                            <Compass className="w-2.5 h-2.5" />
                            <span>Explore</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Board Legend */}
        <div className="mt-3 pt-2 border-t border-[#3d2c1e] flex flex-wrap items-center justify-between text-[10px] text-stone-400 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-800 border border-emerald-400 inline-block" /> Prisoner
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-900 border border-red-500 inline-block" /> Guard
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-stone-900 border border-rose-600 inline-block" /> Hound
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-700 border border-amber-300 inline-block" /> Captain
            </span>
          </div>

          <div className="flex items-center gap-2 text-amber-300/80 font-mono text-[9px]">
            <span>Click any tile to inspect details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

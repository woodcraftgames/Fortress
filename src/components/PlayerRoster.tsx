import React from 'react';
import { Player, FortressGameState } from '../types/game';
import {
  Users,
  Lock,
  Award,
  Key,
  Shield,
  Eye,
  UserCheck,
  PlusCircle,
} from 'lucide-react';

interface PlayerRosterProps {
  gameState: FortressGameState;
  myPlayerId: string;
  onSelectSeat?: (playerId: string) => void;
  onAddTestAlly?: () => void;
}

export const PlayerRoster: React.FC<PlayerRosterProps> = ({
  gameState,
  myPlayerId,
  onSelectSeat,
  onAddTestAlly,
}) => {
  const { players, activePlayerIndex, settings } = gameState;

  return (
    <div className="rounded-xl bg-[#1c1612] border border-[#423223] p-3 text-stone-300 shadow-md">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#33261a]">
        <div className="flex items-center gap-1.5 font-serif text-sm font-bold text-amber-200">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Prisoners ({players.length}/{settings.maxPlayers})</span>
        </div>

        {/* Solo test ally spawner */}
        {players.length < settings.maxPlayers && onAddTestAlly && (
          <button
            onClick={onAddTestAlly}
            className="text-[10px] px-2 py-0.5 bg-[#2c221a] hover:bg-[#3d2e23] border border-amber-700/60 text-amber-300 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="Add a 2nd prisoner seat to test co-op alone"
          >
            <PlusCircle className="w-3 h-3 text-amber-400" />
            <span>+ Add Test Ally</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {players.length === 0 ? (
          <div className="text-xs text-stone-500 italic p-2 text-center">
            No prisoners in cell. Join the escape to begin!
          </div>
        ) : (
          players.map((player, idx) => {
            const isActive = idx === activePlayerIndex;
            const isMe = player.id === myPlayerId;

            return (
              <div
                key={player.id}
                className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-[#14100d] border-[#2c2016]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Token Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow border"
                    style={{
                      backgroundColor: player.character.bgHex,
                      borderColor: player.character.borderHex,
                      color: player.character.accentHex,
                    }}
                  >
                    {player.character.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-serif font-bold text-stone-200">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] bg-stone-800 text-stone-300 px-1 rounded font-mono">
                          YOU
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[9px] bg-amber-600 text-stone-950 px-1 font-bold rounded animate-pulse">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                      <span>{player.character.title}</span>
                      <span>•</span>
                      <span className="font-mono">({player.x}, {player.y})</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges & Controls */}
                <div className="flex items-center gap-1.5">
                  {player.isEscaped ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600">
                      <Award className="w-3 h-3" /> ESCAPED
                    </span>
                  ) : player.isCaptured ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-600">
                      <Lock className="w-3 h-3" /> CAPTURED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
                      Pack: {player.inventory.length}
                    </span>
                  )}

                  {/* Seat switch button for solo tester */}
                  {onSelectSeat && !isMe && (
                    <button
                      onClick={() => onSelectSeat(player.id)}
                      className="text-[9px] px-1.5 py-0.5 bg-[#2a1f16] hover:bg-amber-800 text-stone-300 hover:text-white rounded border border-[#443324] cursor-pointer"
                      title="Switch to controlling this character"
                    >
                      Seat Switch
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

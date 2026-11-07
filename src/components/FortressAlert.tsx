import React from 'react';
import { FortressGameState } from '../types/game';
import {
  ShieldAlert,
  Skull,
  Bone,
  Shield,
  Eye,
  Bell,
} from 'lucide-react';

interface FortressAlertProps {
  gameState: FortressGameState;
}

export const FortressAlert: React.FC<FortressAlertProps> = ({ gameState }) => {
  const { alertLevel, enemies } = gameState;

  const alertLabels = [
    'Level 0: Calm Night',
    'Level 1: Suspicious Whispers',
    'Level 2: Lantern Patrols',
    'Level 3: Search Parties Dispatched',
    'Level 4: High Alert - Bloodhounds Active',
    'Level 5: MAXIMUM FORTRESS LOCKOUT',
  ];

  const alertColors = [
    'bg-emerald-500',
    'bg-lime-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-rose-500',
    'bg-red-600',
  ];

  return (
    <div className="rounded-xl bg-[#1c1612] border border-[#423223] p-3 text-stone-300 shadow-md">
      {/* Alert Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#33261a]">
        <div className="flex items-center gap-1.5 font-serif text-sm font-bold text-amber-200">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Fortress Alert Level</span>
        </div>
        <span className="text-[11px] font-mono text-rose-400 font-bold">
          {alertLevel} / 5
        </span>
      </div>

      {/* Progress Meter */}
      <div className="space-y-1 mb-3">
        <div className="w-full bg-[#120e0b] h-2.5 rounded-full overflow-hidden flex gap-1 p-0.5 border border-[#382b1e]">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <div
              key={lvl}
              className={`flex-1 rounded-full transition-all ${
                lvl <= alertLevel ? alertColors[alertLevel] : 'bg-[#201812]'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-stone-400 text-right font-serif">
          {alertLabels[alertLevel] || alertLabels[1]}
        </p>
      </div>

      {/* Enemy Sentry Roster */}
      <div className="pt-2 border-t border-[#2d2116]">
        <div className="text-[11px] font-serif text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Bell className="w-3 h-3 text-amber-500" />
          <span>Active Sentries</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {enemies.map((enemy) => (
            <div
              key={enemy.id}
              className="p-1.5 rounded bg-[#130f0c] border border-[#261c14] flex items-center justify-between text-[10px]"
            >
              <div className="flex items-center gap-1">
                {enemy.type === 'CAPTAIN' ? (
                  <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                ) : enemy.type === 'HOUND' ? (
                  <Bone className="w-3 h-3 text-rose-400 shrink-0" />
                ) : (
                  <Skull className="w-3 h-3 text-stone-400 shrink-0" />
                )}
                <span className="truncate font-medium text-stone-300 max-w-[75px]">
                  {enemy.name}
                </span>
              </div>

              <div className="font-mono text-stone-500 text-[9px]">
                {enemy.isStunned ? (
                  <span className="text-indigo-400 font-bold">Stunned</span>
                ) : (
                  `(${enemy.x}, ${enemy.y})`
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

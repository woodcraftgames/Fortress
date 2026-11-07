import React from 'react';
import { BoardTile, FortressGameState } from '../types/game';
import { Eye, Key, Shield, Sparkles, AlertTriangle, Compass, MapPin } from 'lucide-react';

interface ChamberInspectorProps {
  tile: BoardTile | null;
  gameState: FortressGameState;
}

export const ChamberInspector: React.FC<ChamberInspectorProps> = ({
  tile,
  gameState,
}) => {
  if (!tile) {
    return (
      <div className="rounded-xl bg-[#1c1612] border border-[#423223] p-3 text-stone-300 shadow-md">
        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[#33261a] font-serif text-sm font-bold text-amber-200">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Chamber Survey</span>
        </div>
        <p className="text-xs text-stone-500 italic p-2 text-center font-serif">
          Click any chamber on the fortress board to survey its details and contents.
        </p>
      </div>
    );
  }

  const { x, y, revealed, peeked, name, description, items, hazard, decor } = tile;
  const isExit = x === 2 && y === 0;
  const isJail = x === 2 && y === 6;

  return (
    <div className="rounded-xl bg-[#1c1612] border border-[#423223] p-3 text-stone-300 shadow-md">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#33261a]">
        <div className="flex items-center gap-1.5 font-serif text-sm font-bold text-amber-200">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Chamber ({x}, {y})</span>
        </div>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            revealed
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : peeked
              ? 'bg-amber-950 text-amber-400 border border-amber-800'
              : 'bg-stone-900 text-stone-400 border border-stone-700'
          }`}
        >
          {revealed ? 'REVEALED' : peeked ? 'PEEKED' : 'UNEXPLORED'}
        </span>
      </div>

      <div>
        <h4 className="font-serif font-bold text-amber-200 text-sm">
          {revealed || peeked ? name : 'Dark Unexplored Stone Vault'}
        </h4>

        <p className="mt-1 text-xs text-stone-400 font-serif leading-relaxed">
          {revealed
            ? description
            : peeked
            ? `Peeking through the keyhole reveals a ${name.toLowerCase()}. Proceed with caution!`
            : 'Heavy oak and granite doors seal this chamber. Use the Look or Explore action from an adjacent tile to uncover what lies within.'}
        </p>

        {/* Items Present */}
        {(revealed || peeked) && items.length > 0 && (
          <div className="mt-2.5 p-2 rounded bg-[#14100d] border border-amber-900/50">
            <span className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" /> Equipment in Chamber:
            </span>
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.id} className="text-xs text-stone-300 flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-200">{item.name}</span>
                  <span className="text-[10px] text-stone-500">— {item.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Attributes */}
        <div className="mt-2.5 pt-2 border-t border-[#2d2116] flex flex-wrap gap-2 text-[10px] font-serif text-stone-400">
          {isExit && (
            <span className="text-amber-400 font-bold">
              ★ Fortress Portcullis ({gameState.exitUnlocked ? 'Unlocked' : 'Requires Iron Key'})
            </span>
          )}
          {isJail && (
            <span className="text-indigo-400 font-bold">★ Deep Jail Cell (Starting Point)</span>
          )}
          {hazard && (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Hazard: {hazard}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

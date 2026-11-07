import React from 'react';
import { GameEvent } from '../types/game';
import { Scroll, Compass, Footprints, AlertTriangle, Key, Award, Info } from 'lucide-react';

interface EventLogProps {
  events: GameEvent[];
}

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  return (
    <div className="rounded-xl bg-[#1a1410] border border-[#3e2e1f] p-3 text-stone-300 shadow-md flex flex-col h-[280px]">
      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[#302316] font-serif text-sm font-bold text-amber-200">
        <Scroll className="w-4 h-4 text-amber-400" />
        <span>Fortress Chronicles & Logs</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-serif text-[11px] leading-snug">
        {events.length === 0 ? (
          <div className="text-stone-500 italic p-2 text-center">No recorded events yet...</div>
        ) : (
          events.map((evt) => {
            const timeStr = new Date(evt.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={evt.id}
                className={`p-1.5 rounded flex items-start gap-1.5 border ${
                  evt.type === 'danger'
                    ? 'bg-rose-950/40 border-rose-900/60 text-rose-200'
                    : evt.type === 'escape'
                    ? 'bg-emerald-950/50 border-emerald-800/70 text-emerald-200'
                    : evt.type === 'loot'
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                    : evt.type === 'explore'
                    ? 'bg-indigo-950/40 border-indigo-900/50 text-indigo-200'
                    : evt.type === 'alert'
                    ? 'bg-red-950/40 border-red-800 text-red-200 font-bold'
                    : 'bg-[#120f0d] border-[#241a12] text-stone-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {evt.type === 'danger' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                  {evt.type === 'escape' && <Award className="w-3.5 h-3.5 text-emerald-400" />}
                  {evt.type === 'loot' && <Key className="w-3.5 h-3.5 text-amber-400" />}
                  {evt.type === 'explore' && <Compass className="w-3.5 h-3.5 text-indigo-400" />}
                  {evt.type === 'move' && <Footprints className="w-3.5 h-3.5 text-stone-400" />}
                  {evt.type === 'info' && <Info className="w-3.5 h-3.5 text-amber-300/70" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono opacity-50">{timeStr}</span>
                  </div>
                  <p className="mt-0.5">{evt.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Skull, RotateCcw } from 'lucide-react';
import { FortressGameState } from '../types/game';

interface GameOverModalProps {
  gameState: FortressGameState;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  onRestart,
}) => {
  const isVictory = gameState.phase === 'VICTORY' || gameState.winner;
  const isDefeat = gameState.phase === 'DEFEAT' || gameState.defeated;

  useEffect(() => {
    if (isVictory) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
        });
      } catch {
        // ignore in case canvas not available
      }
    }
  }, [isVictory]);

  if (!isVictory && !isDefeat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#241c15] via-[#1a1410] to-[#120e0c] border-4 border-[#543e2c] p-6 shadow-2xl text-stone-200 text-center">
        
        {/* Victory Icon / Defeat Icon */}
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-xl">
          {isVictory ? (
            <div className="w-full h-full rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <Award className="w-8 h-8 animate-bounce" />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-rose-950 border-2 border-rose-600 flex items-center justify-center text-rose-400">
              <Skull className="w-8 h-8 animate-pulse" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-serif font-black tracking-tight ${isVictory ? 'text-amber-300' : 'text-rose-400'}`}>
          {isVictory ? 'TRIUMPH! YOU HAVE ESCAPED!' : 'DEFEAT! ALL PRISONERS CAPTURED'}
        </h2>

        {/* Message */}
        <p className="mt-2 text-xs sm:text-sm font-serif text-stone-300 leading-relaxed">
          {isVictory
            ? 'Against impossible odds, your fellowship unlocked the heavy fortress portcullis and vanished into the midnight shadows beyond!'
            : 'The fortress guards and bloodhounds have overwhelmed your party and dragged everyone back down into the dungeon irons.'}
        </p>

        {/* Stats */}
        <div className="mt-4 p-3 rounded-lg bg-[#14100d] border border-[#3d2c1e] text-xs font-mono grid grid-cols-2 gap-2 text-stone-400">
          <div>
            <span className="block text-stone-500">TURNS TAKEN</span>
            <strong className="text-amber-300 text-sm">{gameState.currentTurn}</strong>
          </div>
          <div>
            <span className="block text-stone-500">ALERT LEVEL</span>
            <strong className="text-rose-400 text-sm">{gameState.alertLevel} / 5</strong>
          </div>
        </div>

        {/* Restart Action */}
        <div className="mt-5">
          <button
            onClick={onRestart}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-bold text-sm rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ring-1 ring-amber-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN / RETRY ESCAPE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

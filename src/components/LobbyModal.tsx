import React, { useState } from 'react';
import { CHARACTERS } from '../game/engine';
import { Shield, Sparkles, Copy, Check, Users, Play, HelpCircle } from 'lucide-react';

interface LobbyModalProps {
  roomId: string;
  onJoin: (name: string, characterId: string) => void;
  onStartSolo: () => void;
  onOpenRules: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  roomId,
  onJoin,
  onStartSolo,
  onOpenRules,
}) => {
  const [name, setName] = useState('');
  const [selectedCharId, setSelectedCharId] = useState(CHARACTERS[0].id);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const char = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];
    onJoin(name.trim() || char.name, selectedCharId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#241c15] via-[#1a1410] to-[#120e0c] border-4 border-[#543e2c] ring-2 ring-amber-500/30 p-6 shadow-2xl text-stone-200">
        
        {/* Title */}
        <div className="text-center pb-4 border-b border-[#3d2c1e]">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/40 text-[10px] font-mono tracking-widest text-amber-300 uppercase mb-2">
            2D Medieval Co-Op Board Game
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-amber-200 drop-shadow">
            GET OUT! ESCAPE THE FORTRESS
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 font-serif mt-1 max-w-md mx-auto">
            Work together to escape the high fortress! Explore dark chambers, claim the Heavy Iron Key, outwit the Sentries & Bloodhounds, and breach the Exit Portcullis.
          </p>
        </div>

        {/* Room Share / Invite Bar */}
        <div className="mt-4 p-2.5 rounded-lg bg-[#14100d] border border-[#3d2c1e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-stone-300">
              Session: <strong className="text-amber-300">{roomId}</strong>
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2b2016] hover:bg-[#3d2e20] text-amber-300 text-xs rounded border border-amber-700/50 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-serif font-semibold text-amber-300 mb-1">
              Prisoner Moniker / Name
            </label>
            <input
              type="text"
              placeholder="e.g. Master Valen or enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#120f0d] border border-[#443324] text-sm text-stone-200 focus:outline-none focus:border-amber-500 font-serif"
            />
          </div>

          {/* Character Selection */}
          <div>
            <label className="block text-xs font-serif font-semibold text-amber-300 mb-2">
              Choose Your Prisoner Miniature
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharId === char.id;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelectedCharId(char.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-[#14100d] border-[#312419] hover:border-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow border"
                        style={{
                          backgroundColor: char.bgHex,
                          borderColor: char.borderHex,
                          color: char.accentHex,
                        }}
                      >
                        {char.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-serif font-bold text-stone-100">
                          {char.name}
                        </h4>
                        <span className="text-[10px] text-amber-400/80 font-serif">
                          {char.title}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-stone-400 leading-tight">
                      {char.specialAbility}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-sm rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>JOIN ESCAPE PARTY</span>
            </button>

            <button
              type="button"
              onClick={onStartSolo}
              className="py-2.5 px-4 bg-[#2e2319] hover:bg-[#3d2f22] text-amber-200 border border-amber-700/60 font-serif font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              title="Test game immediately with quick setup"
            >
              <span>Solo Test Mode</span>
            </button>

            <button
              type="button"
              onClick={onOpenRules}
              className="py-2.5 px-3 bg-[#171310] hover:bg-[#221c16] text-stone-400 hover:text-amber-200 border border-[#3d2c1e] text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Rules</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

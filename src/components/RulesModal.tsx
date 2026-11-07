import React from 'react';
import { X, Dices, Eye, Compass, Key, Skull, Award, Sliders } from 'lucide-react';
import { GameRuleSettings } from '../types/game';

interface RulesModalProps {
  onClose: () => void;
  settings?: GameRuleSettings;
  onUpdateSettings?: (settings: Partial<GameRuleSettings>) => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  onClose,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#241c15] via-[#1a1410] to-[#120e0c] border-4 border-[#543e2c] p-6 shadow-2xl text-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3d2c1e]">
          <h2 className="text-xl font-serif font-black text-amber-200 flex items-center gap-2">
            <span>🏰</span> "Get Out! Escape the Fortress" — Rules & Codex
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#1f1712] hover:bg-[#33251c] text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="mt-4 space-y-4 text-xs sm:text-sm font-serif leading-relaxed text-stone-300">
          
          {/* Section: Overview */}
          <div className="p-3 rounded-lg bg-[#15110e] border border-[#382a1d]">
            <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-sm">
              <Award className="w-4 h-4 text-amber-400" /> Goal & Victory Condition
            </h3>
            <p>
              1 to 4 prisoners begin trapped in the deep <strong>Jail Cell at (2, 6)</strong>. To win, prisoners must explore the hidden 5×7 fortress, locate the <strong>Heavy Iron Key</strong> in the upper chambers, unlock the massive <strong>Exit Portcullis at (2, 0)</strong>, and all prisoners must escape together into freedom!
            </p>
          </div>

          {/* Section: Turn Cycle & Action Die */}
          <div className="p-3 rounded-lg bg-[#15110e] border border-[#382a1d]">
            <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-sm">
              <Dices className="w-4 h-4 text-amber-400" /> The 6-Sided Action Die & Turn Flow
            </h3>
            <p className="mb-2">
              On your turn, roll the Action Die to receive <strong>Action Points (AP)</strong>:
            </p>
            <ul className="space-y-1 list-disc list-inside text-stone-400 pl-1 text-xs">
              <li><strong>Face 1:</strong> 2 Action Points + Free Look action</li>
              <li><strong>Face 2:</strong> 2 Action Points + Free Move step</li>
              <li><strong>Face 3:</strong> 3 Action Points</li>
              <li><strong>Face 4:</strong> 3 Action Points + Silent Footsteps</li>
              <li><strong>Face 5:</strong> 4 Action Points (Tactical Advance)</li>
              <li><strong>Face 6:</strong> 5 Action Points (Masterstroke!)</li>
            </ul>
          </div>

          {/* Section: Look vs Explore */}
          <div className="p-3 rounded-lg bg-[#15110e] border border-[#382a1d]">
            <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-sm">
              <Compass className="w-4 h-4 text-indigo-400" /> Actions: Move, Look & Explore
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs">
              <div className="p-2 rounded bg-[#100d0a] border border-[#2d2015]">
                <strong className="text-emerald-400 block mb-0.5">Move (1 AP)</strong>
                Step into an already-revealed adjacent chamber. Safe and reliable.
              </div>
              <div className="p-2 rounded bg-[#100d0a] border border-[#2d2015]">
                <strong className="text-amber-400 block mb-0.5">Look (1 AP)</strong>
                Peek into an adjacent hidden chamber from the doorway without stepping in. Reveals room layout and hazards safely!
              </div>
              <div className="p-2 rounded bg-[#100d0a] border border-[#2d2015]">
                <strong className="text-indigo-400 block mb-0.5">Explore (1 AP)</strong>
                Boldly step forward into an unrevealed chamber, flipping the tile face-up and placing your token inside.
              </div>
            </div>
          </div>

          {/* Section: Sentry & Hound Patrols */}
          <div className="p-3 rounded-lg bg-[#15110e] border border-[#382a1d]">
            <h3 className="font-bold text-rose-300 mb-1 flex items-center gap-1.5 text-sm">
              <Skull className="w-4 h-4 text-rose-400" /> The Fortress Phase & Enemies
            </h3>
            <p>
              After all players finish their turns, the <strong>Fortress Phase</strong> activates:
            </p>
            <ul className="mt-1 space-y-1 list-disc list-inside text-stone-400 pl-1 text-xs">
              <li><strong>Guards (Halberd Sentries):</strong> Patrol 1 tile per turn. If a guard enters your room, you are captured!</li>
              <li><strong>Bloodhounds:</strong> Swift hunting dogs that move 2 tiles per turn, tracking nearby scent trails.</li>
              <li><strong>The Captain:</strong> Imposing warden guarding the Courtyard and Exit perimeter.</li>
              <li><strong>Capture Penalty:</strong> Captured players are returned to the Jail Cell. If all active prisoners are captured at the same time, it is <strong>DEFEAT</strong>!</li>
            </ul>
          </div>

          {/* Section: Equipment & Survival Items */}
          <div className="p-3 rounded-lg bg-[#15110e] border border-[#382a1d]">
            <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-sm">
              <Key className="w-4 h-4 text-amber-400" /> Equipment & Countermeasures
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-stone-300">
              <div><strong>Heavy Iron Key:</strong> Master key required to open the Exit Portcullis at (2, 0).</div>
              <div><strong>Alchemical Smoke Bomb:</strong> Stuns all sentries in your tile, evading capture.</div>
              <div><strong>Cured Meat Shank:</strong> Toss to pacify and distract fierce Bloodhounds.</div>
              <div><strong>Pitch Torch:</strong> Automatically illuminates adjacent rooms while held.</div>
            </div>
          </div>

          {/* Section: Configurable Rules */}
          {settings && onUpdateSettings && (
            <div className="p-3 rounded-lg bg-[#1b1510] border border-amber-800/60">
              <h3 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5 text-sm">
                <Sliders className="w-4 h-4 text-amber-400" /> Configurable Placeholder Rules
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1">Guard Speed (tiles/phase)</label>
                  <select
                    value={settings.guardSpeed}
                    onChange={(e) => onUpdateSettings({ guardSpeed: Number(e.target.value) })}
                    className="w-full bg-[#100d0a] border border-[#443324] rounded px-2 py-1 text-stone-200"
                  >
                    <option value={1}>1 Tile (Standard)</option>
                    <option value={2}>2 Tiles (Fast / Hardcore)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Hound Speed (tiles/phase)</label>
                  <select
                    value={settings.houndSpeed}
                    onChange={(e) => onUpdateSettings({ houndSpeed: Number(e.target.value) })}
                    className="w-full bg-[#100d0a] border border-[#443324] rounded px-2 py-1 text-stone-200"
                  >
                    <option value={1}>1 Tile (Tame)</option>
                    <option value={2}>2 Tiles (Standard Swift)</option>
                    <option value={3}>3 Tiles (Relentless)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-[#3d2c1e] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-sm rounded-lg shadow cursor-pointer"
          >
            Understood! Return to Game
          </button>
        </div>
      </div>
    </div>
  );
};

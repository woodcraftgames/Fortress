export type TileType =
  | 'JAIL_CELL'
  | 'DUNGEON_HALL'
  | 'GUARD_POST'
  | 'ARMORY'
  | 'WARDEN_OFFICE'
  | 'KENNEL'
  | 'SECRET_PASSAGE'
  | 'TORTURE_CHAMBER'
  | 'COURTYARD'
  | 'SEWER_DRAIN'
  | 'EXIT_PORTCULLIS';

export type ItemType =
  | 'IRON_KEY'
  | 'TORCH'
  | 'SMOKE_BOMB'
  | 'LOCKPICK'
  | 'MEAT_CHUNK'
  | 'CLOAK';

export interface GameItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  icon: string;
}

export interface BoardTile {
  x: number;
  y: number;
  type: TileType;
  name: string;
  description: string;
  revealed: boolean;
  peeked: boolean; // Seen via Look action
  items: GameItem[];
  hasExitDoor?: boolean;
  isExitUnlocked?: boolean;
  hazard?: 'TRAP' | 'ALARM_BELL' | null;
  decor?: string;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  title: string;
  color: string;
  bgHex: string;
  borderHex: string;
  accentHex: string;
  avatarIcon: string;
  specialAbility: string;
}

export interface Player {
  id: string;
  name: string;
  character: PlayerCharacter;
  x: number;
  y: number;
  inventory: GameItem[];
  isCaptured: boolean;
  isEscaped: boolean;
  connected: boolean;
  joinedAt: number;
}

export type EnemyType = 'GUARD' | 'HOUND' | 'CAPTAIN';

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  patrolRoute: { x: number; y: number }[];
  patrolIndex: number;
  facing: 'N' | 'S' | 'E' | 'W';
  isStunned: boolean;
  stunTurns: number;
}

export type GamePhase =
  | 'LOBBY'
  | 'PLAYER_ROLL'
  | 'PLAYER_ACTION'
  | 'FORTRESS_PHASE'
  | 'VICTORY'
  | 'DEFEAT';

export interface ActionDieResult {
  value: number; // 1 to 6
  actionPoints: number; // AP granted
  bonusAction: 'MOVE_BONUS' | 'FREE_LOOK' | 'FREE_SNEAK' | 'TACTICAL' | 'NONE';
  label: string;
}

export interface GameEvent {
  id: string;
  timestamp: number;
  text: string;
  type: 'info' | 'move' | 'explore' | 'danger' | 'loot' | 'escape' | 'alert';
}

export interface GameRuleSettings {
  maxPlayers: number;
  guardSpeed: number; // tiles per fortress phase (default 1)
  houndSpeed: number; // tiles per fortress phase (default 2)
  dieMode: 'ACTION_POINTS' | 'STRICT_ROLL';
  fogOfWar: boolean;
  allowTrading: boolean;
}

export interface FortressGameState {
  roomId: string;
  boardWidth: number; // 5
  boardHeight: number; // 7
  tiles: BoardTile[][]; // [y][x]
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  currentTurn: number;
  alertLevel: number; // 1 to 5
  currentDie: ActionDieResult | null;
  apRemaining: number;
  apTotal: number;
  enemies: Enemy[];
  events: GameEvent[];
  settings: GameRuleSettings;
  winner: boolean;
  defeated: boolean;
  exitUnlocked: boolean;
}

// Client to Server Actions
export type ClientAction =
  | { type: 'JOIN'; name: string; characterId: string; roomId?: string }
  | { type: 'LEAVE' }
  | { type: 'START_GAME' }
  | { type: 'ROLL_DIE' }
  | { type: 'MOVE'; targetX: number; targetY: number }
  | { type: 'LOOK'; targetX: number; targetY: number }
  | { type: 'EXPLORE'; targetX: number; targetY: number }
  | { type: 'PICK_UP_ITEM'; itemId: string }
  | { type: 'USE_ITEM'; itemId: string; targetX?: number; targetY?: number }
  | { type: 'UNLOCK_EXIT' }
  | { type: 'ESCAPE' }
  | { type: 'END_TURN' }
  | { type: 'RESTART_GAME' }
  | { type: 'TAKE_OVER_SEAT'; playerId: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameRuleSettings> };

// Server to Client Messages
export type ServerMessage =
  | { type: 'INIT_STATE'; state: FortressGameState; yourPlayerId: string }
  | { type: 'STATE_UPDATE'; state: FortressGameState }
  | { type: 'DICE_ROLLED'; roll: ActionDieResult; rolledBy: string }
  | { type: 'NOTIFICATION'; message: string; severity?: 'info' | 'warning' | 'danger' | 'success' }
  | { type: 'ERROR'; message: string };

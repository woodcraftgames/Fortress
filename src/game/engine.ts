import {
  BoardTile,
  FortressGameState,
  GameEvent,
  GameItem,
  Player,
  PlayerCharacter,
  Enemy,
  ActionDieResult,
  GameRuleSettings,
} from '../types/game';

export const CHARACTERS: PlayerCharacter[] = [
  {
    id: 'rogue',
    name: 'Valen Shadowstep',
    title: 'The Infiltrator',
    color: 'emerald',
    bgHex: '#064e3b',
    borderHex: '#10b981',
    accentHex: '#34d399',
    avatarIcon: 'dagger',
    specialAbility: 'Free Look: Can peek at 1 adjacent tile each turn without spending AP.',
  },
  {
    id: 'blacksmith',
    name: 'Thorgar Ironfist',
    title: 'The Breaker',
    color: 'amber',
    bgHex: '#78350f',
    borderHex: '#f59e0b',
    accentHex: '#fbbf24',
    avatarIcon: 'shield',
    specialAbility: 'Heavy Shove: Can push an enemy 1 tile away using 1 AP.',
  },
  {
    id: 'scholar',
    name: 'Althea the Astute',
    title: 'The Cartographer',
    color: 'indigo',
    bgHex: '#312e81',
    borderHex: '#6366f1',
    accentHex: '#818cf8',
    avatarIcon: 'scroll',
    specialAbility: 'Ancient Lore: Senses keys and secret passages from 2 tiles away.',
  },
  {
    id: 'ranger',
    name: 'Kaelen Swiftwind',
    title: 'The Houndmaster',
    color: 'rose',
    bgHex: '#881337',
    borderHex: '#f43f5e',
    accentHex: '#fb7185',
    avatarIcon: 'paw',
    specialAbility: 'Beast Whisper: Hounds ignore Kaelen on an even die roll.',
  },
];

export const DEFAULT_SETTINGS: GameRuleSettings = {
  maxPlayers: 4,
  guardSpeed: 1,
  houndSpeed: 2,
  dieMode: 'ACTION_POINTS',
  fogOfWar: true,
  allowTrading: true,
};

export function createInitialBoard(width = 5, height = 7): BoardTile[][] {
  const tiles: BoardTile[][] = [];

  // Tile blueprints layout for 5x7
  // y=0: [Courtyard, Watchtower, EXIT_PORTCULLIS, Guard Barracks, Battlement]
  // y=1: [Great Hall, Warden Office (KEY), Upper Corridor, Armory, Archery Tower]
  // y=2: [Library, Dining Hall, Central Hall, Treasury, Kennel]
  // y=3: [Wine Cellar, Guard Post, Grand Stairs, Armory Annex, Servant Quarters]
  // y=4: [Torture Chamber, Low Corridor, Sewer Drain, Storage Vault, Kennel Yard]
  // y=5: [Catacombs, Lower Hallway, Iron Gate Corridor, Secret Passage, Crypt]
  // y=6: [Dungeon East, Solitary Cell, JAIL_CELL (START), Guard Antechamber, Dungeon West]

  for (let y = 0; y < height; y++) {
    const row: BoardTile[] = [];
    for (let x = 0; x < width; x++) {
      let type: BoardTile['type'] = 'DUNGEON_HALL';
      let name = `Hallway (${x}, ${y})`;
      let description = 'Damp stone corridor lit by flickering torches.';
      const items: GameItem[] = [];
      let hazard: BoardTile['hazard'] = null;
      let decor = 'flagstone';

      // Special locations
      if (x === 2 && y === 6) {
        type = 'JAIL_CELL';
        name = 'The Deep Jail Cell';
        description = 'Your starting cold iron cell. Chained shackles hang from mossy granite.';
        decor = 'cell-bars';
      } else if (x === 2 && y === 0) {
        type = 'EXIT_PORTCULLIS';
        name = 'The Fortress Portcullis (Exit)';
        description = 'The massive iron-spiked gate leading outside to the forest bridge! Locked tight.';
        decor = 'portcullis';
      } else if (x === 1 && y === 1) {
        type = 'WARDEN_OFFICE';
        name = "Warden's Quarters";
        description = 'Heavy oak desk with ledgers, maps, and an ornate brass lockbox.';
        items.push({
          id: 'item-key-iron',
          type: 'IRON_KEY',
          name: 'Heavy Iron Fortress Key',
          description: 'The master key that unlocks the massive Exit Portcullis!',
          icon: 'key',
        });
        decor = 'desk';
      } else if (x === 3 && y === 1) {
        type = 'ARMORY';
        name = 'Fortress Armory';
        description = 'Weapons racks and tactical supplies left by the night garrison.';
        items.push({
          id: 'item-smoke-1',
          type: 'SMOKE_BOMB',
          name: 'Alchemical Smoke Bomb',
          description: 'Throw to blind and stun guards in your tile, evading capture.',
          icon: 'cloud',
        });
        decor = 'weapons';
      } else if (x === 4 && y === 2) {
        type = 'KENNEL';
        name = 'Hound Kennel';
        description = 'Straw bedding and gnawed bones. Fresh meat chunks hang on hooks.';
        items.push({
          id: 'item-meat-1',
          type: 'MEAT_CHUNK',
          name: 'Cured Meat Shank',
          description: 'Feed to an approaching Hound to pacify and distract it!',
          icon: 'beef',
        });
        decor = 'bones';
      } else if (x === 3 && y === 5) {
        type = 'SECRET_PASSAGE';
        name = 'Hidden Masonry Chute';
        description = 'A loose revolving wall stone revealing an ancient passage northward!';
        items.push({
          id: 'item-lockpick-1',
          type: 'LOCKPICK',
          name: 'Bent Steel Lockpick',
          description: 'Frees an ally immediately from the Jail Cell or picks heavy doors.',
          icon: 'wrench',
        });
        decor = 'crack';
      } else if (x === 0 && y === 4) {
        type = 'TORTURE_CHAMBER';
        name = 'The Inquisitor Pit';
        description = 'Racks and rusted iron braziers. A forgotten torch flickers in a sconce.';
        items.push({
          id: 'item-torch-1',
          type: 'TORCH',
          name: 'Pitch Pine Torch',
          description: 'Carrying this illuminates all adjacent rooms automatically!',
          icon: 'flame',
        });
        decor = 'iron-cage';
      } else if (x === 2 && y === 4) {
        type = 'SEWER_DRAIN';
        name = 'Flooded Sewer Grate';
        description = 'Dark water flows under iron grates. Whispers echo through the fortress pipes.';
        items.push({
          id: 'item-cloak-1',
          type: 'CLOAK',
          name: 'Shadowspun Cloak',
          description: '50% chance guards walk straight past you without alerting.',
          icon: 'shirt',
        });
        decor = 'water';
      } else if (x === 1 && y === 3) {
        type = 'GUARD_POST';
        name = 'Inner Guard Station';
        description = 'Dice tables and wooden stools where fortress sentries take watch.';
        decor = 'guard-shield';
      } else if (x === 0 && y === 0 || x === 4 && y === 0) {
        type = 'COURTYARD';
        name = 'Watchtower Balcony';
        description = 'Cold mountain wind howls across the outer battlements.';
        decor = 'battlement';
      }

      // Starting tile (2, 6) and adjacent (2, 5) start revealed so players have immediate context
      const isStartRevealed = (x === 2 && y === 6) || (x === 2 && y === 5);

      row.push({
        x,
        y,
        type,
        name,
        description,
        revealed: isStartRevealed,
        peeked: false,
        items,
        hazard,
        decor,
        hasExitDoor: x === 2 && y === 0,
        isExitUnlocked: false,
      });
    }
    tiles.push(row);
  }

  return tiles;
}

export function createInitialEnemies(): Enemy[] {
  return [
    {
      id: 'guard-1',
      type: 'GUARD',
      name: 'Sentry Brand',
      x: 1,
      y: 3,
      patrolRoute: [
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
      ],
      patrolIndex: 0,
      facing: 'E',
      isStunned: false,
      stunTurns: 0,
    },
    {
      id: 'guard-2',
      type: 'GUARD',
      name: 'Iron Guard Dirk',
      x: 0,
      y: 1,
      patrolRoute: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
      ],
      patrolIndex: 0,
      facing: 'E',
      isStunned: false,
      stunTurns: 0,
    },
    {
      id: 'hound-1',
      type: 'HOUND',
      name: 'Bloodhound Fang',
      x: 4,
      y: 2,
      patrolRoute: [
        { x: 4, y: 2 },
        { x: 3, y: 2 },
        { x: 3, y: 4 },
        { x: 4, y: 4 },
      ],
      patrolIndex: 0,
      facing: 'W',
      isStunned: false,
      stunTurns: 0,
    },
    {
      id: 'captain-1',
      type: 'CAPTAIN',
      name: 'Captain Roderic',
      x: 2,
      y: 1,
      patrolRoute: [
        { x: 2, y: 1 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 2, y: 0 },
      ],
      patrolIndex: 0,
      facing: 'N',
      isStunned: false,
      stunTurns: 0,
    },
  ];
}

export function rollActionDie(): ActionDieResult {
  const value = Math.floor(Math.random() * 6) + 1;
  switch (value) {
    case 1:
      return {
        value: 1,
        actionPoints: 2,
        bonusAction: 'FREE_LOOK',
        label: 'Scout: 2 AP + Free Look Action',
      };
    case 2:
      return {
        value: 2,
        actionPoints: 2,
        bonusAction: 'MOVE_BONUS',
        label: 'Swift Foot: 2 AP + Free Move',
      };
    case 3:
      return {
        value: 3,
        actionPoints: 3,
        bonusAction: 'NONE',
        label: 'Determined: 3 Action Points',
      };
    case 4:
      return {
        value: 4,
        actionPoints: 3,
        bonusAction: 'FREE_SNEAK',
        label: 'Prowler: 3 AP + Silent Steps',
      };
    case 5:
      return {
        value: 5,
        actionPoints: 4,
        bonusAction: 'TACTICAL',
        label: 'Fortress Tactician: 4 Action Points',
      };
    case 6:
    default:
      return {
        value: 6,
        actionPoints: 5,
        bonusAction: 'TACTICAL',
        label: 'Masterstroke! 5 Action Points',
      };
  }
}

export function createInitialGameState(roomId = 'fortress-escape'): FortressGameState {
  const boardWidth = 5;
  const boardHeight = 7;
  const tiles = createInitialBoard(boardWidth, boardHeight);
  const enemies = createInitialEnemies();

  const events: GameEvent[] = [
    {
      id: `evt-${Date.now()}-0`,
      timestamp: Date.now(),
      text: 'The fortress bell rings midnight. The prison guards have changed shifts.',
      type: 'info',
    },
    {
      id: `evt-${Date.now()}-1`,
      timestamp: Date.now(),
      text: 'Objective: Explore the fortress, locate the Heavy Iron Key, and unlock the Exit Portcullis together!',
      type: 'info',
    },
  ];

  return {
    roomId,
    boardWidth,
    boardHeight,
    tiles,
    players: [],
    activePlayerIndex: 0,
    phase: 'LOBBY',
    currentTurn: 1,
    alertLevel: 1,
    currentDie: null,
    apRemaining: 0,
    apTotal: 0,
    enemies,
    events,
    settings: DEFAULT_SETTINGS,
    winner: false,
    defeated: false,
    exitUnlocked: false,
  };
}

export function isAdjacent(x1: number, y1: number, x2: number, y2: number): boolean {
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

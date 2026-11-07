import {
  FortressGameState,
  ClientAction,
  BoardTile,
  Player,
  Enemy,
  ActionDieResult,
  GameEvent,
} from '../types/game';
import {
  createInitialGameState,
  CHARACTERS,
  rollActionDie,
  isAdjacent,
} from './engine';

export class GameManager {
  private games: Map<string, FortressGameState> = new Map();

  public getOrCreateGame(roomId = 'fortress-escape'): FortressGameState {
    let game = this.games.get(roomId);
    if (!game) {
      game = createInitialGameState(roomId);
      this.games.set(roomId, game);
    }
    return game;
  }

  public getGame(roomId: string): FortressGameState | undefined {
    return this.games.get(roomId);
  }

  public addEvent(game: FortressGameState, text: string, type: GameEvent['type'] = 'info') {
    const event: GameEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      text,
      type,
    };
    game.events.unshift(event);
    if (game.events.length > 50) {
      game.events.pop();
    }
  }

  public handleAction(roomId: string, playerId: string, action: ClientAction): FortressGameState {
    const game = this.getOrCreateGame(roomId);

    switch (action.type) {
      case 'JOIN': {
        const existingPlayer = game.players.find((p) => p.id === playerId);
        if (existingPlayer) {
          existingPlayer.connected = true;
          existingPlayer.name = action.name || existingPlayer.name;
          this.addEvent(game, `${existingPlayer.name} reconnected to the escape attempt.`);
          return game;
        }

        if (game.players.length >= game.settings.maxPlayers) {
          return game;
        }

        // Find available character
        const usedCharacterIds = new Set(game.players.map((p) => p.character.id));
        const character =
          CHARACTERS.find((c) => c.id === action.characterId && !usedCharacterIds.has(c.id)) ||
          CHARACTERS.find((c) => !usedCharacterIds.has(c.id)) ||
          CHARACTERS[0];

        const newPlayer: Player = {
          id: playerId,
          name: action.name.trim() || character.name,
          character,
          x: 2,
          y: 6, // Jail Cell
          inventory: [],
          isCaptured: false,
          isEscaped: false,
          connected: true,
          joinedAt: Date.now(),
        };

        game.players.push(newPlayer);
        this.addEvent(
          game,
          `${newPlayer.name} (${newPlayer.character.title}) joined the escape party at the Jail Cell!`,
          'info'
        );

        if (game.phase === 'LOBBY' && game.players.length === 1) {
          game.phase = 'PLAYER_ROLL';
          game.activePlayerIndex = 0;
          this.addEvent(game, `It is ${newPlayer.name}'s turn. Roll the Action Die to begin!`, 'info');
        }
        break;
      }

      case 'LEAVE': {
        const player = game.players.find((p) => p.id === playerId);
        if (player) {
          player.connected = false;
          this.addEvent(game, `${player.name} went silent in the shadows.`);
        }
        break;
      }

      case 'START_GAME': {
        if (game.players.length > 0) {
          game.phase = 'PLAYER_ROLL';
          game.activePlayerIndex = 0;
          game.currentTurn = 1;
          this.addEvent(game, 'The escape begins! The guards have changed shifts.', 'info');
        }
        break;
      }

      case 'ROLL_DIE': {
        const activePlayer = game.players[game.activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) return game;
        if (game.phase !== 'PLAYER_ROLL') return game;

        const roll = rollActionDie();
        game.currentDie = roll;
        game.apTotal = roll.actionPoints;
        game.apRemaining = roll.actionPoints;
        game.phase = 'PLAYER_ACTION';

        this.addEvent(
          game,
          `${activePlayer.name} rolled [⚅ ${roll.value}] - ${roll.label}! (${roll.actionPoints} Action Points)`,
          'info'
        );
        break;
      }

      case 'LOOK': {
        const activePlayer = game.players[game.activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) return game;
        if (game.phase !== 'PLAYER_ACTION' || game.apRemaining <= 0) return game;

        const { targetX, targetY } = action;
        if (
          targetX < 0 ||
          targetX >= game.boardWidth ||
          targetY < 0 ||
          targetY >= game.boardHeight
        ) {
          return game;
        }

        if (!isAdjacent(activePlayer.x, activePlayer.y, targetX, targetY)) {
          return game;
        }

        const tile = game.tiles[targetY][targetX];
        tile.peeked = true;
        game.apRemaining -= 1;

        const itemsNote = tile.items.length > 0 ? ` with ${tile.items.map((i) => i.name).join(', ')}` : '';
        this.addEvent(
          game,
          `${activePlayer.name} cautiously looks into (${targetX}, ${targetY}): reveals "${tile.name}"${itemsNote}.`,
          'explore'
        );

        if (game.apRemaining <= 0) {
          // Keep in action phase or let them manually end turn
        }
        break;
      }

      case 'EXPLORE': {
        const activePlayer = game.players[game.activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) return game;
        if (game.phase !== 'PLAYER_ACTION' || game.apRemaining <= 0) return game;

        const { targetX, targetY } = action;
        if (
          targetX < 0 ||
          targetX >= game.boardWidth ||
          targetY < 0 ||
          targetY >= game.boardHeight
        ) {
          return game;
        }

        if (!isAdjacent(activePlayer.x, activePlayer.y, targetX, targetY)) {
          return game;
        }

        const tile = game.tiles[targetY][targetX];
        tile.revealed = true;
        tile.peeked = true;
        activePlayer.x = targetX;
        activePlayer.y = targetY;
        game.apRemaining -= 1;

        this.addEvent(
          game,
          `${activePlayer.name} boldly explored into (${targetX}, ${targetY}) and discovered "${tile.name}"!`,
          'explore'
        );

        // Torch bearer effect: auto-reveals adjacent
        if (activePlayer.inventory.some((i) => i.type === 'TORCH')) {
          this.revealAdjacent(game, targetX, targetY);
        }

        // Check if enemy on this tile
        this.checkImmediateEnemyEncounter(game, activePlayer);
        break;
      }

      case 'MOVE': {
        const activePlayer = game.players[game.activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) return game;
        if (game.phase !== 'PLAYER_ACTION' || game.apRemaining <= 0) return game;

        const { targetX, targetY } = action;
        if (
          targetX < 0 ||
          targetX >= game.boardWidth ||
          targetY < 0 ||
          targetY >= game.boardHeight
        ) {
          return game;
        }

        if (!isAdjacent(activePlayer.x, activePlayer.y, targetX, targetY)) {
          return game;
        }

        const tile = game.tiles[targetY][targetX];
        if (!tile.revealed && !tile.peeked) {
          // Move requires tile to be revealed/peeked, or triggers explore
          tile.revealed = true;
        }

        activePlayer.x = targetX;
        activePlayer.y = targetY;
        game.apRemaining -= 1;

        this.addEvent(
          game,
          `${activePlayer.name} moved to (${targetX}, ${targetY}) [${tile.name}].`,
          'move'
        );

        // Torch bearer effect
        if (activePlayer.inventory.some((i) => i.type === 'TORCH')) {
          this.revealAdjacent(game, targetX, targetY);
        }

        this.checkImmediateEnemyEncounter(game, activePlayer);
        break;
      }

      case 'PICK_UP_ITEM': {
        const activePlayer = game.players[game.activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) return game;
        if (game.phase !== 'PLAYER_ACTION') return game;

        const currentTile = game.tiles[activePlayer.y][activePlayer.x];
        const itemIndex = currentTile.items.findIndex((i) => i.id === action.itemId);
        if (itemIndex >= 0) {
          if (activePlayer.inventory.length >= 4) {
            this.addEvent(game, `${activePlayer.name}'s pack is completely full!`, 'info');
            return game;
          }
          const [item] = currentTile.items.splice(itemIndex, 1);
          activePlayer.inventory.push(item);
          this.addEvent(game, `${activePlayer.name} picked up ${item.name}!`, 'loot');

          if (item.type === 'IRON_KEY') {
            this.addEvent(
              game,
              `★ THE FORTRESS IRON KEY HAS BEEN FOUND! Bring it to the Portcullis at (2, 0) to escape!`,
              'alert'
            );
          }
        }
        break;
      }

      case 'USE_ITEM': {
        const player = game.players.find((p) => p.id === playerId);
        if (!player) return game;
        const itemIdx = player.inventory.findIndex((i) => i.id === action.itemId);
        if (itemIdx < 0) return game;

        const item = player.inventory[itemIdx];
        if (item.type === 'SMOKE_BOMB') {
          player.inventory.splice(itemIdx, 1);
          // Stun enemies within 1 tile
          for (const enemy of game.enemies) {
            if (Math.abs(enemy.x - player.x) <= 1 && Math.abs(enemy.y - player.y) <= 1) {
              enemy.isStunned = true;
              enemy.stunTurns = 2;
            }
          }
          this.addEvent(
            game,
            `💨 ${player.name} threw a Smoke Bomb! Thick fog billows, blinding nearby sentries!`,
            'alert'
          );
        } else if (item.type === 'MEAT_CHUNK') {
          player.inventory.splice(itemIdx, 1);
          // Distract hounds
          for (const enemy of game.enemies) {
            if (enemy.type === 'HOUND') {
              enemy.isStunned = true;
              enemy.stunTurns = 2;
            }
          }
          this.addEvent(
            game,
            `🍖 ${player.name} tossed a juicy cured meat shank! The bloodhounds are busy devouring it!`,
            'loot'
          );
        } else if (item.type === 'LOCKPICK') {
          player.inventory.splice(itemIdx, 1);
          // Free any captured player in Jail Cell
          for (const p of game.players) {
            if (p.isCaptured) {
              p.isCaptured = false;
              this.addEvent(game, `🔓 ${player.name} picked the dungeon locks! ${p.name} is freed!`, 'loot');
            }
          }
        }
        break;
      }

      case 'UNLOCK_EXIT': {
        const activePlayer = game.players[game.activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) return game;
        if (activePlayer.x !== 2 || activePlayer.y !== 0) return game;

        const hasKey = activePlayer.inventory.some((i) => i.type === 'IRON_KEY');
        if (hasKey) {
          game.exitUnlocked = true;
          const exitTile = game.tiles[0][2];
          exitTile.isExitUnlocked = true;
          this.addEvent(
            game,
            `🗝️ ${activePlayer.name} turned the Heavy Iron Key! The fortress portcullis groans open! ESCAPE ROUTE IS OPEN!`,
            'escape'
          );
        } else {
          this.addEvent(game, `The portcullis is locked by heavy iron padlocks. You need the Iron Key!`, 'info');
        }
        break;
      }

      case 'ESCAPE': {
        const activePlayer = game.players[game.activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) return game;
        if (activePlayer.x !== 2 || activePlayer.y !== 0) return game;

        if (!game.exitUnlocked) {
          this.addEvent(game, `The Exit Portcullis is locked! Unlock it with the Iron Key first.`, 'danger');
          return game;
        }

        activePlayer.isEscaped = true;
        this.addEvent(
          game,
          `🏆 ${activePlayer.name} plunged into the midnight woods and ESCAPED THE FORTRESS!`,
          'escape'
        );

        // Check if all players have escaped
        const remainingPrisoners = game.players.filter((p) => !p.isEscaped);
        if (remainingPrisoners.length === 0) {
          game.phase = 'VICTORY';
          game.winner = true;
          this.addEvent(game, `🎉 VICTORY! ALL PRISONERS HAVE SUCCESSFULLY ESCAPED THE FORTRESS!`, 'escape');
          return game;
        }

        // Proceed to next turn
        this.advanceToNextPlayer(game);
        break;
      }

      case 'END_TURN': {
        const activePlayer = game.players[game.activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) return game;

        this.addEvent(game, `${activePlayer.name} ended their turn.`, 'info');
        this.advanceToNextPlayer(game);
        break;
      }

      case 'TAKE_OVER_SEAT': {
        // Handy for solo players testing all 1-4 players
        const targetPlayer = game.players.find((p) => p.id === action.playerId);
        if (targetPlayer) {
          this.addEvent(game, `Tester took control of seat: ${targetPlayer.name}`, 'info');
        }
        break;
      }

      case 'RESTART_GAME': {
        const playersCopy = game.players.map((p) => ({
          ...p,
          x: 2,
          y: 6,
          inventory: [],
          isCaptured: false,
          isEscaped: false,
        }));

        const freshState = createInitialGameState(roomId);
        freshState.players = playersCopy;
        freshState.phase = playersCopy.length > 0 ? 'PLAYER_ROLL' : 'LOBBY';
        freshState.activePlayerIndex = 0;
        this.games.set(roomId, freshState);
        this.addEvent(freshState, '🏰 The fortress has been reset! A new escape begins.', 'info');
        return freshState;
      }

      case 'UPDATE_SETTINGS': {
        game.settings = { ...game.settings, ...action.settings };
        this.addEvent(game, 'Fortress rules updated.', 'info');
        break;
      }
    }

    return game;
  }

  private revealAdjacent(game: FortressGameState, cx: number, cy: number) {
    const coords = [
      { x: cx + 1, y: cy },
      { x: cx - 1, y: cy },
      { x: cx, y: cy + 1 },
      { x: cx, y: cy - 1 },
    ];
    for (const c of coords) {
      if (c.x >= 0 && c.x < game.boardWidth && c.y >= 0 && c.y < game.boardHeight) {
        game.tiles[c.y][c.x].peeked = true;
      }
    }
  }

  private checkImmediateEnemyEncounter(game: FortressGameState, player: Player) {
    for (const enemy of game.enemies) {
      if (enemy.x === player.x && enemy.y === player.y && !enemy.isStunned) {
        this.resolveCapture(game, player, enemy);
      }
    }
  }

  private resolveCapture(game: FortressGameState, player: Player, enemy: Enemy) {
    // Check smoke bomb
    const smokeIdx = player.inventory.findIndex((i) => i.type === 'SMOKE_BOMB');
    if (smokeIdx >= 0) {
      player.inventory.splice(smokeIdx, 1);
      enemy.isStunned = true;
      enemy.stunTurns = 1;
      this.addEvent(
        game,
        `💨 Smoke burst! ${player.name} evaded ${enemy.name} with an alchemical smoke bomb!`,
        'danger'
      );
      return;
    }

    // Check hound with meat
    if (enemy.type === 'HOUND') {
      const meatIdx = player.inventory.findIndex((i) => i.type === 'MEAT_CHUNK');
      if (meatIdx >= 0) {
        player.inventory.splice(meatIdx, 1);
        enemy.isStunned = true;
        enemy.stunTurns = 2;
        this.addEvent(
          game,
          `🍖 ${player.name} threw meat to ${enemy.name}, pacifying the fierce hound!`,
          'loot'
        );
        return;
      }
    }

    // Check cloak
    if (player.inventory.some((i) => i.type === 'CLOAK')) {
      const evadeRoll = Math.random();
      if (evadeRoll > 0.5) {
        this.addEvent(
          game,
          `🧥 ${player.name} blended into the shadows with the Shadowspun Cloak! ${enemy.name} walked right past!`,
          'info'
        );
        return;
      }
    }

    // Captured!
    player.isCaptured = true;
    player.x = 2;
    player.y = 6; // Thrown back to Jail Cell
    game.alertLevel = Math.min(5, game.alertLevel + 1);

    this.addEvent(
      game,
      `🚨 CAPTURED! ${enemy.name} cornered ${player.name} and hauled them back to the Jail Cell! Alert level raised to ${game.alertLevel}!`,
      'danger'
    );

    // Check defeat: all non-escaped players are captured
    const nonEscaped = game.players.filter((p) => !p.isEscaped);
    if (nonEscaped.length > 0 && nonEscaped.every((p) => p.isCaptured)) {
      game.phase = 'DEFEAT';
      game.defeated = true;
      this.addEvent(
        game,
        `💀 DEFEAT! All prisoners have been captured and locked away in the dungeon depths!`,
        'danger'
      );
    }
  }

  private advanceToNextPlayer(game: FortressGameState) {
    if (game.phase === 'VICTORY' || game.phase === 'DEFEAT') return;

    let nextIndex = (game.activePlayerIndex + 1) % game.players.length;

    // Check if we wrapped around back to player 0 (Fortress Phase!)
    if (nextIndex === 0) {
      this.executeFortressPhase(game);
      if (game.winner || game.defeated) return;
    }

    // Skip escaped players
    let attempts = 0;
    while (attempts < game.players.length && game.players[nextIndex]?.isEscaped) {
      nextIndex = (nextIndex + 1) % game.players.length;
      attempts++;
    }

    game.activePlayerIndex = nextIndex;
    game.phase = 'PLAYER_ROLL';
    game.currentDie = null;
    game.apRemaining = 0;
    game.currentTurn += 1;

    const nextPlayer = game.players[nextIndex];
    if (nextPlayer) {
      this.addEvent(game, `It is ${nextPlayer.name}'s turn. Roll the Action Die!`, 'info');
    }
  }

  public executeFortressPhase(game: FortressGameState) {
    this.addEvent(game, '🛡️ FORTRESS PHASE: Sentry torches sweep the halls! Enemies patrol!', 'alert');

    for (const enemy of game.enemies) {
      if (enemy.isStunned) {
        enemy.stunTurns -= 1;
        if (enemy.stunTurns <= 0) {
          enemy.isStunned = false;
          this.addEvent(game, `${enemy.name} has recovered from their stupor.`, 'info');
        } else {
          this.addEvent(game, `${enemy.name} is stunned and unable to move.`, 'info');
          continue;
        }
      }

      // Movement steps: Hounds move 2 tiles, guards move 1 tile
      const steps = enemy.type === 'HOUND' ? game.settings.houndSpeed : game.settings.guardSpeed;

      for (let s = 0; s < steps; s++) {
        // Check if an unescaped, uncaptured player is nearby (within 2 tiles)
        const unescapedPlayers = game.players.filter((p) => !p.isEscaped && !p.isCaptured);
        let targetPlayer: Player | null = null;
        let minDistance = 999;

        for (const p of unescapedPlayers) {
          const dist = Math.abs(p.x - enemy.x) + Math.abs(p.y - enemy.y);
          if (dist < minDistance && dist <= (enemy.type === 'HOUND' ? 3 : 2)) {
            minDistance = dist;
            targetPlayer = p;
          }
        }

        if (targetPlayer && minDistance > 0) {
          // Move towards player
          const dx = targetPlayer.x - enemy.x;
          const dy = targetPlayer.y - enemy.y;

          if (Math.abs(dx) >= Math.abs(dy)) {
            enemy.x += Math.sign(dx);
          } else {
            enemy.y += Math.sign(dy);
          }
        } else if (enemy.patrolRoute.length > 0) {
          // Follow patrol route
          enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolRoute.length;
          const targetWaypoint = enemy.patrolRoute[enemy.patrolIndex];
          enemy.x = targetWaypoint.x;
          enemy.y = targetWaypoint.y;
        }

        // Clamp to board bounds
        enemy.x = Math.max(0, Math.min(game.boardWidth - 1, enemy.x));
        enemy.y = Math.max(0, Math.min(game.boardHeight - 1, enemy.y));

        // Check if on same tile as any player
        for (const player of game.players) {
          if (!player.isEscaped && !player.isCaptured && player.x === enemy.x && player.y === enemy.y) {
            this.resolveCapture(game, player, enemy);
          }
        }
      }
    }
  }
}

export const gameManager = new GameManager();

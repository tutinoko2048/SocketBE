// Unit tests for BlockPlaced frames that carry no player.
//
// Measured against a live client: `setblock` fires BlockPlaced with only
// `block` / `count` / `placementMethod` / `tool` - no `player`, no `placedUnderWater`.
// The handler read `packet.player.name` unconditionally, so every command-driven
// placement threw inside the handler; the network layer caught that and dropped the
// event, and the signal never fired. The loss was silent.
//
// Handlers are not exported, so these go through Server, which registers the real ones
// and is also where the signal lands.
//

import { expect, it } from 'vite-plus/test';
import { BlockPlacedPacket, Packet, Server, ServerEvent } from '../src/index';

/** Captured from a live client running `setblock 69 100 -11 stone`. */
const commandFrame = {
  block: { aux: 0, id: 'stone', namespace: 'minecraft' },
  count: 1,
  placementMethod: 1,
  tool: {
    aux: 0, enchantments: [], freeStackSize: 255,
    id: '', maxStackSize: 255, namespace: '', stackSize: 1,
  },
};

/** The same event as produced by a player, which does carry a player. */
const playerFrame = {
  ...commandFrame,
  placedUnderWater: false,
  player: {
    color: 'ffededed', dimension: 0, id: -4294967295, name: 'Kai_U',
    position: { x: 1, y: 2, z: 3 }, type: 'minecraft:player', variant: 0, yRot: 0,
  },
};

/**
 * Feeds one BlockPlaced frame through the registered handler and returns the signal.
 *
 * The socket is never involved: a stub connection is mapped to a stub world so the
 * handler can find both, and the signal is collected off the server's own emitter.
 */
function handleFrame(body) {
  const server = new Server({ port: 0, disableEncryption: true });
  const connection = {};
  server.worlds.set(connection, {
    server,
    resolvePlayer: (name) => ({ name }),
  });

  const signals = [];
  server.on(ServerEvent.BlockPlaced, (signal) => { signals.push(signal); });

  const handler = [...server.network.handlers].find((h) => h.packet === Packet.BlockPlaced);
  expect(handler, 'BlockPlaced handler is not registered').toBeTruthy();

  try {
    handler.handle(BlockPlacedPacket.deserialize(body), connection);
  } finally {
    server.network.stop();
  }

  return signals;
}

console.log('BlockPlaced');

it('a command-driven frame emits a signal instead of throwing', () => {
  const signals = handleFrame(commandFrame);

  expect(signals).toHaveLength(1);
  expect(signals[0].placedBlockType.id).toBe('minecraft:stone');
});

it('a command-driven frame leaves player and rawPlayer undefined', () => {
  const [signal] = handleFrame(commandFrame);

  expect(signal.player).toBeUndefined();
  expect(signal.rawPlayer).toBeUndefined();
  expect(signal.placedUnderwater).toBeUndefined();
});

it('a player-driven frame still resolves the player', () => {
  const [signal] = handleFrame(playerFrame);

  expect(signal.player.name).toBe('Kai_U');
  expect(signal.rawPlayer.name).toBe('Kai_U');
  expect(signal.placedUnderwater).toBe(false);
});

it('placing air is reported as a placement, not as a break', () => {
  // `setblock <pos> air` produces BlockPlaced with id "air" rather than BlockBroken.
  // Callers that read this as "a block now exists here" need to check for it.
  const [signal] = handleFrame({
    ...commandFrame,
    block: { aux: 0, id: 'air', namespace: 'minecraft' },
  });

  expect(signal.placedBlockType.id).toBe('minecraft:air');
});

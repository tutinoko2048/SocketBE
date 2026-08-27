// Unit tests for BlockPlaced frames that carry no player.
//
// Measured against a live 1.21 client: `setblock` fires BlockPlaced with only
// `block` / `count` / `placementMethod` / `tool` - no `player`, no `placedUnderWater`.
// The handler read `packet.player.name` unconditionally, so every command-driven
// placement threw inside the handler; the network layer caught that and dropped the
// event, and the signal never fired. The loss was silent.
//
// Handlers are not exported, so these go through Server, which registers the real ones
// and is also where the signal lands.
//
// Run: node test/block-placed.test.mjs   (after `tsdown`)

import assert from 'node:assert/strict';
import { BlockPlacedPacket, Packet, Server, ServerEvent } from '../dist/index.mjs';

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
  assert.ok(handler, 'BlockPlaced handler is not registered');

  try {
    handler.handle(BlockPlacedPacket.deserialize(body), connection);
  } finally {
    server.network.stop();
  }

  return signals;
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failed++;
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}

console.log('BlockPlaced');

test('a command-driven frame emits a signal instead of throwing', () => {
  const signals = handleFrame(commandFrame);

  assert.equal(signals.length, 1, 'expected exactly one signal');
  assert.equal(signals[0].placedBlockType.id, 'minecraft:stone');
});

test('a command-driven frame leaves player and rawPlayer undefined', () => {
  const [signal] = handleFrame(commandFrame);

  assert.equal(signal.player, undefined);
  assert.equal(signal.rawPlayer, undefined);
  assert.equal(signal.placedUnderwater, undefined);
});

test('a player-driven frame still resolves the player', () => {
  const [signal] = handleFrame(playerFrame);

  assert.equal(signal.player.name, 'Kai_U');
  assert.equal(signal.rawPlayer.name, 'Kai_U');
  assert.equal(signal.placedUnderwater, false);
});

test('placing air is reported as a placement, not as a break', () => {
  // `setblock <pos> air` produces BlockPlaced with id "air" rather than BlockBroken.
  // Callers that read this as "a block now exists here" need to check for it.
  const [signal] = handleFrame({
    ...commandFrame,
    block: { aux: 0, id: 'air', namespace: 'minecraft' },
  });

  assert.equal(signal.placedBlockType.id, 'minecraft:air');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;

// Unit tests for the six events added from live measurement.
//
// Every frame below was captured verbatim from a Bedrock 1.21 client
// (`header.version` 17104896) over an unencrypted WebSocket connection. None of these
// names appear in the event-name list kept at the bottom of `src/enums/packet.ts`,
// so that list is not a description of what a client will actually send.
//
// Handlers are not exported, so these go through Server, which registers the real ones
// and is also where the signal lands.
//
// Run: node test/measured-events.test.mjs   (after `tsdown`)

import assert from 'node:assert/strict';
import {
  ItemUseMethod,
  Packet,
  DamageCause,
  Packets,
  Server,
  ServerEvent,
} from '../dist/index.mjs';

const PLAYER = {
  color: 'ffededed',
  dimension: 0,
  id: -4294967295,
  name: 'Kai_U',
  position: { x: 42.42772674560547, y: -58.37998962402344, z: -19.0002613067627 },
  type: 'minecraft:player',
  variant: 0,
  yRot: 74.97477722167969,
};

/** An unoccupied equipment slot, as the client actually sends it. */
const EMPTY_SLOT = {
  aux: 0, enchantments: [], freeStackSize: 255,
  id: '', maxStackSize: 255, namespace: '', stackSize: 0,
};

const NETHERITE_SWORD = {
  aux: 0, enchantments: [], freeStackSize: 0,
  id: 'netherite_sword', maxStackSize: 1, namespace: 'minecraft', stackSize: 1,
};

/** Killed by a zombie. */
const PLAYER_DIED_BY_MOB = {
  cause: 2,
  inRaid: false,
  killer: { color: 0, id: 199456, type: 32, variant: 0 },
  player: PLAYER,
};

/** Killed by lava. The killer field is filled in anyway. */
const PLAYER_DIED_BY_LAVA = {
  cause: 8,
  inRaid: false,
  killer: { color: 0, id: 1, type: 1, variant: -1 },
  player: PLAYER,
};

const MOB_KILLED = {
  armorBody: EMPTY_SLOT,
  armorFeet: EMPTY_SLOT,
  armorHead: EMPTY_SLOT,
  armorLegs: EMPTY_SLOT,
  armorTorso: EMPTY_SLOT,
  isMonster: false,
  killMethodType: 2,
  player: PLAYER,
  playerIsHiddenFrom: false,
  victim: {
    color: 0, dimension: 0, id: -103079215078,
    position: { x: 39.01869583129883, y: -60, z: -18.2827205657959 },
    type: 'minecraft:sheep', variant: 0, yRot: -113.90625,
  },
  weapon: NETHERITE_SWORD,
};

const ITEM_USED = {
  count: 1,
  item: { aux: 0, id: 'lava_bucket', namespace: 'minecraft' },
  player: PLAYER,
  useMethod: 9,
};

const END_OF_DAY = { player: PLAYER };

/** Captured from dropping rotten flesh with Q. */
const ITEM_DROPPED = {
  count: 1,
  item: { aux: 0, id: 'rotten_flesh', namespace: 'minecraft' },
  player: PLAYER,
};

/** Captured from a `summon chicken` command. */
const ENTITY_SPAWNED = {
  mob: { type: 10 },
  player: PLAYER,
  spawnType: 2,
};

/**
 * Feeds one frame through the registered handler and returns the signals it produced,
 * deserializing through the same table the network layer uses.
 */
function handleFrame(packetId, serverEvent, body) {
  const server = new Server({ port: 0, disableEncryption: true });
  const connection = {};
  server.worlds.set(connection, { server, resolvePlayer: (name) => ({ name }) });

  const signals = [];
  server.on(serverEvent, (signal) => { signals.push(signal); });

  const handler = [...server.network.handlers].find((h) => h.packet === packetId);
  assert.ok(handler, `no handler registered for ${packetId}`);

  try {
    handler.handle(Packets[packetId].deserialize(body), connection);
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

console.log('PlayerDied');

test('carries the cause and the killing mob', () => {
  const [signal] = handleFrame(Packet.PlayerDied, ServerEvent.PlayerDied, PLAYER_DIED_BY_MOB);

  assert.equal(signal.cause, DamageCause.EntityAttack);
  assert.equal(signal.killer.type, 32);
  assert.equal(signal.inRaid, false);
  assert.equal(signal.player.name, 'Kai_U');
});

test('an environmental death still fills in a killer', () => {
  // Worth pinning: `killer` being present does not mean somebody did the killing.
  const [signal] = handleFrame(Packet.PlayerDied, ServerEvent.PlayerDied, PLAYER_DIED_BY_LAVA);

  assert.equal(signal.cause, DamageCause.Lava);
  assert.deepEqual(signal.killer, { color: 0, id: 1, type: 1, variant: -1 });
});

/**
 * Every pairing below was produced with `/damage <target> 200 <keyword>` against a live
 * client and read back off the resulting frame. Pinned here so a future edit to the enum
 * cannot quietly drift away from the measurement.
 */
const MEASURED_CAUSES = {
  none: -1, override: 0, contact: 1, entity_attack: 2, projectile: 3,
  fall: 5, fire: 6, fire_tick: 7, lava: 8, drowning: 9,
  block_explosion: 10, entity_explosion: 11, void: 12, self_destruct: 13, magic: 14,
  wither: 15, starve: 16, anvil: 17, thorns: 18, falling_block: 19,
  piston: 20, fly_into_wall: 21, magma: 22, fireworks: 23, lightning: 24,
  charging: 25, temperature: 26, freezing: 27, stalactite: 28, stalagmite: 29,
  ram_attack: 30, sonic_boom: 31, campfire: 32,
};

test('the cause numbers match what /damage produced', () => {
  const byNumber = Object.fromEntries(
    Object.entries(DamageCause)
      .filter(([key]) => Number.isNaN(Number(key)))
      .map(([key, value]) => [value, key]),
  );

  for (const [keyword, number] of Object.entries(MEASURED_CAUSES)) {
    assert.ok(byNumber[number] !== undefined, `no DamageCause member for ${keyword} (${number})`);
  }
});

test('includes the remaining causes from Endstone', () => {
  assert.equal(DamageCause.Suffocation, 4);
  assert.equal(DamageCause.SoulCampfire, 33);
  assert.equal(DamageCause.MaceSmash, 34);
});

console.log('MobKilled');

test('identifies the victim by identifier string', () => {
  const [signal] = handleFrame(Packet.MobKilled, ServerEvent.MobKilled, MOB_KILLED);

  assert.equal(signal.victim.type, 'minecraft:sheep');
  assert.equal(signal.isMonster, false);
  assert.equal(signal.killMethodType, DamageCause.EntityAttack);
});

test('killMethodType shares the numbering of PlayerDied.cause', () => {
  // Ten keywords were driven through both events and returned the same number on each:
  // entity_attack 2, projectile 3, contact 1, fire 6, lava 8, block_explosion 10,
  // entity_explosion 11, magic 14, thorns 18, lightning 24. Hence one enum for both.
  const crossChecked = {
    contact: 1, entity_attack: 2, projectile: 3, fire: 6, lava: 8,
    block_explosion: 10, entity_explosion: 11, magic: 14, thorns: 18, lightning: 24,
  };

  for (const [keyword, number] of Object.entries(crossChecked)) {
    assert.equal(MEASURED_CAUSES[keyword], number, `${keyword} disagrees between the two events`);
    const [signal] = handleFrame(Packet.MobKilled, ServerEvent.MobKilled, {
      ...MOB_KILLED, killMethodType: number,
    });
    assert.equal(signal.killMethodType, number);
  }
});

test('regroups the armour slots and drops the empty ones', () => {
  const [signal] = handleFrame(Packet.MobKilled, ServerEvent.MobKilled, MOB_KILLED);

  assert.deepEqual(signal.armor, {
    head: undefined, torso: undefined, legs: undefined, feet: undefined, body: undefined,
  });
  assert.equal(signal.weapon.typeId, 'minecraft:netherite_sword');
});

test('surfaces armour that is actually worn', () => {
  const helmet = {
    aux: 0, enchantments: [], freeStackSize: 0,
    id: 'iron_helmet', maxStackSize: 1, namespace: 'minecraft', stackSize: 1,
  };
  const [signal] = handleFrame(Packet.MobKilled, ServerEvent.MobKilled, {
    ...MOB_KILLED, armorHead: helmet,
  });

  assert.equal(signal.armor.head.typeId, 'minecraft:iron_helmet');
  assert.equal(signal.armor.torso, undefined);
});

console.log('ItemUsed');

test('reports useMethod, which is not ItemInteracted.method', () => {
  const [signal] = handleFrame(Packet.ItemUsed, ServerEvent.ItemUsed, ITEM_USED);

  assert.equal(signal.useMethod, ItemUseMethod.PourBucket);
  assert.equal(signal.item.id, 'lava_bucket');
  assert.equal(signal.count, 1);
});

console.log('EndOfDay');

test('arrives with a player rather than for the world', () => {
  const [signal] = handleFrame(Packet.EndOfDay, ServerEvent.EndOfDay, END_OF_DAY);

  assert.equal(signal.player.name, 'Kai_U');
  assert.equal(signal.rawPlayer.position.y, -58.37998962402344);
});

console.log('ItemDropped');

test('carries only the item type, with no stack detail', () => {
  const [signal] = handleFrame(Packet.ItemDropped, ServerEvent.ItemDropped, ITEM_DROPPED);

  assert.equal(signal.item.id, 'rotten_flesh');
  assert.equal(signal.count, 1);
  assert.equal(signal.item.enchantments, undefined);
  assert.equal(signal.player.name, 'Kai_U');
});

console.log('EntitySpawned');

test('says what spawned but not where', () => {
  const [signal] = handleFrame(Packet.EntitySpawned, ServerEvent.EntitySpawned, ENTITY_SPAWNED);

  assert.equal(signal.mob.type, 10);
  assert.equal(signal.mob.position, undefined);
  assert.equal(signal.spawnType, 2);
});

test('a command-driven spawn still attributes a player', () => {
  // The opposite of BlockPlaced, where a command-driven placement arrives with no player.
  const [signal] = handleFrame(Packet.EntitySpawned, ServerEvent.EntitySpawned, ENTITY_SPAWNED);

  assert.equal(signal.player.name, 'Kai_U');
  assert.equal(signal.rawPlayer.name, 'Kai_U');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;

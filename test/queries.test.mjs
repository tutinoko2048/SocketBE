// Unit tests for the queries added after sweeping what commands actually return.
//
// Bedrock does not advertise which commands carry structured data, so the only way to
// find out is to send one and look for keys beyond statusCode and statusMessage. Every
// response body below was captured that way from a live client, verbatim.
//
// The world here is a stub whose runCommand replays those captures, which keeps the
// parsing under test without needing a client.
//
// Run: node test/queries.test.mjs   (after `tsdown`)

import assert from 'node:assert/strict';
import { Player } from '../dist/index.mjs';

/** Bodies exactly as the client sent them. */
const RESPONSES = {
  'querytarget @e': {
    statusCode: 0,
    details: JSON.stringify([
      { dimension: 0, id: -4294967295, position: { x: 71.5, y: -57.3, z: -7.9 }, uniqueId: '53ab992d', yRot: 137.1 },
      { dimension: 0, id: -111669149660, position: { x: 78.9, y: -59.2, z: 1.9 }, uniqueId: '-111669149660', yRot: 139 },
    ]),
  },
  'querytarget @e[type=zombie]': {
    statusCode: -2147352576,
    statusMessage: 'No targets matched selector',
  },
  gamerule: {
    statusCode: 0,
    details: JSON.stringify({ keepInventory: false, showCoordinates: false, randomTickSpeed: 1, pvp: true }),
  },
  'gamerule showcoordinates': {
    statusCode: 0,
    details: JSON.stringify({ showCoordinates: false }),
  },
  'summon chicken ~ ~ ~': {
    statusCode: 0,
    entityType: 'minecraft:chicken',
    spawnPos: { x: 69.5, y: -58, z: -8.5 },
    uId: '-111669149461',
    wasSpawned: true,
  },
  'xp 0 "Kai_U"': { statusCode: 0, amount: 7, level: 2, player: ['Kai_U'] },
  'xp 3L "Kai_U"': { statusCode: 0, amount: 0, level: 5, player: ['Kai_U'] },
  'clear "Kai_U" stone 0 0': { statusCode: 0, playerTest: ['Kai_U (64)'] },
  'clear "Kai_U" diamond 0 0': {
    statusCode: -2147352576,
    statusMessage: 'No items were found on player Kai_U',
  },
};

function newWorld() {
  const asked = [];
  const world = {
    asked,
    server: { options: {} },
    runCommand: async (commandLine) => {
      asked.push(commandLine);
      const key = commandLine.replace(/\s+/g, ' ').trim();
      const body = RESPONSES[key];
      assert.ok(body, `no capture for: ${key}`);
      return body;
    },
    resolvePlayer: (name) => ({ name }),
  };
  return world;
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failed++;
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}

const { World } = await import('../dist/index.mjs');
/** Borrows World's methods without constructing one, which would need a socket. */
const callWorld = (world, method, ...args) => World.prototype[method].apply(world, args);

console.log('queryEntities');

await test('takes any selector, not just a player name', async () => {
  const world = newWorld();
  const entities = await callWorld(world, 'queryEntities', '@e');

  assert.equal(entities.length, 2);
  assert.equal(entities[1].uniqueId, '-111669149660');
  assert.deepEqual(world.asked, ['querytarget @e']);
});

await test('a selector matching nothing gives an empty array, not a throw', async () => {
  // The client reports this as a failure status; an empty result is not an error here.
  const world = newWorld();
  assert.deepEqual(await callWorld(world, 'queryEntities', '@e[type=zombie]'), []);
});

console.log('game rules');

await test('reads every rule in one command', async () => {
  const world = newWorld();
  const rules = await callWorld(world, 'getGameRules');

  assert.equal(rules.keepInventory, false);
  assert.equal(rules.randomTickSpeed, 1);
  assert.deepEqual(world.asked, ['gamerule']);
});

await test('matches a rule name case-insensitively', async () => {
  // The response echoes the canonical casing, which is not what callers will type.
  const world = newWorld();
  assert.equal(await callWorld(world, 'getGameRule', 'showcoordinates'), false);
});

console.log('summon');

await test('reports the new entity uId', async () => {
  const world = newWorld();
  const result = await callWorld(world, 'summonEntity', 'chicken');

  assert.equal(result.uId, '-111669149461');
  assert.equal(result.entityType, 'minecraft:chicken');
  assert.equal(result.wasSpawned, true);
});

console.log('experience');

const newPlayer = (world) => Object.assign(Object.create(Player.prototype), {
  world,
  rawName: 'Kai_U',
  name: 'Kai_U',
});

await test('getExperience keeps the progress that getLevel drops', async () => {
  const world = newWorld();
  const xp = await Player.prototype.getExperience.call(newPlayer(world));

  assert.deepEqual(xp, { level: 2, amount: 7 });
});

await test('getLevel still answers a bare number', async () => {
  const world = newWorld();
  assert.equal(await Player.prototype.getLevel.call(newPlayer(world)), 2);
});

await test('addLevel reports the level after the change', async () => {
  const world = newWorld();
  const xp = await Player.prototype.addLevel.call(newPlayer(world), 3);

  assert.deepEqual(xp, { level: 5, amount: 0 });
});

console.log('item count');

await test('reads the count out of the string the command returns', async () => {
  // There is no count query; `clear` with a maximum of 0 removes nothing and reports.
  const world = newWorld();
  const count = await Player.prototype.getItemCount.call(newPlayer(world), 'stone');

  assert.equal(count, 64);
  assert.deepEqual(world.asked, ['clear "Kai_U" stone 0 0']);
});

await test('carrying none of the item is 0, not an error', async () => {
  const world = newWorld();
  assert.equal(await Player.prototype.getItemCount.call(newPlayer(world), 'diamond'), 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;

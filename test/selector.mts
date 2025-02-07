import { EntityFilterUtil, GameMode, InputPermissionCategory } from '../src';

const args = EntityFilterUtil.buildSelector('@a', {
  tags: ['tag1', 'tag2'],
  gameMode: GameMode.survival,
  minLevel: 10,
  scoreOptions: [
    { objective: 'objective1', minScore: 10, maxScore: 20 },
    { objective: 'objective2', minScore: 30, maxScore: 40, exclude: true }
  ],
  permissionOptions: [
    { permission: InputPermissionCategory.Camera, enabled: true },
  ],
  itemOptions: [
    {
      item: 'minecraft:diamond',
      quantity: { greaterThanOrEqual: 10 },
    }
  ],
  location: { x: 0, y: 0, z: 0 },
  maxDistance: 10,
  closest: 5,
});
console.log(args);
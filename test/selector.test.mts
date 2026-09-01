import { expect, it } from 'vite-plus/test';
import { EntityQueryUtil, GameMode, InputPermissionCategory } from '../src';

it('builds a selector with the supported query options', () => {
  const selector = EntityQueryUtil.buildSelector('@a', {
    tags: ['tag1', 'tag2'],
    gameMode: GameMode.Survival,
    minLevel: 10,
    scoreOptions: [
      { objective: 'objective1', minScore: 10, maxScore: 20 },
      { objective: 'objective2', minScore: 30, maxScore: 40, exclude: true },
    ],
    permissionOptions: [
      { permission: InputPermissionCategory.Camera, enabled: true },
    ],
    itemOptions: [
      {
        item: 'minecraft:diamond',
        quantity: { greaterThanOrEqual: 10 },
      },
    ],
    location: { x: 0, y: 0, z: 0 },
    maxDistance: 10,
    closest: 5,
  });

  expect(selector).toBe(
    '@a[tag="tag1",tag="tag2",m=survival,lm=10,scores={objective1=10..20,objective2=!30..40},haspermission={camera=enabled},hasitem=[{item=minecraft:diamond,quantity=10..}],x=0,y=0,z=0,r=10,c=5]',
  );
});

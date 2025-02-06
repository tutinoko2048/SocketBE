import * as _minecraftserver from '@minecraft/server';

/**
 * Input permission categories.
 *
 * Reference: {@link _minecraftserver.InputPermissionCategory}
 */
export enum InputPermissionCategory {
  /**
   * @remarks
   * Player input relating to camera movement.
   *
   */
  Camera = 'camera',
  /**
   * @remarks
   * Player input relating to all player movement. Disabling this
   * is equivalent to disabling jump, sneak, lateral movement,
   * mount, and dismount.
   *
   */
  Movement = 'movement',
  /**
   * @rc
   * @remarks
   * Player input for moving laterally in the world. This would
   * be WASD on a keyboard or the movement joystick on gamepad or
   * touch.
   *
   */
  LateralMovement = 'lateral_movement',
  /**
   * @rc
   * @remarks
   * Player input relating to sneak. This also affects flying
   * down.
   *
   */
  Sneak = 'sneak',
  /**
   * @rc
   * @remarks
   * Player input relating to jumping. This also affects flying
   * up.
   *
   */
  Jump = 'jump',
  /**
   * @rc
   * @remarks
   * Player input relating to mounting vehicles.
   *
   */
  Mount = 'mount',
  /**
   * @rc
   * @remarks
   * Player input relating to dismounting. When disabled, the
   * player can still dismount vehicles by other means, for
   * example on horses players can still jump off and in boats
   * players can go into another boat.
   *
   */
  Dismount = 'dismount',
  /**
   * @rc
   * @remarks
   * Player input relating to moving the player forward.
   *
   */
  MoveForward = 'move_forward',
  /**
   * @rc
   * @remarks
   * Player input relating to moving the player backward.
   *
   */
  MoveBackward = 'move_backward',
  /**
   * @rc
   * @remarks
   * Player input relating to moving the player left.
   *
   */
  MoveLeft = 'move_left',
  /**
   * @rc
   * @remarks
   * Player input relating to moving the player right.
   *
   */
  MoveRight = 'move_right',
}

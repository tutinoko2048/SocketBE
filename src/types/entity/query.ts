import type { EntityQueryOptions as MCEntityQueryOptions } from '@minecraft/server';
import type { EntityEquipmentSlot, GameMode, InputPermissionCategory } from '../../enums';

type Flatten<T> = { [K in keyof T]: T[K] };
type Override<Base, T> = Flatten<Omit<Base, keyof T> & T>;

export type EntityQueryOptions = Override<MCEntityQueryOptions, {
  gameMode?: GameMode;
  excludeGameModes?: GameMode[];

  /** hasitem in commands */
  itemOptions?: EntityQueryItemOptions[];

  /** has_property in commands */
  propertyOptions?: EntityQueryPropertyOptions[];

  /** haspermission in commands */
  permissionOptions?: EntityQueryPermissionOptions[];

  /** Represents \@r selector */
  random?: boolean;
}>;

export interface EntityQueryItemOptions {
  item: string;
  quantity?: RangedNumber;
  location?: EntityEquipmentSlot;
  slot?: RangedNumber;
  data?: number;
}

export interface EntityQueryPropertyOptions {
  propertyId: string;
  exclude?: boolean;
  value: string | boolean | RangedNumber;
}

export interface EntityQueryPermissionOptions {
  permission: InputPermissionCategory;
  enabled: boolean;
}

export type RangedNumber = number | RangeOperator | [min: number, max: number];

export interface RangeOperator {
  greaterThanOrEqual?: number;
  lessThanOrEqual?: number;
}

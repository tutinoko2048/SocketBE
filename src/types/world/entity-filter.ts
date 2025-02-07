import type { EntityFilter as MCEntityFilter, EntityQueryOptions as MCEntityQueryOptions } from '@minecraft/server';
import type { EquipmentSlot, GameMode, InputPermissionCategory } from '../../enums';

type Flatten<T> = { [K in keyof T]: T[K] };
type Override<Base, T> = Flatten<Omit<Base, keyof T> & T>;

export type EntityFilter = Override<MCEntityFilter, Filter>;

export type EntityQueryOptions = Override<MCEntityQueryOptions, Filter>;

export interface Filter {
  gameMode?: GameMode;
  excludeGameModes?: GameMode[];

  /** hasitem in commands */
  itemOptions?: EntityItemFilter[];

  /** has_property in commands */
  propertyOptions?: PropertyFilter[];

  /** haspermission in commands */
  permissionOptions?: PermissionFilter[];

  /** Represents \@r selector */
  random?: boolean;
}

export interface EntityItemFilter {
  item: string;
  quantity?: RangedNumber;
  location?: EquipmentSlot;
  slot?: RangedNumber;
  data?: number;
}

export interface PropertyFilter {
  propertyId: string;
  exclude?: boolean;
  value: string | boolean | RangedNumber;
}

export interface PermissionFilter {
  permission: InputPermissionCategory;
  enabled: boolean;
}

export type RangedNumber = number | RangeOperator | [min: number, max: number];

export interface RangeOperator {
  greaterThanOrEqual?: number;
  lessThanOrEqual?: number;
}

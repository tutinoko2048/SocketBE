import type { EntityQueryOptions, RangedNumber, Selector } from '../../types';

type Entries<T> = (
  keyof T extends infer U
    ? U extends keyof T
      ? [U, T[U]]
      : never
    : never
)[];

function getEntries<T extends Record<string, unknown>>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}

export class EntityQueryUtil {
  public static buildSelector(defaultSelector: Selector, options: EntityQueryOptions): string {
    let selector = defaultSelector;
    if (options.random) selector = '@r';

    const args = EntityQueryUtil.buildArguments(options);

    return `${selector}[${args.join(',')}]`;
  }
  
  public static buildArguments(options: EntityQueryOptions): string[] {
    const args: string[] = [];
    
    for (const [name, value] of getEntries(options)) {
      switch (name) {
        case 'excludeFamilies':
          args.push(...value.map(f => `family=!${f}`));
          break;

        case 'excludeGameModes':
          args.push(...value.map(gm => `m=!${gm}`));
          break;

        case 'excludeNames':
          args.push(...value.map(n => `name=!"${n}"`));
          break;

        case 'excludeTags':
          args.push(...value.map(t => `tag=!"${t}"`));
          break;

        case 'families':
          args.push(...value.map(f => `family=${f}`));
          break;

        case 'gameMode':
          args.push(`m=${value}`);
          break;

        case 'maxHorizontalRotation':
          args.push(`ry=${value}`);
          break;

        case 'maxLevel':
          args.push(`l=${value}`);
          break;

        case 'maxVerticalRotation':
          args.push(`rx=${value}`);
          break;

        case 'minHorizontalRotation':
          args.push(`rym=${value}`);
          break;

        case 'minLevel':
          args.push(`lm=${value}`);
          break;

        case 'minVerticalRotation':
          args.push(`rxm=${value}`);
          break;

        case 'name':
          args.push(`name="${value}"`);
          break;

        /** {@link EntityQueryOptions.propertyOptions} */
        case 'propertyOptions': {
          const options = value.map(({ exclude, propertyId, value }) => {

            const parts: string[] = [];
            
            parts.push(propertyId);
            if (exclude) parts.push('!');
            if (typeof value === 'string' || typeof value === 'boolean') {
              parts.push(value.toString());
            } else {
              parts.push(EntityQueryUtil.stringifyRangedNumber(value));
            }
            
            return parts.join('');
          });
          args.push(`has_property={${options.join(',')}}`);
          break;
        }

        /** {@link EntityQueryOptions.scoreOptions} */
        case 'scoreOptions': {
          const options = value.map(({ objective, minScore, maxScore, exclude }) => {
            if (minScore === undefined && maxScore === undefined) {
              throw new Error(`Both minScore and maxScore cannot be undefined for objective ${objective}`);
            }
            
            const parts: string[] = [];

            if (exclude) parts.push(`!`);
            parts.push(
              EntityQueryUtil.stringifyRangedNumber({ greaterThanOrEqual: minScore, lessThanOrEqual: maxScore })
            );
            
            return `${objective}=${parts.join('')}`;
          });
          args.push(`scores={${options.join(',')}}`);
          break;
        }

        case 'tags':
          args.push(...value.map(t => `tag="${t}"`));
          break;

        case 'type':
          args.push(`type=${value}`);
          break;

        /** {@link EntityQueryOptions.itemOptions} */
        case 'itemOptions': {
          const options = value.map(({ item, quantity, location, slot, data }) => {
            const parts: string[] = [];

            parts.push(`item=${item}`);
            if (quantity) parts.push(`quantity=${EntityQueryUtil.stringifyRangedNumber(quantity)}`);
            if (location) parts.push(`location=${location}`);
            if (slot) parts.push(`slot=${EntityQueryUtil.stringifyRangedNumber(slot)}`);
            if (data) parts.push(`data=${data}`);

            return `{${parts.join(',')}}`;
          });
          args.push(`hasitem=[${options.join(',')}]`);
          break;
        }

        /** {@link EntityQueryOptions.permissionOptions} */
        case 'permissionOptions': {
          const options = value.map(({ permission, enabled }) => (
            `${permission}=${enabled ? 'enabled' : 'disabled'}`
          ));
          args.push(`haspermission={${options.join(',')}}`);
          break;
        }

        case 'closest':
          args.push(`c=${value}`);
          break;

        case 'farthest':
          args.push(`c=-${value}`);
          break;

        case 'location':
          args.push(`x=${value.x}`);
          args.push(`y=${value.y}`);
          args.push(`z=${value.z}`);
          break;

        case 'maxDistance':
          args.push(`r=${value}`);
          break;

        case 'minDistance':
          args.push(`rm=${value}`);
          break;

        case 'volume':
          args.push(`dx=${value.x}`);
          args.push(`dy=${value.y}`);
          args.push(`dz=${value.z}`);
          break;

        case 'excludeTypes':
          args.push(...value.map(t => `type=!${t}`));
          break;

        case 'random':
          break;

        default: name satisfies never;
      }
    }
    
    return args;
  }

  /**
   * Converts a RangedNumber to a string like `1..` or `..5` or `1..5`.
   */
  public static stringifyRangedNumber(value: RangedNumber): string {
    if (typeof value === 'number') return value.toString();
    
    if (Array.isArray(value)) return `${value[0]}..${value[1]}`;
    
    const parts: string[] = [];
    
    if (value.greaterThanOrEqual !== undefined) parts.push(value.greaterThanOrEqual.toString());
    parts.push('..');
    if (value.lessThanOrEqual !== undefined) parts.push(value.lessThanOrEqual.toString());

    return parts.join('');
  }
}
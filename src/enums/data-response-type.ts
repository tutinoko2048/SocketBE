/**
 * The `type` field on a `data` response, which says which catalogue it carries.
 *
 * @remarks
 * Measured by sending each of the three `data:` purposes and reading the header back:
 * `data:block` answered with `dataType: "block"` and `type: 0` over 1994 entries,
 * `data:item` with `"item"` and `1` over 1838, `data:mob` with `"mob"` and `2` over 96.
 *
 * These three are the whole set as far as can be told. Twenty other spellings were tried -
 * `data:entity`, `data:chunk`, `data:biome` and the like - and every one was met with
 * silence, as were two deliberate nonsense purposes used as a control. Silence is not
 * proof of absence, but the three known purposes answered reliably in the same run.
 */
export enum DataResponseType {
  Block = 0,
  Item = 1,
  Mob = 2,
}

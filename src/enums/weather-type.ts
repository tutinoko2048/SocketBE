import * as _minecraftserver from '@minecraft/server';

/**
 * Used to specify the type of weather condition within the
 * world.
 * 
 * Reference: {@link _minecraftserver.WeatherType}
 */
export enum WeatherType {
  /**
   * @remarks
   * Specifies a clear weather condition.
   *
   */
  Clear = 'Clear',
  /**
   * @remarks
   * Specifies a rain weather condition.
   *
   */
  Rain = 'Rain',
  /**
   * @remarks
   * Specifies a rain and thunder weather condition.
   *
   */
  Thunder = 'Thunder',
}
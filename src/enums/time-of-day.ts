import * as _minecraftserver from '@minecraft/server';

/**
 * Provides numeric values for common periods in the Minecraft
 * day.  
 * 
 * Reference: {@link _minecraftserver.TimeOfDay}
 */
export enum TimeOfDay {
  /**
   * @remarks
   * Sets the time to the start of the day, which is time of the
   * day 1,000 (or the equivalent of 7am) in Minecraft.
   *
   */
  Day = 1000,
  /**
   * @remarks
   * Sets the time to noon, which is time of the day 6,000 in
   * Minecraft.
   *
   */
  Noon = 6000,
  /**
   * @remarks
   * Sets the time to sunset, which is time of the day 12,000 (or
   * the equivalent of 6pm) in Minecraft.
   *
   */
  Sunset = 12000,
  /**
   * @remarks
   * Sets the time to night, which is time of the day 13,000 (or
   * the equivalent of 7:00pm) in Minecraft.
   *
   */
  Night = 13000,
  /**
   * @remarks
   * Sets the time to midnight, which is time of the day 18,000
   * (or the equivalent of 12:00am) in Minecraft.
   *
   */
  Midnight = 18000,
  /**
   * @remarks
   * Sets the time to sunrise, which is time of the day 23,000
   * (or the equivalent of 5am) in Minecraft.
   *
   */
  Sunrise = 23000,
}

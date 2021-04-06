import {
  ISO8601,
} from '../types';

export default class Clock {
  private _timestampAdjustment: number;

  constructor(timestampAdjustment?: number) {
    this._timestampAdjustment = timestampAdjustment || 0;
  }

  /**
   * @description Set the timestampAdjustment which is the number of seconds the system time should
   * be adjusted for every API call.
   *
   * @param timestampAdjustment seconds to adjust the system time.
   */
  public setTimestampAdjustment(
    timestampAdjustment: number,
  ): void {
    this._timestampAdjustment = timestampAdjustment;
  }

  /**
   * @description Get the current value of timestampAdjustment.
   */
  get timestampAdjustment(): number {
    return this._timestampAdjustment;
  }

  /**
   * @description Get the ISO8601 string for the current time adjusted by the timestampAdjustment.
   */
  public getAdjustedIsoString(): ISO8601 {
    const timestamp: Date = new Date();
    timestamp.setSeconds(timestamp.getSeconds() + this._timestampAdjustment);
    return timestamp.toISOString();
  }
}

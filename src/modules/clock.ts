import {
  ISO8601,
} from '../types';

export default class Clock {
  private _timestampAdjustment: number;

  constructor(timestampAdjustment?: number) {
    this._timestampAdjustment = timestampAdjustment || 0;
  }

  get timestampAdjustment(): number {
    return this._timestampAdjustment;
  }

  public setTimestampAdjustment(
    timestampAdjustment: number,
  ): void {
    this._timestampAdjustment = timestampAdjustment;
  }

  public getAdjustedIsoString(): ISO8601 {
    const timestamp: Date = new Date();
    timestamp.setSeconds(timestamp.getSeconds() + this._timestampAdjustment);
    return timestamp.toISOString();
  }
}

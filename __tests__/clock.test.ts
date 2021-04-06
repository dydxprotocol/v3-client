import { DydxClient } from '../src';

describe('Clock', () => {
  it('constructor', async () => {
    const client = new DydxClient('https://example.com', {});
    expect(client.clock.timestampAdjustment).toEqual(0);
  });

  it('setTimestampAdjustment', async () => {
    const newAdjustment: number = 124234.123;
    const client = new DydxClient('https://example.com', {});
    client.clock.setTimestampAdjustment(newAdjustment);
    expect(client.clock.timestampAdjustment).toEqual(newAdjustment);
  });

  it('getAdjustedIsoString', async () => {
    const newAdjustment: number = -312340.5;
    const client = new DydxClient('https://example.com', {});
    const iso1 = client.clock.getAdjustedIsoString();
    client.clock.setTimestampAdjustment(newAdjustment);
    const iso2 = client.clock.getAdjustedIsoString();

    const oneSecondMs: number = 1000; // iso1/iso2 should be generated within 1 second of each other
    const msAdjustment: number = newAdjustment * 1000;
    expect(Date.parse(iso2) >= Date.parse(iso1) + msAdjustment);
    expect(Date.parse(iso2) <= Date.parse(iso1) + msAdjustment + oneSecondMs);
  });
});

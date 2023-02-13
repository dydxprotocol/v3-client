import { getAllSignatureRotations } from '../../src/eth-signing/helpers';

const ONBOARDING_SIGNATURE_RS = (
  '0x429e616f0d1f73dedbb8ab1d975dca6737b7d2b800ce144c4d1176208288d6cf03' +
  '3b5c589fe04c2ec02fefb6d5af44648d74efa3b25da8708e2d33e648a34837'
);
const ONBOARDING_SIGNATURE = `${ONBOARDING_SIGNATURE_RS}1c00`;
const ONBOARDING_SIGNATURE_ROTATED_V = `${ONBOARDING_SIGNATURE_RS}0100`;
const ONBOARDING_SIGNATURE_ROTATED_T = `${ONBOARDING_SIGNATURE_RS}1c03`;
const ONBOARDING_SIGNATURE_BOTH_ROTATED = `${ONBOARDING_SIGNATURE_RS}0103`;

describe('Signature Formatting', () => {
  describe('getAllSignatureRotations', () => {
    it('rotates a valid signature', () => {
      expect(getAllSignatureRotations(ONBOARDING_SIGNATURE)).toEqual([
        ONBOARDING_SIGNATURE,
        ONBOARDING_SIGNATURE_ROTATED_V,
        ONBOARDING_SIGNATURE_ROTATED_T,
        ONBOARDING_SIGNATURE_BOTH_ROTATED,
      ]);
    });
    it('does not rotate v when invalid', () => {
      expect(getAllSignatureRotations(`${ONBOARDING_SIGNATURE_RS}1d00`)).toEqual([
        `${ONBOARDING_SIGNATURE_RS}1d00`,
        `${ONBOARDING_SIGNATURE_RS}1d00`,
        `${ONBOARDING_SIGNATURE_RS}1d03`,
        `${ONBOARDING_SIGNATURE_RS}1d03`,
      ]);
    });
    it('does not rotate t when invalid', () => {
      expect(getAllSignatureRotations(`${ONBOARDING_SIGNATURE_RS}1c02`)).toEqual([
        `${ONBOARDING_SIGNATURE_RS}1c02`,
        `${ONBOARDING_SIGNATURE_RS}0102`,
        `${ONBOARDING_SIGNATURE_RS}1c02`,
        `${ONBOARDING_SIGNATURE_RS}0102`,
      ]);
    });
    it('throws on invalid signature', () => {
      expect(() => getAllSignatureRotations(ONBOARDING_SIGNATURE_RS)).toThrow(`Invalid signature: ${ONBOARDING_SIGNATURE_RS}`);
    });
  });
});

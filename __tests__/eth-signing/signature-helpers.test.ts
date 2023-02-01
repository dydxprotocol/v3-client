import { rotateRawSignature } from '../../src/eth-signing/helpers';

const SIGNATURE_WITH_V_27_A = '0xb408f3ec452d00';
const SIGNATURE_WITH_V_27_B = '0xb408f3ec452d1b';
const SIGNATURE_WITH_V_28_A = '0xb408f3ec452d01';
const SIGNATURE_WITH_V_28_B = '0xb408f3ec452d1c';

describe('Signature Formatting', () => {
  describe('rotateRawSignature', () => {
    it('rotates 00', () => {
      expect(rotateRawSignature(SIGNATURE_WITH_V_27_A)).toEqual(SIGNATURE_WITH_V_27_B);
    });
    it('rotates 01', () => {
      expect(rotateRawSignature(SIGNATURE_WITH_V_28_A)).toEqual(SIGNATURE_WITH_V_28_B);
    });
    it('rotates 1b', () => {
      expect(rotateRawSignature(SIGNATURE_WITH_V_27_B)).toEqual(SIGNATURE_WITH_V_27_A);
    });
    it('rotates 1c', () => {
      expect(rotateRawSignature(SIGNATURE_WITH_V_28_B)).toEqual(SIGNATURE_WITH_V_28_A);
    });
    it('handles invalid v', () => {
      expect(() => rotateRawSignature('0xb408f3ec452d12')).toThrow(new Error('Invalid v value: 12'));
    });
    it('handles invalid signature length', () => {
      expect(() => rotateRawSignature('1')).toThrow(new Error('Invalid v value: 1'));
    });
  });
});

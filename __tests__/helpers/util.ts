import Web3 from 'web3';

/**
 * Utilities for writing unit tests with Jest.
 */

export const DUMMY_ADDRESS: string = '0x5944ca68fb9dc1cbfb82f69cb435e44c5b577364';

export const PROVIDER = new Web3.providers.HttpProvider('http://0.0.0.0:8445');

/* eslint-disable @typescript-eslint/no-explicit-any */
type Fn = (...args: any[]) => any;
type FnMock<F extends Fn> = jest.Mock<ReturnType<F>, Parameters<F>>;

type ObjMock<T extends {}> = {
  [K in keyof T]: T[K] extends Fn ? FnMock<T[K]> : ObjMock<T[K]>;
};

type Module = { [param: string]: Fn };
type ModuleMock<M extends Module> = {
  [K in keyof M]: M[K] extends Fn ? FnMock<M[K]> : ObjMock<M[K]>;
};

/**
 * Wrap a mocked function or module with the appropriate Jest mock typings.
 */
export function asMock<F extends Fn>(mock: F): FnMock<F>;
export function asMock<M extends Module>(mock: M): ModuleMock<M>;
export function asMock(mock: Fn | Module) {
  if (typeof mock === 'function') {
    return mock as FnMock<typeof mock>;
  }
  return mock as ModuleMock<typeof mock>;
}

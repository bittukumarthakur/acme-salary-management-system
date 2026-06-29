/// <reference types="jest" />

/**
 * Jest setup file to mock Prisma Client globally for all tests.
 * Uses jest-mock-extended to create a mocked Prisma instance.
 *
 * This mocks the Prisma import before any test code runs,
 * so all services and routes get the mock instead of a real database connection.
 *
 * Reference: https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing#singleton
 */

import { mockDeep } from 'jest-mock-extended';

declare const jest: any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('./lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<any>(),
}));


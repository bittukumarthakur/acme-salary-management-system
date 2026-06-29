/**
 * Mock context for testing with dependency injection pattern.
 * Uses jest-mock-extended to mock Prisma Client.
 *
 * Reference: https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing
 */

import { PrismaClient } from '../../generated/prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

/**
 * Create a fresh mock context for each test.
 * Returns a mocked Prisma instance with full type safety.
 */
export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};

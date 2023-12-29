import * as functions from 'firebase-functions';
import db from '../utils/db';

jest.mock('firebase-functions', () => ({
    https: {
        onRequest: jest.fn(),
    },
}));

jest.mock('./utils/db', () => ({
    collection: jest.fn().mockReturnThis(),
    add: jest.fn(),
}));

export const mockFunctions = functions;
export const mockDb = db;
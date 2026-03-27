export const openDatabaseSync = jest.fn(() => ({
  execAsync: jest.fn().mockResolvedValue(true),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
  prepareAsync: jest.fn().mockResolvedValue({
    executeAsync: jest.fn().mockResolvedValue({ getAllAsync: jest.fn().mockResolvedValue([]) }),
    finalizeAsync: jest.fn().mockResolvedValue(true),
  }),
}));

export default {
  openDatabaseSync,
};

export const documentDirectory = "file:///test-dir/";
export const moveAsync = jest.fn().mockResolvedValue(true);
export const deleteAsync = jest.fn().mockResolvedValue(true);
export const makeDirectoryAsync = jest.fn().mockResolvedValue(true);

export default {
  documentDirectory,
  moveAsync,
  deleteAsync,
  makeDirectoryAsync,
};

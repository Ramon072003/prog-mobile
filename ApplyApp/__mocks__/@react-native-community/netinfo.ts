export const addEventListener = jest.fn((callback) => {
  callback({ isConnected: true, isInternetReachable: true });
  return jest.fn(); // unsubscribe
});

export const useNetInfo = jest.fn(() => ({
  isConnected: true,
  isInternetReachable: true,
}));

export default {
  addEventListener,
  useNetInfo,
};

import React from "react";
import { View } from "react-native";

export const CameraView = (props: any) => <View {...props} />;
export const useCameraPermissions = jest.fn(() => [
  { status: "granted", canAskAgain: true },
  jest.fn().mockResolvedValue({ status: "granted" }),
]);

export default {
  CameraView,
  useCameraPermissions,
};

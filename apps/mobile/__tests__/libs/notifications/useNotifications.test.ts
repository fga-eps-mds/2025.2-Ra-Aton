import { renderHook, act } from "@testing-library/react-native";
import { Platform } from "react-native";
import { useNotifications } from "@/libs/notifications/useNotifications";

jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: "android",
    },
  };
});

jest.mock("@/libs/notifications/registerNotifications", () => ({
  registerForPushNotificationsAsync: jest.fn(),
  setupNotificationHandler: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
  addNotificationReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

import {
  registerForPushNotificationsAsync,
  setupNotificationHandler,
} from "@/libs/notifications/registerNotifications";

describe("useNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não deve registrar notificações na Web", () => {
    Platform.OS = "web";

    renderHook(() => useNotifications());

    expect(setupNotificationHandler).not.toHaveBeenCalled();
    expect(registerForPushNotificationsAsync).not.toHaveBeenCalled();
  });

  it("deve registrar e salvar o expoPushToken", async () => {
    Platform.OS = "android";

    (registerForPushNotificationsAsync as jest.Mock).mockResolvedValue(
      "expo-token-123"
    );

    const { result } = renderHook(() => useNotifications());

    await act(async () => {});

    expect(result.current.expoPushToken).toBe("expo-token-123");
  });
});

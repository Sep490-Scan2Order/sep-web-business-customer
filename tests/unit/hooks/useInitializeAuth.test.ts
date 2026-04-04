import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const { mockRestoreAuthFromStorage } = vi.hoisted(() => ({
  mockRestoreAuthFromStorage: vi.fn(),
}));

vi.mock("@/src/store/authStore", () => ({
  restoreAuthFromStorage: mockRestoreAuthFromStorage,
}));

import { useInitializeAuth } from "@/src/hooks/useInitializeAuth";

describe("useInitializeAuth", () => {
  it("calls restoreAuthFromStorage on mount", () => {
    renderHook(() => useInitializeAuth());

    expect(mockRestoreAuthFromStorage).toHaveBeenCalledTimes(1);
  });
});

"use client";

import React from "react";
import {
  startGlobalLoading,
  stopGlobalLoading,
} from "@/src/store/globalLoadingStore";

const FETCH_PATCH_FLAG = "__globalLoadingFetchPatched";

type FetchPatchWindow = Window & {
  [FETCH_PATCH_FLAG]?: boolean;
  __originalFetchForLoading__?: typeof window.fetch;
};

export default function GlobalLoadingProvider() {
  React.useEffect(() => {
    const loadingWindow = window as FetchPatchWindow;
    if (loadingWindow[FETCH_PATCH_FLAG]) return;

    const originalFetch = window.fetch.bind(window);
    loadingWindow[FETCH_PATCH_FLAG] = true;
    loadingWindow.__originalFetchForLoading__ = originalFetch;

    window.fetch = async (...args) => {
      startGlobalLoading();
      try {
        return await originalFetch(...args);
      } finally {
        stopGlobalLoading();
      }
    };

    return () => {
      if (loadingWindow.__originalFetchForLoading__) {
        window.fetch = loadingWindow.__originalFetchForLoading__;
        delete loadingWindow.__originalFetchForLoading__;
      }
      loadingWindow[FETCH_PATCH_FLAG] = false;
    };
  }, []);

  return null;
}

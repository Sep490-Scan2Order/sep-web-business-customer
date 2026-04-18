type GlobalLoadingListener = (isLoading: boolean) => void;

let pendingRequestCount = 0;
const listeners = new Set<GlobalLoadingListener>();

const emit = () => {
  const isLoading = pendingRequestCount > 0;
  listeners.forEach((listener) => listener(isLoading));
};

export const startGlobalLoading = () => {
  pendingRequestCount += 1;
  emit();
};

export const stopGlobalLoading = () => {
  if (pendingRequestCount > 0) {
    pendingRequestCount -= 1;
  }
  emit();
};

export const getGlobalLoadingState = () => pendingRequestCount > 0;

export const subscribeGlobalLoading = (listener: GlobalLoadingListener) => {
  listeners.add(listener);
  listener(getGlobalLoadingState());

  return () => {
    listeners.delete(listener);
  };
};

'use client';

import { useInitializeAuth } from '@/src/hooks/useInitializeAuth';

export function AuthInitializer() {
  useInitializeAuth();
  return null;
}

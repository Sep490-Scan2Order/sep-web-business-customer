'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { useAuth } from '@/src/hooks/useAuth';

interface UseRealtimeOptions {
  tenantId: string | undefined;
  onCountChanged: (count: number) => void;
  onListChanged: () => void;
}

export function useRealtime({
  tenantId,
  onCountChanged,
  onListChanged,
}: UseRealtimeOptions) {
  const { token } = useAuth();

  // Keep latest callbacks in refs to avoid reconnecting on every render
  const onCountChangedRef = useRef(onCountChanged);
  const onListChangedRef = useRef(onListChanged);

  useEffect(() => {
    onCountChangedRef.current = onCountChanged;
  });

  useEffect(() => {
    onListChangedRef.current = onListChanged;
  });

  useEffect(() => {
    if (!tenantId || !token) return;

    const hubUrl = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL;

    if (!hubUrl) {
      console.error("Biến môi trường NEXT_PUBLIC_SIGNALR_HUB_URL chưa được thiết lập!");
      return;
    }
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || '',
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', () => {
      toast.info('🔔 Bạn có thông báo mới!', {
        position: 'top-right',
        autoClose: 4000,
      });
    });

    connection.on('CountChanged', (count: number) => {
      onCountChangedRef.current(count);
    });

    connection.on('ListChanged', () => {
      onListChangedRef.current();
    });

    const start = async () => {
      try {
        await connection.start();
        await connection.invoke('JoinGroup', tenantId);
      } catch (error) {
        console.error('SignalR connection failed:', error);
      }
    };

    start();

    return () => {
      connection.stop();
    };
  }, [tenantId, token]);
}

"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { useRealtime } from "@/src/hooks/useRealtime";
import { notificationService } from "@/src/services/notificationService";
import { NotifyTenantDetailItem, UserInfo } from "@/src/types/type";
import { useCallback, useEffect, useRef, useState } from "react";

const IconBell = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 stroke-slate-500"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M6 17h12" />
    <path d="M8 17V10a4 4 0 1 1 8 0v7" />
    <path d="M10 17a2 2 0 0 0 4 0" />
  </svg>
);

const IconSearch = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 stroke-slate-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export default function TenantHeader() {
  const DETAIL_PAGE_SIZE = 5;

  const { user, refreshUserInfo } = useAuth();
  const tenantInfo = (user ?? null) as UserInfo | null;
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationItems, setNotificationItems] = useState<
    NotifyTenantDetailItem[]
  >([]);
  const [detailPage, setDetailPage] = useState(1);
  const [detailTotalCount, setDetailTotalCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isUpdatingRead, setIsUpdatingRead] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);

  const totalDetailPages = Math.max(
    1,
    Math.ceil(detailTotalCount / DETAIL_PAGE_SIZE),
  );

  const loadUnreadCount = async () => {
    if (!tenantInfo?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationService.countNotifyTenantsByStatus(
        tenantInfo.id,
        0,
      );

      if (response.data?.isSuccess) {
        setUnreadCount(response.data.data ?? 0);
      }
    } catch (error) {
      console.error("Error fetching unread notification count", error);
    }
  };

  const loadNotificationDetails = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await notificationService.getNotifyTenantDetails(
        detailPage,
        DETAIL_PAGE_SIZE,
      );

      if (response.data?.isSuccess && response.data.data) {
        setNotificationItems(response.data.data.items || []);
        setDetailTotalCount(response.data.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notification details", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleCountChanged = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const handleListChanged = useCallback(() => {
    loadNotificationDetails();
  }, [detailPage, showNotifications]);

  useRealtime({
    tenantId: tenantInfo?.id,
    onCountChanged: handleCountChanged,
    onListChanged: handleListChanged,
    onProfileChanged: () => {
      refreshUserInfo();
    },
  });

  useEffect(() => {
    loadUnreadCount();
  }, [tenantInfo?.id]);

  useEffect(() => {
    if (!showNotifications) {
      return;
    }

    loadNotificationDetails();
  }, [detailPage, showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!notificationPanelRef.current?.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const formatDateTime = (value: string | null) => {
    if (!value) return "Chưa đọc";
    return new Date(value).toLocaleString("vi-VN");
  };

  const markNotificationsAsRead = async (notificationIds: number[]) => {
    if (notificationIds.length === 0) {
      return true;
    }

    try {
      setIsUpdatingRead(true);
      const response = await notificationService.updateReadByTenant({
        notificationIds,
        readAt: new Date().toISOString(),
        status: 1,
      });

      if (response.data?.isSuccess) {
        await Promise.all([loadUnreadCount(), loadNotificationDetails()]);
        return true;
      }
    } catch (error) {
      console.error("Error updating read notifications", error);
    } finally {
      setIsUpdatingRead(false);
    }

    return false;
  };

  const handleOpenNotification = async (item: NotifyTenantDetailItem) => {
    if (item.status === 0) {
      await markNotificationsAsRead([item.notificationId]);
    }

    if (item.systemBlogUrl) {
      window.open(item.systemBlogUrl, "_blank", "noopener,noreferrer");
    }

    setShowNotifications(false);
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = Array.from(
      new Set(
        notificationItems
          .filter((item) => item.status === 0)
          .map((item) => item.notificationId),
      ),
    );

    await markNotificationsAsRead(unreadIds);
  };

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[200px]">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Scan to Order
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Quản trị vận hành
          </div>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <IconSearch />
            <input
              type="search"
              placeholder="Tìm kiếm..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <span
              className={`h-2 w-2 rounded-full ${tenantInfo?.isActive ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <span>
              {tenantInfo?.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
            </span>
          </button>

          <div className="relative" ref={notificationPanelRef}>
            <button
              type="button"
              className="cursor-pointer relative flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Thông báo"
              onClick={() => {
                setDetailPage(1);
                setShowNotifications((prev) => !prev);
              }}
            >
              <IconBell />
              {unreadCount > 0 ? (
                <span className=" absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>

            {showNotifications ? (
              <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Thông báo
                      </p>
                      <p className="text-xs text-slate-500">
                        Chưa đọc: {unreadCount}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={isUpdatingRead || unreadCount === 0}
                        className="cursor-pointer text-xs font-medium text-[rgb(var(--color-primary))] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Đã đọc tất cả
                      </button>
                      <p className="text-xs text-slate-500">
                        Trang {detailPage}/{totalDetailPages}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {isLoadingNotifications ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      Đang tải thông báo...
                    </div>
                  ) : notificationItems.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      Chưa có thông báo
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notificationItems.map((item, index) => (
                        <button
                          key={`${item.notificationId}-${item.sentAt}-${index}`}
                          type="button"
                          onClick={() => handleOpenNotification(item)}
                          className={` cursor-pointer  w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                            item.status === 0
                              ? "bg-slate-50/80 text-slate-900"
                              : "text-slate-500"
                          } ${item.systemBlogUrl ? "cursor-pointer" : "cursor-default"}`}
                        >
                          <p
                            className={`text-sm ${item.status === 0 ? "font-semibold" : "font-medium"}`}
                          >
                            {item.notifyTitle}
                          </p>
                          <p
                            className={`mt-1 text-xs ${item.status === 0 ? "text-slate-700" : "text-slate-400"}`}
                          >
                            {item.notifySub}
                          </p>
                          <div
                            className={`mt-2 flex flex-col gap-1 text-[11px] ${item.status === 0 ? "text-slate-600" : "text-slate-400"}`}
                          >
                            <span>Gửi lúc: {formatDateTime(item.sentAt)}</span>
                            <span>Đọc lúc: {formatDateTime(item.readAt)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDetailPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={
                      detailPage <= 1 ||
                      isLoadingNotifications ||
                      isUpdatingRead
                    }
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Lùi lại
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDetailPage((prev) =>
                        Math.min(totalDetailPages, prev + 1),
                      )
                    }
                    disabled={
                      detailPage >= totalDetailPages ||
                      isLoadingNotifications ||
                      isUpdatingRead
                    }
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang tiếp
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <span className="h-7 w-7 rounded-full bg-slate-200">
              {tenantInfo?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenantInfo.avatar}
                  alt="Ảnh đại diện bên thuê"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
                  S20
                </div>
              )}
            </span>
            <span className="font-medium">{tenantInfo?.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

import React from 'react'
import { Restaurant } from '@/src/types/type'

interface Props {
  restaurant: Restaurant
  isRefreshing: boolean
  qrLoadFailed: boolean
  qrPreviewKey: number
  onRefresh: () => void
  onQrLoadError: () => void
  onQrLoadSuccess: () => void
}

const RestaurantQRMenu = React.memo(function RestaurantQRMenu({
  restaurant,
  isRefreshing,
  qrLoadFailed,
  qrPreviewKey,
  onRefresh,
  onQrLoadError,
  onQrLoadSuccess,
}: Props) {
  const getQrPreviewUrl = React.useCallback(
    (qrUrl: string) => {
      const separator = qrUrl.includes('?') ? '&' : '?'
      return `${qrUrl}${separator}v=${qrPreviewKey}`
    },
    [qrPreviewKey]
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">QR Management</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Menu QR</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="cursor-pointer inline-flex items-center rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRefreshing ? 'Đang cập nhật...' : 'Cập nhật QR'}
        </button>
      </div>

      {restaurant.qrMenu ? (
        <div className="space-y-3">
          <div className="flex min-h-56 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4">
            {!qrLoadFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getQrPreviewUrl(restaurant.qrMenu)}
                alt="QR menu"
                className="h-56 w-56 rounded-lg object-contain"
                onLoad={onQrLoadSuccess}
                onError={onQrLoadError}
              />
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-red-600">Không tải được ảnh QR</p>
                <p className="mt-1 text-xs text-slate-500">
                  Hãy nhấn &quot;Cập nhật QR&quot; để tải lại hoặc tạo QR mới nhất.
                </p>
              </div>
            )}
          </div>

          <a
            href={restaurant.qrMenu}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
          >
            Mở link QR trong tab mới
          </a>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Chưa có QR menu cho nhà hàng này.</p>
          <p className="mt-1 text-xs text-slate-500">
            Bạn có thể nhấn &quot;Cập nhật QR&quot; để tải lại dữ liệu mới nhất.
          </p>
        </div>
      )}
    </div>
  )
})

export default RestaurantQRMenu

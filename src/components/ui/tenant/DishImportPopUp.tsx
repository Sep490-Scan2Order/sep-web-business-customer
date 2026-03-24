import React, { useRef, useState } from "react";
import { Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";

interface DishImportPopUpProps {
  onClose: () => void;
  onSubmit: (file: File) => void;
  isLoading?: boolean;
}

const ACCEPT_FILE_TYPES =
  ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

export default function DishImportPopUp({
  onClose,
  onSubmit,
  isLoading = false,
}: DishImportPopUpProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile || isLoading) {
      return;
    }

    onSubmit(selectedFile);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isLoading) {
      onClose();
      return;
    }

    if (e.key === "Enter" && selectedFile && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={isLoading ? undefined : onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Nhập món ăn bằng file"
    >
      <div
        className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Nhập món ăn bằng file Excel
            </h2>
            <p className="text-sm text-slate-500">
              Chọn file theo đúng định dạng mẫu để hệ thống import dữ liệu.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={isLoading}
            aria-label="Đóng popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_FILE_TYPES}
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {selectedFile ? "Chọn lại file" : "Chọn file Excel từ máy"}
          </button>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">File đã chọn:</span>
              <span className="truncate text-slate-600">
                {selectedFile?.name || "Chưa chọn file nào"}
              </span>
            </div>
          </div>

          <a
            href="/documents/Huong_dan.xlsx"
            download
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Download className="h-4 w-4" />
            Tải file template mẫu Huong_dan.xlsx
          </a>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang import...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Nhập món ăn
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

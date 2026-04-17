"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemUnit?: string;
  className?: string;
}

export default function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemUnit = "dữ liệu",
  className = "",
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const [jumpValue, setJumpValue] = useState<string>("");
  const [activeEllipsis, setActiveEllipsis] = useState<"left" | "right" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeEllipsis && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeEllipsis]);

  if (totalPages <= 1) return null;

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpValue);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
    setActiveEllipsis(null);
    setJumpValue("");
  };

  const renderEllipsis = (position: "left" | "right") => {
    if (activeEllipsis === position) {
      return (
        <form onSubmit={handleJump} className="relative inline-block mx-1">
          <input
            ref={inputRef}
            type="text"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ""))}
            onBlur={() => {
              setActiveEllipsis(null);
              setJumpValue("");
            }}
            placeholder="#"
            className="h-8 w-12 rounded-lg border border-indigo-300 bg-white px-1 text-center text-sm font-medium text-slate-700 outline-none ring-2 ring-indigo-100 focus:border-indigo-500"
          />
        </form>
      );
    }

    return (
      <button
        onClick={() => setActiveEllipsis(position)}
        className="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-all cursor-pointer"
        title="Nhảy đến trang..."
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-800 px-2 py-1 text-[10px] text-white transition-all group-hover:scale-100 whitespace-nowrap">
          Nhập số trang
        </span>
      </button>
    );
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showMax = 7;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Near start
        pages.push(2, 3, 4, 5);
        pages.push("right-ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end
        pages.push("left-ellipsis");
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else {
        // In the middle
        pages.push("left-ellipsis");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("right-ellipsis");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 ${className}`}>
      <div className="text-sm text-slate-500">
        Hiển thị <span className="font-medium text-slate-900">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> đến <span className="font-medium text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> trong số <span className="font-medium text-slate-900">{totalItems}</span> {itemUnit}
      </div>

      <div className="flex gap-1 items-center">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === "left-ellipsis") return <React.Fragment key="left-ell">{renderEllipsis("left")}</React.Fragment>;
          if (page === "right-ellipsis") return <React.Fragment key="right-ell">{renderEllipsis("right")}</React.Fragment>;

          return (
            <button
              key={index}
              onClick={() => onPageChange(Number(page))}
              className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-medium transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

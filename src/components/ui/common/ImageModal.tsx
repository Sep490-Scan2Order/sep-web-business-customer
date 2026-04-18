"use client";
import React, { useState } from "react";
import { X, ZoomIn } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageModal({
  src,
  alt,
  className = "h-auto w-full object-contain",
}: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} loading="lazy" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center rounded-lg">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain"
              loading="lazy"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 flex items-center justify-center rounded-lg bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              aria-label="Đóng"
            >
              <X className="h-6 w-6" />
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
              Nhấn bất kỳ nơi để đóng
            </p>
          </div>
        </div>
      )}
    </>
  );
}

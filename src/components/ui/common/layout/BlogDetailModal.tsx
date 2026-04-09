"use client";

import React from "react";
import { X, Eye, Calendar } from "lucide-react";
import { SystemBlogDto, BlogType } from "@/src/types/type";

interface BlogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: SystemBlogDto | null;
  loading: boolean;
  getBlogTypeLabel: (type: string | BlogType) => string;
  getBlogTypeColor: (type: string | BlogType) => string;
  content?: string;
  colorTitle?: string;
  imageUrls?: string[];
  thumbnailUrl?: string;
}

export default function BlogDetailModal({
  isOpen,
  onClose,
  blog,
  loading,
  getBlogTypeLabel,
  getBlogTypeColor,
  content = "",
  colorTitle = "#000000",
  imageUrls = [],
  thumbnailUrl,
}: BlogDetailModalProps) {
  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-8 w-full max-w-4xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết blog</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {/* Title */}
              <h1 className="text-4xl font-bold" style={{ color: colorTitle }}>
                {blog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBlogTypeColor(
                      blog.blogType
                    )}`}
                  >
                    {getBlogTypeLabel(blog.blogType)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{blog.totalViews} lượt xem</span>
                </div>
              </div>

              {/* Divider */}
              <hr className="my-6" />

              {thumbnailUrl && (
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl}
                    alt={`Ảnh thu nhỏ của ${blog.title}`}
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}

              {/* Blog Content */}
              <div className="prose prose-lg max-w-none">
                {content ? (
                  <div
                    className="space-y-6"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        let imageIndex = 0;
                        return content
                          .replace(
                            /IMAGE_PLACEHOLDER_block-\d+/g,
                            () => {
                              const url = imageUrls[imageIndex] || "";
                              imageIndex++;
                              return url;
                            }
                          )
                          // Style paragraphs
                          .replace(
                            /<p([^>]*)>/g,
                            '<p$1 class="text-gray-700 leading-relaxed">'
                          )
                          // Style headings
                          .replace(
                            /<h1([^>]*)>/g,
                            '<h1$1 class="text-3xl font-bold mt-6 mb-4">'
                          )
                          .replace(
                            /<h2([^>]*)>/g,
                            '<h2$1 class="text-2xl font-bold mt-6 mb-4">'
                          )
                          .replace(
                            /<h3([^>]*)>/g,
                            '<h3$1 class="text-xl font-semibold mt-4 mb-3">'
                          )
                          // Style images
                          .replace(
                            /<img([^>]*)>/g,
                            '<img$1 class="rounded-lg shadow-md w-full h-auto my-6">'
                          )
                          // Style strong/bold
                          .replace(
                            /<strong([^>]*)>/g,
                            '<strong$1 class="font-bold text-gray-900">'
                          )
                          // Style em/italic
                          .replace(
                            /<em([^>]*)>/g,
                            '<em$1 class="italic text-gray-700">'
                          );
                      })(),
                    }}
                  />
                ) : (
                  <p className="text-gray-500">Không có nội dung</p>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-12 border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
                  <div>
                    <p className="font-semibold text-gray-900">Ngày tạo</p>
                    <p>{new Date(blog.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Cập nhật lần cuối</p>
                    <p>{new Date(blog.updatedAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Lượt xem</p>
                    <p>{blog.totalViews}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Loại</p>
                    <p>{getBlogTypeLabel(blog.blogType)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

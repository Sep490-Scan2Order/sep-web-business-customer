"use client";

import React from "react";
import { X, Eye, EyeOff, Save } from "lucide-react";
import { BlogType } from "@/src/types/type";
import BlogBlockEditor, { ContentBlock } from "./BlogBlockEditor";
import BlogPreview from "./BlogPreview";

interface CreateBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  formData: {
    title: string;
    colorTitle: string;
    blogType: BlogType;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  thumbnailPreview?: string;
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentBlocks: ContentBlock[];
  onAddBlock: (type: "text" | "image" | "heading") => void;
  onUpdateBlock: (id: string, updates: Partial<ContentBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlockUp: (index: number) => void;
  onMoveBlockDown: (index: number) => void;
  onImageUpload: (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  getBlogTypeLabel: (type: string | BlogType) => string;
  getBlogTypeColor: (type: string | BlogType) => string;
}

export default function CreateBlogModal({
  isOpen,
  onClose,
  showPreview,
  onTogglePreview,
  formData,
  onFormChange,
  thumbnailPreview,
  onThumbnailUpload,
  contentBlocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlockUp,
  onMoveBlockDown,
  onImageUpload,
  onSubmit,
  loading,
  getBlogTypeLabel,
  getBlogTypeColor,
}: CreateBlogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-8 w-full max-w-5xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Tạo Blog Mới</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePreview}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Editor
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          {!showPreview ? (
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onFormChange}
                    placeholder="Nhập tiêu đề blog"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Loại blog <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="blogType"
                    value={formData.blogType}
                    onChange={onFormChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value={BlogType.Announcement}>Thông báo</option>
                    <option value={BlogType.Promotion}>Khuyến mãi</option>
                    <option value={BlogType.Update}>Cập nhật</option>
                    <option value={BlogType.Event}>Sự kiện</option>
                    <option value={BlogType.Other}>Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Màu tiêu đề
                </label>
                <input
                  type="color"
                  name="colorTitle"
                  value={formData.colorTitle}
                  onChange={onFormChange}
                  className="h-10 w-32 rounded-lg border border-gray-300 px-2 py-1"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onThumbnailUpload}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                {thumbnailPreview && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Content Blocks */}
              <BlogBlockEditor
                contentBlocks={contentBlocks}
                onAddBlock={onAddBlock}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                onMoveBlockUp={onMoveBlockUp}
                onMoveBlockDown={onMoveBlockDown}
                onImageUpload={onImageUpload}
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || contentBlocks.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Đang tạo..." : "Tạo Blog"}
                </button>
              </div>
            </form>
          ) : (
            /* Preview Mode */
            <BlogPreview
              title={formData.title}
              colorTitle={formData.colorTitle}
              blogType={formData.blogType}
              contentBlocks={contentBlocks}
              getBlogTypeLabel={getBlogTypeLabel}
              getBlogTypeColor={getBlogTypeColor}
            />
          )}
        </div>
      </div>
    </div>
  );
}

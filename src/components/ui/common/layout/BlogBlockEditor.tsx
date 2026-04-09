"use client";

import React from "react";
import Image from "next/image";
import {
  MoveUp,
  MoveDown,
  Trash2,
  ImageIcon,
  Type,
  Heading1,
  X,
  Bold,
  Italic,
} from "lucide-react";

export type BlockType = "text" | "image" | "heading";

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  imageFile?: File;
  imagePreview?: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    heading?: "h1" | "h2" | "h3";
    alignment?: "left" | "center" | "right";
  };
}

interface BlogBlockEditorProps {
  contentBlocks: ContentBlock[];
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (id: string, updates: Partial<ContentBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlockUp: (index: number) => void;
  onMoveBlockDown: (index: number) => void;
  onImageUpload: (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BlogBlockEditor({
  contentBlocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlockUp,
  onMoveBlockDown,
  onImageUpload,
}: BlogBlockEditorProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Nội dung Blog <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAddBlock("heading")}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Heading1 className="h-3.5 w-3.5" />
            Tiêu đề
          </button>
          <button
            type="button"
            onClick={() => onAddBlock("text")}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Type className="h-3.5 w-3.5" />
            Văn bản
          </button>
          <button
            type="button"
            onClick={() => onAddBlock("image")}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Hình ảnh
          </button>
        </div>
      </div>

      {/* Content Blocks List */}
      <div className="space-y-3">
        {contentBlocks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">
              Chưa có nội dung. Nhấn các nút bên trên để thêm tiêu đề, văn bản
              hoặc hình ảnh.
            </p>
          </div>
        ) : (
          contentBlocks.map((block, index) => (
            <div
              key={block.id}
              className="group rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-blue-300 hover:bg-white"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {block.type === "text" && (
                    <Type className="h-4 w-4 text-gray-500" />
                  )}
                  {block.type === "heading" && (
                    <Heading1 className="h-4 w-4 text-gray-500" />
                  )}
                  {block.type === "image" && (
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-xs font-medium text-gray-600">
                    {block.type === "text"
                      ? "Văn bản"
                      : block.type === "heading"
                      ? "Tiêu đề"
                      : "Hình ảnh"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveBlockUp(index)}
                    disabled={index === 0}
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveBlockDown(index)}
                    disabled={index === contentBlocks.length - 1}
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteBlock(block.id)}
                    className="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Block Content */}
              {(block.type === "text" || block.type === "heading") && (
                <>
                  {block.type === "heading" && (
                    <div className="mb-2 flex gap-2">
                      <select
                        value={block.style?.heading || "h2"}
                        onChange={(e) =>
                          onUpdateBlock(block.id, {
                            style: {
                              ...block.style,
                              heading: e.target.value as "h1" | "h2" | "h3",
                            },
                          })
                        }
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        <option value="h1">H1</option>
                        <option value="h2">H2</option>
                        <option value="h3">H3</option>
                      </select>
                    </div>
                  )}
                  <textarea
                    value={block.content}
                    onChange={(e) =>
                      onUpdateBlock(block.id, { content: e.target.value })
                    }
                    placeholder={
                      block.type === "heading"
                        ? "Nhập tiêu đề..."
                        : "Nhập nội dung văn bản..."
                    }
                    rows={block.type === "heading" ? 2 : 4}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateBlock(block.id, {
                          style: {
                            ...block.style,
                            bold: !block.style?.bold,
                          },
                        })
                      }
                      className={`rounded border px-2 py-1 text-xs transition-colors ${
                        block.style?.bold
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateBlock(block.id, {
                          style: {
                            ...block.style,
                            italic: !block.style?.italic,
                          },
                        })
                      }
                      className={`rounded border px-2 py-1 text-xs transition-colors ${
                        block.style?.italic
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}

              {block.type === "image" && (
                <div>
                  {block.imagePreview ? (
                    <div className="relative">
                      <Image
                        src={block.imagePreview}
                        alt="Xem trước"
                        width={600}
                        height={400}
                        className="rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateBlock(block.id, {
                            imageFile: undefined,
                            imagePreview: undefined,
                          })
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
                      <label className="flex cursor-pointer flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Nhấn để chọn ảnh
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onImageUpload(block.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

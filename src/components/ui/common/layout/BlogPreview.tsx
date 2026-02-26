"use client";

import React from "react";
import Image from "next/image";
import { BlogType } from "@/src/types/type";
import { ContentBlock } from "./BlogBlockEditor";

interface BlogPreviewProps {
  title: string;
  colorTitle: string;
  blogType: BlogType;
  contentBlocks: ContentBlock[];
  getBlogTypeLabel: (type: string | BlogType) => string;
  getBlogTypeColor: (type: string | BlogType) => string;
}

export default function BlogPreview({
  title,
  colorTitle,
  blogType,
  contentBlocks,
  getBlogTypeLabel,
  getBlogTypeColor,
}: BlogPreviewProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1
          className="mb-6 text-3xl font-bold"
          style={{ color: colorTitle }}
        >
          {title || "Tiêu đề blog"}
        </h1>
        <div className="mb-6 flex items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBlogTypeColor(
              blogType
            )}`}
          >
            {getBlogTypeLabel(blogType)}
          </span>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("vi-VN")}
          </span>
        </div>
        <div className="prose max-w-none">
          {contentBlocks.map((block) => {
            if (block.type === "heading") {
              const Tag = block.style?.heading || "h2";
              return (
                <Tag
                  key={block.id}
                  className={`${
                    block.style?.bold ? "font-bold" : ""
                  } ${block.style?.italic ? "italic" : ""}`}
                >
                  {block.content || "Tiêu đề trống"}
                </Tag>
              );
            } else if (block.type === "text") {
              return (
                <p
                  key={block.id}
                  className={`${
                    block.style?.bold ? "font-bold" : ""
                  } ${block.style?.italic ? "italic" : ""}`}
                >
                  {block.content || "Văn bản trống"}
                </p>
              );
            } else if (block.type === "image" && block.imagePreview) {
              return (
                <div key={block.id} className="my-6 text-center">
                  <Image
                    src={block.imagePreview}
                    alt="Blog image"
                    width={800}
                    height={500}
                    className="inline-block rounded-lg"
                  />
                </div>
              );
            }
            return null;
          })}
          {contentBlocks.length === 0 && (
            <p className="text-gray-400">Chưa có nội dung</p>
          )}
        </div>
      </div>
    </div>
  );
}

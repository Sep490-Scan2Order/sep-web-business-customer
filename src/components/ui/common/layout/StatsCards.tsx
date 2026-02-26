"use client";

import React from "react";
import { Eye, Calendar, Tag } from "lucide-react";
import { SystemBlogDto, BlogType } from "@/src/types/type";

interface StatsCardsProps {
  blogs: SystemBlogDto[];
  getBlogTypeLabel: (type: string | BlogType) => string;
}

export default function StatsCards({
  blogs,
  getBlogTypeLabel,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng Blog</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {blogs.length}
            </p>
          </div>
          <div className="rounded-full bg-blue-500/10 p-3">
            <Tag className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng Lượt Xem</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {blogs.reduce((sum, blog) => sum + blog.totalViews, 0)}
            </p>
          </div>
          <div className="rounded-full bg-green-500/10 p-3">
            <Eye className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Thông Báo</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {
                blogs.filter(
                  (b) => parseInt(b.blogType) === BlogType.Announcement
                ).length
              }
            </p>
          </div>
          <div className="rounded-full bg-purple-500/10 p-3">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Khuyến Mãi</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {
                blogs.filter(
                  (b) => parseInt(b.blogType) === BlogType.Promotion
                ).length
              }
            </p>
          </div>
          <div className="rounded-full bg-orange-500/10 p-3">
            <Tag className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

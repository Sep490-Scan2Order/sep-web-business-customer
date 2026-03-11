"use client";

import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { SystemBlogDto, BlogType } from "@/src/types/type";

interface BlogsTableProps {
  blogs: SystemBlogDto[];
  loading: boolean;
  getBlogTypeLabel: (type: string | BlogType) => string;
  getBlogTypeColor: (type: string | BlogType) => string;
  onViewDetail?: (blog: SystemBlogDto) => void;
  onEdit?: (blog: SystemBlogDto) => void;
  onDelete?: (blog: SystemBlogDto) => void;
}

export default function BlogsTable({
  blogs,
  loading,
  getBlogTypeLabel,
  getBlogTypeColor,
  onViewDetail,
}: BlogsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Lượt xem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cập nhật
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr key="loading-row">
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr key="no-data-row">
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">
                    Chưa có blog nào. Tạo blog đầu tiên!
                  </p>
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.systemBlogId || blog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {blog.title}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBlogTypeColor(
                        blog.blogType
                      )}`}
                    >
                      {getBlogTypeLabel(blog.blogType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {blog.totalViews}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(blog.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewDetail?.(blog)}
                        className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-green-600 transition-colors hover:bg-green-50">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-red-600 transition-colors hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

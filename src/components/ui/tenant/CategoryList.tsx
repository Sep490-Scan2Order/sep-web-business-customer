import React, { useState } from "react";
import { CategoryDto } from "@/src/types/type";
import { Search, Plus, Edit2, Layers, Package } from "lucide-react";

interface CategoryListProps {
  categories: CategoryDto[];
  onCreateClick: () => void;
  onEditClick: (category: CategoryDto) => void;
}

export default function CategoryList({
  categories,
  onCreateClick,
  onEditClick,
}: CategoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCategories = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Array of gradient colors for categories
  const gradients = [
    "from-emerald-400 to-emerald-600",
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-orange-400 to-orange-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600",
    "from-teal-400 to-teal-600",
    "from-rose-400 to-rose-600",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 shadow-lg">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Quản lý danh mục
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Tổng cộng {categories.length} danh mục
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onCreateClick}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            Thêm danh mục mới
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category, index) => {
              const gradient = gradients[index % gradients.length];
              return (
                <div
                  key={category.id}
                  onClick={() => onEditClick(category)}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                >
                  {/* Gradient Background */}
                  <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradient} p-6`}>
                    <div className="flex h-full flex-col items-center justify-center">
                      <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                        <Package className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    {/* Edit Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="rounded-full bg-white p-3 shadow-xl">
                        <Edit2 className="h-6 w-6 text-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-5">
                    <h3 className="text-center text-lg font-semibold text-slate-900 truncate">
                      {category.categoryName}
                    </h3>
                    <div className="mt-3 flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        <Layers className="h-3 w-3" />
                        Danh mục
                      </span>
                    </div>
                  </div>

                  {/* Bottom Border Animation */}
                  <div className={`h-1 w-0 bg-gradient-to-r ${gradient} transition-all duration-300 group-hover:w-full`} />
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white py-20">
            <div className="rounded-full bg-slate-100 p-6">
              <Package className="h-16 w-16 text-slate-400" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              {searchTerm ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác"
                : "Nhấn nút 'Thêm danh mục mới' để bắt đầu"}
            </p>
            {!searchTerm && (
              <button
                onClick={onCreateClick}
                className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-700"
              >
                <Plus className="h-5 w-5" />
                Thêm danh mục đầu tiên
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { CategoryDto } from "@/src/types/type";
import { Search, Plus, Edit2, Layers, Trash2 } from "lucide-react";

interface CategoryListProps {
  categories: CategoryDto[];
  onCreateClick: () => void;
  onEditClick: (category: CategoryDto) => void;
  onDeleteClick: (category: CategoryDto) => void;
}

export default function CategoryList({
  categories,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: CategoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCategories = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quản lý danh mục</div>
          <div className="text-lg font-semibold text-slate-900">Danh mục món ăn</div>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => onEditClick(category)}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Layers className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {category.categoryName}
                    </h3>
                    <p className="text-xs text-slate-500">ID: #{category.id}</p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(category);
                    }}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Chỉnh sửa danh mục"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(category);
                    }}
                    className="cursor-pointer rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12">
          <div className="rounded-full bg-slate-100 p-4">
            <Layers className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-slate-900">
            {searchTerm ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Nhấn nút 'Thêm danh mục' để bắt đầu"}
          </p>
        </div>
      )}
    </div>
  );
}

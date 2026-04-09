import { CategoryDto, DishesDto } from "@/src/types/type";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus, Search, X } from "lucide-react";

interface ComboItemForm {
  dishId: number;
  quantity: number;
}

interface ComboPopUpProps {
  categories: CategoryDto[];
  dishes: DishesDto[];
  onClose: () => void;
  onSubmit: (categoryId: number, comboData: FormData) => void;
  isLoading?: boolean;
}

export default function ComboPopUp({
  categories,
  dishes,
  onClose,
  onSubmit,
  isLoading,
}: ComboPopUpProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0);
  const [comboName, setComboName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<ComboItemForm[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [totalMoneyReview, setTotalMoneyReview] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectableDishes = useMemo(
    () => dishes.filter((dish) => dish.type !== 1),
    [dishes],
  );

  const totalMoney = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      const dish = dishes.find((d) => d.id === item.dishId);
      if (!dish) return total;
        return total + dish.price * item.quantity;
    }, 0);
  }, [selectedItems, dishes]);

  useEffect(() => {
    setTotalMoneyReview(totalMoney);
  }, [totalMoney]);

  const filteredDishes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return selectableDishes;

    return selectableDishes.filter(
      (dish) =>
        dish.dishName.toLowerCase().includes(keyword) ||
        dish.categoryName.toLowerCase().includes(keyword),
    );
  }, [searchTerm, selectableDishes]);

  const isInfoValid = Boolean(categoryId && comboName.trim() && Number(price) > 0);
  const isItemsValid = selectedItems.length > 0 && selectedItems.every((item) => item.quantity > 0);
  const comboPriceValue = Number(price) > 0 ? Number(price) : 0;
  const isSubtotalHigherThanComboPrice = comboPriceValue > 0 && totalMoneyReview > comboPriceValue;
  const exceededAmount = isSubtotalHigherThanComboPrice ? totalMoneyReview - comboPriceValue : 0;

  const getItemByDishId = (dishId: number) => selectedItems.find((item) => item.dishId === dishId);

  const toggleDishSelection = (dishId: number) => {
    setSelectedItems((prev) => {
      const exists = prev.some((item) => item.dishId === dishId);
      if (exists) {
        return prev.filter((item) => item.dishId !== dishId);
      }

      return [...prev, { dishId, quantity: 1 }];
    });
  };

  const updateItemQuantity = (dishId: number, quantityValue: string) => {
    const nextQuantity = Number(quantityValue);

    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.dishId !== dishId) {
          return item;
        }

        return {
          ...item,
          quantity: Number.isFinite(nextQuantity) && nextQuantity > 0 ? Math.floor(nextQuantity) : 1,
        };
      }),
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const goToItemStep = () => {
    if (!isInfoValid) return;
    setStep(2);
  };

  const handleSubmit = () => {
    if (!isInfoValid || !isItemsValid) return;

    const formData = new FormData();
    formData.append("ComboName", comboName.trim());
    formData.append("Price", String(Number(price)));
    formData.append("Description", description.trim());

    if (imageFile) {
      formData.append("ImageUrl", imageFile);
    }

    selectedItems.forEach((item) => {
      formData.append("Items", JSON.stringify(item));
    });

    onSubmit(categoryId, formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tạo combo mới</h2>
            <p className="text-sm text-slate-500">Chọn danh mục, nhập thông tin combo và chọn các món thành phần</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-6 py-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`rounded-full px-3 py-1 ${step === 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
              1. Thông tin combo
            </span>
            <span className={`rounded-full px-3 py-1 ${step === 2 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
              2. Chọn món
            </span>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {step === 1 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Danh mục combo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tên combo <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={comboName}
                    onChange={(e) => setComboName(e.target.value)}
                    disabled={isLoading}
                    placeholder="Nhập tên combo"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Giá combo (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={isLoading}
                    placeholder="Nhập giá combo"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    placeholder="Nhập mô tả combo"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Hình ảnh combo</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full rounded-xl border-2 border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-400"
                  >
                    {imagePreview ? "Thay đổi hình ảnh" : "Tải lên hình ảnh"}
                  </button>
                </div>

                {imagePreview && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Xem trước combo" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Danh sách món trong combo</div>
                  <div className="text-xs text-slate-500">Đã chọn {selectedItems.length} món</div>
                  <div className="text-xs text-slate-500">Tổng tiền tạm tính: {totalMoneyReview.toLocaleString()} VND</div>
                  <div className="text-xs text-slate-500">Giá combo: {comboPriceValue.toLocaleString()} VND</div>
                  {isSubtotalHigherThanComboPrice && (
                    <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      Cảnh báo: Tổng tạm tính đang cao hơn giá combo {exceededAmount.toLocaleString()} VND.
                    </div>
                  )}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên món..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm text-slate-600 outline-none focus:border-slate-300 focus:bg-white"
                  />
                </div>
              </div>

              {filteredDishes.length > 0 ? (
                <div className="space-y-2">
                  {filteredDishes.map((dish) => {
                    const selected = getItemByDishId(dish.id);

                    return (
                      <div
                        key={dish.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(selected)}
                            onChange={() => toggleDishSelection(dish.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-800">{dish.dishName}</div>
                            <div className="text-xs text-slate-500">{dish.categoryName}</div>
                            <div className="text-xs text-slate-500">Giá: {dish.price.toLocaleString()} VND</div>
                          </div>
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Số lượng</span>
                          <input
                            type="number"
                            min="1"
                            value={selected?.quantity ?? 1}
                            onChange={(e) => updateItemQuantity(dish.id, e.target.value)}
                            disabled={!selected}
                            className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-700 outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                  Không có món nào để chọn
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {step === 1 ? (
              "Hủy bỏ"
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Quay lại
              </>
            )}
          </button>

          {step === 1 ? (
            <button
              onClick={goToItemStep}
              disabled={!isInfoValid || isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Tiếp tục
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isInfoValid || !isItemsValid || isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Tạo combo
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

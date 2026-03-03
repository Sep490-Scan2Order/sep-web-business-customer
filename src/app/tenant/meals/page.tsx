"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import {
  ApiResponse,
  CategoryDto,
  CreateCategoryRequest,
  CreateDishRequest,
  DishesDto,
} from "@/src/types/type";

export default function MealsPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [meals, setMeals] = useState<DishesDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [showMealForm, setShowMealForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [mealFormData, setMealFormData] = useState<CreateDishRequest>({
    dishName: "",
    price: 0,
    description: "",
    dishAvailability: 1,
  });
  const [creatingMeal, setCreatingMeal] = useState(false);
  const [mealImage, setMealImage] = useState<File | null>(null);
  const [mealImagePreview, setMealImagePreview] = useState<string | null>(null);

  const getCategoriesApi = async (): Promise<ApiResponse<CategoryDto[]>> => {
    const response = await apiClient.get<ApiResponse<CategoryDto[]>>(API.CATEGORY.GET_ALL);
    return response.data;
  };

  const createCategoryApi = async (
    payload: CreateCategoryRequest
  ): Promise<ApiResponse<CategoryDto>> => {
    const response = await apiClient.post<ApiResponse<CategoryDto>>(API.CATEGORY.CREATE, payload);
    return response.data;
  };

  const getDishesApi = async (): Promise<ApiResponse<DishesDto[]>> => {
    const response = await apiClient.get<ApiResponse<DishesDto[]>>(API.DISHES.GET_ALL);
    return response.data;
  };

  const createDishApi = async (
    payload: CreateDishRequest,
    categoryId: number
  ): Promise<ApiResponse<DishesDto>> => {
    const formData = new FormData();
    formData.append("DishName", payload.dishName);
    formData.append("Price", payload.price.toString());
    formData.append("Description", payload.description);
    formData.append("DishAvailability", payload.dishAvailability.toString());
    if (payload.image) formData.append("ImageUrl", payload.image);

    const response = await apiClient.post<ApiResponse<DishesDto>>(
      API.DISHES.CREATE(categoryId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesResponse, mealsResponse] = await Promise.all([
        getCategoriesApi(),
        getDishesApi(),
      ]);

      if (categoriesResponse.isSuccess && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      if (mealsResponse.isSuccess && mealsResponse.data) {
        setMeals(mealsResponse.data);
      }

      if (!categoriesResponse.isSuccess) {
        setError(categoriesResponse.message || "Failed to fetch categories");
      } else if (!mealsResponse.isSuccess) {
        setError(mealsResponse.message || "Failed to fetch meals");
      }
    } catch (err) {
      setError("Error fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesApi();
      if (response.isSuccess && response.data) {
        setCategories(response.data);
      } else {
        setError(response.message || "Failed to fetch categories");
      }
    } catch (err) {
      setError("Error fetching categories");
      console.error(err);
    }
  };

  const fetchMeals = async () => {
    try {
      const response = await getDishesApi();
      if (response.isSuccess && response.data) {
        setMeals(response.data);
      } else {
        setError(response.message || "Failed to fetch meals");
      }
    } catch (err) {
      setError("Error fetching meals");
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setCreatingCategory(true);
      setError(null);
      const payload: CreateCategoryRequest = { categoryName: categoryName.trim() };
      const response = await createCategoryApi(payload);

      if (response.isSuccess) {
        setCategoryName("");
        setShowCategoryForm(false);
        await fetchCategories();
      } else {
        setError(response.message || "Failed to create category");
      }
    } catch (err) {
      setError("Error creating category");
      console.error(err);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      setError("Please select a category");
      return;
    }

    if (!mealFormData.dishName.trim()) {
      setError("Meal name is required");
      return;
    }

    if (mealFormData.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      setCreatingMeal(true);
      setError(null);

      const payload: CreateDishRequest = {
        ...mealFormData,
        dishName: mealFormData.dishName.trim(),
        image: mealImage || undefined,
      };

      const response = await createDishApi(payload, selectedCategoryId);

      if (response.isSuccess) {
        setMealFormData({
          dishName: "",
          price: 0,
          description: "",
          dishAvailability: 1,
        });
        setMealImage(null);
        setMealImagePreview(null);
        setSelectedCategoryId(null);
        setShowMealForm(false);
        await fetchMeals();
      } else {
        setError(response.message || "Failed to create meal");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message 
        || err?.response?.data?.errors?.[0] 
        || err?.message 
        || "Error creating meal";
      setError(errorMessage);
      console.error("Meal creation error:", {
        status: err?.response?.status,
        message: err?.response?.data?.message,
        errors: err?.response?.data?.errors,
        fullError: err,
      });
    } finally {
      setCreatingMeal(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Meals Management</h1>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-800">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-bold text-red-600 hover:text-red-800"
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : (
        <>
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <button
                onClick={() => setShowCategoryForm((prev) => !prev)}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                type="button"
              >
                {showCategoryForm ? "Cancel" : "Add Category"}
              </button>
            </div>

            {showCategoryForm && (
              <form
                onSubmit={handleCreateCategory}
                className="mb-4 rounded border border-gray-200 bg-gray-50 p-4"
              >
                <input
                  type="text"
                  placeholder="Category Name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {creatingCategory ? "Creating..." : "Create Category"}
                </button>
              </form>
            )}

            {categories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded border border-gray-200 bg-white p-4 shadow"
                  >
                    <h3 className="text-lg font-semibold">{category.categoryName}</h3>
                    <p className="text-sm text-gray-600">
                      Status: {category.isActive ? "Active" : "Inactive"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories yet</p>
            )}
          </div>

          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Meals</h2>
              <button
                onClick={() => setShowMealForm((prev) => !prev)}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                type="button"
              >
                {showMealForm ? "Cancel" : "Add Meal"}
              </button>
            </div>

            {showMealForm && (
              <form
                onSubmit={handleCreateMeal}
                className="mb-4 rounded border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">Category</label>
                  <select
                    value={selectedCategoryId || ""}
                    onChange={(e) =>
                      setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Meal Name"
                  value={mealFormData.dishName}
                  onChange={(e) =>
                    setMealFormData((prev) => ({ ...prev, dishName: e.target.value }))
                  }
                  className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
                />

                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  value={mealFormData.price}
                  onChange={(e) =>
                    setMealFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value) || 0,
                    }))
                  }
                  className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
                />

                <textarea
                  placeholder="Description"
                  value={mealFormData.description}
                  onChange={(e) =>
                    setMealFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
                  rows={3}
                />

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">Availability</label>
                  <input
                    type="number"
                    min="0"
                    value={mealFormData.dishAvailability}
                    onChange={(e) =>
                      setMealFormData((prev) => ({
                        ...prev,
                        dishAvailability: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">Image</label>

                  <div className="mb-3">
                    {mealImagePreview ? (
                      <div className="relative">
                        <img
                          src={mealImagePreview}
                          alt="Preview"
                          className="h-40 w-full rounded border border-gray-300 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMealImage(null);
                            setMealImagePreview(null);
                          }}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center rounded border border-dashed border-gray-300 bg-gray-200">
                        <span className="text-gray-400">No image selected</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setMealImage(file);

                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setMealImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setMealImagePreview(null);
                      }
                    }}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingMeal}
                  className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {creatingMeal ? "Creating..." : "Create Meal"}
                </button>
              </form>
            )}

            {meals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="rounded border border-gray-200 bg-white p-4 shadow"
                  >
                    {(meal.imageUrl || meal.image) ? (
                      <img
                        src={meal.imageUrl || meal.image}
                        alt={meal.dishName}
                        className="mb-2 h-40 w-full rounded object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="mb-2 flex h-40 w-full items-center justify-center rounded bg-gray-200">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}

                    <h3 className="text-lg font-semibold">{meal.dishName}</h3>
                    <p className="mb-2 text-sm text-gray-600">{meal.description}</p>
                    <p className="mb-2 text-lg font-bold text-green-600">{meal.price.toFixed(0)} VND</p>
                    <p className="text-sm text-gray-500">Category: {meal.categoryName}</p>
                    <p className="text-sm text-gray-500">
                      Status: {meal.isAvailable ? "Available" : "Unavailable"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No meals yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { ApiResponse, PlanApiItem, PlanUpsertRequest } from "@/src/types/type";
import { toast } from "react-toastify";
import PlanPageHeader from "@/src/components/ui/admin/billing-subscriptions/PlanPageHeader";
import PlanSearchBar from "@/src/components/ui/admin/billing-subscriptions/PlanSearchBar";
import PlanTable from "@/src/components/ui/admin/billing-subscriptions/PlanTable";
import PlanFormModal from "@/src/components/ui/admin/billing-subscriptions/PlanFormModal";
import { defaultPlanForm, PlanDetailResponse } from "@/src/components/ui/admin/billing-subscriptions/planUtils";

export default function BillingSubscriptionsPage() {
  const [plans, setPlans] = useState<PlanApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PlanUpsertRequest>(defaultPlanForm);

  const filteredPlans = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return plans;

    return plans.filter((plan) => {
      return (
        plan.name.toLowerCase().includes(keyword) ||
        String(plan.level).includes(keyword) ||
        plan.status.toLowerCase().includes(keyword)
      );
    });
  }, [plans, search]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<ApiResponse<PlanApiItem[]>>(API.PLAN.GETALL);
      if (response.data?.isSuccess && response.data?.data) {
        setPlans(response.data.data);
        return;
      }
      setPlans([]);
      toast.error(response.data?.message || "Không thể tải danh sách gói.");
    } catch (error) {
      setPlans([]);
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(message || "Lỗi khi tải danh sách Plan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlanId(null);
    setFormData(defaultPlanForm());
    setIsModalOpen(true);
  };

  const openEditModal = async (planId: number) => {
    try {
      const response = await apiClient.get<ApiResponse<PlanDetailResponse>>(API.PLAN.GET_BY_ID(planId));
      if (!response.data?.isSuccess || !response.data?.data) {
        toast.error(response.data?.message || "Không thể tải dữ liệu gói.");
        return;
      }

      const detail = response.data.data;
      setEditingPlanId(planId);
      setFormData({
        name: detail.name || "",
        monthlyPrice: Number(detail.monthlyPrice) || 0,
        yearlyPrice: Number(detail.yearlyPrice) || 0,
        durationInDays: Number(detail.durationInDays) || 30,
        level: Number(detail.level) || 1,
        isTrial: Boolean(detail.isTrial),
        isCommissionExempt: Boolean(detail.isCommissionExempt),
        features: {
          canUseAIUpsell: Boolean(detail.features?.canUseAIUpsell),
          canRecommendationOnTop: Boolean(detail.features?.canRecommendationOnTop),
          canUsePromotions: Boolean(detail.features?.canUsePromotions),
          canCustomMenuTemplate: Boolean(detail.features?.canCustomMenuTemplate),
        },
      });
      setIsModalOpen(true);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(message || "Lỗi khi tải thông tin gói.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlanId(null);
    setFormData(defaultPlanForm());
  };

  const updateField = <K extends keyof PlanUpsertRequest>(key: K, value: PlanUpsertRequest[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateFeature = (key: keyof PlanUpsertRequest["features"], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value,
      },
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Tên gói không được để trống.");
      return false;
    }
    if (formData.monthlyPrice < 0 || formData.yearlyPrice < 0) {
      toast.error("Giá theo tháng/năm phải lớn hơn hoặc bằng 0.");
      return false;
    }
    if (formData.durationInDays <= 0) {
      toast.error("Số ngày hiệu lực phải lớn hơn 0.");
      return false;
    }
    if (formData.level < 0) {
      toast.error("Level phải lớn hơn hoặc bằng 0.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      if (editingPlanId === null) {
        const response = await apiClient.post<ApiResponse<unknown>>(API.PLAN.CREATE, formData);
        if (!response.data?.isSuccess) {
          toast.error(response.data?.message || "Tạo gói thất bại.");
          return;
        }
        toast.success(response.data?.message || "Tạo gói thành công.");
      } else {
        const response = await apiClient.put<ApiResponse<unknown>>(API.PLAN.UPDATE(editingPlanId), formData);
        if (!response.data?.isSuccess) {
          toast.error(response.data?.message || "Cập nhật gói thất bại.");
          return;
        }
        toast.success(response.data?.message || "Cập nhật gói thành công.");
      }

      closeModal();
      fetchPlans();
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(message || "Có lỗi xảy ra khi lưu gói.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <PlanPageHeader onRefresh={fetchPlans} onCreate={openCreateModal} />
        <PlanSearchBar value={search} onChange={setSearch} />
        <PlanTable plans={filteredPlans} isLoading={isLoading} onEdit={openEditModal} />
      </div>

      <PlanFormModal
        isOpen={isModalOpen}
        isSaving={isSaving}
        editingPlanId={editingPlanId}
        formData={formData}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFieldChange={updateField}
        onFeatureChange={updateFeature}
      />
    </div>
  );
}

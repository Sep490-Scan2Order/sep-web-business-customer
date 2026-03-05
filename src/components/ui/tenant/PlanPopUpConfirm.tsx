'use client'
import { Edit2, Layers, Loader2, Plus, X } from 'lucide-react'
import React from 'react'

type PlanApiItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  isActive: boolean;
  createdAt: string;
  updateAt: string;
  isDeleted: boolean;
};

interface PlanProps {
  onClose: () => void
  onSubmit: (planId: number) => void
  isLoading?: boolean
  planData: PlanApiItem | null
  isFirstPlan: boolean
}

export default function PlanPopUpConfirm({ onClose, onSubmit, isLoading, planData, isFirstPlan }: PlanProps) {

      const handleSubmit = () => {
        if (planData?.id) {
          onSubmit(planData.id);
        }
      };
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-t-2xl bg-[rgb(var(--color-primary))] px-8 py-6">
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                {isFirstPlan ? (
                  <Edit2 className="h-6 w-6 text-white" />
                ) : (
                  <Plus className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isFirstPlan ? "Bạn xác nhận mua gói dịch vụ" : "Bạn xác nhận nâng cấp gói dịch vụ này?"}
                </h2>
                <p className="text-sm text-emerald-50">
                  {isFirstPlan ? "Bạn có chắc chắn muốn mua gói dịch vụ này?" : "Bạn có chắc chắn muốn nâng cấp gói dịch vụ này?"}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Layers className="h-4 w-4 text-emerald-600" />
              Tên gói {planData?.name}
              <span className="text-red-500">*</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 rounded-b-2xl bg-slate-50 px-8 py-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border-2 border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !planData?.name.trim()}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : planData ? (
              <>
                <Edit2 className="h-4 w-4" />
                Nâng cấp
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Mua gói dịch vụ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

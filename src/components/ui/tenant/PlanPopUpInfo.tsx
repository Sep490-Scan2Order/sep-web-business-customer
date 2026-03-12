import { PlanApiItem } from '@/src/types/type'
import React, { useState } from 'react'

interface PlanProps {
  onClose: () => void
  onSubmit: (planId: number) => void
  planData: PlanApiItem[] | null
}

export default function PlanPopUpInfo({ onClose, onSubmit, planData }: PlanProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden p-6">
        <h2 className="text-xl font-bold mb-4">Chọn gói dịch vụ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planData?.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedId(plan.id)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                selectedId === plan.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <div className="text-sm text-gray-500 mt-2">
                <ul className="space-y-1">
                      {/* Always shows if > 0 */}
                      {plan.features.maxStaff > 0 && (
                        <li>
                          - Quản lý tối đa {plan.features.maxStaff} nhân viên
                        </li>
                      )}

                      {/* Shows standard if true, grayed-out/strikethrough if false */}
                      <li
                        className={
                          plan.features.canCustomMenuTemplate
                            ? ""
                            : "text-gray-400 line-through"
                        }
                      >
                        - Tùy chỉnh mẫu thực đơn
                      </li>

                      <li
                        className={
                          plan.features.canUseCombo
                            ? ""
                            : "text-gray-400 line-through"
                        }
                      >
                        - Hỗ trợ tạo Combo
                      </li>

                      <li
                        className={
                          plan.features.canUsePromotions
                            ? ""
                            : "text-gray-400 line-through"
                        }
                      >
                        - Quản lý Khuyến mãi
                      </li>
                    </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
          <button 
            disabled={!selectedId}
            onClick={() => selectedId && onSubmit(selectedId)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 hover:bg-emerald-700"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  )
}
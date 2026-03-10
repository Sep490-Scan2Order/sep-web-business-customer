"use client";
import StaffList from "@/src/components/ui/tenant/StaffList";
import StaffPopUp from "@/src/components/ui/tenant/StaffPopUp";
import { API } from "@/src/constants/api";
import { useAuth } from "@/src/hooks/useAuth";
import apiClient from "@/src/services/apiClient";
import { Restaurant, StaffDto } from "@/src/types/type";
import { randomBytes } from "crypto";
import { Plus, ArrowLeft, Store } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function UsersPage() {
  const { user } = useAuth();
  const [staffs, setStaffs] = useState<StaffDto[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffDto | null>(null);

  // Fetch restaurants on mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user?.id) {
        toast.error("Không tìm thấy tenantId để tải nhà hàng");
        return;
      }

      try {
        const response = await apiClient.get(
          API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID,
        );

        if (response.data.isSuccess && response.data.data) {
          setRestaurant(response.data.data);
        }
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            "Có lỗi xảy ra khi tải dữ liệu nhà hàng",
        );
      }
    };
    fetchRestaurants();
  }, [user?.id]);

  // Fetch staff when restaurant is selected
  useEffect(() => {
    const fetchStaff = async () => {
      if (!selectedRestaurant?.id) return;

      setLoading(true);
      try {
        const response = await apiClient.get(
          `${API.STAFF.GET_ALL}?restaurantId=${selectedRestaurant.id}&page=1&pageSize=100`,
        );

        console.log("Response from API:", response);
        if (response.status === 200 && response.data.items) {
          setStaffs(response.data.items);
        }
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            "Có lỗi xảy ra khi tải dữ liệu nhân viên",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [selectedRestaurant]);

  const handleCreateClick = () => {
    if (!selectedRestaurant) {
      toast.warning("Vui lòng chọn nhà hàng trước khi thêm nhân viên");
      return;
    }
    setSelectedStaff(null);
    setShowStaffModal(true);
  };

  const handleUpdateClick = (staff: StaffDto) => {
    setSelectedStaff(staff);
    setShowStaffModal(true);
  };

  const handleCreateStaff = async (
    restaurantId: number,
    formData: FormData,
  ) => {
    if (!selectedRestaurant) {
      toast.error("Vui lòng chọn nhà hàng");
      return;
    }

    const array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    const generatedPassword = Array.from(array, (dec) =>
      dec.toString(16).padStart(8, "0"),
    )
      .join("")
      .substring(0, 8);

    setLoading(true);
    try {
      const response = await apiClient.post(API.STAFF.CREATE, {
        restaurantId: selectedRestaurant.id,
        email: formData.get("email") as string,
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        password: generatedPassword,
      });

      if (response.data.isSuccess) {
        setStaffs((prev) => [...prev, response.data.data]);
        toast.success("Tạo nhân viên thành công");

        const emailHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    
    <div style="background-color: #ea580c; padding: 25px; text-align: center;">
      <h2 style="margin: 0; color: #ffffff; font-size: 24px;">Chào mừng bạn gia nhập!</h2>
      <p style="margin: 5px 0 0 0; color: #fff3e0; font-size: 16px;">${selectedRestaurant.restaurantName}</p>
    </div>

    <div style="padding: 30px; color: #333333;">
      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Xin chào <strong>${formData.get("name")}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.6;">Tài khoản nhân viên của bạn đã được quản trị viên tạo thành công trên hệ thống quản lý nhà hàng. Dưới đây là thông tin đăng nhập của bạn:</p>
      
      <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; font-size: 15px; color: #555555;">
          <span style="display: inline-block; width: 100px;">Email:</span> 
          <strong>${formData.get("email")}</strong>
        </p>
        <p style="margin: 0; font-size: 15px; color: #555555;">
          <span style="display: inline-block; width: 100px;">Mật khẩu:</span> 
          <strong style="font-family: monospace; font-size: 18px; color: #ea580c; letter-spacing: 1px;">${generatedPassword}</strong>
        </p>
      </div>

      <p style="font-size: 14px; color: #dc2626; line-height: 1.5; font-style: italic;">
        * Lưu ý quan trọng: Vui lòng đăng nhập và đổi mật khẩu ngay trong lần đầu tiên truy cập để đảm bảo an toàn cho tài khoản.
      </p>
      
      <div style="text-align: center; margin-top: 35px; margin-bottom: 10px;">
        <a href="https://your-domain.com/login" style="background-color: #ea580c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Đăng nhập hệ thống</a>
      </div>
    </div>

    <div style="background-color: #f9fafb; border-top: 1px solid #eeeeee; padding: 15px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Email này được gửi tự động từ hệ thống quản lý <strong>S2O - Scan2Order</strong>. Vui lòng không trả lời email này.
      </p>
    </div>

  </div>
</body>
</html>
`;

        // Gửi email với biến cục bộ
        const emailResponse = await apiClient.post(API.EMAIL.SEND, {
          to: formData.get("email") as string,
          subject: "Thông tin tài khoản nhân viên",
          htmlContent: emailHtmlContent,
        });

        if (emailResponse.data.isSuccess) {
          toast.success("Gửi email thông tin tài khoản thành công");
        } else {
          toast.error(
            emailResponse.data.message ||
              "Không thể gửi email thông tin tài khoản",
          );
        }

        setShowStaffModal(false);
      } else {
        toast.error(response.data.message || "Không thể tạo nhân viên");
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi tạo nhân viên",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaff = async () => {
    setLoading(true);
    try {
      // TODO: Implement update staff API
      // const response = await apiClient.put(
      //   API.STAFF.UPDATE_STAFF(staffId),
      //   formData,
      //   {
      //     headers: {
      //       'Content-Type': 'multipart/form-data',
      //     },
      //   }
      // );
      // if (response.data.isSuccess) {
      // setStaffs((prev) =>
      //   prev.map((staff) => (staff.id === staffId ? response.data.data : staff))
      // );
      // toast.success("Cập nhật nhân viên thành công");
      // setShowStaffModal(false);
      // } else {
      // toast.error(response.data.message || "Không thể cập nhật nhân viên");
      // }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi cập nhật nhân viên",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {!selectedRestaurant ? (
        // Restaurant Selection View
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Staff Management
            </div>
            <div className="text-lg font-semibold text-slate-900">
              Chọn nhà hàng để quản lý nhân viên
            </div>
          </div>

          {/* Restaurant Grid */}
          {restaurant.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {restaurant.map((rest) => (
                <div
                  key={rest.id}
                  onClick={() => setSelectedRestaurant(rest)}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md"
                >
                  {/* Restaurant Image */}
                  {rest.image ? (
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rest.image}
                        alt={rest.restaurantName}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-slate-100">
                      <Store className="h-12 w-12 text-slate-300" />
                    </div>
                  )}

                  {/* Restaurant Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {rest.restaurantName}
                    </h3>
                    {rest.address && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {rest.address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State - No Restaurants
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12">
              <div className="rounded-full bg-slate-100 p-4">
                <Store className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-slate-900">
                Chưa có nhà hàng nào
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Vui lòng tạo nhà hàng trước khi quản lý nhân viên
              </p>
            </div>
          )}
        </div>
      ) : (
        // Staff List View (when restaurant is selected)
        <div>
          {/* Back Button & Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedRestaurant(null);
                setStaffs([]);
              }}
              className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại chọn nhà hàng
            </button>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {selectedRestaurant.restaurantName}
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  Danh sách nhân viên
                </div>
              </div>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Thêm nhân viên
              </button>
            </div>
          </div>

          {/* Staff List or Empty State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-slate-500">Đang tải...</div>
            </div>
          ) : staffs.length > 0 ? (
            <StaffList staffs={staffs} onEditClick={handleUpdateClick} />
          ) : (
            // Empty State - No Staff
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12">
              <div className="rounded-full bg-slate-100 p-4">
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-slate-900">
                Chưa có nhân viên nào
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Nhấn nút &ldquo;Thêm nhân viên&rdquo; để bắt đầu
              </p>
            </div>
          )}
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && selectedRestaurant && (
        <StaffPopUp
          restaurants={[
            {
              id: String(selectedRestaurant.id),
              name: selectedRestaurant.restaurantName,
            },
          ]}
          onClose={() => {
            setShowStaffModal(false);
            setSelectedStaff(null);
          }}
          onSubmit={handleCreateStaff}
          onUpdate={handleUpdateStaff}
          isLoading={loading}
          staffData={selectedStaff}
        />
      )}
    </div>
  );
}

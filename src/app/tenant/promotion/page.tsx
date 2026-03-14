'use client'
import PromotionList from '@/src/components/ui/tenant/PromotionList';
import PromotionPopUp from '@/src/components/ui/tenant/PromotionPopUp';
import { API } from '@/src/constants/api';
import apiClient from '@/src/services/apiClient';
import { DishesDto, PromotionDto, PromotionResponse, PromotionUpsertPayload, Restaurant } from '@/src/types/type';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionDto | null>(null);
  const [dishes, setDishes] = useState<DishesDto[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

   const [loading, setLoading] = useState<boolean>(false);

    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<PromotionResponse>(API.PROMOTION.GET_BY_TENANT);
        if (response.data.isSuccess) {
          setPromotions(response.data.data.items);
          return;
        }

        toast.error(response.data.message || 'Không thể tải danh sách khuyến mãi');
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            'Có lỗi xảy ra khi tải khuyến mãi',
        );
      } finally {
        setLoading(false);
      }
    };

    // Fetch promotions data
    useEffect(() => {
      fetchPromotions();
    }, []);

    const handleCreateClick = () => {
      getAllDishes();
      getAllRestaurants();
      setSelectedPromotion(null);
      setShowPromotionModal(true);
    }

    const handleEditClick = (promotionDto: PromotionDto) => {
      getAllDishes();
      getAllRestaurants();
      setSelectedPromotion(promotionDto);
      setShowPromotionModal(true);
    }

    const handleCreatePromotion = async (promotionData: PromotionUpsertPayload) => {
      console.log("Creating promotion with data:", promotionData);
      setLoading(true);
      try {
        const response = await apiClient.post(API.PROMOTION.CREATE, promotionData);

        if (response.data?.isSuccess) {
          toast.success('Tạo khuyến mãi thành công');
          setShowPromotionModal(false);
          setSelectedPromotion(null);
          await fetchPromotions();
          return;
        }

        toast.error(response.data?.message || 'Không thể tạo khuyến mãi');
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            'Có lỗi xảy ra khi tạo khuyến mãi',
        );
      } finally {
        setLoading(false);
      }
    }

    const handleUpdatePromotion = async (promotionId: number, promotionData: PromotionUpsertPayload) => {
     console.log("Update promotion with data:", promotionData);
      setLoading(true);
      try {
        const response = await apiClient.put(API.PROMOTION.UPDATE, {
          ...promotionData,
          id: promotionId,
        });

        if (response.data?.isSuccess) {
          toast.success('Cập nhật khuyến mãi thành công');
          setShowPromotionModal(false);
          setSelectedPromotion(null);
          await fetchPromotions();
          return;
        }

        toast.error(response.data?.message || 'Không thể cập nhật khuyến mãi');
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            'Có lỗi xảy ra khi cập nhật khuyến mãi',
        );
      } finally {
        setLoading(false);
      }
    }

    const handleDeletePromotion = async (promotionId: number) => {
      setLoading(true);
      try {
        const response = await apiClient.delete(API.PROMOTION.DELETE(promotionId));

        if (response.data?.isSuccess) {
          toast.success('Xóa khuyến mãi thành công');
          setPromotions((prev) => prev.filter((promotion) => promotion.id !== promotionId));
          return;
        }

        toast.error(response.data?.message || 'Không thể xóa khuyến mãi');
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            'Có lỗi xảy ra khi xóa khuyến mãi',
        );
      } finally {
        setLoading(false);
      }
    }

    const getAllDishes = async () => {
      try {
        const response = await apiClient.get(API.DISHES.GET_ALL);
        if (response.data.isSuccess) {
          setDishes(response.data.data);
        }
      }catch (error) {
        console.error("Error fetching dishes:", error);
      }
    }

    const getAllRestaurants = async () => {
      try {
        const response = await apiClient.get(API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID);
        if (response.data.isSuccess) {
          setRestaurants(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    }
  


  return (
    <div>
      <PromotionList 
        onCreateClick={handleCreateClick}
        promotions={promotions} 
        onEditClick={handleEditClick}
        onDeleteClick={handleDeletePromotion}
      />

      {showPromotionModal && (
        <PromotionPopUp 
          onClose={() => {
            setShowPromotionModal(false)
            setSelectedPromotion(null)
          }}
          onSubmit={handleCreatePromotion}
          onUpdate={handleUpdatePromotion}
          dishes={dishes}
          isLoading={loading}
          restaurants={restaurants}
          promotionData={selectedPromotion}
        />
      )}
    </div>
  )
}

'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PromotionList from '@/src/components/ui/tenant/PromotionList';
import PromotionDetailPopUp from '@/src/components/ui/tenant/PromotionDetailPopUp';
import PromotionPopUp from '@/src/components/ui/tenant/PromotionPopUp';
import { API } from '@/src/constants/api';
import apiClient from '@/src/services/apiClient';
import { DishesDto, PromotionDto, PromotionResponse, PromotionUpsertPayload, Restaurant } from '@/src/types/type';
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const toPositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

export default function PromotionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionDto | null>(null);
  const [detailPromotion, setDetailPromotion] = useState<PromotionDto | null>(null);
  const [dishes, setDishes] = useState<DishesDto[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const pageNumber = toPositiveInt(searchParams.get('pageNumber') ?? searchParams.get('pageIndex'), 1);
  const pageSize = toPositiveInt(searchParams.get('pageSize'), 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const currentPage = Math.min(pageNumber, Math.max(1, totalPages));

   const [loading, setLoading] = useState<boolean>(false);

    const fetchPromotions = useCallback(async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<PromotionResponse>(
          API.PROMOTION.GET_BY_TENANT(pageNumber, pageSize),
        );
        if (response.data.isSuccess) {
          setPromotions(response.data.data.items ?? []);
          setTotalPages(Math.max(1, response.data.data.totalPages ?? 1));
          setTotalCount(response.data.data.totalCount ?? 0);
          setHasPreviousPage(Boolean(response.data.data.hasPreviousPage));
          setHasNextPage(Boolean(response.data.data.hasNextPage));
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
    }, [pageNumber, pageSize]);

    // Fetch promotions data
    useEffect(() => {
      fetchPromotions();
    }, [fetchPromotions]);

    const handlePageChange = (nextPage: number) => {
      const boundedPage = Math.max(1, Math.min(nextPage, Math.max(1, totalPages)));
      if (boundedPage === pageNumber) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set('pageNumber', String(boundedPage));
      params.set('pageSize', String(pageSize));
      params.delete('pageIndex');

      router.push(`${pathname}?${params.toString()}`);
    };

    const ensureReferenceData = async () => {
      const fetchTasks: Promise<void>[] = [];

      if (dishes.length === 0) {
        fetchTasks.push(getAllDishes());
      }

      if (restaurants.length === 0) {
        fetchTasks.push(getAllRestaurants());
      }

      if (fetchTasks.length > 0) {
        await Promise.all(fetchTasks);
      }
    };

    const handleCreateClick = async () => {
      await ensureReferenceData();
      setDetailPromotion(null);
      setSelectedPromotion(null);
      setShowPromotionModal(true);
    }

    const handleViewDetailClick = async (promotionDto: PromotionDto) => {
      await ensureReferenceData();
      setShowPromotionModal(false);
      setSelectedPromotion(null);
      setDetailPromotion(promotionDto);
    }

    const handleEditClick = async (promotionDto: PromotionDto) => {
      await ensureReferenceData();
      setDetailPromotion(null);
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
      } catch (error) {
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
        onViewDetailClick={handleViewDetailClick}
        promotions={promotions} 
        onEditClick={handleEditClick}
        onDeleteClick={handleDeletePromotion}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalCount={totalCount}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPageChange={handlePageChange}
        isLoading={loading}
      />

      {detailPromotion && (
        <PromotionDetailPopUp
          promotion={detailPromotion}
          dishes={dishes}
          restaurants={restaurants}
          onClose={() => setDetailPromotion(null)}
        />
      )}

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

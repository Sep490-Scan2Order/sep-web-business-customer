import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import {
	ApiResponse,
	BlogListResponse,
	NotificationCreateRequest,
	NotificationCreatedData,
	NotificationListResponse,
	NotificationItem,
	NotifyTenantCreateRequest,
	NotifyTenantDetailListResponse,
	NotifyTenantItem,
	NotifyTenantUpdateReadRequest,
	TenantSummaryDto,
} from "@/src/types/type";

export const notificationService = {
	getAllNotifications: (pageIndex = 1, pageSize = 7) =>
		apiClient.get<ApiResponse<NotificationListResponse>>(
			API.NOTIFICATION.GET_ALL(pageIndex, pageSize)
		),

	createNotification: (data: NotificationCreateRequest) =>
		apiClient.post<ApiResponse<NotificationCreatedData>>(API.NOTIFICATION.POST, data),

	assignTenants: (data: NotifyTenantCreateRequest) =>
		apiClient.post<ApiResponse<boolean>>(API.NOTIFY_TENANT.POST, data),

	getAllTenants: () =>
		apiClient.get<ApiResponse<TenantSummaryDto[]>>(API.TENANT.GET_ALL),

	getAllBlogs: (pageIndex = 1, pageSize = 100) =>
		apiClient.get<ApiResponse<BlogListResponse>>(API.BLOG.GET_ALL(pageIndex, pageSize)),

	getAllNotifyTenants: () =>
		apiClient.get<ApiResponse<NotifyTenantItem[]>>(API.NOTIFY_TENANT.GET_ALL),

	countNotifyTenantsByStatus: (tenantId: string, notifyTenantStatus: number) =>
		apiClient.get<ApiResponse<number>>(
			API.NOTIFY_TENANT.COUNT_BY_TENANT_ID(tenantId, notifyTenantStatus)
		),

	updateReadByTenant: (data: NotifyTenantUpdateReadRequest) =>
		apiClient.put<ApiResponse<string>>(API.NOTIFY_TENANT.UPDATE_READ_BY_TENANT_ID, data),

	getNotifyTenantDetails: (pageIndex = 1, pageSize = 5) =>
		apiClient.get<ApiResponse<NotifyTenantDetailListResponse>>(
			API.NOTIFY_TENANT.DETAILS(pageIndex, pageSize)
		),
};

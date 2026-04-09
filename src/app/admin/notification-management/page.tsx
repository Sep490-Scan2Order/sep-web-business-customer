"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Send } from "lucide-react";
import { toast } from "react-toastify";
import { notificationService } from "@/src/services/notificationService";
import {
	NotificationCreateRequest,
	NotificationItem,
	NotifyTenantCreateRequest,
	NotifyTenantItem,
	SystemBlogDto,
	TenantSummaryDto,
} from "@/src/types/type";

const defaultNotificationForm: NotificationCreateRequest = {
	notifyTitle: "",
	notifySub: "",
	systemBlogUrl: "",
};

export default function NotificationManagementPage() {
	const PAGE_SIZE = 7;

	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [tenants, setTenants] = useState<TenantSummaryDto[]>([]);
	const [blogs, setBlogs] = useState<SystemBlogDto[]>([]);
	const [allNotifyTenants, setAllNotifyTenants] = useState<NotifyTenantItem[]>([]);
	const [totalNotifications, setTotalNotifications] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageInput, setPageInput] = useState("1");

	const [isLoading, setIsLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [isAssigning, setIsAssigning] = useState(false);

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showAssignModal, setShowAssignModal] = useState(false);

	const [notificationForm, setNotificationForm] =
		useState<NotificationCreateRequest>(defaultNotificationForm);
	const [createdNotificationId, setCreatedNotificationId] = useState<number | null>(null);

	const [selectAllTenants, setSelectAllTenants] = useState(false);
	const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(new Set());
	const [searchTenant, setSearchTenant] = useState("");
	const [origin, setOrigin] = useState("https://scan2order.id.vn");

	useEffect(() => {
		if (typeof window !== "undefined") {
			setOrigin(window.location.origin);
		}
	}, []);

	const fetchAll = async (pageIndex = currentPage) => {
		try {
			setIsLoading(true);

			const [notificationRes, tenantRes, blogRes, notifyTenantRes] = await Promise.all([
				notificationService.getAllNotifications(pageIndex, PAGE_SIZE),
				notificationService.getAllTenants(),
				notificationService.getAllBlogs(),
				notificationService.getAllNotifyTenants(),
			]);

			if (notificationRes.data?.isSuccess) {
				setNotifications(notificationRes.data.data?.items || []);
				setTotalNotifications(notificationRes.data.data?.totalCount || 0);
				setCurrentPage(notificationRes.data.data?.page || pageIndex);
				setPageInput(String(notificationRes.data.data?.page || pageIndex));
			}

			if (tenantRes.data?.isSuccess) {
				setTenants(tenantRes.data.data || []);
			}

			if (blogRes.data?.isSuccess && blogRes.data.data?.items) {
				setBlogs(blogRes.data.data.items);
			}

			if (notifyTenantRes.data?.isSuccess) {
				setAllNotifyTenants(notifyTenantRes.data.data || []);
			}
		} catch (error) {
			console.error("Error loading notification management data", error);
			toast.error("Không thể tải dữ liệu thông báo");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAll(currentPage);
	}, [currentPage]);

	const blogOptions = useMemo(() => {
		return blogs
			.map((blog) => {
				const blogId = blog.systemBlogId ?? blog.id;
				if (!blogId) return null;

				return {
					label: blog.title,
					value: `${origin}/pages/public/blogs/${blogId}`,
				};
			})
			.filter((item): item is { label: string; value: string } => item !== null);
	}, [blogs, origin]);

	const notifyCountMap = useMemo(() => {
		const map = new Map<number, Set<string>>();
		for (const nt of allNotifyTenants) {
			if (!map.has(nt.notificationId)) map.set(nt.notificationId, new Set());
			map.get(nt.notificationId)!.add(nt.tenantId);
		}
		return map;
	}, [allNotifyTenants]);

	const totalPages = useMemo(() => {
		return Math.max(1, Math.ceil(totalNotifications / PAGE_SIZE));
	}, [totalNotifications]);

	const filteredTenants = useMemo(() => {
		const alreadyAssigned = createdNotificationId ? (notifyCountMap.get(createdNotificationId) ?? new Set()) : new Set();
		const available = tenants.filter((t) => !alreadyAssigned.has(t.id));
		const keyword = searchTenant.trim().toLowerCase();
		if (!keyword) return available;
		return available.filter(
			(tenant) =>
				tenant.name?.toLowerCase().includes(keyword) ||
				tenant.accountId?.toLowerCase().includes(keyword) ||
				tenant.phone?.toLowerCase().includes(keyword)
		);
	}, [tenants, searchTenant, createdNotificationId, notifyCountMap]);

	const resetAssignState = () => {
		setSelectAllTenants(false);
		setSelectedTenantIds(new Set());
		setSearchTenant("");
	};

	const closeCreateModal = () => {
		setShowCreateModal(false);
		setNotificationForm(defaultNotificationForm);
	};

	const openAssignModal = (notificationId: number) => {
		setCreatedNotificationId(notificationId);
		resetAssignState();
		setShowAssignModal(true);
	};

	const handleCreateNotification = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!notificationForm.notifyTitle.trim() || !notificationForm.notifySub.trim()) {
			toast.warning("Vui lòng nhập tiêu đề và nội dung thông báo");
			return;
		}

		try {
			setIsCreating(true);

			const response = await notificationService.createNotification({
				notifyTitle: notificationForm.notifyTitle,
				notifySub: notificationForm.notifySub,
				systemBlogUrl: notificationForm.systemBlogUrl,
			});

			if (response.data?.isSuccess && response.data?.data) {
				const newId = response.data.data.id;
				closeCreateModal();
				toast.success("Tạo thông báo thành công");
				await fetchAll();
				openAssignModal(newId);
			} else {
				toast.error(response.data?.message || "Tạo thông báo thất bại");
			}
		} catch (error) {
			console.error("Error creating notification", error);
			toast.error("Không thể tạo thông báo");
		} finally {
			setIsCreating(false);
		}
	};

	const toggleTenant = (tenantId: string, checked: boolean) => {
		setSelectedTenantIds((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(tenantId);
			} else {
				next.delete(tenantId);
			}
			return next;
		});
	};

	const handleAssignTenant = async () => {
		if (!createdNotificationId) {
			toast.warning("Chưa có thông báo để gán bên thuê");
			return;
		}

		const tenantIds = selectAllTenants ? filteredTenants.map((tenant) => tenant.id) : Array.from(selectedTenantIds);

		if (tenantIds.length === 0) {
			toast.warning("Vui lòng chọn ít nhất một bên thuê");
			return;
		}

		try {
			setIsAssigning(true);

			const payload: NotifyTenantCreateRequest = {
				notificationId: createdNotificationId,
				tenantIds,
			};

			const response = await notificationService.assignTenants(payload);

			if (response.data?.isSuccess) {
				toast.success("Gán bên thuê nhận thông báo thành công");
				setShowAssignModal(false);
				resetAssignState();
				await fetchAll();
			} else {
				toast.error(response.data?.message || "Gán bên thuê thất bại");
			}
		} catch (error) {
			console.error("Error assigning tenant", error);
			toast.error("Không thể gán bên thuê");
		} finally {
			setIsAssigning(false);
		}
	};

	const handleGoToPage = () => {
		const parsed = Number(pageInput);
		if (!Number.isInteger(parsed)) {
			toast.warning("Vui lòng nhập số trang hợp lệ");
			return;
		}

		const bounded = Math.min(Math.max(parsed, 1), totalPages);
		setCurrentPage(bounded);
		setPageInput(String(bounded));
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Quản lý thông báo</h1>
					<p className="mt-1 text-sm text-gray-500">
						Tạo thông báo và chỉ định tenant nhận thông báo
					</p>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => fetchAll(currentPage)}
						className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
					>
						<RefreshCw className="h-4 w-4" />
						Làm mới
					</button>

					<button
						onClick={() => setShowCreateModal(true)}
						className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(var(--color-accent-dark))]"
					>
						<Plus className="h-4 w-4" />
						Tạo thông báo
					</button>
				</div>
			</div>

			<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-sm text-gray-500">Tổng thông báo</p>
					<p className="mt-2 text-2xl font-bold text-gray-900">{totalNotifications}</p>
				</div>
				<div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-sm text-gray-500">Tổng tenant</p>
					<p className="mt-2 text-2xl font-bold text-gray-900">{tenants.length}</p>
				</div>
				<div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-sm text-gray-500">Tổng liên kết blog</p>
					<p className="mt-2 text-2xl font-bold text-gray-900">{blogOptions.length}</p>
				</div>
			</div>

			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ID</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tiêu đề</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nội dung</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Liên kết blog</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ngày gửi</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tenant nhận</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-200 bg-white">
							{isLoading ? (
								<tr>
									<td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
										Đang tải...
									</td>
								</tr>
							) : notifications.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
										Chưa có thông báo nào
									</td>
								</tr>
							) : (
								notifications.map((item) => (
									<tr key={item.notificationId} className="hover:bg-gray-50">
										<td className="px-4 py-3 text-sm text-gray-700">#{item.notificationId}</td>
										<td className="px-4 py-3 text-sm font-medium text-gray-900">{item.notifyTitle}</td>
										<td className="px-4 py-3 text-sm text-gray-700">{item.notifySub}</td>
										<td className="px-4 py-3 text-sm text-blue-600">
											{item.systemBlogUrl ? (
												<a href={item.systemBlogUrl} target="_blank" rel="noopener noreferrer" className="underline">
													Mở liên kết
												</a>
											) : (
												<span className="text-gray-400">Không có</span>
											)}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{new Date(item.sentAt).toLocaleString("vi-VN")}
										</td>
										<td className="px-4 py-3 text-sm">
											<span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
												{notifyCountMap.get(item.notificationId)?.size ?? 0} tenant
											</span>
										</td>
										<td className="px-4 py-3 text-sm">
											<button
												onClick={() => openAssignModal(item.notificationId)}
												className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
											>
												<Send className="h-3 w-3" />
												Gửi lại
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3">
					<p className="text-sm text-gray-500">
						Trang {currentPage}/{totalPages}
					</p>

					<div className="flex flex-wrap items-center gap-2">
						<button
							type="button"
							onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
							disabled={currentPage <= 1 || isLoading}
							className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Lùi lại
						</button>

						<button
							type="button"
							onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={currentPage >= totalPages || isLoading}
							className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Trang tiếp
						</button>

						<input
							type="number"
							min={1}
							max={totalPages}
							value={pageInput}
							onChange={(e) => setPageInput(e.target.value)}
							className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none"
						/>

						<button
							type="button"
							onClick={handleGoToPage}
							disabled={isLoading}
							className="rounded-lg bg-[rgb(var(--color-primary))] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[rgb(var(--color-accent-dark))] disabled:opacity-50"
						>
							Đi tới trang
						</button>
					</div>
				</div>
			</div>

			{showCreateModal ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-lg font-bold text-gray-900">Tạo thông báo</h2>
							<button onClick={closeCreateModal} className="text-sm text-gray-500 hover:text-gray-700">
								Đóng
							</button>
						</div>

						<form onSubmit={handleCreateNotification} className="space-y-4">
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề thông báo</label>
								<input
									type="text"
									value={notificationForm.notifyTitle}
									onChange={(e) =>
										setNotificationForm((prev) => ({ ...prev, notifyTitle: e.target.value }))
									}
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none"
								placeholder="Nhập tiêu đề"
									required
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700">Nội dung tóm tắt</label>
								<textarea
									value={notificationForm.notifySub}
									onChange={(e) =>
										setNotificationForm((prev) => ({ ...prev, notifySub: e.target.value }))
									}
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none"
									placeholder="Nhập nội dung thông báo"
									rows={4}
									required
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700">Liên kết blog hệ thống (không bắt buộc)</label>
								<select
									value={notificationForm.systemBlogUrl}
									onChange={(e) =>
										setNotificationForm((prev) => ({ ...prev, systemBlogUrl: e.target.value }))
									}
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none"
								>
									<option value="">Không gắn blog URL</option>
									{blogOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<button
									type="button"
									onClick={closeCreateModal}
									className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
								>
									Hủy
								</button>
								<button
									type="submit"
									disabled={isCreating}
									className="rounded-xl bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(var(--color-accent-dark))] disabled:opacity-50"
								>
									{isCreating ? "Đang tạo..." : "Tạo và chọn bên thuê"}
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			{showAssignModal ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
						<div className="mb-5 flex items-center justify-between">
							<div>
								<h2 className="text-lg font-bold text-gray-900">Chỉ định bên thuê nhận thông báo</h2>
								<p className="text-sm text-gray-500">Thông báo ID: #{createdNotificationId}{createdNotificationId && (notifyCountMap.get(createdNotificationId)?.size ?? 0) > 0 ? ` · Đã gửi cho ${notifyCountMap.get(createdNotificationId)!.size} bên thuê` : ""}</p>
							</div>
							<button
								onClick={() => {
									setShowAssignModal(false);
									resetAssignState();
								}}
								className="text-sm text-gray-500 hover:text-gray-700"
							>
								Đóng
							</button>
						</div>

						<div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
							<label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
								<input
									type="checkbox"
									checked={selectAllTenants}
									onChange={(e) => {
										setSelectAllTenants(e.target.checked);
										if (e.target.checked) {
											setSelectedTenantIds(new Set());
										}
									}}
								/>
								Chọn tất cả bên thuê đã tạo
							</label>
						</div>

						<div className="mb-3">
							<input
								type="text"
								placeholder="Tìm bên thuê theo tên, mã tài khoản, số điện thoại"
								value={searchTenant}
								onChange={(e) => setSearchTenant(e.target.value)}
								disabled={selectAllTenants}
								className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
							/>
						</div>

						<div className="max-h-72 overflow-auto rounded-xl border border-gray-200">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="w-12 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Chọn</th>
										<th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tên</th>
										<th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tài khoản</th>
										<th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Điện thoại</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{filteredTenants.map((tenant) => (
										<tr key={tenant.id} className="hover:bg-gray-50">
											<td className="px-3 py-2">
												<input
													type="checkbox"
													disabled={selectAllTenants}
													checked={selectedTenantIds.has(tenant.id)}
													onChange={(e) => toggleTenant(tenant.id, e.target.checked)}
												/>
											</td>
											<td className="px-3 py-2 text-sm text-gray-800">{tenant.name}</td>
											<td className="px-3 py-2 text-sm text-gray-600">{tenant.accountId}</td>
											<td className="px-3 py-2 text-sm text-gray-600">{tenant.phone}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="mt-5 flex items-center justify-between">
							<p className="text-sm text-gray-500">
								{selectAllTenants
									? `Đã chọn tất cả ${filteredTenants.length} bên thuê chưa nhận`
									: `Đã chọn ${selectedTenantIds.size} bên thuê`}
							</p>

							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => {
										setShowAssignModal(false);
										resetAssignState();
									}}
									className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
								>
									Hủy
								</button>
								<button
									type="button"
									onClick={handleAssignTenant}
									disabled={isAssigning}
									className="rounded-xl bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(var(--color-accent-dark))] disabled:opacity-50"
								>
									{isAssigning ? "Đang gửi..." : "Gửi đến bên thuê đã chọn"}
								</button>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}

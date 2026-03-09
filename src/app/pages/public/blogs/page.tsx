"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ROUTES } from "@/src/constants/routes";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { ApiResponse } from "@/src/types/type";

interface SystemBlogItem {
	systemBlogId: number;
	title: string;
	createdAt: string;
	updatedAt: string;
	totalViews: number;
	thumbnailUrl?: string;
	blogType: number;
	isActive: boolean;
	isDeleted: boolean;
}

interface BlogsResponse {
	items: SystemBlogItem[];
	totalCount: number;
	page: number;
	pageSize: number;
}

const formatDate = (isoDate: string) => {
	return new Date(isoDate).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

export default function BlogsPage() {
	const [blogs, setBlogs] = useState<SystemBlogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [pageSize, setPageSize] = useState(7);
	const [apiPage, setApiPage] = useState(1);

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				const response = await apiClient.get<ApiResponse<BlogsResponse>>(
					API.BLOG.GET_ALL(currentPage, 7)
				);

				if (response.data?.isSuccess && response.data.data?.items) {
					setTotalCount(response.data.data.totalCount ?? 0);
					setPageSize(response.data.data.pageSize ?? 7);
					setApiPage(response.data.data.page ?? currentPage);

					// Sort by createdAt in descending order (newest first)
					const sortedBlogs = [...response.data.data.items].sort((a, b) => {
						return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
					});
					setBlogs(sortedBlogs);
				}
			} catch (error) {
				console.error("Error fetching blogs:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchBlogs();
	}, [currentPage]);

	const sortedBlogs = blogs;
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const canGoPrev = apiPage > 1;
	const canGoNext = apiPage < totalPages;

	return (
		<div className="bg-white text-gray-900">
			<section className="bg-[rgb(var(--color-secondary))] border-b border-[rgb(var(--color-primary)/0.15)]">
				<div className="max-w-6xl mx-auto px-6 py-14">
					<p className="text-[rgb(var(--color-primary))] font-semibold tracking-wide uppercase text-sm">
						Blog S2O
					</p>
					<h1 className="mt-2 text-3xl md:text-5xl font-extrabold leading-tight">
						Tin tức và kiến thức vận hành
						<span className="text-[rgb(var(--color-primary))]"> nhà hàng số</span>
					</h1>
					<p className="mt-4 text-sm md:text-base text-gray-600 max-w-3xl leading-relaxed">
						Cập nhật các bài viết mới nhất về quản trị nhà hàng, chuyển đổi số ngành F&B,
						và các tính năng nổi bật từ nền tảng Scan2Order.
					</p>
				</div>
			</section>

			<section className="max-w-6xl mx-auto px-6 py-12">
				{loading ? (
					<div className="rounded-2xl border border-[rgb(var(--color-primary)/0.15)] bg-white px-6 py-12 text-center">
						<p className="text-sm text-gray-600">Đang tải danh sách blog...</p>
					</div>
				) : null}

				{sortedBlogs.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-[rgb(var(--color-primary)/0.25)] bg-[rgb(var(--color-secondary))] px-6 py-12 text-center">
						<p className="text-lg font-semibold text-[rgb(var(--color-primary))]">
							Chưa có bài viết nào
						</p>
						<p className="mt-2 text-sm text-gray-600">
							Nội dung blog sẽ được cập nhật sớm. Vui lòng quay lại sau.
						</p>
						<Link
							href={ROUTES.HOME}
							className="mt-6 inline-flex items-center justify-center rounded-xl bg-[rgb(var(--color-accent-dark))] px-6 py-3 text-white font-semibold hover:bg-[rgb(var(--color-primary))] transition-colors"
						>
							Quay về trang chủ
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{sortedBlogs.map((blog) => (
							<article
								key={blog.systemBlogId}
								className="rounded-2xl border border-[rgb(var(--color-primary)/0.12)] bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
							>
								<div className="h-44 bg-[rgb(var(--color-secondary))] flex items-center justify-center text-sm text-gray-500 overflow-hidden">
									{blog.thumbnailUrl ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={blog.thumbnailUrl}
											alt={blog.title}
											className="h-full w-full object-cover"
										/>
									) : (
										<span>Ảnh bài viết</span>
									)}
								</div>
								<div className="p-5">
									<div className="flex items-center gap-2 text-xs text-gray-500">
										<span>{formatDate(blog.createdAt)}</span>
										<span>•</span>
										<span>{blog.totalViews.toLocaleString()} lượt xem</span>
									</div>
									<h2 className="mt-2 text-lg font-bold text-gray-900 line-clamp-2">{blog.title}</h2>
									<div className="mt-4">
										<Link
											href={`${ROUTES.PAGES.PUBLIC.BLOGS}/${blog.systemBlogId}`}
											className="inline-flex items-center text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline"
										>
											Đọc tiếp
										</Link>
									</div>
								</div>
							</article>
						))}
					</div>
				)}

				{sortedBlogs.length > 0 && (
					<div className="mt-8 flex items-center justify-center gap-3">
						<button
							onClick={() => canGoPrev && setCurrentPage((prev) => prev - 1)}
							disabled={!canGoPrev}
							className="rounded-lg border border-[rgb(var(--color-primary)/0.25)] bg-white px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary))] transition-colors hover:bg-[rgb(var(--color-secondary))] disabled:cursor-not-allowed disabled:opacity-50"
						>
							Trang trước
						</button>

						<p className="min-w-28 text-center text-sm text-gray-600">
							Trang {apiPage}/{totalPages}
						</p>

						<button
							onClick={() => canGoNext && setCurrentPage((prev) => prev + 1)}
							disabled={!canGoNext}
							className="rounded-lg bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[rgb(var(--color-primary)/0.85)] disabled:cursor-not-allowed disabled:opacity-50"
						>
							Trang sau
						</button>
					</div>
				)}
			</section>
		</div>
	);
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/src/constants/routes";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { ApiResponse } from "@/src/types/type";
import { ChevronLeft } from "lucide-react";

interface SystemBlogDetail {
	systemBlogId: number;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	totalViews: number;
	blogType: number;
	isActive: boolean;
	isDeleted: boolean;
	colorTitle?: string;
	imageUrl?: string;
	thumbnailUrl?: string;
}

const formatDate = (isoDate: string) => {
	return new Date(isoDate).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getBlogTypeLabel = (type: number) => {
	switch (type) {
		case 1:
			return "Thông báo";
		case 2:
			return "Khuyến mãi";
		case 3:
			return "Cập nhật";
		case 4:
			return "Sự kiện";
		case 5:
			return "Khác";
		default:
			return "Không xác định";
	}
};

const getBlogTypeColor = (type: number) => {
	switch (type) {
		case 1:
			return "bg-blue-500/10 text-blue-600 border-blue-500/20";
		case 2:
			return "bg-green-500/10 text-green-600 border-green-500/20";
		case 3:
			return "bg-purple-500/10 text-purple-600 border-purple-500/20";
		case 4:
			return "bg-orange-500/10 text-orange-600 border-orange-500/20";
		case 5:
			return "bg-gray-500/10 text-gray-600 border-gray-500/20";
		default:
			return "bg-gray-500/10 text-gray-600 border-gray-500/20";
	}
};

const parseImageUrls = (imageUrl?: string): string[] => {
	if (!imageUrl) return [];

	try {
		const parsed = JSON.parse(imageUrl) as unknown;
		if (Array.isArray(parsed)) {
			return parsed.filter((item): item is string => typeof item === "string" && item.startsWith("http"));
		}
	} catch {
		if (imageUrl.startsWith("http")) {
			return [imageUrl];
		}
	}

	return [];
};

const resolveBlogContentImages = (content: string, imageUrls: string[]): string => {
	let index = 0;

	const withResolvedImages = content.replace(/src="IMAGE_PLACEHOLDER[^"]*"/g, () => {
		const nextImage = imageUrls[index];
		index += 1;
		return nextImage ? `src="${nextImage}"` : 'src=""';
	});

	// Remove unresolved image blocks if there are more placeholders than images.
	return withResolvedImages.replace(
		/<div class="image-placeholder"[^>]*>.*?<img[^>]*src=""[^>]*>.*?<\/div>/g,
		""
	);
};

export default function BlogDetailPage() {
	const params = useParams();
	const blogId = Number(params.id);

	const [blog, setBlog] = useState<SystemBlogDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBlogDetail = async () => {
			if (!blogId || isNaN(blogId)) {
				setError("ID blog không hợp lệ");
				setLoading(false);
				return;
			}

			try {
				const response = await apiClient.get<ApiResponse<SystemBlogDetail>>(
					API.BLOG.GET_BY_ID(blogId)
				);

				if (response.data?.isSuccess && response.data.data) {
					setBlog(response.data.data);
				} else {
					setError(response.data?.message || "Không tìm thấy bài blog");
				}
			} catch (err) {
				console.error("Error fetching blog detail:", err);
				setError("Lỗi khi tải bài blog");
			} finally {
				setLoading(false);
			}
		};

		fetchBlogDetail();
	}, [blogId]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[rgb(var(--color-primary))]"></div>
					<p className="mt-4 text-gray-600">Đang tải bài viết...</p>
				</div>
			</div>
		);
	}

	if (error || !blog) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
				<div className="text-center">
					<p className="text-lg font-semibold text-gray-900">{error || "Không tìm thấy bài blog"}</p>
					<p className="mt-2 text-sm text-gray-600">Bài viết bạn tìm kiếm không còn tồn tại hoặc đã bị xóa.</p>
					<Link
						href={ROUTES.PAGES.PUBLIC.BLOGS}
						className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgb(var(--color-primary)/0.8)]"
					>
						<ChevronLeft className="h-4 w-4" />
						Quay lại danh sách blog
					</Link>
				</div>
			</div>
		);
	}

	const imageUrls = parseImageUrls(blog.imageUrl);
	const resolvedContent = blog.content
		? resolveBlogContentImages(blog.content, imageUrls)
		: "";
	const hasPlaceholderInContent = blog.content?.includes("IMAGE_PLACEHOLDER") ?? false;
	const fallbackGalleryImages = hasPlaceholderInContent ? [] : imageUrls;

	// Show thumbnail if available
	const displayThumbnail = blog.thumbnailUrl && blog.thumbnailUrl.trim() !== "";

	return (
		<div className="bg-white text-gray-900">
			<style>{`
				.blog-content h1 { font-size: 2rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 1rem; }
				.blog-content h2 { font-size: 1.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 1rem; }
				.blog-content h3 { font-size: 1.25rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.75rem; }
				.blog-content h4 { font-size: 1.1rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.75rem; }
				.blog-content p { margin-bottom: 1rem; }
				.blog-content strong { font-weight: bold; }
				.blog-content em { font-style: italic; }
				.blog-content ul, .blog-content ol { margin-left: 2rem; margin-bottom: 1rem; }
				.blog-content li { margin-bottom: 0.5rem; }
			`}</style>
			{/* Header */}
			<section className="border-b border-[rgb(var(--color-primary)/0.15)] bg-[rgb(var(--color-secondary))]">
				<div className="mx-auto max-w-4xl px-6 py-8">
					<Link
						href={ROUTES.PAGES.PUBLIC.BLOGS}
						className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-primary))] transition-colors hover:text-[rgb(var(--color-primary)/0.8)]"
					>
						<ChevronLeft className="h-4 w-4" />
						Quay lại danh sách
					</Link>

					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="flex-1">
							<h1
								className="text-3xl font-extrabold leading-tight md:text-4xl"
								style={{
									color: blog.colorTitle || "rgb(var(--color-primary))",
								}}
							>
								{blog.title}
							</h1>

							<div className="mt-4 flex flex-wrap items-center gap-3">
								<span
									className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBlogTypeColor(blog.blogType)}`}
								>
									{getBlogTypeLabel(blog.blogType)}
								</span>
								<span className="text-sm text-gray-600">{formatDate(blog.createdAt)}</span>
								<span className="text-sm text-gray-600">•</span>
								<span className="text-sm text-gray-600">{blog.totalViews.toLocaleString()} lượt xem</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Content */}
			<section className="mx-auto max-w-4xl px-6 py-12">
				{/* Thumbnail - Display first if available */}
				{displayThumbnail && (
					<div className="mb-8 overflow-hidden rounded-2xl border border-[rgb(var(--color-primary)/0.1)]">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={blog.thumbnailUrl}
							alt={blog.title}
							className="h-96 w-full object-cover"
						/>
					</div>
				)}

				{/* Content Gallery Images (from imageUrl) - only show if no placeholders in content */}
				{!displayThumbnail && fallbackGalleryImages.length > 0 ? (
					<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
						{fallbackGalleryImages.map((url, idx) => (
							<div
								key={`${url}-${idx}`}
								className="overflow-hidden rounded-2xl border border-[rgb(var(--color-primary)/0.1)]"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={url}
									alt={`${blog.title} ${idx + 1}`}
									className="h-72 w-full object-cover"
								/>
							</div>
						))}
					</div>
				) : !displayThumbnail ? (
					<div className="mb-8 rounded-2xl overflow-hidden border border-[rgb(var(--color-primary)/0.1)] h-96 bg-[rgb(var(--color-secondary))] flex items-center justify-center">
						<span className="text-gray-500">Ảnh minh họa</span>
					</div>
				) : null}

				<div className="max-w-none">
					{blog.content ? (
						<div
							className="blog-content text-gray-700 leading-relaxed space-y-4"
							dangerouslySetInnerHTML={{
								__html: resolvedContent,
							}}
							style={{
								fontSize: "1rem",
								lineHeight: "1.75",
							}}
						/>
					) : (
						<p className="text-gray-600 italic">Bài viết này không có nội dung.</p>
					)}
				</div>
			</section>

			{/* Footer CTA */}
			<section className="border-t border-[rgb(var(--color-primary)/0.15)] bg-[rgb(var(--color-secondary))]">
				<div className="mx-auto max-w-4xl px-6 py-8">
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<Link
							href={ROUTES.PAGES.PUBLIC.BLOGS}
							className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgb(var(--color-primary)/0.8)]"
						>
							<ChevronLeft className="h-4 w-4" />
							Quay lại danh sách blog
						</Link>
						<p className="text-sm text-gray-600">
							Cập nhật lần cuối: {formatDate(blog.updatedAt)}
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}

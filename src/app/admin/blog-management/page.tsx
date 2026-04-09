"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import {
  SystemBlogDto,
  AddSystemBlogDtoResponse,
  ApiResponse,
  BlogType,
} from "@/src/types/type";
import BlogBlockEditor, { ContentBlock, BlockType } from "@/src/components/ui/common/layout/BlogBlockEditor";
import StatsCards from "@/src/components/ui/common/layout/StatsCards";
import BlogsTable from "@/src/components/ui/common/layout/BlogsTable";
import CreateBlogModal from "@/src/components/ui/common/layout/CreateBlogModal";
import BlogDetailModal from "@/src/components/ui/common/layout/BlogDetailModal";

interface BlogListResponse {
  items: SystemBlogDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<SystemBlogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    colorTitle: "#000000",
    blogType: BlogType.Announcement,
  });
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<SystemBlogDto | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailContent, setDetailContent] = useState<string>("");
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>([]);
  const [detailThumbnailUrl, setDetailThumbnailUrl] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");


  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiResponse<BlogListResponse>>(
        API.BLOG.GET_ALL(1, 50)
      );

      if (response.data?.isSuccess && response.data.data?.items) {
        setBlogs(response.data.data.items);
      } else {
        toast.error("Không thể tải danh sách blog");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi tải blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Fetch blog detail
  const fetchBlogDetail = async (blogId: number) => {
    try {
      setDetailLoading(true);
      const response = await apiClient.get<ApiResponse<SystemBlogDto>>(
        API.BLOG.GET_BY_ID(blogId)
      );

      if (response.data?.isSuccess && response.data.data) {
        const blog = response.data.data;
        setSelectedBlog(blog);
        setDetailContent(blog.content || "");
        setDetailThumbnailUrl(typeof blog.thumbnailUrl === "string" ? blog.thumbnailUrl : "");
        
        // Parse imageUrl if it's a JSON string
        try {
          const imageUrls = typeof blog.imageUrl === "string"
            ? (JSON.parse(blog.imageUrl) as string[])
            : Array.isArray(blog.imageUrl)
            ? blog.imageUrl
            : [];
          setDetailImageUrls(imageUrls as string[]);
        } catch {
          setDetailImageUrls([]);
        }
        
        setShowDetailModal(true);
      } else {
        toast.error("Không thể tải chi tiết blog");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi tải chi tiết blog");
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreview("");
      return;
    }

    setThumbnailFile(file);
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };

  // Add new content block
  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: "",
    };
    setContentBlocks((prev) => [...prev, newBlock]);
  };

  // Update block content
  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  // Delete block
  const deleteBlock = (id: string) => {
    setContentBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  // Move block up
  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...contentBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    setContentBlocks(newBlocks);
  };

  // Move block down
  const moveBlockDown = (index: number) => {
    if (index === contentBlocks.length - 1) return;
    const newBlocks = [...contentBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [
      newBlocks[index + 1],
      newBlocks[index],
    ];
    setContentBlocks(newBlocks);
  };

  // Handle image upload for block
  const handleBlockImageUpload = (
    blockId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBlock(blockId, {
          imageFile: file,
          imagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert blocks to HTML content
  const blocksToHtml = (): string => {
    return contentBlocks
      .map((block) => {
        if (block.type === "text") {
          let text = block.content;
          if (block.style?.bold) text = `<strong>${text}</strong>`;
          if (block.style?.italic) text = `<em>${text}</em>`;
          const align = block.style?.alignment || "left";
          return `<p style="text-align: ${align}">${text}</p>`;
        } else if (block.type === "heading") {
          const level = block.style?.heading || "h2";
          const align = block.style?.alignment || "left";
          return `<${level} style="text-align: ${align}">${block.content}</${level}>`;
        } else if (block.type === "image") {
          return `<div class="image-placeholder" style="text-align: center; margin: 20px 0;"><img src="IMAGE_PLACEHOLDER_${block.id}" alt="Blog image" style="max-width: 100%; height: auto;" /></div>`;
        }
        return "";
      })
      .join("");
  };

  // Create new blog
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || contentBlocks.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin và thêm nội dung");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      formDataToSend.append("Title", formData.title);
      formDataToSend.append("ColorTitle", formData.colorTitle);
      formDataToSend.append("BlogType", formData.blogType.toString());

      // Convert blocks to HTML content
      const htmlContent = blocksToHtml();
      formDataToSend.append("Content", htmlContent);

      // Append images from blocks
      contentBlocks.forEach((block) => {
        if (block.type === "image" && block.imageFile) {
          formDataToSend.append("Images", block.imageFile);
        }
      });

      if (thumbnailFile) {
        formDataToSend.append("Thumbnail", thumbnailFile);
      }

      const response = await apiClient.post<
        ApiResponse<AddSystemBlogDtoResponse>
      >(API.BLOG.CREATE, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.isSuccess) {
        toast.success("Tạo blog thành công");
        setShowCreateModal(false);
        // Reset form
        setFormData({
          title: "",
          colorTitle: "#000000",
          blogType: BlogType.Announcement,
        });
        setContentBlocks([]);
        setThumbnailFile(null);
        setThumbnailPreview("");
        // Refresh blogs list
        fetchBlogs();
      } else {
        toast.error(response.data?.message || "Tạo blog thất bại");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi tạo blog");
    } finally {
      setLoading(false);
    }
  };

  // Get blog type label
  const getBlogTypeLabel = (type: string | BlogType) => {
    const typeNum = typeof type === "string" ? parseInt(type) : type;
    switch (typeNum) {
      case BlogType.Announcement:
        return "Thông báo";
      case BlogType.Promotion:
        return "Khuyến mãi";
      case BlogType.Update:
        return "Cập nhật";
      case BlogType.Event:
        return "Sự kiện";
      case BlogType.Other:
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  // Get blog type color
  const getBlogTypeColor = (type: string | BlogType) => {
    const typeNum = typeof type === "string" ? parseInt(type) : type;
    switch (typeNum) {
      case BlogType.Announcement:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case BlogType.Promotion:
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case BlogType.Update:
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case BlogType.Event:
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case BlogType.Other:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý blog
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Quản lý các bài viết, thông báo và khuyến mãi
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Tạo blog mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <StatsCards blogs={blogs} getBlogTypeLabel={getBlogTypeLabel} />
        </div>

        {/* Blogs Table */}
        <BlogsTable
          blogs={blogs}
          loading={loading}
          getBlogTypeLabel={getBlogTypeLabel}
          getBlogTypeColor={getBlogTypeColor}
          onViewDetail={(blog) => {
            const blogId = blog.id || blog.systemBlogId;
            if (blogId) {
              fetchBlogDetail(blogId);
            } else {
              toast.error("ID blog không hợp lệ");
            }
          }}
        />
      </div>

      {/* Create Blog Modal */}
      <CreateBlogModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setContentBlocks([]);
          setShowPreview(false);
          setThumbnailFile(null);
          setThumbnailPreview("");
        }}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        formData={formData}
        onFormChange={handleInputChange}
        thumbnailPreview={thumbnailPreview}
        onThumbnailUpload={handleThumbnailUpload}
        contentBlocks={contentBlocks}
        onAddBlock={addBlock}
        onUpdateBlock={updateBlock}
        onDeleteBlock={deleteBlock}
        onMoveBlockUp={moveBlockUp}
        onMoveBlockDown={moveBlockDown}
        onImageUpload={handleBlockImageUpload}
        onSubmit={handleCreateBlog}
        loading={loading}
        getBlogTypeLabel={getBlogTypeLabel}
        getBlogTypeColor={getBlogTypeColor}
      />

      {/* Blog Detail Modal */}
      <BlogDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBlog(null);
          setDetailContent("");
          setDetailImageUrls([]);
          setDetailThumbnailUrl("");
        }}
        blog={selectedBlog}
        loading={detailLoading}
        getBlogTypeLabel={getBlogTypeLabel}
        getBlogTypeColor={getBlogTypeColor}
        content={detailContent}
        colorTitle={selectedBlog?.colorTitle}
        imageUrls={detailImageUrls}
        thumbnailUrl={detailThumbnailUrl}
      />
    </div>
  );
}
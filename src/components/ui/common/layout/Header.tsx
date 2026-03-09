"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, LogOut, User } from "lucide-react";
import logoDefault from "@/src/images/logo/logo_removebg.png";
import { ROUTES, TENANT_ROUTES } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // Toggle dropdown
  const toggleDropdown = (userId: string) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  const handleLogOut = async () => {
      logout();
      toast.success("Đăng xuất thành công");
      router.push(ROUTES.HOME);
  };
  return (
    <header
      className={`sticky top-0 z-50 bg-[rgb(var(--color-primary))] border-b border-[rgb(var(--color-primary)/0.4)] px-6 py-3 ${className}`}
    >
      <div className="flex items-center justify-between max-w-full mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="h-9 w-[120px] flex items-center">
            <Image
              src={logoDefault}
              alt="Logo"
              width={120}
              height={36}
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-12">
          {!isAuthenticated && (
            <>
              <Link
                href={ROUTES.PAGES.PUBLIC.FEATURES}
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Tính năng
              </Link>
              <Link
                href={ROUTES.PAGES.PUBLIC.PLAN}
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Bảng giá
              </Link>
              <Link
                href="#"
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Khách hàng
              </Link>
              <Link
                href={ROUTES.PAGES.PUBLIC.ABOUT_US}
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Về chúng tôi
              </Link>
              <Link
                href={ROUTES.PAGES.PUBLIC.BLOGS}
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Blog
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link
                href={ROUTES.PAGES.PUBLIC.FEATURES}
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Tính năng
              </Link>
              <Link
                href={ROUTES.PAGES.PUBLIC.PLAN}
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Bảng giá
              </Link>
              <Link
                href="#"
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Khách hàng
              </Link>
              <Link
                href={ROUTES.PAGES.PUBLIC.ABOUT_US}
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Về chúng tôi
              </Link>
              <Link
                href={TENANT_ROUTES.DASHBOARD}
                className="text-white/90 hover:text-white font-medium text-base"
              >
                Quản lý nhà hàng
              </Link>
            </>
          )}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 text-white">
          {isAuthenticated ? (
            <div
              className="flex items-center gap-3"
              ref={openDropdownId === user?.id ? dropdownRef : null}
            >
              <span className="text-sm font-medium text-white/90">
                {user?.name || "Người dùng"}
              </span>
              <button
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 relative"
                aria-label="Tài khoản"
                onClick={() => toggleDropdown(user?.id || "")}
              >
                <User className="h-5 w-5" />
              </button>
              {/* Dropdown Menu */}
              {openDropdownId === user?.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      handleLogOut();
                      setOpenDropdownId(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng Xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href={ROUTES.PAGES.PUBLIC.LOGIN}
                className="px-4 py-2 rounded-full border border-whit text-sm font-medium hover:bg-[rgb(var(--color-accent-dark))]"
              >
                Đăng nhập
              </Link>
              <Link
                href={ROUTES.PAGES.PUBLIC.REGISTER}
                className="px-4 py-2 rounded-full border border-white text-white text-sm font-medium hover:bg-white/10"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import logoDefault from "@/src/images/logo/logo_removebg.png";
import { ROUTES } from "@/src/constants/routes";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const isLoggedIn = false;
  const userName = "User";

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
          <Link
            href="#"
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
            href="#"
            className="text-white/90 hover:text-white font-medium text-base"
          >
            Về chúng tôi
          </Link>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 text-white">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white/90">
                {userName}
              </span>
              <button
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 relative"
                aria-label="Tài khoản"
              >
                <User className="h-5 w-5" />
              </button>
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

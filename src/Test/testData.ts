export type PlanPackage = {
    PlanId: number;
    Name: string;
    Price: number;
    Description: string;
    DurationMonths: number;
    Status: number;
    Features: string[];
    Tag: string;
    IsPopular?: boolean;
};

export const PLAN_TEST_DATA: PlanPackage[] = [
    {
        PlanId: 1,
        Name: "Starter",
        Price: 199000,
        Description: "Dành cho quán nhỏ cần triển khai nhanh và dễ quản lý.",
        DurationMonths: 1,
        Status: 1,
        Tag: "Cơ bản",
        Features: [
            "Menu QR cơ bản, cập nhật dễ dàng",
            "Tối đa 30 món và 5 bàn",
            "Thông báo đơn hàng theo thời gian thực",
            "Báo cáo doanh thu theo ngày",
        ],
    },
    {
        PlanId: 2,
        Name: "Growth",
        Price: 399000,
        Description: "Phù hợp nhà hàng vừa, cần tối ưu vận hành và báo cáo chi tiết.",
        DurationMonths: 3,
        Status: 1,
        Tag: "Phổ biến",
        IsPopular: true,
        Features: [
            "Tối đa 120 món và 20 bàn",
            "Tùy chỉnh giao diện menu",
            "Quản lý nhân viên theo vai trò",
            "Báo cáo bán chạy theo khung giờ",
        ],
    },
    {
        PlanId: 3,
        Name: "Enterprise",
        Price: 799000,
        Description: "Dành cho chuỗi nhà hàng cần tính năng mở rộng và hỗ trợ ưu tiên.",
        DurationMonths: 12,
        Status: 1,
        Tag: "Nâng cao",
        Features: [
            "Không giới hạn món và bàn",
            "Tích hợp hệ thống POS/ERP",
            "Tùy biến quy trình đặt món",
            "Hỗ trợ kỹ thuật ưu tiên 24/7",
        ],
    },
];

export const fetchPlansMock = async (): Promise<PlanPackage[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return PLAN_TEST_DATA;
};
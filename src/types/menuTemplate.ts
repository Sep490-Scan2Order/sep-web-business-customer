export interface MenuTemplateDish {
  dishId: number;
  dishName: string;
  description?: string;
  imageUrl?: string;
  price: number;
  discountedPrice?: number;
  isSoldOut?: boolean;
  hasPromotion?: boolean;
  promotionLabel?: string;
  dishAvailabilityStock?: number;
}

export interface MenuTemplateCategory {
  categoryId: number;
  categoryName: string;
  dishes: MenuTemplateDish[];
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundMode?: "color" | "image";
  backgroundColor?: string;
  backgroundImageUrl?: string;
}

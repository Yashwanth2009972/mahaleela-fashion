export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  description: string;
  details?: string[];
  size_fit?: string;
  material_care?: string;
  colours: string[];
  sizes: string[];
  stock: number;
  images: string[];
  video_url?: string;
  material?: string;
  fit?: string;
  pattern?: string;
  care?: string;
  badges?: string[];
  collections: string[];
  is_signature?: boolean;
  is_exclusive?: boolean;
  shipping_fee?: number;
  status: 'published' | 'draft' | 'archived';
  created_at?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  desktop_banner?: string;
  mobile_banner?: string;
  thumbnail?: string;
  is_published: boolean;
  is_exclusive?: boolean;
  sort_order: number;
  product_count?: number;
  products?: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count?: number;
  sort_order: number;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  section_type: string;
  title: string;
  subtitle?: string;
  content?: string;
  cta_text?: string;
  cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  image_url?: string;
  mobile_image_url?: string;
  secondary_image_url?: string;
  display_order: number;
  is_visible: boolean;
  product_id?: string;
  limit?: number;
  stories?: Array<{
    number: string;
    title: string;
    description: string;
    image: string;
    url: string;
  }>;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  desktop_image: string;
  mobile_image: string;
  cta_text?: string;
  cta_url?: string;
  position: string;
  is_active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  usage_limit?: number;
  used_count?: number;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  colour: string;
  size: string;
  quantity: number;
}

export interface OrderTrackingStage {
  status: string;
  label: string;
  time: string;
  completed: boolean;
}

export interface OrderItem {
  product_id: string;
  name: string;
  colour: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    address_line: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  cod_fee: number;
  discount: number;
  coupon_code?: string;
  total: number;
  payment_method: 'UPI' | 'COD';
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  tracking_timeline: OrderTrackingStage[];
  created_at: string;
}

export interface SiteSettings {
  brand_name: string;
  tagline: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  free_shipping_threshold: number;
  cod_fee: number;
  standard_shipping_fee?: number;
  bottom_gallery?: Array<{ id: string; image_url: string; title?: string }>;
  social: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  policies: {
    shipping: string;
    returns: string;
    privacy: string;
    terms: string;
  };
  google_client_id?: string;
  exclusive_settings?: {
    title: string;
    subtitle: string;
    banner_image: string;
    direct_shopping_enabled: boolean;
  };
  cloud_sync?: {
    firebase_url?: string;
    imgbb_api_key?: string;
    backend_url?: string;
    last_synced_at?: string;
  };
}

export interface ColorOption {
  name: string;
  hex: string;
  border?: boolean;
}

export const STANDARD_COLORS: ColorOption[] = [
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Dark Green', hex: '#166534' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Charcoal Grey', hex: '#4B5563' },
  { name: 'Warm Ivory', hex: '#E7DFD5', border: true },
  { name: 'Maroon', hex: '#800020' },
  { name: 'Golden Yellow', hex: '#EAB308' },
];

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  auth_provider?: string;
  role: 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'PRODUCT_ADMIN' | 'ORDER_ADMIN' | 'CUSTOMER';
  is_exclusive_member: boolean;
  created_at?: string;
}

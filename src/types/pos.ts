export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  available: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Table {
  id: string;
  name: string;
  status: 'free' | 'occupied' | 'reserved';
  capacity: number;
  position?: { x: number; y: number };
}

export interface Order {
  id: number;
  tableId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'kitchen' | 'ready' | 'served' | 'paid';
  platform: 'pos' | 'delivery' | 'online';
  customerName?: string;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: 'cash' | 'card' | 'digital';
}

export interface DailyReport {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrder: number;
  taxableAmount: number;
  taxAmount: number;
  paymentMethods: Record<string, number>;
  topItems: { item: string; quantity: number; revenue: number }[];
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}
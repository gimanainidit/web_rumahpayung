import { z } from 'zod';
export const money = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
export const stages = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Quotation Sent',
  'Negotiation',
  'Won',
  'Lost',
] as const;
export const orderStates = [
  'unfulfilled',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
] as const;
export const stageLabels: Record<string, string> = {
  'New Lead': 'Prospek baru',
  Contacted: 'Dihubungi',
  Qualified: 'Terkualifikasi',
  'Quotation Sent': 'Penawaran dikirim',
  Negotiation: 'Negosiasi',
  Won: 'Berhasil',
  Lost: 'Tidak lanjut',
};
export const orderLabels: Record<string, string> = {
  unfulfilled: 'Menunggu pembayaran',
  processing: 'Diproses',
  packed: 'Dikemas',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
};
const text = (min = 1, max = 160) => z.string().trim().min(min).max(max);
const integer = z.number().int().min(0).max(1_000_000_000);
export const variantSchema = z.object({
  id: text(),
  label: text(),
  color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
  stock: integer.max(100000),
});
export const productSchema = z.object({
  revision: z.number().int().min(0).default(0),
  id: text(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  sku: text(),
  name: text(3),
  category: z.enum(['Payung', 'Tumbler', 'Tas']),
  description: text(10, 3000),
  price: integer.positive(),
  cost: integer,
  moq: z.number().int().min(1).max(10000),
  image: z.union([
    z.enum(['navy', 'black', 'cream', 'green', 'tumbler', 'bag']),
    z.string().regex(/^\/media\/[a-f0-9-]{36}\.webp$/),
  ]),
  active: z.boolean(),
  verified: z.boolean(),
  variants: z.array(variantSchema).min(1).max(12),
});
export type Product = z.infer<typeof productSchema>;
export const settingsSchema = z.object({
  demo: z.boolean(),
  whatsapp: z.string().regex(/^(62\d{8,13})?$/),
  businessName: text(),
  bankName: z.string().trim().max(80),
  bankAccount: z.string().trim().max(80),
  bankHolder: z.string().trim().max(120),
  minMargin: z.number().min(0).max(80),
  maxDiscount: z.number().min(0).max(40),
  printCost: integer,
  setupCost: integer,
  shippingLocal: integer,
  shippingNational: integer,
  followupHours: z.number().int().min(1).max(168),
  responseMinutes: z.number().int().min(1).max(1440),
});
export type Settings = z.infer<typeof settingsSchema>;
export const leadSchema = z.object({
  company: text(2),
  name: text(2),
  phone: z
    .string()
    .trim()
    .max(24)
    .transform((value) => value.replace(/[ ()-]/g, ''))
    .pipe(z.string().regex(/^(?:\+62|62|0)\d{8,13}$/)),
  email: z.union([z.email(), z.literal('')]),
  productId: text(),
  quantity: z.number().int().min(1).max(10000),
  budget: integer,
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().trim().max(2000),
  consent: z.literal(true),
  source: z.string().max(120).default('Website'),
  campaign: z.string().max(120).default(''),
  medium: z.string().max(120).default(''),
  term: z.string().max(120).default(''),
});
export type LeadInput = z.infer<typeof leadSchema>;
export interface Quote {
  unitPrice: number;
  subtotal: number;
  setup: number;
  total: number;
  cost: number;
  margin: number;
  discount: number;
  quantity: number;
  productName: string;
  createdAt: string;
  validUntil: string;
  demo: boolean;
}
export interface Activity {
  at: string;
  text: string;
}
export interface Lead extends LeadInput {
  id: string;
  createdAt: string;
  stage: (typeof stages)[number];
  owner: string;
  followupAt: string | null;
  lostReason: string;
  revenue: number;
  quote: Quote | null;
  activities: Activity[];
}
export const addressSchema = z.object({
  name: text(2),
  phone: leadSchema.shape.phone,
  email: z.union([z.email(), z.literal('')]),
  address: text(10, 500),
  city: text(2, 100),
  postalCode: z.string().regex(/^\d{5}$/),
});
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: text(),
        variantId: text(),
        quantity: z.number().int().min(1).max(500),
      }),
    )
    .min(1)
    .max(30),
  address: addressSchema,
  shipping: z.enum(['pickup', 'local', 'national']),
  consent: z.literal(true),
  expectedTotal: integer,
});
export type Checkout = z.infer<typeof checkoutSchema>;
export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: Product['image'];
}
export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: z.infer<typeof addressSchema>;
  subtotal: number;
  shippingCost: number;
  shipping: string;
  total: number;
  payment: 'pending' | 'paid' | 'cancelled';
  status: (typeof orderStates)[number];
  courier: string;
  tracking: string;
  timeline: Activity[];
  demo: boolean;
  bank: { name: string; account: string; holder: string };
}
export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}
export function calculateQuote(
  product: Product,
  quantity: number,
  settings: Settings,
  requestedDiscount?: number,
): Quote {
  if (!Number.isInteger(quantity) || quantity < product.moq || quantity > 10000)
    throw Error(`Minimum pemesanan ${product.moq} pcs, maksimum 10.000 pcs.`);
  const discount =
    requestedDiscount ??
    Math.min(settings.maxDiscount, quantity >= 300 ? 8 : quantity >= 100 ? 5 : 0);
  if (discount < 0 || discount > settings.maxDiscount)
    throw Error(`Diskon maksimal ${settings.maxDiscount}%.`);
  const costUnit = product.cost + settings.printCost;
  const floor = Math.ceil(
    ((costUnit * quantity + settings.setupCost) / (1 - settings.minMargin / 100) -
      settings.setupCost) /
      quantity,
  );
  const offered = Math.round((product.price + settings.printCost) * (1 - discount / 100));
  if (requestedDiscount !== undefined && offered < floor)
    throw Error('Harga melanggar margin minimum. Kurangi diskon atau revisi spesifikasi.');
  const unitPrice = Math.max(floor, offered),
    subtotal = unitPrice * quantity,
    total = subtotal + settings.setupCost,
    cost = costUnit * quantity + settings.setupCost;
  return {
    unitPrice,
    subtotal,
    setup: settings.setupCost,
    total,
    cost,
    margin: Math.round(((total - cost) / total) * 10000) / 100,
    discount,
    quantity,
    productName: product.name,
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
    demo: settings.demo,
  };
}

export const productImage = (image: string) =>
  image.startsWith('/media/') ? image : '/images/' + image + '.svg';

export const businessDate = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

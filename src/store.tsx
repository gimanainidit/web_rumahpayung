import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product, CartItem } from './domain';
import { api } from './api';
export type PublicProduct = Omit<Product, 'cost'>;
export interface StoreData {
  products: PublicProduct[];
  settings: {
    demo: boolean;
    whatsapp: string;
    businessName: string;
    shippingLocal: number;
    shippingNational: number;
    bankReady: boolean;
  };
}
interface Store extends StoreData {
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  add: (p: PublicProduct, variantId: string, q?: number) => void;
  refresh: () => Promise<void>;
  notice: string;
  notify: (s: string) => void;
}
const Context = createContext<Store | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData | null>(null),
    [error, setError] = useState(''),
    [notice, notify] = useState('');
  const [cart, updateCart] = useState<CartItem[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('rp_cart') || '[]');
      return Array.isArray(raw)
        ? raw.filter(
            (i: CartItem) =>
              typeof i.productId === 'string' &&
              typeof i.variantId === 'string' &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0,
          )
        : [];
    } catch {
      return [];
    }
  });
  const setCart = (c: CartItem[]) => {
    updateCart(c);
    localStorage.setItem('rp_cart', JSON.stringify(c));
  };
  const refresh = async () => {
    setData(await api<StoreData>('/store'));
  };
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => notify(''), 4500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  if (error)
    return (
      <main className="center">
        <h1>Belum bisa terhubung</h1>
        <p>{error}</p>
        <button onClick={() => location.reload()}>Coba lagi</button>
      </main>
    );
  if (!data)
    return (
      <div className="center" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" /> Memuat RUMAH Payung…
      </div>
    );
  const add = (p: PublicProduct, variantId: string, q = 1) => {
    const old = cart.find((i) => i.productId === p.id && i.variantId === variantId),
      v = p.variants.find((v) => v.id === variantId);
    if (!v || !Number.isInteger(q) || q < 1 || q + (old?.quantity || 0) > v.stock) {
      notify('Jumlah melebihi stok tersedia.');
      return;
    }
    setCart(
      old
        ? cart.map((i) => (i === old ? { ...i, quantity: i.quantity + q } : i))
        : [...cart, { productId: p.id, variantId, quantity: q }],
    );
    notify('Produk ditambahkan ke keranjang.');
  };
  return (
    <Context.Provider value={{ ...data, cart, setCart, add, refresh, notice, notify }}>
      {children}
      {notice && (
        <div role="status" className="toast">
          {notice}
          <button onClick={() => notify('')} aria-label="Tutup notifikasi">
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useStore() {
  const c = useContext(Context);
  if (!c) throw Error('Missing store');
  return c;
}

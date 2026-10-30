import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Provider } from './store';
import { Header, Footer, Empty } from './components';
import {
  Home,
  CustomLanding,
  Catalog,
  ProductDetail,
  QuoteForm,
  Cart,
  CheckoutPage,
  Orders,
  OrderDetail,
  InfoPage,
} from './Storefront';
import { Admin, AdminLogin } from './Admin';
import { attribution } from './api';
import './styles.css';
function Layout() {
  return (
    <>
      <a className="skip-link" href="#content">
        Lewati ke konten
      </a>
      <Header />
      <div id="content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
function Scroll() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    attribution();
    const titles: Record<string, string> = {
      '/': 'Payung untuk setiap cerita',
      '/katalog': 'Katalog produk',
      '/payung-custom': 'Payung custom perusahaan',
      '/penawaran': 'Minta penawaran',
      '/keranjang': 'Keranjang',
      '/checkout': 'Checkout',
      '/pesanan': 'Pesanan saya',
    };
    document.title =
      (titles[pathname] || (pathname.startsWith('/admin') ? 'Ruang tim' : 'RumahPayung')) +
      ' | RumahPayung';
  }, [pathname]);
  return null;
}
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="center">
        <h1>Halaman belum dapat ditampilkan.</h1>
        <p>Data yang sudah tersimpan tetap tersedia.</p>
        <button onClick={() => location.reload()}>Muat ulang</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Provider>
          <Scroll />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="katalog" element={<Catalog />} />
              <Route path="payung-custom" element={<CustomLanding />} />
              <Route path="produk/:slug" element={<ProductDetail />} />
              <Route path="penawaran" element={<QuoteForm />} />
              <Route path="keranjang" element={<Cart />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="pesanan" element={<Orders />} />
              <Route path="pesanan/:id" element={<OrderDetail />} />
              <Route path="tentang" element={<InfoPage />} />
              <Route path="kebijakan" element={<InfoPage privacy />} />
              <Route
                path="*"
                element={
                  <Empty
                    title="Halaman tidak ditemukan"
                    description="Kembali untuk menemukan pilihan Anda."
                    to="/katalog"
                  />
                }
              />
            </Route>
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/:tab" element={<Admin />} />
          </Routes>
        </Provider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Umbrella,
  ShoppingBag,
  Search,
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Package,
  ShieldCheck,
  Palette,
  MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useStore, type PublicProduct } from './store';
import { productImage, money } from './domain';
import { api, attribution } from './api';
export const Logo = () => (
  <Link to="/" className="logo">
    <Umbrella size={32} strokeWidth={1.7} />
    <span>
      RumahPayung<span className="logo-dot">.</span>
      <small>MERCHANDISE WITH MEANING</small>
    </span>
  </Link>
);
export function Header() {
  const { cart, settings } = useStore(),
    navigate = useNavigate();
  const [q, setQ] = useState(''),
    [open, setOpen] = useState(false);
  return (
    <>
      <div className="topline">
        <span>Payung custom untuk perusahaan, event & setiap cerita.</span>
        <Link to="/penawaran">
          Mulai konsultasi <ArrowUpRight size={13} />
        </Link>
      </div>
      {settings.demo && (
        <div className="demo-bar">
          MODE DEMONSTRASI · Produk, harga & stok contoh. Tidak menerima pembayaran nyata.
        </div>
      )}
      <header>
        <div className="container header-main">
          <Logo />
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate('/katalog?q=' + encodeURIComponent(q));
            }}
          >
            <Search size={18} />
            <input
              aria-label="Cari produk"
              placeholder="Cari payung, tumbler, atau merchandise…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <kbd>↵</kbd>
          </form>
          <Link to="/pesanan" className="header-order">
            Pesanan saya
          </Link>
          <Link
            to="/keranjang"
            className="cart-link"
            aria-label={`Keranjang, ${cart.reduce((n, i) => n + i.quantity, 0)} produk`}
          >
            <ShoppingBag size={22} />
            {cart.length > 0 && <span>{cart.reduce((n, i) => n + i.quantity, 0)}</span>}
          </Link>
          <button
            className="mobile-toggle icon-button"
            onClick={() => setOpen(!open)}
            aria-label="Buka menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <nav className={'container nav ' + (open ? 'open' : '')} onClick={() => setOpen(false)}>
          <div>
            <NavLink to="/" end>
              Beranda
            </NavLink>
            <NavLink to="/katalog">Katalog produk</NavLink>
            <NavLink to="/payung-custom">
              Payung custom <span className="tiny-label">B2B</span>
            </NavLink>
            <NavLink to="/tentang">Tentang kami</NavLink>
          </div>
          <Link to="/penawaran" className="nav-quote">
            Minta penawaran <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-main">
        <div>
          <Logo />
          <p>
            Payung untuk setiap cerita.
            <br />
            Merchandise untuk koneksi yang berarti.
          </p>
        </div>
        <div>
          <h4>Jelajahi</h4>
          <Link to="/katalog">Katalog produk</Link>
          <Link to="/payung-custom">Payung custom</Link>
          <Link to="/penawaran">Minta penawaran</Link>
        </div>
        <div>
          <h4>Informasi</h4>
          <Link to="/tentang">Tentang RumahPayung</Link>
          <Link to="/kebijakan">Pemesanan & privasi</Link>
          <Link to="/pesanan">Pesanan saya</Link>
        </div>
        <div>
          <h4>Mari buat sesuatu.</h4>
          <p>
            Ceritakan kebutuhan perusahaan Anda.
            <br />
            Kita mulai dari sana.
          </p>
          <Link to="/penawaran" className="text-link">
            Bicarakan kebutuhan <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} RumahPayung. Semua hak dilindungi.</span>
        <Link to="/admin">Area tim</Link>
        <span>Dibuat untuk segala cuaca.</span>
      </div>
    </footer>
  );
}
export function ProductCard({ p }: { p: PublicProduct }) {
  return (
    <article className="product-card">
      <Link to={'/produk/' + p.slug} className="product-image">
        <img
          src={productImage(p.image)}
          alt={p.image.startsWith('/media/') ? p.name : `Ilustrasi ${p.name}`}
          loading="lazy"
        />
        {!p.image.startsWith('/media/') && <span className="image-note">Ilustrasi produk</span>}
        <span className="image-arrow">
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="product-meta">
        <span>{p.category.toUpperCase()}</span>
        <div className="swatches">
          {p.variants.map((v) => (
            <i key={v.id} style={{ background: v.color }} title={v.label} />
          ))}
        </div>
      </div>
      <Link to={'/produk/' + p.slug}>
        <h3>{p.name}</h3>
      </Link>
      <div className="product-bottom">
        <strong>{money(p.price)}</strong>
        <span>/ pcs</span>
        <Link to={'/penawaran?produk=' + p.id} title="Minta penawaran">
          <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}
export function Benefits() {
  return (
    <div className="benefits container">
      {[
        [Palette, 'Custom sesuai kebutuhan', 'Logo, warna & jumlah pilihan'],
        [MessageCircle, 'Konsultasi sebelum pesan', 'Bantu tentukan spesifikasi'],
        [ShieldCheck, 'Penawaran transparan', 'Rincian biaya di awal'],
        [Package, 'Pengadaan lebih terencana', 'Konfirmasi jadwal bersama'],
      ].map(([Icon, title, desc]) => {
        const I = Icon as typeof Palette;
        return (
          <div key={String(title)}>
            <I size={24} />
            <span>
              <strong>{String(title)}</strong>
              <small>{String(desc)}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
export function WhatsAppButton({ label = 'Konsultasi via WhatsApp' }: { label?: string }) {
  const { settings, notify } = useStore();
  return settings.whatsapp ? (
    <button
      className="button secondary"
      onClick={() => {
        const a = attribution();
        api('/events', 'POST', {
          name: 'whatsapp_click',
          source: a.source || 'Website',
          campaign: a.campaign || '',
        }).catch(() => notify('Statistik klik belum tersimpan.'));
        window.open(
          `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Halo RumahPayung, saya ingin konsultasi payung custom untuk perusahaan.')}`,
          '_blank',
          'noopener,noreferrer',
        );
      }}
    >
      <MessageCircle size={18} />
      {label}
    </button>
  ) : (
    <Link className="button secondary" to="/penawaran">
      <MessageCircle size={18} />
      Konsultasi kebutuhan
    </Link>
  );
}
export function ErrorBox({ error }: { error: string }) {
  return error ? (
    <div role="alert" className="error-box">
      {error}
    </div>
  ) : null;
}
export function Empty({
  title,
  description,
  to,
  label,
}: {
  title: string;
  description: string;
  to?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <ShoppingBag size={38} />
      <h2>{title}</h2>
      <p>{description}</p>
      {to && (
        <Link className="button" to={to}>
          {label || 'Jelajahi katalog'}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

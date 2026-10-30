import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Package,
  Palette,
  MessageCircle,
} from 'lucide-react';
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { useStore, type PublicProduct } from './store';
import { productImage, money } from './domain';
import { api, attribution } from './api';
export const Logo = () => (
  <Link to="/" className="logo" aria-label="RUMAH Payung — Beranda">
    <svg
      className="brand-symbol"
      viewBox="0 0 48 48"
      width="44"
      height="44"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 24C4.6 12.7 13 6 24 6s19.4 6.7 21 18H3Z" fill="currentColor" />
      <path
        d="M24 8v15M13 23c.8-8.4 4.5-13.8 11-16 6.5 2.2 10.2 7.6 11 16"
        stroke="var(--brand-cutout, #f6f2ea)"
        strokeWidth="1.4"
      />
      <path d="M21 28h6v10a6 6 0 0 1-12 0v-2h5v2a1 1 0 0 0 2 0V28Z" fill="currentColor" />
      <path d="M21 21h6v8h-6z" fill="var(--brand-cutout, #f6f2ea)" />
    </svg>
    <span className="brand-wordmark">
      <span className="brand-house">RUMAH</span>
      <span className="brand-name">
        Payung<span className="brand-period">.</span>
      </span>
    </span>
  </Link>
);
export function EditorialImage({
  className = '',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={'editorial-image ' + className}>
      {failed ? (
        <div className="image-fallback">
          <img src="/images/navy.svg" alt="Ilustrasi payung navy" />
          <span>Ilustrasi payung</span>
        </div>
      ) : (
        <picture>
          <source media="(max-width: 600px)" srcSet="/images/editorial/umbrella-mobile.webp" />
          <img
            src="/images/editorial/umbrella-hero.webp"
            width="1200"
            height="1000"
            alt="Visual konsep payung navy dengan tekstur kain dan gagang kayu pada latar ivory"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => setFailed(true)}
          />
        </picture>
      )}
      <figcaption>
        STUDI PAYUNG / 01 <span>Visual konsep</span>
      </figcaption>
    </figure>
  );
}
export function Header() {
  const { cart, settings } = useStore(),
    navigate = useNavigate();
  const [q, setQ] = useState(''),
    [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null),
    navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    navRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      {settings.demo && (
        <div className="demo-bar">
          MODE DEMONSTRASI · Produk, harga & stok contoh. Tidak menerima pembayaran nyata.
        </div>
      )}
      <header className="store-header">
        <div className="container header-main">
          <Logo />
          <form
            className="search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              navigate('/katalog?q=' + encodeURIComponent(q));
            }}
          >
            <Search size={20} aria-hidden="true" />
            <input
              aria-label="Cari produk"
              placeholder="Temukan payung & merchandise"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="search-submit" aria-label="Cari">
              <ArrowRight size={18} />
            </button>
          </form>
          <Link to="/pesanan" className="header-order">
            Pesanan saya
          </Link>
          <Link
            to="/keranjang"
            className="cart-link"
            aria-label={`Keranjang, ${cart.reduce((n, i) => n + i.quantity, 0)} produk`}
          >
            <ShoppingBag size={23} aria-hidden="true" />
            {cart.length > 0 && <span>{cart.reduce((n, i) => n + i.quantity, 0)}</span>}
          </Link>
          <button
            ref={toggleRef}
            className="mobile-toggle icon-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            aria-controls="store-navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <nav
          ref={navRef}
          id="store-navigation"
          aria-label="Navigasi utama"
          className={'container nav ' + (open ? 'open' : '')}
          onClick={() => setOpen(false)}
        >
          <div>
            <NavLink to="/" end>
              Beranda
            </NavLink>
            <NavLink to="/katalog">Katalog produk</NavLink>
            <NavLink to="/payung-custom">Payung custom</NavLink>
            <NavLink to="/tentang">Tentang kami</NavLink>
          </div>
          <Link to="/penawaran" className="nav-quote">
            Minta penawaran <ArrowUpRight size={18} aria-hidden="true" />
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
            merchandise dengan makna.
            <br />
            Dari sebuah benda, menjadi sebuah cerita.
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
        <span>© {new Date().getFullYear()} RUMAH Payung. Semua hak dilindungi.</span>
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
        <div className="swatches" aria-label="Pilihan warna">
          {p.variants.map((v) => (
            <i
              key={v.id}
              style={{ background: v.color }}
              title={v.label}
              role="img"
              aria-label={v.label}
            />
          ))}
        </div>
      </div>
      <Link to={'/produk/' + p.slug}>
        <h3>{p.name}</h3>
      </Link>
      <div className="product-bottom">
        <strong>{money(p.price)}</strong>
        <span>/ pcs, tanpa cetak</span>
        <Link
          to={'/penawaran?produk=' + p.id}
          title="Minta penawaran"
          aria-label={'Minta penawaran untuk ' + p.name}
        >
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
        [Palette, 'Pilihan yang personal', 'Model, warna, dan identitas Anda'],
        [MessageCircle, 'Mulai dari percakapan', 'Sepakati spesifikasi sebelum pesan'],
        [Package, 'Rincian sejak awal', 'Biaya dan jadwal melalui penawaran'],
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

// Keep native constraint validation while retaining a visible, associated field message.
export function Field({ children, className }: { children: ReactNode; className?: string }) {
  const [message, setMessage] = useState('');
  const hintId = useId();
  return (
    <label
      className={className}
      onInvalidCapture={(event) => {
        const control = event.target as HTMLInputElement;
        setMessage(control.validationMessage);
      }}
    >
      {Children.map(children, (child) => {
        if (
          !isValidElement<HTMLAttributes<HTMLInputElement>>(child) ||
          !['input', 'select', 'textarea'].includes(String(child.type))
        )
          return child;
        return cloneElement(child, {
          'aria-invalid': message ? true : undefined,
          'aria-describedby':
            [child.props['aria-describedby'], message ? hintId : undefined]
              .filter(Boolean)
              .join(' ') || undefined,
          onBlur: (event) => {
            child.props.onBlur?.(event);
            const control = event.target as HTMLInputElement;
            setMessage(control.validity.valid ? '' : control.validationMessage);
          },
          onChange: (event) => {
            child.props.onChange?.(event);
            const control = event.target as HTMLInputElement;
            if (control.validity.valid) setMessage('');
          },
        });
      })}
      {message && (
        <span id={hintId} className="field-error">
          {message}
        </span>
      )}
    </label>
  );
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Package,
  Clock,
  FileText,
  SlidersHorizontal,
  Download,
} from 'lucide-react';
import { useStore } from './store';
import {
  ProductCard,
  Benefits,
  WhatsAppButton,
  ErrorBox,
  Empty,
  EditorialImage,
  Field,
} from './components';
import { api, attribution } from './api';
import {
  businessDate,
  productImage,
  money,
  orderLabels,
  type Quote,
  type Order,
  type Checkout,
} from './domain';
export function Home() {
  const { products } = useStore();
  return (
    <main className="home-page">
      <section className="home-hero container">
        <div className="home-hero-copy">
          <span className="eyebrow">UNTUK CERITA YANG INGIN ANDA BAGIKAN</span>
          <h1>
            Merchandise
            <br />
            dengan <span>makna.</span>
          </h1>
          <p>
            Payung dan merchandise yang membawa identitas Anda. Untuk tim, acara, dan hadiah yang
            lebih personal.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/penawaran">
              Minta penawaran custom <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
            <Link className="text-link" to="/katalog">
              Belanja satuan <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <p className="hero-retail-note">
            Belanja satuan tanpa cetak.
            <br />
            Kebutuhan logo dan jumlah besar melalui penawaran.
          </p>
          <div className="hero-signature">
            <span className="signature-line" /> PILIH DENGAN HATI. BERI IDENTITAS.
          </div>
        </div>
        <EditorialImage className="home-hero-image" priority />
      </section>
      <Benefits />
      <section className="section container home-products">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PILIHAN PAYUNG</span>
            <h2>Awal dari cerita Anda.</h2>
          </div>
          <Link className="text-link" to="/katalog?kategori=Payung">
            Lihat semua payung <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((p) => p.category === 'Payung')
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
        </div>
        <p className="section-note">
          Harga satuan tanpa cetak. Untuk custom logo, bahan, dan jumlah, minta penawaran sesuai
          kebutuhan Anda.
        </p>
      </section>
      <section className="brand-story container">
        <div className="story-visual">
          <img
            src="/images/editorial/umbrella-detail.webp"
            width="800"
            height="900"
            alt="Visual konsep detail kain dan panel payung navy"
            loading="lazy"
          />
          <span>DETAIL YANG MEMBAWA CERITA · VISUAL KONSEP</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">SEBUAH BENDA. SEBUAH PESAN.</span>
          <h2>
            Yang dibawa pulang,
            <br />
            yang terus diingat.
          </h2>
          <p>
            Untuk menyambut anggota tim, merayakan pertemuan, atau mengucapkan terima kasih. Pilih
            merchandise yang terasa dekat dengan orang yang menerimanya.
          </p>
          <div className="story-use-cases">
            <span>01 / Apresiasi pelanggan</span>
            <span>02 / Acara & komunitas</span>
            <span>03 / Kebutuhan tim</span>
          </div>
          <Link to="/payung-custom" className="text-link">
            Temukan pilihan custom <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="section container category-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LENGKAPI PILIHAN ANDA</span>
            <h2>Banyak bentuk. Satu maksud baik.</h2>
          </div>
        </div>
        <div className="category-grid">
          {[
            ['Payung', 'Naungan untuk setiap perjalanan', 'navy'],
            ['Tumbler', 'Teman di sela aktivitas', 'tumbler'],
            ['Tas', 'Ruang untuk yang berarti', 'bag'],
          ].map(([name, sub, img]) => (
            <Link key={name} to={'/katalog?kategori=' + name} className="category">
              <div>
                <span className="eyebrow">KOLEKSI</span>
                <h3>{name}</h3>
                <p>{sub}</p>
                <ArrowUpRight size={22} aria-hidden="true" />
              </div>
              <img src={'/images/' + img + '.svg'} alt={'Ilustrasi ' + name} loading="lazy" />
              <span className="category-image-note">Ilustrasi produk</span>
            </Link>
          ))}
        </div>
      </section>
      <Process />
      <section className="container faq-section">
        <div>
          <span className="eyebrow">SEBELUM MEMULAI</span>
          <h2>
            Hal kecil yang
            <br />
            perlu Anda tahu.
          </h2>
          <p>Kami ingin Anda memesan dengan informasi yang jelas.</p>
        </div>
        <Faq />
      </section>
      <section className="closing-cta">
        <div className="container">
          <span className="eyebrow">MARI WUJUDKAN BERSAMA</span>
          <h2>Apa cerita Anda berikutnya?</h2>
          <p>Ceritakan kebutuhan, jumlah, dan anggaran Anda. Kita mulai dari sana.</p>
          <Link to="/penawaran" className="button">
            Minta penawaran <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
function Process() {
  return (
    <section className="section container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">DARI IDE KE PESANAN</span>
          <h2>Dibuat mudah, sejak awal.</h2>
        </div>
        <p>Tiga langkah menuju merchandise Anda.</p>
      </div>
      <div className="process-grid">
        {[
          [
            '01',
            'Ceritakan kebutuhan',
            'Pilih model, jumlah, anggaran, dan kapan Anda membutuhkannya.',
          ],
          [
            '02',
            'Sepakati penawaran',
            'Tinjau spesifikasi, desain logo, biaya, dan jadwal pemenuhan.',
          ],
          [
            '03',
            'Wujudkan bersama',
            'Setelah persetujuan dan pembayaran, tim memproses pesanan Anda.',
          ],
        ].map(([n, t, d]) => (
          <div key={n}>
            <span>{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
function Faq() {
  return (
    <div className="faq">
      {[
        [
          'Berapa minimum pemesanan payung custom?',
          'Minimum pemesanan mengikuti model yang dipilih dan terlihat pada formulir penawaran. Angka pada mode demonstrasi masih merupakan contoh.',
        ],
        [
          'Apakah bisa menyesuaikan anggaran?',
          'Sampaikan jumlah dan anggaran Anda. Tim akan membantu mempertimbangkan pilihan produk, bahan, dan cetak yang sesuai.',
        ],
        [
          'Berapa lama proses produksi dan pengiriman?',
          'Jadwal ditentukan setelah spesifikasi, jumlah, persetujuan desain, dan ketersediaan dikonfirmasi. Deadline pada formulir adalah kebutuhan Anda, belum merupakan janji pengiriman.',
        ],
        [
          'Bagaimana cara pembayaran?',
          'MVP mendukung transfer bank dengan verifikasi manual oleh admin. Rekening ditampilkan pada pesanan ketika penjualan nyata sudah diaktifkan. Tidak ada pembayaran nyata pada mode demonstrasi.',
        ],
      ].map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <Plus size={17} />
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
export function CustomLanding() {
  return (
    <main>
      <section className="container custom-hero">
        <div>
          <span className="eyebrow">UNTUK PERUSAHAAN, TIM & ACARA</span>
          <h1>
            Identitas Anda.
            <br />
            Dibawa ke mana saja.
          </h1>
          <p>
            Supplier payung custom untuk event, souvenir, dan kebutuhan perusahaan. Mulai dari
            kebutuhan Anda, temukan pilihan sesuai anggaran.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/penawaran">
              Minta penawaran <ArrowUpRight size={18} />
            </Link>
            <WhatsAppButton />
          </div>
          <div className="use-cases">
            <span>Hadiah perusahaan</span>
            <span>Event & promosi</span>
            <span>Paket sambutan tim</span>
          </div>
        </div>
        <EditorialImage priority />
      </section>
      <Benefits />
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">KENALI PILIHANNYA</span>
            <h2>Pilih bentuk, beri identitas.</h2>
          </div>
          <p>Visual adalah ilustrasi. Spesifikasi akhir sesuai quotation.</p>
        </div>
        <div className="product-grid">
          {useStore()
            .products.filter((p) => p.category === 'Payung')
            .map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
        </div>
      </section>
      <Process />
      <section className="container faq-section">
        <div>
          <span className="eyebrow">PANDUAN PEMESANAN</span>
          <h2>
            Mulai dengan
            <br />
            informasi yang jelas.
          </h2>
        </div>
        <Faq />
      </section>
      <div className="container cta-strip">
        <h2>Sudah punya rencana?</h2>
        <Link className="button" to="/penawaran">
          Ceritakan kebutuhan Anda <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}
export function Catalog() {
  const { products } = useStore(),
    [params, setParams] = useSearchParams();
  const category = params.get('kategori') || '',
    q = params.get('q') || '';
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!filtersOpen) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFiltersOpen(false);
        filterToggle.current?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [filtersOpen]);
  const [sort, setSort] = useState('default'),
    [max, setMax] = useState(250000),
    [stock, setStock] = useState(false),
    [page, setPage] = useState(1);
  const filtered = products
    .filter(
      (p) =>
        (!category || p.category === category) &&
        p.name.toLowerCase().includes(q.toLowerCase()) &&
        p.price <= max &&
        (!stock || p.variants.some((v) => v.stock > 0)),
    )
    .sort((a, b) => (sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0));
  useEffect(() => setPage(1), [category, q, max, stock, sort]);
  return (
    <main className="container section catalog">
      <div className="breadcrumb">
        <Link to="/">Beranda</Link>
        <ChevronRight size={14} />
        Katalog produk
      </div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PILIHAN UNTUK SETIAP KEBUTUHAN</span>
          <h1>Katalog produk.</h1>
          <p>Temukan awal yang tepat untuk merchandise Anda.</p>
        </div>
      </div>
      <button
        ref={filterToggle}
        className="filter-toggle"
        aria-expanded={filtersOpen}
        aria-controls="catalog-filters"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        {filtersOpen ? 'Tutup filter' : 'Filter produk'}
      </button>
      <div className="catalog-layout">
        <aside
          id="catalog-filters"
          aria-label="Filter produk"
          className={'filters ' + (filtersOpen ? 'is-open' : '')}
        >
          <h3>
            <SlidersHorizontal size={18} /> Filter produk
          </h3>
          <h4>Kategori</h4>
          {['', 'Payung', 'Tumbler', 'Tas'].map((c) => (
            <button
              className={category === c ? 'filter-choice selected' : 'filter-choice'}
              aria-pressed={category === c}
              key={c}
              onClick={() => {
                const p = new URLSearchParams(params);
                if (c) p.set('kategori', c);
                else p.delete('kategori');
                setParams(p);
              }}
            >
              {c || 'Semua produk'}
              <span>{products.filter((p) => !c || p.category === c).length}</span>
            </button>
          ))}
          <h4>Batas harga</h4>
          <input
            aria-label="Batas harga"
            type="range"
            min="25000"
            max="250000"
            step="5000"
            value={max}
            onChange={(e) => setMax(+e.target.value)}
          />
          <p className="muted">Hingga {money(max)}</p>
          <label className="check-label">
            <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} />{' '}
            Stok tersedia
          </label>
          <button
            className="link-button filter-reset"
            onClick={() => {
              setParams({});
              setMax(250000);
              setStock(false);
              setSort('default');
            }}
          >
            Reset semua filter
          </button>
          <div className="filter-help">
            <FileText size={25} />
            <h4>Pesan dalam jumlah besar?</h4>
            <p>Dapatkan penawaran sesuai kebutuhan perusahaan.</p>
            <Link to="/penawaran" className="text-link">
              Minta penawaran <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
        <div>
          <div className="catalog-toolbar">
            <p role="status" aria-live="polite">
              {filtered.length} produk{' '}
              {q && (
                <>
                  untuk “{q}”{' '}
                  <button
                    className="link-button"
                    onClick={() => {
                      params.delete('q');
                      setParams(params);
                    }}
                  >
                    Hapus pencarian
                  </button>
                </>
              )}
            </p>
            <label>
              Urutkan{' '}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Pilihan katalog</option>
                <option value="low">Harga terendah</option>
                <option value="high">Harga tertinggi</option>
              </select>
            </label>
          </div>
          {filtered.length ? (
            <div className="product-grid catalog-grid">
              {filtered.slice((page - 1) * 6, page * 6).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <Empty
              title="Belum ada yang sesuai"
              description="Coba kata kunci atau filter lainnya."
            />
          )}
          {filtered.length > 6 && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(filtered.length / 6) }, (_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? 'active' : ''}
                  aria-current={page === i + 1 ? 'page' : undefined}
                  aria-label={'Halaman ' + (i + 1)}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
export function ProductDetail() {
  const { slug } = useParams(),
    store = useStore(),
    p = store.products.find((p) => p.slug === slug);
  const [variant, setVariant] = useState(''),
    [q, setQ] = useState(1);
  if (!p)
    return (
      <Empty
        title="Produk tidak ditemukan"
        description="Produk mungkin sudah tidak tersedia."
        to="/katalog"
      />
    );
  const v = p.variants.find((v) => v.id === variant) || p.variants[0];
  return (
    <main className="container section">
      <div className="breadcrumb">
        <Link to="/katalog">Katalog</Link>
        <ChevronRight size={14} />
        {p.name}
      </div>
      <div className="detail-layout">
        <div className="detail-image">
          <img
            src={productImage(p.image)}
            alt={p.image.startsWith('/media/') ? p.name : `Ilustrasi ${p.name}`}
          />
          <span>
            {p.image.startsWith('/media/') ? 'Foto produk.' : 'Ilustrasi produk.'} Warna dan
            spesifikasi dikonfirmasi sebelum pemesanan.
          </span>
        </div>
        <div className="detail-info">
          <span className="eyebrow">{p.category.toUpperCase()} / KOLEKSI RUMAH PAYUNG</span>
          <h1>{p.name}</h1>
          <p>{p.description}</p>
          <div className="detail-price">
            {money(p.price)} <small>/ pcs, sebelum custom</small>
          </div>
          <span className="stock-label">
            {v.stock > 0 ? (
              <>
                <span /> {v.stock} pcs tersedia{!p.verified ? ' (contoh)' : ''}
              </>
            ) : (
              'Stok habis'
            )}
          </span>
          <label>
            Warna: <strong>{v.label}</strong>
          </label>
          <div className="variant-buttons">
            {p.variants.map((c) => (
              <button
                key={c.id}
                aria-label={c.label}
                aria-pressed={v.id === c.id}
                title={c.label}
                className={v.id === c.id ? 'chosen' : ''}
                onClick={() => setVariant(c.id)}
              >
                <i style={{ background: c.color }} />
              </button>
            ))}
          </div>
          <label>Jumlah</label>
          <div className="quantity">
            <button aria-label="Kurangi jumlah" onClick={() => setQ(Math.max(1, q - 1))}>
              <Minus size={15} />
            </button>
            <input
              aria-label="Jumlah produk"
              type="number"
              min={1}
              max={v.stock}
              value={q}
              onChange={(e) => setQ(+e.target.value)}
            />
            <button aria-label="Tambah jumlah" onClick={() => setQ(Math.min(v.stock, q + 1))}>
              <Plus size={15} />
            </button>
          </div>
          <button
            className="button full"
            disabled={v.stock < 1 || q < 1 || q > v.stock}
            onClick={() => store.add(p, v.id, q)}
          >
            Tambah ke keranjang <Plus size={17} />
          </button>
          <Link className="button secondary full" to={'/penawaran?produk=' + p.id}>
            Custom logo? Minta penawaran <ArrowUpRight size={18} />
          </Link>
          <div className="detail-facts">
            <div>
              <PaletteIcon />
              <span>
                Custom mulai {p.moq} pcs
                <br />
                <small>Harga mengikuti spesifikasi</small>
              </span>
            </div>
            <div>
              <Package size={21} />
              <span>
                Tarif kirim transparan
                <br />
                <small>Tertera sebelum checkout</small>
              </span>
            </div>
          </div>
        </div>
      </div>
      <section className="product-description">
        <h2>Tentang produk ini</h2>
        <p>{p.description}</p>
        <p>
          Harga katalog adalah harga produk tanpa tambahan cetak. Untuk kebutuhan logo, spesifikasi
          bahan, ukuran, dan jumlah besar, gunakan formulir penawaran agar tim dapat mengonfirmasi
          kemampuan pemenuhan.
        </p>
      </section>
    </main>
  );
}
const PaletteIcon = () => <FileText size={21} />;
export function QuoteForm() {
  const { products, settings } = useStore(),
    [params] = useSearchParams();
  const [productId, setProduct] = useState(params.get('produk') || products[0]?.id || ''),
    [quantity, setQuantity] = useState(100),
    [quote, setQuote] = useState<Omit<Quote, 'cost' | 'margin'> | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState('');
  const [estimateState, setEstimateState] = useState<'idle' | 'loading' | 'error' | 'ready'>(
    'idle',
  );
  const [estimateRetry, setEstimateRetry] = useState(0);
  const p = products.find((p) => p.id === productId);
  useEffect(() => {
    let live = true;
    setQuote(null);
    setEstimateState(p && quantity >= p.moq ? 'loading' : 'idle');
    if (p && quantity >= p.moq)
      api<Omit<Quote, 'cost' | 'margin'>>('/estimate', 'POST', { productId, quantity })
        .then((q) => {
          if (live) {
            setQuote(q);
            setEstimateState('ready');
          }
        })
        .catch(() => {
          if (live) setEstimateState('error');
        });
    return () => {
      live = false;
    };
  }, [productId, quantity, p?.moq, estimateRetry]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const d = new FormData(e.currentTarget);
    try {
      const r = await api<{ id: string }>('/leads', 'POST', {
        company: d.get('company'),
        name: d.get('name'),
        phone: d.get('phone'),
        email: d.get('email'),
        productId,
        quantity,
        budget: Number(d.get('budget') || 0),
        deadline: d.get('deadline'),
        notes: d.get('notes'),
        consent: d.get('consent') === 'on',
        ...attribution(),
      });
      setSuccess(r.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <main className="container section">
        <div className="success-card">
          <CheckCircle2 size={48} />
          <span className="eyebrow">LANGKAH PERTAMA, SELESAI.</span>
          <h1>
            Kebutuhan Anda
            <br />
            sudah kami catat.
          </h1>
          <p>
            Nomor permintaan <strong>{success}</strong>
          </p>
          <p>
            Tim akan meninjau kebutuhan Anda dan menghubungi kontak yang diberikan. Pengajuan ini
            belum merupakan konfirmasi pesanan atau jadwal produksi.
          </p>
          {settings.demo && (
            <p className="info-box">
              Mode demonstrasi: permintaan tersimpan di CRM lokal. Tidak ada notifikasi eksternal
              yang dikirim.
            </p>
          )}
          <Link className="button" to="/katalog">
            Kembali ke katalog <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  return (
    <main className="container section">
      <div className="breadcrumb">
        <Link to="/">Beranda</Link>
        <ChevronRight size={14} />
        Minta penawaran
      </div>
      <div className="page-heading">
        <span className="eyebrow">MARI MULAI DARI KEBUTUHAN ANDA</span>
        <h1>Buat sesuatu yang berarti.</h1>
        <p>Lengkapi informasi berikut agar tim dapat menyiapkan penawaran yang relevan.</p>
      </div>
      <div className="quote-layout">
        <form onSubmit={submit} className="panel quote-form">
          <h2>Mari kenalan.</h2>
          <p className="form-intro">
            Kontak ini digunakan untuk membahas kebutuhan dan penawaran Anda.
          </p>
          <div className="form-grid">
            <Field>
              Nama perusahaan
              <input
                name="company"
                required
                minLength={2}
                maxLength={160}
                placeholder="PT / organisasi Anda"
              />
            </Field>
            <Field>
              Nama PIC
              <input
                name="name"
                required
                minLength={2}
                maxLength={160}
                placeholder="Nama lengkap"
              />
            </Field>
            <Field>
              Nomor WhatsApp
              <input name="phone" required type="tel" placeholder="08xxxxxxxxxx" />
            </Field>
            <Field>
              Email (opsional)
              <input name="email" type="email" placeholder="nama@perusahaan.com" />
            </Field>
            <div className="form-section-title span-2">
              <span>02</span>
              <h2>Rencanakan kebutuhan.</h2>
            </div>
            <Field>
              Produk
              <select value={productId} onChange={(e) => setProduct(e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              Jumlah kebutuhan (pcs)
              <input
                type="number"
                required
                min={p?.moq || 1}
                max={10000}
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
              />
              <small>Minimum custom {p?.moq || '—'} pcs</small>
            </Field>
            <div className="form-section-title span-2">
              <span>03</span>
              <h2>Anggaran & waktu.</h2>
            </div>
            <Field>
              Anggaran total (opsional)
              <input
                name="budget"
                type="number"
                min="0"
                max="1000000000"
                placeholder="Contoh: 15000000"
              />
            </Field>
            <Field>
              Tanggal dibutuhkan
              <input name="deadline" type="date" required min={businessDate()} />
            </Field>
            <Field className="span-2">
              Ceritakan kebutuhan Anda
              <textarea
                name="notes"
                maxLength={2000}
                rows={4}
                placeholder="Kebutuhan acara, warna, cetak logo, alamat tujuan, atau hal lain yang perlu kami ketahui."
              />
            </Field>
          </div>
          <label className="check-label">
            <input type="checkbox" name="consent" required />
            Saya menyetujui pemrosesan data untuk penawaran dan tindak lanjut sesuai{' '}
            <Link to="/kebijakan">kebijakan privasi</Link>.
          </label>
          <ErrorBox error={error} />
          <button className="button full" disabled={busy || !p}>
            {busy ? 'Mengirim…' : 'Kirim permintaan penawaran'}
            <ArrowUpRight size={18} />
          </button>
          <small className="muted">
            Belum ada pembayaran. Kebutuhan Anda akan ditinjau terlebih dahulu.
          </small>
        </form>
        <aside>
          <div className="estimate-card">
            <span className="eyebrow">GAMBARAN ANGGARAN</span>
            <h2>Rencanakan lebih mudah.</h2>
            {p && <img src={productImage(p.image)} alt={p.name} />}
            <h3>{p?.name}</h3>
            {quote ? (
              <>
                <div className="summary-row">
                  <span>
                    {quantity} pcs × {money(quote.unitPrice)}
                  </span>
                  <strong>{money(quote.subtotal)}</strong>
                </div>
                <div className="summary-row">
                  <span>Persiapan cetak</span>
                  <strong>{money(quote.setup)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Estimasi total</span>
                  <strong>{money(quote.total)}</strong>
                </div>
              </>
            ) : (
              <div role="status" aria-live="polite">
                {estimateState === 'loading' ? (
                  <p>Menghitung estimasi…</p>
                ) : estimateState === 'error' ? (
                  <>
                    <p>Estimasi belum dapat dimuat. Anda tetap dapat mengajukan kebutuhan.</p>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setEstimateRetry((n) => n + 1)}
                    >
                      Coba estimasi lagi
                    </button>
                  </>
                ) : (
                  <p>Masukkan jumlah sesuai minimum untuk melihat estimasi.</p>
                )}
              </div>
            )}
            <p className="small">
              {settings.demo ? 'Harga simulasi, belum diverifikasi owner. ' : ''}Estimasi mencakup
              contoh cetak satu logo; belum termasuk ongkir dan pajak bila berlaku. Penawaran final
              mengikuti spesifikasi dan persetujuan tim.
            </p>
          </div>
          <div className="quote-reassurance">
            <Check size={17} /> Kebutuhan tercatat untuk ditindaklanjuti
            <br />
            <Check size={17} /> Pilihan sesuai jumlah dan anggaran
            <br />
            <Check size={17} /> Tidak ada komitmen pembelian
          </div>
        </aside>
      </div>
    </main>
  );
}
export function Cart() {
  const { cart, setCart, products } = useStore();
  const rows = cart.map((i) => ({ i, p: products.find((p) => p.id === i.productId) }));
  const total = rows.reduce((s, { i, p }) => s + (p?.price || 0) * i.quantity, 0);
  return (
    <main className="container section">
      <div className="page-heading">
        <span className="eyebrow">SATU LANGKAH LEBIH DEKAT</span>
        <h1>Keranjang Anda.</h1>
      </div>
      {!cart.length ? (
        <Empty
          title="Masih ada ruang untuk cerita baru"
          description="Pilih produk yang sesuai dengan kebutuhan Anda."
          to="/katalog"
        />
      ) : (
        <div className="checkout-layout">
          <div className="panel">
            {rows.map(({ i, p }, index) => (
              <div className="cart-row" key={i.productId + i.variantId}>
                <img
                  src={productImage(p?.image || 'navy')}
                  alt={p?.name || 'Produk tidak tersedia'}
                />
                <div>
                  <Link to={'/produk/' + p?.slug}>
                    <h3>{p?.name || 'Produk tidak tersedia'}</h3>
                  </Link>
                  <p className="muted">
                    {p?.variants.find((v) => v.id === i.variantId)?.label} · {money(p?.price || 0)}{' '}
                    / pcs
                  </p>
                  <div className="quantity">
                    <button
                      aria-label="Kurangi jumlah"
                      onClick={() =>
                        setCart(
                          cart.map((c, j) =>
                            j === index ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c,
                          ),
                        )
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      aria-label="Jumlah"
                      type="number"
                      min="1"
                      value={i.quantity}
                      onChange={(e) => {
                        const q = +e.target.value;
                        if (Number.isInteger(q) && q > 0)
                          setCart(cart.map((c, j) => (j === index ? { ...c, quantity: q } : c)));
                      }}
                    />
                    <button
                      aria-label="Tambah jumlah"
                      onClick={() =>
                        setCart(
                          cart.map((c, j) =>
                            j === index ? { ...c, quantity: c.quantity + 1 } : c,
                          ),
                        )
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <strong>{money((p?.price || 0) * i.quantity)}</strong>
                <button
                  className="icon-button"
                  aria-label="Hapus produk"
                  onClick={() => setCart(cart.filter((_, j) => j !== index))}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <Link className="text-link" to="/katalog">
              Lanjut jelajahi katalog <ArrowRight size={17} />
            </Link>
          </div>
          <div className="panel summary-panel">
            <h2>Ringkasan belanja</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="small muted">
              Ongkir dihitung pada checkout. Harga produk belum termasuk cetak custom.
            </p>
            <Link className="button full" to="/checkout">
              Lanjut ke checkout <ArrowRight size={17} />
            </Link>
            <Link className="button secondary full" to="/penawaran">
              Butuh custom? Minta penawaran
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
export function CheckoutPage() {
  const { cart, products, settings, setCart, refresh } = useStore(),
    navigate = useNavigate();
  const [shipping, setShipping] = useState<Checkout['shipping']>('pickup'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [key] = useState(() => crypto.randomUUID());
  const subtotal = cart.reduce(
      (s, i) => s + (products.find((p) => p.id === i.productId)?.price || 0) * i.quantity,
      0,
    ),
    shippingCost =
      shipping === 'pickup'
        ? 0
        : shipping === 'local'
          ? settings.shippingLocal
          : settings.shippingNational,
    total = subtotal + shippingCost;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const d = new FormData(e.currentTarget);
    try {
      const order = await api<Order>(
        '/orders',
        'POST',
        {
          items: cart,
          address: {
            name: d.get('name'),
            phone: d.get('phone'),
            email: d.get('email'),
            address: d.get('address'),
            city: d.get('city'),
            postalCode: d.get('postalCode'),
          },
          shipping,
          consent: d.get('consent') === 'on',
          expectedTotal: total,
        },
        { 'Idempotency-Key': key },
      );
      setCart([]);
      await refresh();
      navigate('/pesanan/' + order.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!cart.length)
    return (
      <Empty
        title="Keranjang masih kosong"
        description="Pilih produk terlebih dahulu."
        to="/katalog"
      />
    );
  return (
    <main className="container section">
      <div className="page-heading">
        <span className="eyebrow">LENGKAPI PESANAN</span>
        <h1>Checkout.</h1>
        <p>Transfer bank dengan verifikasi manual. Tidak ada pembayaran otomatis.</p>
      </div>
      <form onSubmit={submit} className="checkout-layout">
        <div className="panel">
          <h2>Informasi penerima</h2>
          <div className="form-grid">
            <Field>
              Nama lengkap
              <input name="name" required minLength={2} />
            </Field>
            <Field>
              Nomor WhatsApp
              <input name="phone" type="tel" required />
            </Field>
            <Field className="span-2">
              Email (opsional)
              <input name="email" type="email" />
            </Field>
            <Field className="span-2">
              Alamat lengkap
              <textarea name="address" required minLength={10} rows={3} />
            </Field>
            <Field>
              Kota
              <input name="city" required minLength={2} />
            </Field>
            <Field>
              Kode pos
              <input name="postalCode" required pattern="[0-9]{5}" inputMode="numeric" />
            </Field>
          </div>
          <h2>Pengiriman</h2>
          {(
            [
              ['pickup', 'Ambil sendiri / koordinasi dengan tim', 0],
              ['local', 'Tarif tetap Jakarta', settings.shippingLocal],
              ['national', 'Tarif tetap luar Jakarta', settings.shippingNational],
            ] as const
          ).map(([value, label, cost]) => (
            <label
              key={value}
              className={'shipping-option ' + (shipping === value ? 'selected' : '')}
            >
              <input
                type="radio"
                name="shipping"
                checked={shipping === value}
                onChange={() => setShipping(value)}
              />
              <span>
                {label}
                <small>
                  {value === 'pickup'
                    ? 'Jadwal dan lokasi dikonfirmasi tim'
                    : 'Tarif admin, bukan kalkulasi kurir otomatis'}
                </small>
              </span>
              <strong>{money(cost)}</strong>
            </label>
          ))}
          <p className="small muted">
            Tarif tetap yang dipilih berlaku pada pesanan ini. Jadwal dan layanan pengiriman
            dikonfirmasi tim.
          </p>
          <label className="check-label">
            <input name="consent" type="checkbox" required />
            Saya menyetujui <Link to="/kebijakan">ketentuan pemesanan dan privasi</Link>.
          </label>
        </div>
        <aside className="panel summary-panel">
          <h2>Ringkasan pesanan</h2>
          {cart.map((i) => (
            <div key={i.productId + i.variantId} className="summary-row">
              <span>
                {products.find((p) => p.id === i.productId)?.name}
                <small>{i.quantity} pcs</small>
              </span>
              <strong>
                {money((products.find((p) => p.id === i.productId)?.price || 0) * i.quantity)}
              </strong>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Ongkir</span>
            <strong>{money(shippingCost)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <div className="info-box">
            {settings.demo
              ? 'Pesanan simulasi. Jangan melakukan transfer pembayaran.'
              : 'Instruksi rekening tersedia setelah pesanan berhasil dibuat. Admin memverifikasi pembayaran sebelum memproses pesanan.'}
          </div>
          <ErrorBox error={error} />
          <button
            className="button full"
            disabled={busy || (!settings.demo && !settings.bankReady)}
          >
            {busy ? 'Memproses…' : settings.demo ? 'Buat pesanan simulasi' : 'Buat pesanan'}
            <ArrowRight size={18} />
          </button>
          {!settings.demo && !settings.bankReady && (
            <p>Pembayaran belum dikonfigurasi. Gunakan formulir penawaran.</p>
          )}
        </aside>
      </form>
    </main>
  );
}
export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api<Order[]>('/orders')
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <main className="container section">
      <div className="page-heading">
        <span className="eyebrow">DARI PILIHAN KE TUJUAN</span>
        <h1>Pesanan saya.</h1>
        <p>Pesanan tersimpan untuk browser ini. Simpan nomor pesanan untuk bantuan tim.</p>
      </div>
      <ErrorBox error={error} />
      {loading ? (
        <p>Memuat pesanan…</p>
      ) : !orders.length ? (
        <Empty
          title="Belum ada pesanan"
          description="Pesanan Anda akan muncul di sini setelah checkout."
          to="/katalog"
        />
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <Link key={o.id} to={'/pesanan/' + o.id} className="panel order-list-row">
              <Package />
              <div>
                <strong>{o.id}</strong>
                <small>
                  {new Date(o.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) +
                    ' WIB'}
                </small>
              </div>
              <span className={'badge ' + o.status}>{orderLabels[o.status]}</span>
              <strong>{money(o.total)}</strong>
              <ChevronRight size={18} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
export function OrderDetail() {
  const { id } = useParams();
  const [o, setOrder] = useState<Order | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false);
  const { refresh } = useStore();
  const load = () =>
    api<Order>('/orders/' + id)
      .then(setOrder)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [id]);
  return (
    <main className="container section">
      <div className="breadcrumb">
        <Link to="/pesanan">Pesanan saya</Link>
        <ChevronRight size={14} />
        {id}
      </div>
      <ErrorBox error={error} />
      {o ? (
        <>
          <div className="page-heading">
            <span className="eyebrow">DETAIL PESANAN</span>
            <h1>{o.id}</h1>
            <span className={'badge ' + o.status}>{orderLabels[o.status]}</span>
            <button className="link-button" onClick={load}>
              Perbarui status
            </button>
          </div>
          <div className="checkout-layout">
            <div className="panel">
              <h2>Perjalanan pesanan</h2>
              <p className="small muted">
                Status diperbarui manual oleh tim, bukan pelacakan kurir langsung.
              </p>
              <div className="timeline">
                {o.timeline.map((a, i) => (
                  <div key={i}>
                    <span className="timeline-dot" />
                    <strong>{a.text}</strong>
                    <small>
                      {new Date(a.at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) +
                        ' WIB'}
                    </small>
                  </div>
                ))}
              </div>
              {o.tracking && (
                <div className="info-box">
                  {o.courier} · Nomor resi / referensi: <strong>{o.tracking}</strong>
                </div>
              )}
              <h2>Produk pesanan</h2>
              {o.items.map((i) => (
                <div className="summary-row" key={i.productId + i.variantId}>
                  <span>
                    {i.name} · {i.variant}
                    <small>
                      {i.quantity} × {money(i.price)}
                    </small>
                  </span>
                  <strong>{money(i.price * i.quantity)}</strong>
                </div>
              ))}
              <h2>Alamat penerima</h2>
              <p>
                {o.address.name}
                <br />
                {o.address.phone}
                <br />
                {o.address.address}, {o.address.city} {o.address.postalCode}
              </p>
            </div>
            <div className="panel summary-panel">
              <h2>Pembayaran</h2>
              <div className="summary-row total">
                <span>Total</span>
                <strong>{money(o.total)}</strong>
              </div>
              <p className="small">Termasuk ongkir {money(o.shippingCost)}</p>
              <span className="badge">
                {o.payment === 'paid'
                  ? 'Terverifikasi'
                  : o.payment === 'cancelled'
                    ? 'Dibatalkan'
                    : 'Menunggu verifikasi'}
              </span>
              {o.demo ? (
                <div className="info-box">Pesanan demonstrasi. Jangan transfer uang.</div>
              ) : o.payment === 'pending' ? (
                <div className="info-box">
                  Transfer ke {o.bank.name}
                  <br />
                  <strong>{o.bank.account}</strong>
                  <br />
                  a.n. {o.bank.holder}
                  <p>
                    Sertakan nomor pesanan saat konfirmasi kepada tim melalui kontak bisnis. Status
                    berubah setelah verifikasi admin.
                  </p>
                </div>
              ) : null}
              {o.payment === 'pending' &&
                (confirm ? (
                  <div className="info-box">
                    <p>Batalkan pesanan ini dan kembalikan stok?</p>
                    <button
                      disabled={busy}
                      className="button danger"
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await api('/orders/' + id + '/cancel', 'POST', {});
                          await load();
                          await refresh();
                        } catch (e) {
                          setError((e as Error).message);
                        } finally {
                          setBusy(false);
                          setConfirm(false);
                        }
                      }}
                    >
                      Ya, batalkan
                    </button>
                    <button className="link-button" onClick={() => setConfirm(false)}>
                      Kembali
                    </button>
                  </div>
                ) : (
                  <button className="button secondary full" onClick={() => setConfirm(true)}>
                    Batalkan pesanan
                  </button>
                ))}
              <button className="button secondary full no-print" onClick={() => window.print()}>
                <Download size={16} />
                Simpan / cetak pesanan
              </button>
            </div>
          </div>
        </>
      ) : (
        !error && <p>Memuat detail…</p>
      )}
    </main>
  );
}
export function InfoPage({ privacy = false }: { privacy?: boolean }) {
  return (
    <main className="container section prose">
      <span className="eyebrow">RUMAH PAYUNG</span>
      <h1>{privacy ? 'Pemesanan & privasi.' : 'Merchandise dengan makna.'}</h1>
      {privacy ? (
        <>
          <h2>Pemesanan dan harga</h2>
          <p>
            Harga katalog adalah harga satuan sebelum cetak custom. Estimasi penawaran belum
            mengikat; spesifikasi, pajak bila berlaku, jadwal, dan biaya pengiriman disepakati dalam
            penawaran final. Mode demonstrasi menggunakan data contoh dan tidak menerima pembayaran
            nyata.
          </p>
          <h2>Pembayaran dan pembatalan</h2>
          <p>
            Pembayaran menggunakan transfer bank dan diverifikasi manual. Pesanan belum dibayar
            dapat dibatalkan dari halaman pesanan. Permintaan retur, pengembalian dana, atau
            perubahan pesanan dibayar ditangani tim secara manual sesuai kesepakatan pesanan dan
            ketentuan yang berlaku.
          </p>
          <h2>Data yang kami gunakan</h2>
          <p>
            Nama, perusahaan, kontak, alamat, dan kebutuhan pesanan dipakai untuk penawaran, tindak
            lanjut, serta pemenuhan pesanan. Akses dibatasi kepada tim operasional. Parameter
            kampanye digunakan untuk mengukur sumber prospek; klik WhatsApp tidak dianggap sebagai
            penjualan.
          </p>
          <h2>Penyimpanan lokal dan cookie</h2>
          <p>
            Cookie sesi menghubungkan browser dengan pesanan dan login admin. Keranjang disimpan
            pada browser. Menghapus cookie akan menghilangkan akses riwayat pesanan di browser
            tersebut; hubungi tim dengan nomor pesanan untuk bantuan setelah verifikasi identitas.
          </p>
          <h2>Permintaan terkait data</h2>
          <p>
            Gunakan kontak bisnis yang tersedia atau formulir konsultasi untuk meminta koreksi atau
            penghapusan data. Data transaksi yang wajib disimpan mengikuti kewajiban yang berlaku.
            Jangan memasukkan data sensitif atau informasi pembayaran kartu.
          </p>
        </>
      ) : (
        <>
          <p className="lead-text">
            RUMAH Payung membantu perusahaan dan organisasi menemukan payung custom serta
            merchandise sesuai kebutuhan dan anggaran.
          </p>
          <h2>Dimulai dari percakapan.</h2>
          <p>
            Setiap acara punya kebutuhan berbeda. Kami menyediakan jalur konsultasi untuk menentukan
            model, jumlah, dan cetak sebelum menyepakati penawaran.
          </p>
          <h2>Informasi yang jelas.</h2>
          <p>
            Ketersediaan, bahan, ukuran, dan waktu pemenuhan dikonfirmasi sebelum pesanan custom
            diproses. Visual pada katalog awal adalah ilustrasi, bukan dokumentasi hasil produksi.
          </p>
          <Link className="button" to="/penawaran">
            Ceritakan kebutuhan Anda <ArrowUpRight size={18} />
          </Link>
        </>
      )}
    </main>
  );
}

import { useEffect, useState, useRef, type FormEvent } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Settings as SettingsIcon,
  LogOut,
  ArrowUpRight,
  Plus,
  Search,
  X,
  Download,
  Clock,
  ArrowRight,
  Check,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Logo, ErrorBox, Empty } from './components';
import { api } from './api';
import {
  productImage,
  money,
  stages,
  stageLabels,
  orderLabels,
  type Lead,
  type Order,
  type Product,
  type Settings,
} from './domain';
import { useStore } from './store';
interface AdminData {
  leads: Lead[];
  orders: Order[];
  products: Product[];
  settings: Settings;
  audit: { id: number; at: string; action: string; entity: string }[];
  whatsappClicks: number;
}
const date = (v: string | null) =>
  v
    ? new Date(v).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      }) + ' WIB'
    : '—';
const localDate = (v: string | null) =>
  v ? new Date(new Date(v).getTime() + 7 * 3600000).toISOString().slice(0, 16) : '';
export function AdminLogin() {
  const [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/admin/login', 'POST', { password });
      navigate('/admin');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-brand">
        <Logo />
        <div>
          <span className="eyebrow">RUANG KERJA TIM</span>
          <h1>
            Hubungkan kebutuhan.
            <br />
            Bangun hubungan.
          </h1>
          <p>
            Satu tempat untuk prospek, penawaran,
            <br />
            dan setiap pesanan RumahPayung.
          </p>
          <img src="/images/navy.svg" alt="Ilustrasi payung" />
        </div>
        <small>RUMAH PAYUNG / OPERATIONS</small>
      </section>
      <section className="login-form">
        <form onSubmit={submit}>
          <span className="eyebrow">SELAMAT DATANG KEMBALI</span>
          <h1>Masuk ke ruang tim.</h1>
          <p>Akses khusus pengelola RumahPayung.</p>
          <label>
            Password admin
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </label>
          <ErrorBox error={error} />
          <button className="button full" disabled={busy}>
            {busy ? 'Memeriksa…' : 'Masuk'}
            <ArrowRight size={18} />
          </button>
          <Link to="/" className="text-link">
            Kembali ke website
          </Link>
        </form>
      </section>
    </main>
  );
}
export function Admin() {
  const { tab = 'dashboard' } = useParams(),
    navigate = useNavigate(),
    store = useStore();
  const [data, setData] = useState<AdminData | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const load = async () => {
    try {
      setData(await api<AdminData>('/admin/data'));
    } catch (e) {
      if ((e as Error).message.includes('masuk')) navigate('/admin/login');
      else setError((e as Error).message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  async function updated() {
    await load();
    await store.refresh();
    setNotice('Perubahan tersimpan.');
    setTimeout(() => setNotice(''), 3500);
  }
  const tabs = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['crm', 'CRM & prospek', Users],
    ['orders', 'Pesanan', ShoppingBag],
    ['products', 'Produk', Package],
    ['settings', 'Aturan & pengaturan', SettingsIcon],
  ] as const;
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Logo />
        <div className="workspace-label">WORKSPACE / TIM RUMAH PAYUNG</div>
        <nav>
          {tabs.map(([key, label, Icon]) => (
            <NavLink
              aria-label={label}
              key={key}
              to={key === 'dashboard' ? '/admin' : '/admin/' + key}
              end
            >
              <Icon size={19} />
              {label}
              {key === 'crm' && data && (
                <span>{data.leads.filter((l) => l.stage === 'New Lead').length}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/">
            Lihat website <ArrowUpRight size={16} />
          </Link>
          <button
            onClick={async () => {
              await api('/admin/logout', 'POST', {});
              navigate('/admin/login');
            }}
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-top">
          <span>
            RumahPayung <span className="muted">/ Ruang tim</span>
          </span>
          <div>
            <span className="connection-dot" />
            {data?.settings.demo ? 'Mode demonstrasi' : 'Operasional'}
            <span className="avatar">RP</span>
          </div>
        </header>
        <main className="admin-main">
          <ErrorBox error={error} />
          {notice && (
            <div className="save-notice" role="status">
              <Check size={17} />
              {notice}
            </div>
          )}
          {!data ? (
            <p>Memuat ruang tim…</p>
          ) : tab === 'dashboard' ? (
            <Dashboard data={data} />
          ) : tab === 'crm' ? (
            <CRM data={data} updated={updated} />
          ) : tab === 'orders' ? (
            <AdminOrders data={data} updated={updated} />
          ) : tab === 'products' ? (
            <AdminProducts data={data} updated={updated} />
          ) : tab === 'settings' ? (
            <AdminSettings data={data} updated={updated} />
          ) : (
            <Empty title="Halaman tidak ditemukan" description="Pilih menu pada navigasi." />
          )}
        </main>
      </div>
    </div>
  );
}
function AdminHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function Dashboard({ data }: { data: AdminData }) {
  const active = data.leads.filter((l) => !['Won', 'Lost'].includes(l.stage)),
    due = active.filter((l) => l.followupAt && new Date(l.followupAt) <= new Date()),
    won = data.leads.filter((l) => l.stage === 'Won'),
    revenue = won.reduce((n, l) => n + l.revenue, 0),
    margin = won.reduce((n, l) => n + l.revenue - (l.quote?.cost || l.revenue), 0);
  return (
    <>
      <AdminHeading
        eyebrow="GAMBARAN OPERASIONAL"
        title="Setiap hubungan, berarti."
        description="Pantau prospek dan tindak lanjut yang membutuhkan perhatian."
      >
        <Link className="button" to="/admin/crm">
          Buka CRM <ArrowRight size={17} />
        </Link>
      </AdminHeading>
      <div className="metrics">
        {[
          [String(active.length), 'Prospek aktif', 'Seluruh prospek belum ditutup', Users],
          [String(due.length), 'Perlu follow-up', 'Jadwal jatuh tempo atau terlambat', Clock],
          [money(revenue), 'Omzet deal CRM', 'Total deal Won, seluruh periode', ShoppingBag],
          [money(margin), 'Margin kotor CRM', 'Omzet Won dikurangi biaya quotation', FileText],
        ].map(([n, t, d, I]) => {
          const Icon = I as typeof Users;
          return (
            <div className="metric" key={String(t)}>
              <span>
                {String(t)}
                <Icon size={19} />
              </span>
              <strong>{String(n)}</strong>
              <small>{String(d)}</small>
            </div>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Pipeline penjualan</h2>
            <span className="muted">Seluruh periode</span>
          </div>
          <div className="funnel">
            {stages.map((s) => {
              const count = data.leads.filter((l) => l.stage === s).length;
              return (
                <div key={s}>
                  <span>{stageLabels[s]}</span>
                  <div>
                    <i
                      style={{
                        width:
                          Math.max(count ? 4 : 0, (count / Math.max(1, data.leads.length)) * 100) +
                          '%',
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
          <p className="small muted">
            Klik WhatsApp: {data.whatsappClicks}. Klik adalah interaksi, bukan percakapan atau
            penjualan.
          </p>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>Prioritas follow-up</h2>
            <Link to="/admin/crm?due=1" className="text-link">
              Lihat semua <ArrowUpRight size={15} />
            </Link>
          </div>
          {due.length ? (
            due.slice(0, 5).map((l) => (
              <Link to={'/admin/crm?lead=' + l.id} key={l.id} className="followup-row">
                <span className="initials">{l.company.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{l.company}</strong>
                  <small>
                    {l.name} · {l.owner}
                  </small>
                </div>
                <span className="due-text">{date(l.followupAt)}</span>
              </Link>
            ))
          ) : (
            <div className="quiet-empty">
              <Check size={30} />
              <h3>Belum ada tindak lanjut jatuh tempo.</h3>
              <p>Prospek baru otomatis memiliki jadwal respons.</p>
            </div>
          )}
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>Aktivitas operasional</h2>
          <span className="muted">100 perubahan terakhir tersedia</span>
        </div>
        {data.audit.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Aktivitas</th>
                  <th>Referensi</th>
                </tr>
              </thead>
              <tbody>
                {data.audit.slice(0, 8).map((a) => (
                  <tr key={a.id}>
                    <td>{date(a.at)}</td>
                    <td>{a.action}</td>
                    <td>{a.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Perubahan produk, quotation, dan pesanan akan tercatat di sini.</p>
        )}
      </section>
    </>
  );
}
function CRM({ data, updated }: { data: AdminData; updated: () => Promise<void> }) {
  const [q, setQ] = useState(''),
    [stage, setStage] = useState(''),
    [due, setDue] = useState(new URLSearchParams(location.search).has('due')),
    [selected, setSelected] = useState<string | null>(
      new URLSearchParams(location.search).get('lead'),
    );
  const leads = data.leads.filter(
      (l) =>
        (!stage || l.stage === stage) &&
        (!due || (l.followupAt && new Date(l.followupAt) <= new Date())) &&
        [l.company, l.name, l.phone, l.id].join(' ').toLowerCase().includes(q.toLowerCase()),
    ),
    lead = data.leads.find((l) => l.id === selected);
  return (
    <>
      <AdminHeading
        eyebrow="RELASI SEBELUM TRANSAKSI"
        title="CRM & prospek."
        description="Catat kebutuhan, jaga percakapan, dan jadwalkan langkah berikutnya."
      >
        <div className="button-group">
          <a className="button secondary" href="/api/admin/leads.csv">
            <Download size={16} />
            Ekspor CSV
          </a>
          <Link className="button" to="/penawaran?utm_source=Manual-B2B">
            <Plus size={17} />
            Catat prospek
          </Link>
        </div>
      </AdminHeading>
      <div className="pipeline-tabs">
        <button className={!stage ? 'active' : ''} onClick={() => setStage('')}>
          Semua <span>{data.leads.length}</span>
        </button>
        {stages.map((s) => (
          <button key={s} className={stage === s ? 'active' : ''} onClick={() => setStage(s)}>
            {stageLabels[s]} <span>{data.leads.filter((l) => l.stage === s).length}</span>
          </button>
        ))}
      </div>
      <section className="panel">
        <div className="admin-toolbar">
          <div className="search">
            <Search size={17} />
            <input
              aria-label="Cari prospek"
              placeholder="Cari perusahaan, PIC, atau kontak…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <label className="check-label">
            <input type="checkbox" checked={due} onChange={(e) => setDue(e.target.checked)} />
            Perlu follow-up
          </label>
          <span className="muted">{leads.length} prospek</span>
        </div>
        {leads.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Perusahaan / PIC</th>
                  <th>Kebutuhan</th>
                  <th>Sumber</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>PIC sales</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <button className="table-name" onClick={() => setSelected(l.id)}>
                        {l.company}
                      </button>
                      <small>
                        {l.name} · {l.phone}
                      </small>
                    </td>
                    <td>
                      {l.quantity} pcs
                      <small>{data.products.find((p) => p.id === l.productId)?.name}</small>
                    </td>
                    <td>
                      {l.source}
                      <small>{l.campaign || 'Organik / langsung'}</small>
                    </td>
                    <td>
                      <span className={'badge ' + l.stage.replaceAll(' ', '-')}>
                        {stageLabels[l.stage]}
                      </span>
                    </td>
                    <td
                      className={
                        l.followupAt && new Date(l.followupAt) <= new Date() ? 'due-text' : ''
                      }
                    >
                      {date(l.followupAt)}
                    </td>
                    <td>{l.owner}</td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={'Buka ' + l.company}
                        onClick={() => setSelected(l.id)}
                      >
                        <ArrowUpRight size={19} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Belum ada prospek di daftar ini"
            description="Formulir penawaran masuk otomatis ke CRM. Gunakan Catat prospek untuk kontak B2B manual."
          />
        )}
      </section>
      {lead && (
        <LeadEditor
          key={lead.id}
          lead={lead}
          settings={data.settings}
          close={() => setSelected(null)}
          updated={updated}
        />
      )}
    </>
  );
}
function Modal({
  title,
  close,
  children,
  wide = false,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const controls = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]',
        ) || [],
      );
    controls()[0]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const c = controls(),
          first = c[0],
          last = c.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = prev;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        ref={ref}
        className={'modal ' + (wide ? 'wide' : '')}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Tutup dialog" onClick={close}>
            <X size={22} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function LeadEditor({
  lead: l,
  settings,
  close,
  updated,
}: {
  lead: Lead;
  settings: Settings;
  close: () => void;
  updated: () => Promise<void>;
}) {
  const [stage, setStage] = useState(l.stage),
    [discount, setDiscount] = useState(l.quote?.discount || 0),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const d = new FormData(e.currentTarget);
    try {
      await api('/admin/leads/' + l.id, 'PATCH', {
        stage,
        owner: d.get('owner'),
        followupAt: d.get('followupAt')
          ? new Date(String(d.get('followupAt')) + ':00+07:00').toISOString()
          : null,
        lostReason: d.get('lostReason') || '',
        revenue: Number(d.get('revenue') || 0),
        note: d.get('note') || '',
      });
      await updated();
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={l.company} close={close} wide>
      <div className="modal-body lead-editor">
        <div className="lead-contact">
          <span className="initials">{l.company.slice(0, 2).toUpperCase()}</span>
          <div>
            <h3>{l.name}</h3>
            <p>
              {l.phone} {l.email && '· ' + l.email}
            </p>
            <small>
              {l.id} · Masuk {date(l.createdAt)}
            </small>
          </div>
        </div>
        <div className="info-grid">
          <div>
            <small>Kebutuhan</small>
            <strong>
              {l.quantity} pcs · {l.productId}
            </strong>
          </div>
          <div>
            <small>Deadline</small>
            <strong>{l.deadline}</strong>
          </div>
          <div>
            <small>Anggaran</small>
            <strong>{l.budget ? money(l.budget) : 'Belum ditentukan'}</strong>
          </div>
          <div>
            <small>Atribusi</small>
            <strong>
              {l.source} / {l.campaign || '—'} / {l.term || '—'}
            </strong>
          </div>
        </div>
        {l.notes && <p className="info-box">{l.notes}</p>}
        <form onSubmit={save}>
          <div className="form-grid">
            <label>
              Status prospek
              <select value={stage} onChange={(e) => setStage(e.target.value as Lead['stage'])}>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {stageLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              PIC sales
              <input name="owner" defaultValue={l.owner} required maxLength={120} />
            </label>
            <label>
              Follow-up berikutnya (WIB)
              <input
                key={l.followupAt}
                name="followupAt"
                type="datetime-local"
                defaultValue={localDate(
                  l.followupAt ||
                    new Date(Date.now() + settings.followupHours * 3600000).toISOString(),
                )}
                required={!['Won', 'Lost'].includes(stage)}
              />
            </label>
            <label>
              Omzet deal disepakati
              <input
                key={l.quote?.createdAt}
                name="revenue"
                type="number"
                min={0}
                defaultValue={l.revenue || l.quote?.total || 0}
              />
            </label>
            {stage === 'Lost' && (
              <label className="span-2">
                Alasan tidak lanjut
                <textarea name="lostReason" required defaultValue={l.lostReason} />
              </label>
            )}
            <label className="span-2">
              Catatan tindak lanjut
              <textarea
                name="note"
                rows={2}
                placeholder="Hasil percakapan dan langkah selanjutnya"
                maxLength={2000}
              />
            </label>
          </div>
          <ErrorBox error={error} />
          <button className="button" disabled={busy}>
            Simpan tindak lanjut <Check size={16} />
          </button>
        </form>
        <section className="quote-admin">
          <h3>Penawaran harga</h3>
          <p className="small muted">
            Batas diskon {settings.maxDiscount}%. Margin minimum {settings.minMargin}%. Quotation
            tidak dikirim otomatis.
          </p>
          <div className="button-group">
            <label>
              Diskon (%)
              <input
                type="number"
                min={0}
                max={settings.maxDiscount}
                value={discount}
                onChange={(e) => setDiscount(+e.target.value)}
              />
            </label>
            <button
              className="button secondary"
              disabled={busy || ['Won', 'Lost'].includes(l.stage)}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await api('/admin/leads/' + l.id + '/quote', 'POST', { discount });
                  await updated();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Buat / revisi quotation
            </button>
          </div>
          {l.quote && (
            <>
              <div className="summary-row">
                <span>Nilai quotation</span>
                <strong>{money(l.quote.total)}</strong>
              </div>
              <div className="summary-row">
                <span>Margin kotor internal</span>
                <strong>
                  {l.quote.margin}% · {money(l.quote.total - l.quote.cost)}
                </strong>
              </div>
              <button
                className="button secondary"
                onClick={() => {
                  document.body.classList.add('print-quote');
                  window.print();
                  document.body.classList.remove('print-quote');
                }}
              >
                <Download size={16} />
                Cetak quotation / PDF
              </button>
              <div className="quotation-print">
                <Logo />
                <h1>Penawaran harga</h1>
                <p>
                  {l.id} · {date(l.quote.createdAt)}
                </p>
                <h2>Kepada {l.company}</h2>
                <p>u.p. {l.name}</p>
                {l.quote.demo && <p>SIMULASI — BUKAN PENAWARAN KOMERSIAL</p>}
                <table>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Jumlah</th>
                      <th>Harga satuan</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {l.quote.productName}
                        <br />
                        Estimasi cetak satu logo
                      </td>
                      <td>{l.quote.quantity}</td>
                      <td>{money(l.quote.unitPrice)}</td>
                      <td>{money(l.quote.subtotal)}</td>
                    </tr>
                  </tbody>
                </table>
                <p>Persiapan cetak: {money(l.quote.setup)}</p>
                <h2>Total estimasi: {money(l.quote.total)}</h2>
                <p>
                  Berlaku sampai {date(l.quote.validUntil)}. Belum termasuk ongkir dan pajak bila
                  berlaku. Spesifikasi, desain, ketersediaan, dan jadwal harus disepakati tertulis
                  sebelum pembayaran atau produksi.
                </p>
              </div>
            </>
          )}
        </section>
        <h3>Riwayat aktivitas</h3>
        <div className="timeline">
          {[...l.activities].reverse().map((a, i) => (
            <div key={i}>
              <span className="timeline-dot" />
              <strong>{a.text}</strong>
              <small>{date(a.at)}</small>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
function AdminOrders({ data, updated }: { data: AdminData; updated: () => Promise<void> }) {
  const [q, setQ] = useState(''),
    [status, setStatus] = useState(''),
    [selected, setSelected] = useState<string | null>(null);
  const orders = data.orders.filter(
      (o) =>
        (!status || o.status === status) &&
        [o.id, o.address.name].join(' ').toLowerCase().includes(q.toLowerCase()),
    ),
    o = data.orders.find((o) => o.id === selected);
  return (
    <>
      <AdminHeading
        eyebrow="OPERASIONAL TOKO"
        title="Kelola pesanan."
        description="Verifikasi transfer, proses pengiriman, dan catat setiap perubahan."
      />
      <section className="panel">
        <div className="admin-toolbar">
          <div className="search">
            <Search size={17} />
            <input
              placeholder="Cari nomor pesanan atau pelanggan…"
              aria-label="Cari pesanan"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Semua status</option>
            {Object.entries(orderLabels).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
        {orders.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Total</th>
                  <th>Pembayaran</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <button className="table-name" onClick={() => setSelected(o.id)}>
                        {o.id}
                      </button>
                      <small>
                        {date(o.createdAt)}
                        {o.demo ? ' · Simulasi' : ''}
                      </small>
                    </td>
                    <td>
                      {o.address.name}
                      <small>{o.address.city}</small>
                    </td>
                    <td>{money(o.total)}</td>
                    <td>
                      <span className={'badge ' + o.payment}>{o.payment}</span>
                    </td>
                    <td>
                      <span className={'badge ' + o.status}>{orderLabels[o.status]}</span>
                    </td>
                    <td>
                      <button className="button small secondary" onClick={() => setSelected(o.id)}>
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Belum ada pesanan" description="Pesanan checkout akan muncul di sini." />
        )}
      </section>
      {o && <OrderEditor o={o} close={() => setSelected(null)} updated={updated} />}
    </>
  );
}
function OrderEditor({
  o,
  close,
  updated,
}: {
  o: Order;
  close: () => void;
  updated: () => Promise<void>;
}) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false),
    [courier, setCourier] = useState(o.courier),
    [tracking, setTracking] = useState(o.tracking);
  const next: Record<string, string> = {
    processing: 'packed',
    packed: 'shipped',
    shipped: 'delivered',
  };
  async function change(action: string) {
    setBusy(true);
    setError('');
    try {
      await api('/admin/orders/' + o.id, 'PATCH', {
        action,
        status: action === 'fulfill' ? next[o.status] : undefined,
        courier,
        tracking,
      });
      await updated();
      setConfirm(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={o.id} close={close}>
      <div className="modal-body">
        <span className={'badge ' + o.status}>{orderLabels[o.status]}</span>
        <h3>{o.address.name}</h3>
        <p>
          {o.address.phone}
          <br />
          {o.address.address}, {o.address.city} {o.address.postalCode}
        </p>
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
        <div className="summary-row">
          <span>Ongkir</span>
          <strong>{money(o.shippingCost)}</strong>
        </div>
        <div className="summary-row total">
          <span>Total pembayaran</span>
          <strong>{money(o.total)}</strong>
        </div>
        {o.demo && <p className="info-box">Pesanan simulasi. Tidak ada pembayaran nyata.</p>}
        <ErrorBox error={error} />
        {o.payment === 'pending' &&
          (confirm ? (
            <div className="info-box">
              <p>
                Pastikan transfer sejumlah <strong>{money(o.total)}</strong> sudah diterima di
                rekening yang benar. Tindakan ini dicatat dalam audit.
              </p>
              <button className="button" disabled={busy} onClick={() => change('pay')}>
                Konfirmasi sudah diterima
              </button>
              <button className="link-button" onClick={() => setConfirm(false)}>
                Kembali
              </button>
            </div>
          ) : (
            <button className="button full" onClick={() => setConfirm(true)}>
              Verifikasi pembayaran manual
            </button>
          ))}
        {o.payment === 'paid' && next[o.status] && (
          <>
            {o.status === 'packed' && (
              <>
                <label>
                  Kurir / metode serah terima
                  <input value={courier} onChange={(e) => setCourier(e.target.value)} />
                </label>
                <label>
                  Nomor resi / referensi serah terima
                  <input value={tracking} onChange={(e) => setTracking(e.target.value)} />
                </label>
              </>
            )}
            <button className="button full" disabled={busy} onClick={() => change('fulfill')}>
              Tandai {orderLabels[next[o.status]]}
            </button>
          </>
        )}
        <div className="timeline">
          {o.timeline.map((a, i) => (
            <div key={i}>
              <span className="timeline-dot" />
              <strong>{a.text}</strong>
              <small>{date(a.at)}</small>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
function AdminProducts({ data, updated }: { data: AdminData; updated: () => Promise<void> }) {
  const [selected, setSelected] = useState<Product | null>(null),
    [q, setQ] = useState('');
  function add() {
    const id = 'produk-' + crypto.randomUUID().slice(0, 8);
    setSelected({
      revision: 0,
      id,
      slug: id,
      sku: id.toUpperCase(),
      name: '',
      description: '',
      price: 100000,
      cost: 50000,
      category: 'Payung',
      moq: 24,
      image: 'navy',
      active: false,
      verified: false,
      variants: [{ id: 'navy', label: 'Navy', color: '#183b59', stock: 0 }],
    });
  }
  return (
    <>
      <AdminHeading
        eyebrow="KATALOG & PERSEDIAAN"
        title="Kelola produk."
        description="Harga, varian, dan stok menjadi sumber data untuk setiap pesanan."
      >
        <button className="button" onClick={add}>
          <Plus size={17} />
          Tambah produk
        </button>
      </AdminHeading>
      <section className="panel">
        <div className="admin-toolbar">
          <div className="search">
            <Search size={17} />
            <input
              aria-label="Cari produk admin"
              placeholder="Cari produk atau SKU…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <span className="muted">Arsipkan produk melalui status Aktif.</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga / HPP</th>
                <th>Stok total</th>
                <th>MOQ custom</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.products
                .filter((p) => (p.name + p.sku).toLowerCase().includes(q.toLowerCase()))
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-product">
                        <img src={productImage(p.image)} alt="" />
                        <div>
                          <strong>{p.name}</strong>
                          <small>{p.sku}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {money(p.price)}
                      <small>HPP {money(p.cost)}</small>
                    </td>
                    <td>{p.variants.reduce((n, v) => n + v.stock, 0)}</td>
                    <td>{p.moq} pcs</td>
                    <td>
                      <span className="badge">
                        {p.active ? 'Aktif' : 'Arsip'} · {p.verified ? 'Terverifikasi' : 'Contoh'}
                      </span>
                    </td>
                    <td>
                      <button className="button small secondary" onClick={() => setSelected(p)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {selected && (
        <ProductEditor product={selected} close={() => setSelected(null)} updated={updated} />
      )}
    </>
  );
}
function ProductEditor({
  product,
  close,
  updated,
}: {
  product: Product;
  close: () => void;
  updated: () => Promise<void>;
}) {
  const [p, setP] = useState(product),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  function field<K extends keyof Product>(k: K, v: Product[K]) {
    setP({ ...p, [k]: v });
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/admin/products/' + p.id, 'PUT', p);
      await updated();
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={product.name || 'Tambah produk'} close={close} wide>
      <form className="modal-body" onSubmit={save}>
        <div className="form-grid">
          <label>
            Nama produk
            <input
              required
              minLength={3}
              value={p.name}
              onChange={(e) => field('name', e.target.value)}
            />
          </label>
          <label>
            SKU
            <input required value={p.sku} onChange={(e) => field('sku', e.target.value)} />
          </label>
          <label>
            Slug URL
            <input
              required
              pattern="[a-z0-9-]+"
              value={p.slug}
              onChange={(e) => field('slug', e.target.value)}
            />
          </label>
          <label>
            Kategori
            <select
              value={p.category}
              onChange={(e) => field('category', e.target.value as Product['category'])}
            >
              {['Payung', 'Tumbler', 'Tas'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Harga satuan (Rp)
            <input
              type="number"
              min={1}
              required
              value={p.price}
              onChange={(e) => field('price', +e.target.value)}
            />
          </label>
          <label>
            HPP satuan (Rp)
            <input
              type="number"
              min={0}
              required
              value={p.cost}
              onChange={(e) => field('cost', +e.target.value)}
            />
          </label>
          <label>
            MOQ custom
            <input
              type="number"
              min={1}
              required
              value={p.moq}
              onChange={(e) => field('moq', +e.target.value)}
            />
          </label>
          <label>
            Visual ilustrasi
            <select
              value={p.image}
              onChange={(e) => field('image', e.target.value as Product['image'])}
            >
              {p.image.startsWith('/media/') && <option value={p.image}>Foto yang diunggah</option>}
              {['navy', 'black', 'cream', 'green', 'tumbler', 'bag'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="span-2">
            Foto produk (JPEG, PNG, WebP; maks. 5 MB)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  setError('Ukuran foto maksimal 5 MB.');
                  return;
                }
                setBusy(true);
                setError('');
                try {
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                  });
                  const r = await api<{ url: string }>('/admin/media', 'POST', {
                    data: base64,
                    mime: file.type,
                  });
                  field('image', r.url);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
            <small>
              Foto diperiksa, dikonversi ke WebP, dan metadata dibuang. Pastikan Anda berhak
              menggunakannya.
            </small>
            <img
              className="upload-preview"
              src={productImage(p.image)}
              alt="Pratinjau foto produk"
            />
          </label>
          <label className="span-2">
            Deskripsi
            <textarea
              required
              minLength={10}
              rows={3}
              value={p.description}
              onChange={(e) => field('description', e.target.value)}
            />
          </label>
        </div>
        <h3>Varian & stok</h3>
        {p.variants.map((v, i) => (
          <div className="variant-editor" key={v.id}>
            <label>
              Nama warna
              <input
                required
                value={v.label}
                onChange={(e) =>
                  field(
                    'variants',
                    p.variants.map((n, j) => (j === i ? { ...n, label: e.target.value } : n)),
                  )
                }
              />
            </label>
            <label>
              Warna
              <input
                type="color"
                value={v.color}
                onChange={(e) =>
                  field(
                    'variants',
                    p.variants.map((n, j) => (j === i ? { ...n, color: e.target.value } : n)),
                  )
                }
              />
            </label>
            <label>
              Stok
              <input
                type="number"
                min={0}
                max={100000}
                required
                value={v.stock}
                onChange={(e) =>
                  field(
                    'variants',
                    p.variants.map((n, j) => (j === i ? { ...n, stock: +e.target.value } : n)),
                  )
                }
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          className="link-button"
          disabled={p.variants.length >= 12}
          onClick={() =>
            field('variants', [
              ...p.variants,
              { id: crypto.randomUUID(), label: 'Warna baru', color: '#667788', stock: 0 },
            ])
          }
        >
          + Tambah varian
        </button>
        <div className="check-stack">
          <label className="check-label">
            <input
              type="checkbox"
              checked={p.active}
              onChange={(e) => field('active', e.target.checked)}
            />
            Aktif di katalog
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={p.verified}
              onChange={(e) => field('verified', e.target.checked)}
            />
            Harga, HPP, stok, MOQ, dan spesifikasi sudah diverifikasi owner.
          </label>
        </div>
        <ErrorBox error={error} />
        <button className="button" disabled={busy}>
          Simpan produk <Check size={17} />
        </button>
      </form>
    </Modal>
  );
}
function AdminSettings({ data, updated }: { data: AdminData; updated: () => Promise<void> }) {
  const [s, setS] = useState(data.settings),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  function field<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS({ ...s, [k]: v });
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/admin/settings', 'PUT', s);
      await updated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AdminHeading
        eyebrow="ATURAN YANG MENJAGA BISNIS"
        title="Harga & tindak lanjut."
        description="Nilai awal adalah hipotesis. Validasi bersama owner sebelum menerima pembayaran nyata."
      />
      <form onSubmit={save}>
        <div className="settings-grid">
          <section className="panel">
            <h2>Aturan penawaran</h2>
            <p className="muted small">
              Diskon bertingkat: 0% untuk &lt;100 pcs, 5% untuk 100–299, 8% untuk ≥300; dibatasi
              maksimum di bawah. Harga otomatis menjaga margin minimum.
            </p>
            <div className="form-grid">
              {(
                [
                  ['minMargin', 'Margin minimum (%)', 0, 80],
                  ['maxDiscount', 'Diskon maksimum (%)', 0, 40],
                  ['printCost', 'Biaya cetak per pcs (Rp)', 0, 1000000000],
                  ['setupCost', 'Biaya persiapan cetak (Rp)', 0, 1000000000],
                ] as const
              ).map(([k, l, min, max]) => (
                <label key={k}>
                  {l}
                  <input
                    type="number"
                    min={min}
                    max={max}
                    required
                    value={s[k]}
                    onChange={(e) => field(k, +e.target.value)}
                  />
                </label>
              ))}
            </div>
            <p className="small">
              Harga khusus di bawah batas margin ditolak. Untuk spesifikasi berbeda, revisi produk
              dan HPP terlebih dahulu; setiap perubahan dicatat.
            </p>
          </section>
          <section className="panel">
            <h2>Disiplin follow-up</h2>
            <label>
              Target respons awal (menit)
              <input
                type="number"
                min={1}
                max={1440}
                required
                value={s.responseMinutes}
                onChange={(e) => field('responseMinutes', +e.target.value)}
              />
            </label>
            <label>
              Follow-up setelah quotation (jam)
              <input
                type="number"
                min={1}
                max={168}
                required
                value={s.followupHours}
                onChange={(e) => field('followupHours', +e.target.value)}
              />
            </label>
            <p className="small muted">
              Target internal memakai waktu kalender. Admin menyesuaikan jadwal ke jam kerja. Tidak
              ada pesan otomatis; sales mencatat hasil dan menentukan tindak lanjut. Prospek aktif
              wajib memiliki jadwal berikutnya.
            </p>
          </section>
          <section className="panel">
            <h2>Informasi bisnis & pembayaran</h2>
            <label>
              Nama bisnis
              <input
                required
                value={s.businessName}
                onChange={(e) => field('businessName', e.target.value)}
              />
            </label>
            <label>
              WhatsApp bisnis (62…, tanpa +)
              <input
                value={s.whatsapp}
                pattern="(62[0-9]{8,13})?"
                onChange={(e) => field('whatsapp', e.target.value)}
              />
            </label>
            <label>
              Nama bank
              <input value={s.bankName} onChange={(e) => field('bankName', e.target.value)} />
            </label>
            <label>
              Nomor rekening
              <input value={s.bankAccount} onChange={(e) => field('bankAccount', e.target.value)} />
            </label>
            <label>
              Pemilik rekening
              <input value={s.bankHolder} onChange={(e) => field('bankHolder', e.target.value)} />
            </label>
          </section>
          <section className="panel">
            <h2>Tarif & mode toko</h2>
            <label>
              Tarif tetap Jakarta (Rp)
              <input
                type="number"
                min={0}
                required
                value={s.shippingLocal}
                onChange={(e) => field('shippingLocal', +e.target.value)}
              />
            </label>
            <label>
              Tarif tetap luar Jakarta (Rp)
              <input
                type="number"
                min={0}
                required
                value={s.shippingNational}
                onChange={(e) => field('shippingNational', +e.target.value)}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={s.demo}
                onChange={(e) => field('demo', e.target.checked)}
              />
              Mode demonstrasi
            </label>
            <div className="info-box">
              <AlertCircle size={19} />
              <p>
                Untuk mematikan mode demonstrasi: isi kontak dan rekening, lalu verifikasi atau
                arsipkan seluruh produk contoh. Tarif harus sesuai kemampuan pemenuhan. Riwayat
                simulasi tetap diberi label.
              </p>
            </div>
          </section>
        </div>
        <ErrorBox error={error} />
        <button className="button" disabled={busy}>
          Simpan aturan & pengaturan <Check size={17} />
        </button>
      </form>
    </>
  );
}

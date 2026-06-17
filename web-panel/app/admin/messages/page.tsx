'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCheck,
  Clock,
  Inbox,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

function formatDate(iso?: string) {
  if (!iso) return '-';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const selected = useMemo(
    () => messages.find((message) => message.id === selectedId) ?? messages[0] ?? null,
    [messages, selectedId]
  );

  const unreadCount = messages.filter((message) => !message.read).length;
  const todayCount = messages.filter((message) => {
    if (!message.createdAt) return false;
    const created = new Date(message.createdAt);
    const now = new Date();
    return created.toDateString() === now.toDateString();
  }).length;

  const filtered = messages.filter((message) => {
    if (filter === 'unread' && message.read) return false;
    if (!search.trim()) return true;

    const q = search.trim().toLowerCase();
    return (
      message.name.toLowerCase().includes(q) ||
      message.email.toLowerCase().includes(q) ||
      message.subject.toLowerCase().includes(q) ||
      message.message.toLowerCase().includes(q)
    );
  });

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/messages?pageSize=100', { cache: 'no-store' });
      if (!res.ok) throw new Error('Mesajlar yüklenemedi.');

      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items ?? []);
      setMessages(items);
      setSelectedId((current) => current ?? items[0]?.id ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Mesajlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markRead = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Mesaj okundu yapılamadı.');

      setMessages((prev) =>
        prev.map((message) => (message.id === id ? { ...message, read: true } : message))
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deleteMessage = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Mesaj silinemedi.');

      setMessages((prev) => {
        const next = prev.filter((message) => message.id !== id);
        setSelectedId(next[0]?.id ?? null);
        return next;
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openMessage = (message: ContactMessage) => {
    setSelectedId(message.id);
    if (!message.read) {
      markRead(message.id);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Demo ve iletişim akışı
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Gelen Mesajlar
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            İletişim formundan gelen demo taleplerini tek ekranda takip et, yanıtla ve arşivi temiz tut.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary disabled:opacity-60"
        >
          <RefreshCw className={classNames('h-4 w-4', loading && 'animate-spin')} />
          Yenile
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Toplam mesaj</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{messages.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-sm text-emerald-300">Okunmamış</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">{unreadCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Bugün gelen</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{todayCount}</p>
        </div>
      </section>

      <section className="grid min-h-[620px] gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="flex min-h-[520px] flex-col rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ad, e-posta, konu veya mesaj ara..."
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilter('all')}
                className={classNames(
                  'rounded-lg border px-3 py-2 text-sm font-semibold transition',
                  filter === 'all'
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                Tümü ({messages.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={classNames(
                  'rounded-lg border px-3 py-2 text-sm font-semibold transition',
                  filter === 'unread'
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                Okunmamış ({unreadCount})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <Inbox className="h-10 w-10" />
                <p className="text-sm">Bu filtrede mesaj bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => openMessage(message)}
                    className={classNames(
                      'w-full rounded-lg border p-4 text-left transition',
                      selected?.id === message.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/40',
                      !message.read && 'shadow-[inset_4px_0_0_hsl(var(--primary))]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">{message.name}</p>
                        <p className="mt-1 truncate text-xs font-semibold text-primary">
                          {message.subject}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatDate(message.createdAt).split(' ')[0]}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {message.message}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="rounded-lg border border-border bg-card">
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!selected.read && (
                      <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                        Yeni
                      </span>
                    )}
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Demo talebi
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-foreground">{selected.subject}</h3>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{selected.name}</span>
                    <a className="inline-flex items-center gap-1.5 hover:text-primary" href={`mailto:${selected.email}`}>
                      <Mail className="h-4 w-4" />
                      {selected.email}
                    </a>
                    {selected.phone && (
                      <a className="inline-flex items-center gap-1.5 hover:text-primary" href={`tel:${selected.phone}`}>
                        <Phone className="h-4 w-4" />
                        {selected.phone}
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatDate(selected.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!selected.read && (
                    <button
                      onClick={() => markRead(selected.id)}
                      disabled={actionLoading === selected.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15 disabled:opacity-60"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Okundu
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(selected.id)}
                    disabled={actionLoading === selected.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/15 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </button>
                </div>
              </div>

              <div className="flex-1 p-5">
                <div className="max-w-4xl rounded-lg border border-border bg-background p-5 text-sm leading-7 text-foreground">
                  <p className="whitespace-pre-wrap">{selected.message}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${selected.email}?subject=Re%3A%20${encodeURIComponent(selected.subject)}&body=${encodeURIComponent(`Merhaba ${selected.name},\n\n`)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    <Mail className="h-4 w-4" />
                    E-posta ile Yanıtla
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(selected.email)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
                  >
                    E-postayı Kopyala
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Inbox className="h-12 w-12" />
              <p className="text-sm">Henüz mesaj yok.</p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

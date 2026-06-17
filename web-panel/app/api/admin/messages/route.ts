import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BACKEND = process.env.INTERNAL_API_BASE_URL ?? 'http://127.0.0.1:5000';
const ADMIN_KEY = process.env.CONTACT_ADMIN_KEY ?? 'CHANGE_ME_CONTACT_ADMIN_KEY_2026';

async function isAdmin(req: NextRequest) {
  const res = await fetch(`${BACKEND}/api/auth/me`, {
    headers: { cookie: req.headers.get('cookie') ?? '' },
    cache: 'no-store',
  });

  if (!res.ok) return false;

  const data = await res.json().catch(() => null);
  return String(data?.role ?? '').toLowerCase() === 'admin';
}

function backendHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Contact-Admin-Key': ADMIN_KEY,
  };
}

function normalizeMessage(message: any) {
  return {
    id: message.id,
    name: message.name ?? '',
    email: message.email ?? '',
    phone: message.phone ?? '',
    subject: message.subject ?? '',
    message: message.message ?? '',
    createdAt: message.createdAt,
    read: Boolean(message.read ?? message.isRead),
  };
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  const qs = req.nextUrl.searchParams.toString();

  try {
    const res = await fetch(`${BACKEND}/api/contact${qs ? `?${qs}` : ''}`, {
      headers: backendHeaders(),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({ items: [] }));
    const items = Array.isArray(data) ? data : (data.items ?? []);

    return NextResponse.json({
      total: Array.isArray(data) ? data.length : (data.total ?? items.length),
      page: Array.isArray(data) ? 1 : (data.page ?? 1),
      pageSize: Array.isArray(data) ? items.length : (data.pageSize ?? items.length),
      items: items.map(normalizeMessage),
    }, { status: res.status });
  } catch (err) {
    console.error('Admin messages GET error:', err);
    return NextResponse.json({ error: 'Mesajlar alınamadı.' }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  let id = '';
  try {
    ({ id } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  if (!id) return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });

  try {
    const res = await fetch(`${BACKEND}/api/contact/${id}/read`, {
      method: 'PATCH',
      headers: backendHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Admin messages PATCH error:', err);
    return NextResponse.json({ error: 'İşlem başarısız.' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  let id = '';
  try {
    ({ id } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  if (!id) return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });

  try {
    const res = await fetch(`${BACKEND}/api/contact/${id}`, {
      method: 'DELETE',
      headers: backendHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Admin messages DELETE error:', err);
    return NextResponse.json({ error: 'Silme başarısız.' }, { status: 502 });
  }
}

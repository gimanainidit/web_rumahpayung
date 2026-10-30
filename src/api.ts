export async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<T> {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-RP-Request': '1', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw Error(data.error || 'Permintaan gagal.');
  return data as T;
}
export function attribution() {
  const p = new URLSearchParams(location.search);
  if (p.has('utm_source'))
    sessionStorage.setItem(
      'rp_utm',
      JSON.stringify({
        source: p.get('utm_source') || 'Website',
        campaign: p.get('utm_campaign') || '',
        medium: p.get('utm_medium') || '',
        term: p.get('utm_term') || '',
      }),
    );
  try {
    return JSON.parse(sessionStorage.getItem('rp_utm') || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

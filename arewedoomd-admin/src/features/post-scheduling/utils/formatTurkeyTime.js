// Türkiye saati gösterim/giriş yardımcıları. Backend YALNIZ UTC ISO-8601 saklar/gönderir;
// çevrim salt bu görüntü katmanında. Türkiye 2016'dan beri DST uygulamıyor → sabit +03:00 güvenli.

export function formatTurkeyTime(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatTurkeyDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

// 'YYYY-MM-DD' + 'HH:mm' (Türkiye lokal) → UTC ISO string
export function turkeyTimeToUtcIso(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00+03:00`).toISOString();
}

// Bugünün Türkiye takvim günü, 'YYYY-MM-DD' (backend'in ?date= parametresi için)
export function todayTurkeyDateString() {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

// UTC ISO → edit formu için { date: 'YYYY-MM-DD', time: 'HH:mm' } (Türkiye lokal)
export function utcIsoToTurkeyParts(iso) {
  const shifted = new Date(new Date(iso).getTime() + 3 * 60 * 60 * 1000);
  const s = shifted.toISOString();
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}

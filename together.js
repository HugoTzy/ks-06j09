/* ====== EDIT THESE ====== */
// The moment you became a couple. Manila June 8, 10 PM = Sydney June 9, 12 AM.
// Change the year (and time) to your real date.
const START = new Date('2026-06-08T22:00:00+08:00');
const TZ_PH = 'Asia/Manila';
const QC = [14.676, 121.044];     // Quezon City
const KV = [-33.705, 150.955];    // Kellyville, Sydney
/* ======================== */

const $ = id => document.getElementById(id);
const fmtTime = tz => new Intl.DateTimeFormat('en-US', {timeZone: tz, hour: 'numeric', minute: '2-digit', second: '2-digit'});
const fmtDate = tz => new Intl.DateTimeFormat('en-US', {timeZone: tz, weekday: 'long', month: 'long', day: 'numeric'});

function tick() {
  const now = new Date();
  $('timePH').textContent = fmtTime(TZ_PH).format(now);
  $('datePH').textContent = fmtDate(TZ_PH).format(now);
  $('timeSY').textContent = fmtTime(TZ_SY).format(now);
  $('dateSY').textContent = fmtDate(TZ_SY).format(now);
  const mins = Math.floor(Math.max(0, now - START) / 60000);
  $('cDays').textContent = Math.floor(mins / 1440);
  $('cHours').textContent = Math.floor(mins % 1440 / 60);
  $('cMins').textContent = mins % 60;
  let m = (now.getFullYear() - START.getFullYear()) * 12 + now.getMonth() - START.getMonth();
  if (now.getDate() < START.getDate()) m--;
  $('monthLine').textContent = m >= 1 ? `that's ${m} month${m > 1 ? 's' : ''} of doing life with you.` : '';
}
tick(); setInterval(tick, 1000);

// distance (great-circle)
function haversine(a, b) {
  const R = 6371, r = x => x * Math.PI / 180;
  const dLat = r(b[0] - a[0]), dLng = r(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const km = Math.round(haversine(QC, KV));
$('km').textContent = km.toLocaleString();
$('mi').textContent = `(${Math.round(km * 0.621371).toLocaleString()} mi)`;

// map + plane
const map = L.map('map', {scrollWheelZoom: false}).fitBounds([QC, KV], {padding: [60, 60]});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap'}).addTo(map);
const N = 80, pts = [];
for (let i = 0; i <= N; i++) {
  const t = i / N;
  pts.push([QC[0] + (KV[0] - QC[0]) * t + Math.sin(Math.PI * t) * 6, QC[1] + (KV[1] - QC[1]) * t]);
}
L.polyline(pts, {color: '#f2e5c5', weight: 3, dashArray: '8 10'}).addTo(map);
[[QC, 'Quezon City, me'], [KV, 'Kellyville, you']].forEach(([c, label]) =>
  L.circleMarker(c, {radius: 8, color: '#4b1b1e', weight: 3, fillColor: '#f2e5c5', fillOpacity: 1})
    .addTo(map).bindTooltip(label, {permanent: true, direction: 'top', className: 'tip', offset: [0, -6]}));
const plane = L.marker(pts[0], {interactive: false, icon: L.divIcon({className: '', html: '<div class="plane" id="planeIcon">✈️</div>', iconSize: [28, 28], iconAnchor: [14, 14]})}).addTo(map);
let p = 0, dir = 1;
(function fly() {
  p += dir * 0.0025;
  if (p >= 1) { p = 1; dir = -1; } else if (p <= 0) { p = 0; dir = 1; }
  const f = p * N, i = Math.min(N - 1, Math.floor(f)), k = f - i, a = pts[i], b = pts[i + 1];
  plane.setLatLng([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
  const pa = map.latLngToLayerPoint(a), pb = map.latLngToLayerPoint(b);
  const ang = Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180 / Math.PI - 45;   // the emoji points up-right
  const el = document.getElementById('planeIcon');
  if (el) el.style.transform = `rotate(${dir === 1 ? ang : ang + 180}deg)`;
  requestAnimationFrame(fly);
})();

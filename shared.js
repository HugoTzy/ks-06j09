/* Shared by every page after the cover: lock guard, navbar, music, day/night theme */
const PAGE = document.body.dataset.page;               // cover | together | voice | final
const TZ_SY = 'Australia/Sydney';
const NEXT  = {together:['voice.html','Next: voice notes'], voice:['scrapbook.html','Next: our scrapbook'], scrapbook:['song.html','Next: a song for you'], song:['final.html','Next: the last part']};

// ---- guard: must enter the passcode first ----
if (PAGE !== 'cover' && sessionStorage.getItem('unlocked') !== '1') location.replace('index.html');

// ---- music (keeps playing from the same spot on every page) ----
const bgm = new Audio('assets/song.mp3');
bgm.loop = true; bgm.volume = 0.5;
bgm.muted = localStorage.getItem('bgm_m') === '1';
const startMusic = () => bgm.play().catch(() => {});
if (PAGE !== 'cover') {
  bgm.addEventListener('loadedmetadata', () => { bgm.currentTime = +localStorage.getItem('bgm_t') || 0; }, {once:true});
  bgm.play().catch(() => addEventListener('pointerdown', startMusic, {once:true}));  // if the browser blocks it, any tap starts it
}
const saveTime = () => localStorage.setItem('bgm_t', bgm.currentTime);
setInterval(() => { if (!bgm.paused) saveTime(); }, 500);
addEventListener('pagehide', saveTime);

// pause the song while a voice note / the video plays
document.addEventListener('play', e => { if (!bgm.paused) bgm.pause(); }, true);
const resume = () => {
  const busy = [...document.querySelectorAll('audio,video')].some(m => !m.paused && !m.ended);
  if (!busy && !bgm.muted && PAGE !== 'cover') startMusic();
};
document.addEventListener('pause', resume, true);
document.addEventListener('ended', resume, true);

// ---- navbar + next button ----
if (PAGE !== 'cover') {
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `<span class="brand">4th motmot</span>
    <button class="mute" aria-label="Mute or unmute music"></button>`;
  document.body.prepend(nav);
  const btn = nav.querySelector('.mute');
  const paint = () => btn.textContent = bgm.muted ? '🔇' : '🔊';
  paint();
  btn.addEventListener('click', () => {
    bgm.muted = !bgm.muted;
    localStorage.setItem('bgm_m', bgm.muted ? '1' : '0');
    if (!bgm.muted) startMusic();
    paint();
  });
  if (NEXT[PAGE]) {
    const w = document.createElement('div');
    w.className = 'next-wrap';
    w.innerHTML = `<a class="btn" href="${NEXT[PAGE][0]}">${NEXT[PAGE][1]}</a>`;
    document.querySelector('main').append(w);
  }
  // fade out when moving between pages
  document.querySelectorAll('a[href$=".html"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => location.href = a.href, 450);
  }));
}

// ---- day/night theme follows HER time (Sydney: day = 6 AM to 6 PM) ----
function applyTheme() {
  const h = +new Intl.DateTimeFormat('en-US', {timeZone: TZ_SY, hour: 'numeric', hour12: false}).format(new Date()) % 24;
  const day = h >= 6 && h < 18;
  document.body.dataset.theme = day ? 'day' : 'night';
  const note = document.getElementById('themeNote');
  if (note) note.textContent = day ? "☀️ it's daytime in Sydney right now" : "🌙 it's nighttime in Sydney right now";
}
applyTheme(); setInterval(applyTheme, 60000);

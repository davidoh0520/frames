const catalog = document.getElementById('catalog');
const modal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');
const searchInput = document.getElementById('searchInput');
const seriesFilter = document.getElementById('seriesFilter');
const heroPanel = document.getElementById('heroPanel');

function allProducts(){ return PRODUCT_SERIES.flatMap(s => s.items.map(p => ({...p, seriesName:s.name, seriesSubtitle:s.subtitle}))); }
function esc(s){ return String(s||'').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function quoteHref(p){
  const text = `Hello, I'm interested in LZN Model ${p.model} (${p.seriesName}). Please send me a quotation.\n\nModel: ${p.model}\nSize: ${p.sizeCode || ''}\nCompany:\nCountry:\nQuantity:`;
  return `https://wa.me/821063175840?text=${encodeURIComponent(text)}`;
}

function setUrlState(model, color){
  const url = new URL(window.location.href);
  if(model) url.searchParams.set('model', model);
  if(color) url.searchParams.set('color', color);
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}
function getUrlState(){
  const url = new URL(window.location.href);
  return { model: url.searchParams.get('model'), color: url.searchParams.get('color') };
}

function render(){
  const q = searchInput.value.trim();
  const sf = seriesFilter.value;
  catalog.innerHTML = PRODUCT_SERIES.map(series => {
    let items = series.items.filter(p => (!q || p.model.includes(q)) && (sf==='all' || p.series===sf));
    if(!items.length) return '';
    return `<section class="series" id="series-${series.code}">
      <div class="series-head">
        <div><p class="eyebrow">${esc(series.subtitle)}</p><h2>${esc(series.name)}</h2><p>Shop cards with model details, size specs, and clickable color options.</p></div>
        <div class="count">${items.length} Models</div>
      </div>
      <div class="grid">${items.map(card).join('')}</div>
    </section>`;
  }).join('');
  document.querySelectorAll('[data-model]').forEach(el => {
    el.addEventListener('click', () => openProduct(el.dataset.model));
    el.addEventListener('keydown', e => { if(e.key==='Enter') openProduct(el.dataset.model); });
  });
}

function card(p){
  const colorChips = p.colors.slice(0,5).map(c => `<span class="chip">${esc(c.en)}</span>`).join('');
  return `<article class="card" data-model="${p.model}" tabindex="0">
    <div class="card-img"><img src="${esc(p.title)}" alt="Model ${p.model}"></div>
    <div class="card-body"><div class="card-kicker">${p.series} Series</div><h3>${p.model}</h3><p class="card-title">${esc(p.productTitle)}</p><p class="card-desc">${esc(p.short)}</p><div class="chips">${colorChips}</div></div>
  </article>`;
}

function sizeSpecTable(p){
  if(!p.specs) return '';
  const rows = [
    ['Size Code', p.sizeCode],
    ['Frame Width', p.specs.frameWidth],
    ['Lens Width', p.specs.lensWidth],
    ['Lens Height', p.specs.lensHeight],
    ['Bridge', p.specs.bridge],
    ['Temple Length', p.specs.templeLength],
    ['Weight', p.specs.weight]
  ];
  return `<div class="spec-table size-only">${rows.map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>`;
}

function generalSpecTable(p){
  const rows = [
    ['Material', p.material],
    ['Frame Type', p.frameType],
    ['Gender', p.gender],
    ['Origin', p.origin]
  ];
  return `<div class="spec-table general-only">${rows.map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>`;
}


function openProduct(model){
  const p = allProducts().find(x => x.model === model);
  if(!p) return;
  setUrlState(p.model);
  modalContent.innerHTML = `<div class="detail">
    <section class="detail-head">
      <div class="detail-copy"><p class="eyebrow">${esc(p.seriesName)}</p><h2>Model ${esc(p.model)}</h2><h3>${esc(p.productTitle)}</h3><p>${esc(p.short)}</p><p>${esc(p.description)}</p><a class="btn primary" href="${quoteHref(p)}" target="_blank" rel="noopener">Request Quotation</a></div>
      <div class="detail-img"><img src="${esc(p.title)}" alt="Model ${esc(p.model)} main image"></div>
    </section>
    <section class="feature-grid hinge-grid">
      ${p.sub1 ? `<div class="feature"><h4>Outer Hinge Detail</h4><p>Exterior hinge construction engineered for durability and stable fitting.</p><img src="${esc(p.sub1)}" alt="Model ${esc(p.model)} outer hinge detail"></div>` : ''}
      ${p.sub2 ? `<div class="feature"><h4>Inner Hinge Detail</h4><p>Internal hinge finishing designed for a clean fit and smooth wearing comfort.</p><img src="${esc(p.sub2)}" alt="Model ${esc(p.model)} inner hinge detail"></div>` : ''}
    </section>
    <section class="spec size-section"><div class="size-image">${p.sub3 ? `<img src="${esc(p.sub3)}" alt="Model ${esc(p.model)} size reference image">` : ''}</div><div class="size-data"><h4>Size Specification</h4>${sizeSpecTable(p)}<p class="note">Measurements may vary slightly depending on the measuring method.</p></div></section>
    <section class="spec general-section"><h4>Product Information</h4>${generalSpecTable(p)}</section>
    <section class="colors"><h4>Available Colors</h4><p class="note">Click a color option to view it larger.</p><div class="color-grid">${p.colors.map(c => `<button class="color-card" type="button" data-color-src="${esc(c.src)}" data-color-name="${esc(c.en)}" data-color-ko="${esc(c.ko)}" data-color-model="${esc(p.model)}" data-color-key="${esc(c.key)}"><img src="${esc(c.src)}" alt="${esc(p.model)} ${esc(c.en)}"><strong>${esc(c.en)}</strong><span>${esc(c.ko)}</span></button>`).join('')}</div></section>
  </div>`;
  modal.classList.add('active'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  modal.querySelectorAll('[data-color-src]').forEach(el => el.addEventListener('click', () => openColorViewer(el.dataset.colorSrc, el.dataset.colorModel, el.dataset.colorName, el.dataset.colorKo, el.dataset.colorKey)));
}
function openColorViewer(src, model, name, ko, key){
  setUrlState(model, key);
  const viewer=document.createElement('div');
  viewer.className='color-viewer active';
  viewer.innerHTML=`<div class="color-viewer-backdrop" data-viewer-close></div><div class="color-viewer-card"><button class="close viewer-close" type="button" data-viewer-close aria-label="Close">×</button><img src="${esc(src)}" alt="Model ${esc(model)} ${esc(name)}"><div class="color-viewer-caption"><strong>Model ${esc(model)} · ${esc(name)}</strong><span>${esc(ko)}</span></div></div>`;
  document.body.appendChild(viewer);
  viewer.querySelectorAll('[data-viewer-close]').forEach(el=>el.addEventListener('click',()=>viewer.remove()));
}
function closeModal(){ modal.classList.remove('active'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
modal.addEventListener('click', e => { if(e.target.dataset.close !== undefined) closeModal(); });
document.addEventListener('keydown', e => { if(e.key==='Escape'){ document.querySelectorAll('.color-viewer').forEach(v=>v.remove()); if(modal.classList.contains('active')) closeModal(); } });
searchInput.addEventListener('input', render); seriesFilter.addEventListener('change', render);

const first = PRODUCT_SERIES[0]?.items[0]; if(first) heroPanel.innerHTML = `<img src="${first.title}" alt="Featured LZN frame">`;
render();
const initial = getUrlState();
if(initial.model){
  openProduct(initial.model);
  if(initial.color){
    const p = allProducts().find(x => x.model === initial.model);
    const c = p?.colors.find(x => x.key === initial.color);
    if(c) setTimeout(() => openColorViewer(c.src, p.model, c.en, c.ko, c.key), 100);
  }
}

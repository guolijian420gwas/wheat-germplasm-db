/* ============================================================
   小麦种质资源数据库 — 交互脚本
   功能: 数据加载、搜索过滤、卡片渲染、分页、详情弹窗
   ============================================================ */

// ---------- 全局状态 ----------
const PAGE_SIZE = 20;              // 每页显示条数
let allData = [];                  // 全部数据
let filteredData = [];             // 筛选后的数据
let currentPage = 1;               // 当前页码

// ---------- DOM 元素缓存 ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const searchInput   = $('#searchInput');
const searchBtn     = $('#searchBtn');
const filterProvince = $('#filterProvince');
const filterYearStart = $('#filterYearStart');
const filterYearEnd  = $('#filterYearEnd');
const resetBtn      = $('#resetBtn');
const resultCount   = $('#resultCount');
const cardGrid      = $('#cardGrid');
const pagination    = $('#pagination');
const loadingEl     = $('#loadingIndicator');
const detailModal   = $('#detailModal');
const modalBody     = $('#modalBody');
const modalClose    = $('#modalClose');
const navToggle     = $('#navToggle');
const navLinks      = document.querySelector('.nav-links');

// ---------- 数据加载 ----------
async function loadData() {
  try {
    loadingEl.style.display = 'flex';
    cardGrid.innerHTML = '';
    const resp = await fetch('assets/wheat_data.json');
    if (!resp.ok) throw new Error('数据加载失败');
    allData = await resp.json();
    // 填充省份下拉框
    const provinces = [...new Set(allData.map(d => d.province))].sort();
    provinces.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      filterProvince.appendChild(opt);
    });
    applyFilters();
  } catch (err) {
    loadingEl.innerHTML = '<p style="color:#ff5252;">⚠️ 数据加载失败，请检查 assets/wheat_data.json 文件是否存在</p>';
    console.error(err);
  } finally {
    loadingEl.style.display = 'none';
  }
}

// ---------- 筛选逻辑 ----------
function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const province = filterProvince.value;
  const yearStart = parseInt(filterYearStart.value) || 0;
  const yearEnd = parseInt(filterYearEnd.value) || 9999;

  filteredData = allData.filter(item => {
    if (keyword && !item.name.toLowerCase().includes(keyword)) return false;
    if (province && item.province !== province) return false;
    if (item.year < yearStart || item.year > yearEnd) return false;
    return true;
  });

  currentPage = 1;
  renderCards();
  renderPagination();
  resultCount.textContent = filteredData.length;
}

// ---------- 渲染卡片 ----------
function renderCards() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const page = filteredData.slice(start, start + PAGE_SIZE);

  if (page.length === 0) {
    cardGrid.innerHTML = '<div class="loading"><p>😕 没有找到匹配的种质资源，请调整筛选条件</p></div>';
    return;
  }

  cardGrid.innerHTML = page.map((d, i) => `
    <div class="card" data-index="${start + i}" onclick="openDetail(${start + i})">
      <!-- 品种名称和省份 -->
      <div class="card-header">
        <span class="card-name">${escapeHtml(d.name)}</span>
        <span class="card-province">${escapeHtml(d.province)}</span>
      </div>
      <!-- 年代信息 -->
      <div class="card-meta">🕐 年代: ${d.year}</div>
      <!-- 核心指标预览 -->
      <div class="card-traits">
        <div class="trait-item">
          <span class="trait-label">株高</span>
          <span class="trait-value">${d.plant_height} cm</span>
        </div>
        <div class="trait-item">
          <span class="trait-label">千粒重</span>
          <span class="trait-value">${d.tkw} g</span>
        </div>
        <div class="trait-item">
          <span class="trait-label">穗粒数</span>
          <span class="trait-value">${d.grain_num}</span>
        </div>
        <div class="trait-item">
          <span class="trait-label">单株产量</span>
          <span class="trait-value">${d.yield_per_plant} g</span>
        </div>
        <div class="trait-item">
          <span class="trait-label">蛋白含量</span>
          <span class="trait-value">${d.protein}%</span>
        </div>
        <div class="trait-item">
          <span class="trait-label">湿面筋</span>
          <span class="trait-value">${d.gluten}%</span>
        </div>
      </div>
      <span class="card-more">点击查看完整数据 →</span>
    </div>
  `).join('');
}

// ---------- 渲染分页 ----------
function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹ 上一页</button>`;

  // 显示页码（最多显示7个）
  let pages = [];
  if (totalPages <= 7) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    let startP = Math.max(2, currentPage - 1);
    let endP = Math.min(totalPages - 1, currentPage + 1);
    // 让范围始终有3个
    if (currentPage <= 3) endP = 4;
    if (currentPage >= totalPages - 2) startP = totalPages - 3;
    for (let i = startP; i <= endP; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  pages.forEach(p => {
    if (p === '...') {
      html += '<span class="page-btn" style="border:none;cursor:default;">…</span>';
    } else {
      html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
    }
  });

  html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页 ›</button>`;
  pagination.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderCards();
  renderPagination();
  // 滚动到数据库区域
  $('#database').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- 详情弹窗 ----------
function openDetail(index) {
  const d = filteredData[index];
  if (!d) return;

  // 抗病性状的中文描述
  const rustLevel = d.stripe_rust <= 3 ? '抗病' : d.stripe_rust <= 5 ? '中抗' : d.stripe_rust <= 7 ? '中感' : '感病';
  const pmLevel = d.powdery_mildew <= 3 ? '抗病' : d.powdery_mildew <= 5 ? '中抗' : d.powdery_mildew <= 7 ? '中感' : '感病';

  modalBody.innerHTML = `
    <h2 class="detail-title">${escapeHtml(d.name)}</h2>
    <div class="detail-meta">🕐 年代: ${d.year} &nbsp;|&nbsp; 📍 省份: ${escapeHtml(d.province)}</div>
    <div class="detail-grid">
      <!-- 产量性状 -->
      <div class="detail-group-title">🌾 产量性状</div>
      <div class="detail-row"><span class="detail-label">抽穗期</span><span class="detail-value">${d.heading_days} 天</span></div>
      <div class="detail-row"><span class="detail-label">扬花期</span><span class="detail-value">${d.flowering_days} 天</span></div>
      <div class="detail-row"><span class="detail-label">株高</span><span class="detail-value">${d.plant_height} cm</span></div>
      <div class="detail-row"><span class="detail-label">穗长</span><span class="detail-value">${d.spike_length} cm</span></div>
      <div class="detail-row"><span class="detail-label">小穗数</span><span class="detail-value">${d.spikelet_num}</span></div>
      <div class="detail-row"><span class="detail-label">穗粒数</span><span class="detail-value">${d.grain_num}</span></div>
      <div class="detail-row"><span class="detail-label">千粒重</span><span class="detail-value">${d.tkw} g</span></div>
      <div class="detail-row"><span class="detail-label">粒长</span><span class="detail-value">${d.grain_length} mm</span></div>
      <div class="detail-row"><span class="detail-label">粒宽</span><span class="detail-value">${d.grain_width} mm</span></div>
      <div class="detail-row"><span class="detail-label">粒厚</span><span class="detail-value">${d.grain_thick} mm</span></div>
      <div class="detail-row"><span class="detail-label">单株产量</span><span class="detail-value">${d.yield_per_plant} g</span></div>

      <!-- 抗病性状 -->
      <div class="detail-group-title">🛡️ 抗病性状</div>
      <div class="detail-row"><span class="detail-label">条锈病 (1-9级)</span><span class="detail-value">${d.stripe_rust} (${rustLevel})</span></div>
      <div class="detail-row"><span class="detail-label">白粉病 (1-9级)</span><span class="detail-value">${d.powdery_mildew} (${pmLevel})</span></div>

      <!-- 抗旱性状 -->
      <div class="detail-group-title">💧 抗旱性状</div>
      <div class="detail-row"><span class="detail-label">存活率</span><span class="detail-value">${d.survival_rate}%</span></div>

      <!-- 抗寒性状 -->
      <div class="detail-group-title">❄️ 抗寒性状</div>
      <div class="detail-row"><span class="detail-label">叶片黄化率</span><span class="detail-value">${d.leaf_yellowing}%</span></div>

      <!-- 品质性状 -->
      <div class="detail-group-title">🍞 品质性状</div>
      <div class="detail-row"><span class="detail-label">蛋白含量</span><span class="detail-value">${d.protein}%</span></div>
      <div class="detail-row"><span class="detail-label">湿面筋含量</span><span class="detail-value">${d.gluten}%</span></div>
      <div class="detail-row"><span class="detail-label">沉降值</span><span class="detail-value">${d.sedimentation} ml</span></div>
    </div>
  `;

  detailModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  detailModal.classList.remove('active');
  document.body.style.overflow = '';
}

// ---------- 工具函数：HTML 转义 ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- 事件绑定 ----------
searchBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyFilters();
});
filterProvince.addEventListener('change', applyFilters);
filterYearStart.addEventListener('change', applyFilters);
filterYearEnd.addEventListener('change', applyFilters);
resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  filterProvince.value = '';
  filterYearStart.value = '';
  filterYearEnd.value = '';
  applyFilters();
});

modalClose.addEventListener('click', closeDetail);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeDetail();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetail();
});

// 移动端菜单切换
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// 点击导航链接后关闭移动端菜单
$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    // 高亮当前链接
    $$('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// 导航栏滚动阴影
window.addEventListener('scroll', () => {
  const navbar = $('#navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // 滚动时高亮当前区块对应的导航链接
  const sections = ['home', 'database', 'contact'];
  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 100) {
      current = id;
    }
  });
  $$('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// ---------- 启动 ----------
loadData();

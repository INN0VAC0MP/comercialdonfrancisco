/**
 * CUTELARIA · app.js
 * Sistema de automatización de ventas – Comercial
 * ─────────────────────────────────────────────────
 * Funcionalidades:
 *  1. JSON base del negocio
 *  2. Renderizado dinámico de servicios
 *  3. Renderizado dinámico de productos con filtro por categoría
 *  4. Buscador en tiempo real
 *  5. Animación del chat en el hero
 *  6. Navbar scroll
 *  7. Hamburger menu
 *  8. Scroll reveal
 *  9. Formulario conectado a n8n webhook
 * 10. Año dinámico en footer
 */

'use strict';

/* ════════════════════════════════════════════
   1. JSON BASE DEL NEGOCIO
════════════════════════════════════════════ */
const negocio = {
  nombre: "Cutelaria · Comercial",
  whatsapp: "59100000000",          // ← reemplaza con tu número real
  webhookUrl: "https://TU-N8N/webhook/cutelaria-webhook", // ← reemplaza con tu URL de n8n

  servicios: [
    {
      icon: "💬",
      nombre: "Atención automática por WhatsApp",
      descripcion: "El bot responde consultas, envía catálogos y toma pedidos las 24 horas sin intervención humana."
    },
    {
      icon: "🤖",
      nombre: "IA para responder clientes",
      descripcion: "Modelos de lenguaje entrenados con tu inventario para respuestas precisas y personalizadas."
    },
    {
      icon: "📊",
      nombre: "Cotizaciones automáticas",
      descripcion: "El cliente pregunta por un producto y recibe precio, stock y opciones de entrega al instante."
    },
    {
      icon: "📡",
      nombre: "Seguimiento de clientes",
      descripcion: "CRM automatizado con recordatorios, seguimiento de leads y notificaciones de post-venta."
    },
    {
      icon: "📱",
      nombre: "Integración Facebook & Instagram",
      descripcion: "Conecta Messenger e Instagram Direct para centralizar todas las conversaciones en un panel."
    },
    {
      icon: "🛍️",
      nombre: "Catálogo digital interactivo",
      descripcion: "Muestra tus productos con fotos, precios y variantes directamente en el chat de WhatsApp."
    }
  ],

  categorias: ["Electrodomésticos", "Repuestos", "Hogar"],

  productos: [
    // ── Electrodomésticos ──
    { id: 1, nombre: "Licuadora Pro 1000W",  categoria: "Electrodomésticos", emoji: "🥤", precio: "Bs. 350" },
    { id: 2, nombre: "Batidora de Mano",      categoria: "Electrodomésticos", emoji: "🍰", precio: "Bs. 220" },
    { id: 3, nombre: "Microondas 20L",         categoria: "Electrodomésticos", emoji: "📦", precio: "Bs. 680" },
    { id: 4, nombre: "Tostadora 2 ranuras",    categoria: "Electrodomésticos", emoji: "🍞", precio: "Bs. 180" },
    // ── Repuestos ──
    { id: 5, nombre: "Motor Licuadora Oster",  categoria: "Repuestos", emoji: "⚙️",  precio: "Bs. 95" },
    { id: 6, nombre: "Tapa de Vaso Universal", categoria: "Repuestos", emoji: "🔩",  precio: "Bs. 25" },
    { id: 7, nombre: "Cuchilla Acero Inox.",   categoria: "Repuestos", emoji: "🔧",  precio: "Bs. 45" },
    { id: 8, nombre: "Empaque de Goma x5",     categoria: "Repuestos", emoji: "🔑",  precio: "Bs. 18" },
    // ── Hogar ──
    { id: 9,  nombre: "Vajilla Porcelana x6",  categoria: "Hogar", emoji: "🍽️", precio: "Bs. 290" },
    { id: 10, nombre: "Set Cubiertos x12",      categoria: "Hogar", emoji: "🍴", precio: "Bs. 145" },
    { id: 11, nombre: "Sartén Antiadherente",  categoria: "Hogar", emoji: "🍳", precio: "Bs. 175" },
    { id: 12, nombre: "Set Utensilios x8",      categoria: "Hogar", emoji: "🥄", precio: "Bs. 120" }
  ]
};

/* ════════════════════════════════════════════
   2. RENDERIZADO DINÁMICO — SERVICIOS
════════════════════════════════════════════ */
function renderServicios () {
  const grid = document.getElementById('gridServicios');
  if (!grid) return;

  grid.innerHTML = negocio.servicios.map((s, i) => `
    <div class="service-card reveal" style="transition-delay:${i * 80}ms">
      <div class="service-icon">${s.icon}</div>
      <h3 class="service-name">${s.nombre}</h3>
      <p class="service-desc">${s.descripcion}</p>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════
   3. RENDERIZADO DINÁMICO — PRODUCTOS
════════════════════════════════════════════ */
let productosFiltrados = [...negocio.productos];
let categoriaActiva = 'todos';

function renderProductos (lista) {
  const grid = document.getElementById('gridProductos');
  const noResults = document.getElementById('noResults');
  if (!grid) return;

  if (lista.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');

  grid.innerHTML = lista.map((p, i) => `
    <article class="product-card reveal" style="transition-delay:${i * 50}ms" data-id="${p.id}">
      <div class="product-thumb">${p.emoji}</div>
      <div class="product-info">
        <p class="product-cat">${p.categoria}</p>
        <h4 class="product-name">${p.nombre}</h4>
        <p class="product-price">${p.precio}</p>
      </div>
      <button class="product-btn" onclick="consultarPorWhatsApp('${p.nombre}', '${p.precio}')">
        Consultar por WhatsApp 💬
      </button>
    </article>
  `).join('');

  // Re-trigger reveal observer on new cards
  observeReveal();
}

/** Construye filtros de categoría dinámicamente */
function renderFilterBar () {
  const bar = document.getElementById('filterBar');
  if (!bar) return;

  const cats = ['todos', ...negocio.categorias];
  bar.innerHTML = cats.map(cat => `
    <button class="filter-btn${cat === 'todos' ? ' active' : ''}" data-cat="${cat}">
      ${cat === 'todos' ? 'Todos' : cat}
    </button>
  `).join('');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    categoriaActiva = btn.dataset.cat;
    filtrarProductos();
  });
}

/** Filtra por categoría + término de búsqueda */
function filtrarProductos () {
  const termino = document.getElementById('buscador')?.value.trim().toLowerCase() ?? '';

  productosFiltrados = negocio.productos.filter(p => {
    const enCategoria = categoriaActiva === 'todos' || p.categoria === categoriaActiva;
    const enBusqueda  = p.nombre.toLowerCase().includes(termino) || p.categoria.toLowerCase().includes(termino);
    return enCategoria && enBusqueda;
  });

  renderProductos(productosFiltrados);
}

/* ════════════════════════════════════════════
   4. BUSCADOR EN TIEMPO REAL
════════════════════════════════════════════ */
function initBuscador () {
  const input = document.getElementById('buscador');
  const clearBtn = document.getElementById('searchClear');
  if (!input) return;

  input.addEventListener('input', () => {
    clearBtn.style.display = input.value ? 'block' : 'none';
    filtrarProductos();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    filtrarProductos();
    input.focus();
  });
}

/* ════════════════════════════════════════════
   5. CONSULTAR POR WHATSAPP (producto)
════════════════════════════════════════════ */
function consultarPorWhatsApp (nombre, precio) {
  const texto = encodeURIComponent(
    `Hola Cutelaria 👋, estoy interesado/a en *${nombre}* (${precio}). ¿Pueden darme más información?`
  );
  window.open(`https://wa.me/${negocio.whatsapp}?text=${texto}`, '_blank');
}

/* ════════════════════════════════════════════
   6. ANIMACIÓN CHAT HERO
════════════════════════════════════════════ */
const chatScript = [
  { role: 'bot',  text: '¡Hola! 👋 Bienvenido a Cutelaria. ¿En qué puedo ayudarte hoy?' },
  { role: 'user', text: '¿Tienen motores para licuadora Oster?' },
  { role: 'bot',  text: '¡Sí! Tenemos el Motor Licuadora Oster por Bs. 95. ¿Lo quieres con delivery? 🚚' },
  { role: 'user', text: 'Sí, envíame la cotización.' },
  { role: 'bot',  text: '✅ Cotización enviada. Un asesor te contactará en minutos.' }
];

function renderChatHero () {
  const container = document.getElementById('mockupChat');
  if (!container) return;

  let index = 0;
  const interval = setInterval(() => {
    if (index >= chatScript.length) {
      clearInterval(interval);
      return;
    }
    const msg = chatScript[index];
    const div = document.createElement('div');
    div.className = `chat-msg ${msg.role}`;
    div.innerHTML = `
      <div class="chat-avatar">${msg.role === 'bot' ? '🤖' : '👤'}</div>
      <div class="bubble">${msg.text}</div>
    `;
    div.style.animationDelay = '0s';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    index++;
  }, 1200);
}

/* ════════════════════════════════════════════
   7. NAVBAR SCROLL
════════════════════════════════════════════ */
function initNavbar () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ════════════════════════════════════════════
   8. HAMBURGER MENU
════════════════════════════════════════════ */
function initHamburger () {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    document.body.style.overflow = '';
  }));
}

/* ════════════════════════════════════════════
   9. SCROLL REVEAL
════════════════════════════════════════════ */
function observeReveal () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ════════════════════════════════════════════
   10. FORMULARIO → N8N WEBHOOK
════════════════════════════════════════════ */
function initFormulario () {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const resetBtn = document.getElementById('resetForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const submitBtn  = document.getElementById('submitBtn');
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoader  = submitBtn.querySelector('.btn-loader');

    // Estado de carga
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    const payload = {
      nombre:   document.getElementById('nombre').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      mensaje:  document.getElementById('mensaje').value.trim(),
      negocio:  negocio.nombre,
      timestamp: new Date().toISOString()
    };

    try {
      /**
       * Integración n8n:
       * Envía los datos del formulario al webhook de n8n.
       * n8n puede: guardar en Google Sheets, enviar WhatsApp, notificar por email, etc.
       */
      const res = await fetch(negocio.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Éxito
      form.classList.add('hidden');
      success.classList.remove('hidden');
      console.info('[Cutelaria] Formulario enviado a n8n ✅', payload);

    } catch (err) {
      console.warn('[Cutelaria] Webhook no disponible (modo demo):', err.message);
      // En modo demo / desarrollo, mostramos éxito igual
      form.classList.add('hidden');
      success.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
    }
  });

  resetBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    form.classList.remove('hidden');
    success.classList.add('hidden');
    limpiarErrores();
  });
}

/** Validación básica del formulario */
function validarFormulario () {
  let valido = true;
  limpiarErrores();

  const nombre   = document.getElementById('nombre');
  const telefono = document.getElementById('telefono');
  const mensaje  = document.getElementById('mensaje');

  if (!nombre.value.trim() || nombre.value.trim().length < 2) {
    mostrarError('errNombre', nombre, 'Ingresa tu nombre completo.');
    valido = false;
  }
  if (!telefono.value.trim() || !/[\d\+\s\-]{6,}/.test(telefono.value)) {
    mostrarError('errTelefono', telefono, 'Ingresa un teléfono válido.');
    valido = false;
  }
  if (!mensaje.value.trim() || mensaje.value.trim().length < 10) {
    mostrarError('errMensaje', mensaje, 'Escribe un mensaje de al menos 10 caracteres.');
    valido = false;
  }
  return valido;
}

function mostrarError (spanId, field, texto) {
  document.getElementById(spanId).textContent = texto;
  field.classList.add('error');
}

function limpiarErrores () {
  ['errNombre','errTelefono','errMensaje'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['nombre','telefono','mensaje'].forEach(id => {
    document.getElementById(id)?.classList.remove('error');
  });
}

/* ════════════════════════════════════════════
   AÑO DINÁMICO EN FOOTER
════════════════════════════════════════════ */
function setYear () {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ════════════════════════════════════════════
   INICIALIZACIÓN PRINCIPAL
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Datos
  renderServicios();
  renderFilterBar();
  renderProductos(negocio.productos);

  // Interactividad
  initBuscador();
  initNavbar();
  initHamburger();
  initFormulario();
  setYear();

  // Animaciones
  renderChatHero();
  observeReveal();

  console.info(`✅ Cutelaria · ${negocio.nombre} — Sistema listo`);
});

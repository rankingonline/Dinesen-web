/* ═══ Finexen · Landing hoteles — interacción ═══ */
(function () {
  'use strict';
  if (window.__finexenLp) return;
  window.__finexenLp = 1;

  document.body.classList.add('js');
  /* fallback: si el observer no llega a disparar, todo visible a los 2s */
  setTimeout(function () {
    document.querySelectorAll('[data-rv]').forEach(function (el) { el.classList.add('in'); });
  }, 2000);

  /* ═ CONFIG ═ */
  window.FINEXEN_LP = {
    slug: 'finexen-hotels',
    webhook: '',            /* [FALTA] Inbound Webhook de GHL/CRM — definir destino de leads */
    tel: '+34623759018',
    whatsapp: '34623759018'
  };
  var CFG = window.FINEXEN_LP;

  var t0 = performance.now();
  window.dataLayer = window.dataLayer || [];
  function ev(name, extra) {
    try {
      window.dataLayer.push(Object.assign({ event: name, ro_lp: CFG.slug }, extra || {}));
    } catch (e) {}
  }
  ev('ro_lp_view');

  /* sombra del nav al hacer scroll */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* reveals al hacer scroll */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-rv]').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('[data-rv]').forEach(function (el) { el.classList.add('in'); });
  }

  /* eventos de contacto (tel / whatsapp) */
  document.querySelectorAll('[data-ev]').forEach(function (a) {
    a.addEventListener('click', function () {
      ev(a.getAttribute('data-ev'), { href: a.href });
    });
  });

  /* formulario */
  var card = document.querySelector('#form-card');
  if (!card) return;
  var form = card.querySelector('form');
  var msg = form.querySelector('.msg');
  var btn = form.querySelector('button[type=submit]');

  var M = {
    nombre: 'Escribe tu nombre.',
    hotel: 'Escribe el nombre del hotel.',
    email: 'Revisa el email: no parece válido.',
    telefono: 'Revisa el teléfono (9–15 dígitos).',
    consent: 'Necesitamos tu consentimiento para enviarte el benchmark.'
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    msg.classList.remove('ok');

    var hp = form.querySelector('[name=web_empresa]');
    if (hp && hp.value) return;                    /* honeypot */
    if (performance.now() - t0 < 3000) return;     /* demasiado rápido = bot */

    var bad = null;
    ['nombre', 'hotel', 'email', 'telefono', 'consent'].some(function (n) {
      var el = form.querySelector('[name=' + n + ']');
      if (el && !el.checkValidity()) { bad = n; el.focus(); return true; }
      return false;
    });
    if (bad) { msg.textContent = M[bad]; return; }

    var data = {
      nombre: form.nombre.value.trim(),
      hotel: form.hotel.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      habitaciones: (form.habitaciones && form.habitaciones.value.trim()) || '',
      consent: true,
      consent_ts: new Date().toISOString(),
      pagina: location.href,
      utm: location.search.slice(1),
      origen: 'landing-finexen-hotels'
    };

    btn.disabled = true;
    btn.textContent = 'Enviando…';

    function ok() {
      card.classList.add('done');
      ev('lead', { form: 'benchmark' });
    }
    function ko() {
      btn.disabled = false;
      btn.textContent = 'Quiero mi benchmark →';
      msg.textContent = 'No se pudo enviar. Escríbenos a info@finexen.com o llama al +34 623 759 018.';
    }

    if (!CFG.webhook) {
      console.warn('FINEXEN_LP.webhook [FALTA] — modo demo: no se envía a CRM');
      setTimeout(ok, 600);
      return;
    }
    fetch(CFG.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { if (r.ok) { ok(); } else { ko(); } }).catch(ko);
  });
})();

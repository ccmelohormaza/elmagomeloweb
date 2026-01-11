// ===============================
// RESERVAS.JS (FASE 3: clases + motor de reglas)
// FIX: evita loops de change + respeta display:none inline + invalid en custom-select
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const isVisible = (el) => !!(el && el.offsetParent !== null);

  const form = document.querySelector(".booking__form");
  const servicioSelect = $("servicio");
  if (!form || !servicioSelect) return;

  // Guard anti-loop
  let isApplying = false;

  // ===============================
  // Helpers para custom-select (marcar rojo el TRIGGER)
  // ===============================
  const getSelectTrigger = (selectEl) => {
    if (!selectEl) return null;
    const cs = selectEl.closest(".custom-select");
    return cs ? cs.querySelector(".custom-select__trigger") : null;
  };

  const getInvalidTarget = (el) => {
    if (!el) return null;
    if (el.type === "checkbox") return el.closest(".termsRow") || el;
    if (el.tagName === "SELECT") return getSelectTrigger(el) || el;
    return el;
  };


  // ===============================
  // Show/Hide (FIX display:none inline)
  // ===============================
  const showEl = (el) => {
    if (!el) return;
    el.classList.remove("is-hidden");
    if (el.style && el.style.display === "none") el.style.display = "";
    if (el.classList.contains("anim")) el.classList.add("is-visible");
  };

  const hideEl = (el) => {
    if (!el) return;
    if (el.classList.contains("anim")) {
      el.classList.remove("is-visible");
      setTimeout(() => {
        el.classList.add("is-hidden");
        el.style.display = "none";
      }, 240);
    } else {
      el.classList.add("is-hidden");
      el.style.display = "none";
    }
  };

  const resetFieldValue = (el) => {
    if (!el) return;

    // IMPORTANTE: no dispares "change" aquí (evita loops)
    if (el.tagName === "SELECT") {
      el.selectedIndex = 0;
      el.dispatchEvent(new Event("options:changed", { bubbles: true }));
      return;
    }

    if (el.type === "checkbox" || el.type === "radio") {
      el.checked = false;
      return;
    }

    el.value = "";
  };

  const hideAndReset = (fieldEl) => {
    if (!fieldEl) return;
    hideEl(fieldEl);
    fieldEl.querySelectorAll("input, select, textarea").forEach((el) => {
      el.required = false;
      resetFieldValue(el);
      clearInvalid(el);
    });
  };

  // ===============================
  // ELEMENTOS
  // ===============================
  const preview = $("service-preview");

  const nombre = $("nombre");
  const email = $("email");
  const phone = $("phone");
  const ciudadSelect = $("ciudad");
  const barrio = $("barrio");
  const direccion = $("direccion");
  const fechaInput = $("fecha");
  const horaInput = $("Hora");
  const terminos = $("acepta_terminos");

  const otraCiudadField = $("otraCiudadField");
  const otraCiudadInput = $("otra_ciudad");
  const notaViaticos = $("notaViaticos");

  const celebracionField = $("celebracionField");
  const celebracionInput = $("celebracion");

  const personasField = $("personasField");
  const personasSelect = $("cantidad_personas");

  const edadField = $("edadField");
  const edadSelect = $("edad_publico");
  const notaAdultos = $("notaAdultos");

  const discapacidadField = $("discapacidadField");
  const tieneDiscapacidad = $("tiene_discapacidad");
  const detalleDiscapacidadField = $("detalleDiscapacidadField");
  const detalleDiscapacidadInput = $("detalle_discapacidad");

  const detalleField = $("detalleField");
  const detalleSelect = $("detalle_si_no");
  const detalleCualField = $("detalleCualField");
  const detalleCualInput = $("detalle_cual");

  const restauranteField = $("restauranteField");
  const restauranteInput = $("nombre_restaurante");

  // ===============================
  // PREVIEW SERVICIOS
  // ===============================
  const servicesData = {
    magia_cerca_adultos: {
      title: "Show de magia de cerca para adultos",
      desc: "Se realiza sobre una mesa, con los espectadores al frente en un semicírculo alrededor. Incluye magia, comedia y mentalismo con objetos pequeños.",
      events: "Cumpleaños en casa, novenas, cenas navideñas, asados, reuniones familiares.",
      img: "magiadecerca.png",
      badges: ["45 min", "Edad mínima 12", "Público max 35", "Precio 380K"]
    },
    magia_salon_adultos: {
      title: "Show de magia de salón para adultos",
      desc: "Es un show que se realiza de pie frente al público. Incluye magia, mentalismo y comedia.",
      events: "Cumpleaños, eventos empresariales, reuniones sociales, celebraciones especiales, cenas formales, eventos culturales.",
      img: "salon.png",
      badges: ["45 min", "Edad mínima 12", "Público max 150", "Precio 380K"]
    },
    magia_salon_familiar: {
      title: "Show de magia de salón familiar",
      desc: "Es un show que se realiza de pie frente al público. Incluye magia, mentalismo y comedia.",
      events: "Cumpleaños infantiles, eventos empresariales, reuniones con gran cantidad de niños, celebraciones especiales, eventos culturales.",
      img: "magiainfantil.png",
      badges: ["45 min", "Edad mínima 5", "Público max 60", "Precio 400K"]
    },
    magia_restaurante: {
      title: "Magia de restaurante",
      desc: "Minishows de magia de cerca, comedia y mentalismo en las mesas mientras esperan la comida. Minimiza el tiempo de espera y sirve de publicidad.",
      events: "Restaurantes, cenas especiales, eventos con mesas, activaciones en espacios gastronómicos.",
      img: "Restaurtantes.png",
      badges: ["Tiempo negociable", "Precio negociable"]
    },
    magia_escenario: {
      title: "Magia de escenario",
      desc: "Show en escenario que incluye magia, escapismo, mentalismo y algo de hipnosis.",
      events: "Eventos empresariales, lanzamientos de marca, convenciones y conferencias, networking y galas.",
      img: "escenario .png",
      badges: ["45 min", "Público max 800", "Precio negociable"]
    },
    propuesta_matrimonio: {
      title: "Propuestas de matrimonio con magia",
      desc: "Un show sorpresa que acompaña una propuesta especial, iniciando de forma natural y convirtiendo la magia en un momento personal y emotivo.",
      events: "Propuestas de noviazgo, pedidas de mano, aniversarios y cenas románticas.",
      img: "propuestasdematrimonio.png",
      badges: ["30 min", "Precio 250K"]
    },
    magia_ferias: {
      title: "Magia para ferias",
      desc: "Magia para atraer público al stand o establecimiento.",
      events: "Ferias comerciales, activaciones de marca y eventos empresariales.",
      img: "ferias.png",
      badges: ["Tiempo negociable", "Precio negociable"]
    },
    show_parejas: {
      title: "Show en parejas (salón y/o close-up)",
      desc: "Show realizado por dos artistas. Incluye magia, mentalismo y comedia.",
      events: "Cumpleaños, eventos empresariales, reuniones sociales, celebraciones especiales.",
      img: "showenparejas.png",
      badges: ["45 min", "Edad mínima 12", "Público max 150", "Precio 500K"]
    },
    labor_social: {
      title: "Show para labor social",
      desc: "Shows de magia como parte de iniciativas de labor social, siempre y cuando mi agenda lo permita.",
      events: "Eventos comunitarios, fundaciones, actividades escolares o sociales.",
      img: "laborsocial.jpg",
      badges: ["45 min", "Público max 150", "Precio Gratis"]
    }
  };

  function renderService(key) {
    if (!preview) return;
    const s = servicesData[key];
    if (!s) {
      preview.innerHTML = "";
      return;
    }

    const eventsHtml = s.events
      ? `<p class="service-preview-events"><span class="service-preview-eventsLabel">Tipo de eventos:</span> ${s.events}</p>`
      : "";

    preview.innerHTML = `
      <div class="service-preview-card">
        <div class="service-preview-media">
          <img src="${s.img}" alt="${s.title}">
        </div>
        <div class="service-preview-content">
          <h3 class="service-preview-title">${s.title}</h3>
          <p class="service-preview-desc">${s.desc}</p>
          ${eventsHtml}
          <div class="service-preview-info">
            ${(s.badges || []).map(b => `<span class="service-preview-badge">${b}</span>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  // ===============================
  // CUSTOM SELECT (open-up estable)
  // ===============================
  (function initCustomSelects() {
    const wrappers = Array.from(document.querySelectorAll("[data-select]"));

    function build(cs) {
      const native = cs.querySelector("select");
      const trigger = cs.querySelector(".custom-select__trigger");
      const valueEl = cs.querySelector(".custom-select__value");
      const panel = cs.querySelector(".custom-select__panel");
      if (!native || !trigger || !valueEl || !panel) return;

      const render = () => {
        const opts = Array.from(native.options);
        panel.innerHTML = "";
        for (const opt of opts) {
          const isPlaceholder = opt.disabled && opt.value === "";
          if (isPlaceholder) continue;

          const div = document.createElement("div");
          div.className = "custom-select__option";
          div.textContent = opt.textContent;
          div.dataset.value = opt.value;
          div.setAttribute("role", "option");
          div.tabIndex = -1;

          if (native.value === opt.value) div.classList.add("is-selected");
          panel.appendChild(div);
        }
      };

      valueEl.textContent = native.selectedOptions[0]?.textContent || "Selecciona una opción";
      render();

      function computeDirection() {
        const prev = panel.style.display;
        panel.style.display = "block";
        const rect = cs.getBoundingClientRect();
        const panelHeight = panel.scrollHeight;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < panelHeight + 20 && spaceAbove > spaceBelow) {
          cs.classList.add("open-up");
        } else {
          cs.classList.remove("open-up");
        }
        panel.style.display = prev;
      }

      function open() {
        document.querySelectorAll(".custom-select.is-open").forEach(other => {
          if (other !== cs) other.classList.remove("is-open");
        });

        cs.classList.add("is-open");
        cs.style.zIndex = "9999";
        trigger.setAttribute("aria-expanded", "true");
        computeDirection();
      }

      function close() {
        cs.classList.remove("is-open");
        cs.classList.remove("open-up");
        cs.style.zIndex = "";
        trigger.setAttribute("aria-expanded", "false");
      }

      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        cs.classList.contains("is-open") ? close() : open();
      });

      panel.addEventListener("click", (e) => {
        const opt = e.target.closest(".custom-select__option");
        if (!opt) return;

        native.value = opt.dataset.value;
        valueEl.textContent = opt.textContent;

        panel.querySelectorAll(".custom-select__option").forEach(o => {
          o.classList.toggle("is-selected", o === opt);
        });

        // ahora sí disparamos change SOLO cuando el usuario selecciona
        native.dispatchEvent(new Event("change", { bubbles: true }));
        close();
        trigger.focus();
      });

      native.addEventListener("change", () => {
        valueEl.textContent = native.selectedOptions[0]?.textContent || "Selecciona una opción";
        panel.querySelectorAll(".custom-select__option").forEach(o => {
          o.classList.toggle("is-selected", o.dataset.value === native.value);
        });
      });

      native.addEventListener("options:changed", () => {
        render();
        valueEl.textContent = native.selectedOptions[0]?.textContent || "Selecciona una opción";
      });
    }

    wrappers.forEach(build);

    document.addEventListener("click", (e) => {
      document.querySelectorAll(".custom-select.is-open").forEach(cs => {
        if (!cs.contains(e.target)) cs.classList.remove("is-open");
      });
    });
  })();

  // ===============================
  // REGLAS
  // ===============================
  const RULES = [
    // otra ciudad
    {
      field: otraCiudadField,
      when: () => ciudadSelect?.value === "otra",
      onHide: () => resetFieldValue(otraCiudadInput),
    },

    // viáticos
    {
      field: notaViaticos,
      when: () => ciudadSelect?.value && ciudadSelect.value !== "popayan",
      mode: "block",
    },

    // celebracion: NO aplica restaurante / ferias / propuesta
    {
      field: celebracionField,
      when: () =>
        !!servicioSelect.value &&
        !["magia_restaurante", "magia_ferias", "propuesta_matrimonio"].includes(servicioSelect.value),
      onHide: () => resetFieldValue(celebracionInput),
    },

    // restaurante
    {
      field: restauranteField,
      when: () => servicioSelect.value === "magia_restaurante",
      onHide: () => resetFieldValue(restauranteInput),
    },

    // personas (aplica a salon adultos/familiar/escenario/parejas/labor social)
 // personas
{
  field: personasField,
  when: () =>
    ["magia_salon_adultos", "magia_salon_familiar", "magia_escenario", "show_parejas", "labor_social"]
      .includes(servicioSelect.value),

  onShow: () => {
    const opt_0_35 = { value: "0_35", label: "0 - 35" };
    const opt_35_60 = { value: "35_60", label: "35 - 60" };
    const opt_60_150 = { value: "60_150", label: "60 - 150" };
    const opt_150mas = { value: "150_mas", label: "Más de 150 personas" };

    const map = {
      magia_salon_adultos: [opt_0_35, opt_35_60, opt_60_150],
      magia_salon_familiar: [opt_0_35, opt_35_60],
      magia_escenario: [opt_0_35, opt_35_60, opt_60_150, opt_150mas],
      show_parejas: [opt_0_35, opt_35_60, opt_60_150],
      labor_social: [opt_0_35, opt_35_60, opt_60_150, opt_150mas],
    };

    if (!personasSelect) return;

    const opciones = map[servicioSelect.value] || [];

    // 🔒 Guardar selección actual antes de reconstruir
    const prev = personasSelect.value;

    // ✅ Ver si realmente hay que reconstruir:
    const currentValues = Array.from(personasSelect.options).map(o => o.value).filter(Boolean);
    const nextValues = opciones.map(o => o.value);
    const sameOptions =
      currentValues.length === nextValues.length &&
      currentValues.every((v, i) => v === nextValues[i]);

    // Si las opciones ya son las mismas, NO tocar nada (así no se borra)
    if (sameOptions) return;

    // 🔁 reconstruir solo si cambió el servicio/opciones
    personasSelect.innerHTML = `
      <option value="" disabled ${prev ? "" : "selected"}>Selecciona un rango</option>
      ${opciones.map(o => `<option value="${o.value}">${o.label}</option>`).join("")}
    `;

    // ✅ restaurar si el valor sigue existiendo
    if (prev && nextValues.includes(prev)) {
      personasSelect.value = prev;
    } else {
      personasSelect.value = "";
    }

    personasSelect.dispatchEvent(new Event("options:changed", { bubbles: true }));
    personasSelect.dispatchEvent(new Event("change", { bubbles: true }));
  },

  onHide: () => {
    if (!personasSelect) return;
    personasSelect.innerHTML = `<option value="" disabled selected>Selecciona un rango</option>`;
    personasSelect.value = "";
    personasSelect.dispatchEvent(new Event("options:changed", { bubbles: true }));
  }
},


    // edad (familiar/escenario/parejas/labor social)
// edad
{
  field: edadField,
  when: () =>
    ["magia_salon_familiar", "magia_escenario", "show_parejas", "labor_social"]
      .includes(servicioSelect.value),

  onShow: () => {
    if (!edadSelect) return;

    const base = [
      { value: "ninos_5_10", label: "Niños de 5 - 10 años" },
      { value: "ninos_10_15", label: "Niños de 10 - 15 años" },
      { value: "adolescentes_15_18", label: "Adolescentes 15 - 18 años" },
      { value: "mixto", label: "Mixto (adultos y niños)" }
    ];

    const conAdultos = [
      ...base,
      { value: "solo_adultos", label: "Solo adultos" }
    ];

    const opciones =
      servicioSelect.value === "magia_salon_familiar"
        ? base
        : conAdultos;

    // 🔒 guardar valor previo
    const prev = edadSelect.value;

    // 🔍 comprobar si las opciones ya son las mismas
    const currentValues = Array.from(edadSelect.options)
      .map(o => o.value)
      .filter(Boolean);

    const nextValues = opciones.map(o => o.value);

    const sameOptions =
      currentValues.length === nextValues.length &&
      currentValues.every((v, i) => v === nextValues[i]);

    // ⛔ si son iguales, no tocar nada (evita borrados)
    if (sameOptions) return;

    // 🔁 reconstruir solo si cambió el servicio
    edadSelect.innerHTML = `
      <option value="" disabled ${prev ? "" : "selected"}>Selecciona un rango</option>
      ${opciones.map(o => `<option value="${o.value}">${o.label}</option>`).join("")}
    `;

    // ✅ restaurar selección si sigue siendo válida
    if (prev && nextValues.includes(prev)) {
      edadSelect.value = prev;
    } else {
      edadSelect.value = "";
    }

    edadSelect.dispatchEvent(new Event("options:changed", { bubbles: true }));
    edadSelect.dispatchEvent(new Event("change", { bubbles: true }));
  },

  onHide: () => {
    if (!edadSelect) return;
    edadSelect.innerHTML = `<option value="" disabled selected>Selecciona un rango</option>`;
    edadSelect.value = "";
    edadSelect.dispatchEvent(new Event("options:changed", { bubbles: true }));
    if (notaAdultos) notaAdultos.style.display = "none";
  }
},


    // nota adultos
    {
      field: notaAdultos,
      when: () => {
        const rangosConMenores = new Set(["ninos_5_10", "ninos_10_15", "adolescentes_15_18", "mixto"]);
        return rangosConMenores.has(edadSelect?.value);
      },
      mode: "block"
    },

    // discapacidad (no aplica a restaurante ni ferias) => aplica a cerca adultos también
    {
      field: discapacidadField,
      when: () =>
        !!servicioSelect.value &&
        !["magia_restaurante", "magia_ferias"].includes(servicioSelect.value),
      onHide: () => {
        resetFieldValue(tieneDiscapacidad);
        hideAndReset(detalleDiscapacidadField);
      }
    },

    // detalle discapacidad
    {
      field: detalleDiscapacidadField,
      when: () => tieneDiscapacidad?.value === "si" && isVisible(discapacidadField),
      onHide: () => resetFieldValue(detalleDiscapacidadInput),
    },

    // detalle (objeto) NO aplica a labor/restaurante/ferias/escenario => sí aplica a cerca adultos y propuesta
    {
      field: detalleField,
      when: () => {
        const no = new Set(["labor_social", "magia_restaurante", "magia_ferias", "magia_escenario"]);
        return !!servicioSelect.value && !no.has(servicioSelect.value);
      },
      onHide: () => {
        resetFieldValue(detalleSelect);
        hideAndReset(detalleCualField);
      }
    },

    // detalle cual
    {
      field: detalleCualField,
      when: () => detalleSelect?.value === "si" && isVisible(detalleField),
      onHide: () => resetFieldValue(detalleCualInput),
    },
  ];

  function applyRules() {
    RULES.forEach(rule => {
      const el = rule.field;
      if (!el) return;

      const shouldShow = !!rule.when?.();

      if (rule.mode === "block") {
        el.style.display = shouldShow ? "block" : "none";
        return;
      }

      if (shouldShow) {
        showEl(el);
        rule.onShow?.();
      } else {
        rule.onHide?.();
        hideEl(el);
      }
    });
  }

  // ===============================
  // REQUIRED CENTRAL
  // ===============================
  function applyRequired() {
    const hasService = !!servicioSelect.value;

    [nombre, phone, ciudadSelect, barrio, direccion, fechaInput, horaInput].forEach(el => {
      if (el) el.required = hasService;
    });

    if (otraCiudadInput) otraCiudadInput.required = hasService && ciudadSelect?.value === "otra" && isVisible(otraCiudadField);
    if (restauranteInput) restauranteInput.required = hasService && servicioSelect.value === "magia_restaurante" && isVisible(restauranteField);

    if (celebracionInput) {
      celebracionInput.required =
        hasService &&
        !["magia_restaurante", "magia_ferias", "propuesta_matrimonio"].includes(servicioSelect.value) &&
        isVisible(celebracionField);
    }

    if (personasSelect) personasSelect.required = hasService && isVisible(personasField);
    if (edadSelect) edadSelect.required = hasService && isVisible(edadField);

    if (tieneDiscapacidad) tieneDiscapacidad.required = hasService && isVisible(discapacidadField);
    if (detalleDiscapacidadInput) detalleDiscapacidadInput.required = hasService && tieneDiscapacidad?.value === "si" && isVisible(detalleDiscapacidadField);

    if (detalleSelect) detalleSelect.required = hasService && isVisible(detalleField);
    if (detalleCualInput) detalleCualInput.required = hasService && detalleSelect?.value === "si" && isVisible(detalleCualField);
    if (terminos) terminos.required = hasService;

  }

  // ===============================
  // OCULTAR TODO SI NO HAY SERVICIO
  // ===============================
  const allFields = Array.from(form.querySelectorAll(".field"));
  const serviceField = servicioSelect.closest(".field");
  const fieldsToToggle = allFields.filter(f => f !== serviceField);

  function hideAllQuestions() {
    isApplying = true;
    fieldsToToggle.forEach(f => hideAndReset(f));
    if (preview) preview.innerHTML = "";
    if (notaViaticos) notaViaticos.style.display = "none";
    if (notaAdultos) notaAdultos.style.display = "none";
    applyRequired();
    isApplying = false;
  }

  function showBaseQuestions() {
    isApplying = true;
    fieldsToToggle.forEach(f => showEl(f));
    applyRules();
    applyRequired();
    isApplying = false;
  }

  // ===============================
  // FECHA / HORA
  // ===============================
  function setMinFechaHoy() {
    if (!fechaInput) return;
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    fechaInput.min = `${yyyy}-${mm}-${dd}`;
  }

  function hoyLocal() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function horaAhora() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${min}`;
  }

  function actualizarMinHora() {
    if (!fechaInput || !horaInput) return;
    if (fechaInput.value === hoyLocal()) horaInput.min = horaAhora();
    else horaInput.min = "";
    if (horaInput.value && horaInput.min && horaInput.value < horaInput.min) {
      horaInput.value = "";
    }
  }

  if (fechaInput) {
    setMinFechaHoy();
    fechaInput.addEventListener("click", () => fechaInput.showPicker?.());
    fechaInput.addEventListener("change", () => {
      actualizarMinHora();
      applyRequired();
    });
  }

  if (horaInput) {
    horaInput.addEventListener("click", () => horaInput.showPicker?.());
    horaInput.addEventListener("focus", actualizarMinHora);
  }

  // ===============================
  // PHONE (tel): solo dígitos + 10
  // ===============================
  if (phone) {
    const sanitizePhone = () => {
      phone.value = (phone.value || "").replace(/[^\d]/g, "").slice(0, 10);
    };
    phone.addEventListener("input", sanitizePhone);
    phone.addEventListener("paste", () => setTimeout(sanitizePhone, 0));
  }

  // ===============================
  // VALIDACIÓN (rojo en trigger)
  // ===============================
  function markInvalid(el) {
    const target = getInvalidTarget(el);
    if (!target) return;
    target.focus?.();
    target.style.borderColor = "#ff3b3b";
    target.style.boxShadow = "0 0 8px rgba(255, 59, 59, 0.6)";
  }

  function clearInvalid(el) {
    const target = getInvalidTarget(el);
    if (!target) return;
    target.style.borderColor = "";
    target.style.boxShadow = "";
  }

  [
    servicioSelect, nombre, email, restauranteInput, phone, ciudadSelect, otraCiudadInput,
    barrio, direccion, fechaInput, horaInput, personasSelect, edadSelect,
    tieneDiscapacidad, detalleSelect, detalleCualInput, detalleDiscapacidadInput, terminos //
  ].forEach(el => {
    if (!el) return;
    el.addEventListener("input", () => clearInvalid(el));
    el.addEventListener("change", () => clearInvalid(el));
  });

  form.addEventListener("submit", async (e) => {
  // ✅ Asegura que required/reglas estén actualizados
  applyRules();
  applyRequired();

  // ✅ Si falta algo (incluye términos), NO envíes
  if (!form.checkValidity()) {
    e.preventDefault();

    // marca inválidos visibles (custom selects y términos)
    const requiredEls = Array.from(
      form.querySelectorAll("input[required], select[required], textarea[required]")
    );

    for (const el of requiredEls) {
      const field = el.closest(".field");
      const hidden = field && (field.style.display === "none" || field.classList.contains("is-hidden"));
      if (hidden) continue;

      if (!el.checkValidity()) markInvalid(el);
      else clearInvalid(el);
    }

    form.reportValidity();
    return;
  }

  // ✅ si llegó aquí, todo está OK
  e.preventDefault();

  // ✅ Guardar servicio y precio para gracias.html
  try {
    const key = servicioSelect.value;
    const s = servicesData[key];
    const title = s?.title || key || "Servicio";
    const badgePrecio = (s?.badges || []).find(b => String(b).toLowerCase().includes("precio"));
    let precio = "Por confirmar";
    if (badgePrecio) precio = badgePrecio.replace(/precio\s*/i, "").trim();

    localStorage.setItem("reserva_servicio_key", key);
    localStorage.setItem("reserva_servicio_title", title);
    localStorage.setItem("reserva_precio", precio);
  } catch (err) {
    console.warn("No se pudo guardar datos para gracias.html", err);
  }

  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Enviando..."; }

  try {
    // ✅ Asunto único (tu lógica)
    const keyServicio = servicioSelect.value;
    const servicioTxt = (servicesData[keyServicio]?.title) || servicioSelect.selectedOptions[0]?.textContent || keyServicio || "Servicio";
    const clienteTxt = (nombre?.value || "").trim() || "Cliente";
    const fechaTxt = (fechaInput?.value || "").trim() || "sin-fecha";
    const stamp = Date.now();

    const subject = `Nueva reserva | ${servicioTxt} | ${clienteTxt} | ${fechaTxt} | ${stamp}`;

    const subjInput = document.getElementById("subjectField");
    if (subjInput) subjInput.value = subject;

    // ✅ Construir FormData
    const formData = new FormData(form);

    // ✅ FIX 1: Forzar el nombre correcto del servicio en el correo (adiós “escenario mágico”)
    // Esto SOBREESCRIBE el campo "Servicio" que venía del select.
    formData.set("Servicio", servicioTxt);

    // ✅ FIX 2 (opcional): también enviar el código del servicio
    formData.set("Servicio (código)", keyServicio);

    const res = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    });

    if (res.ok) {
      window.location.href = "gracias.html";
      return;
    }

    console.error("FormSubmit error:", await res.text());
    alert("❌ No se pudo enviar la reserva. Intenta de nuevo o escríbenos por WhatsApp.");
  } catch (err) {
    console.error(err);
    alert("❌ No se pudo enviar la reserva. Revisa tu conexión o escríbenos por WhatsApp.");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = originalText; }
  }
});




  // ===============================
  // FLUJO PRINCIPAL
  // ===============================
  function updateAll() {
    if (isApplying) return;
    isApplying = true;
    renderService(servicioSelect.value);
    applyRules();
    applyRequired();
    isApplying = false;
  }

  servicioSelect.addEventListener("change", () => {
    if (isApplying) return;
    if (!servicioSelect.value) {
      hideAllQuestions();
      return;
    }
    showBaseQuestions();
    updateAll();
  });

  ciudadSelect?.addEventListener("change", () => !isApplying && updateAll());
  edadSelect?.addEventListener("change", () => !isApplying && updateAll());
  tieneDiscapacidad?.addEventListener("change", () => !isApplying && updateAll());
  detalleSelect?.addEventListener("change", () => !isApplying && updateAll());

  // INIT
  actualizarMinHora();
  if (!servicioSelect.value) hideAllQuestions();
  else {
    showBaseQuestions();
    updateAll();
  }
});

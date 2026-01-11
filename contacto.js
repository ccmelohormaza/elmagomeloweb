// contacto.js -> Custom Select (igual a reservas)
document.addEventListener("DOMContentLoaded", () => {
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
          if (other === cs) return;
          other.classList.remove("is-open", "open-up");
          other.style.zIndex = "";
          other.querySelector(".custom-select__trigger")
            ?.setAttribute("aria-expanded", "false");
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
    }

    wrappers.forEach(build);

    document.addEventListener("click", (e) => {
      document.querySelectorAll(".custom-select.is-open").forEach(cs => {
        if (cs.contains(e.target)) return;
        cs.classList.remove("is-open", "open-up");
        cs.style.zIndex = "";
        cs.querySelector(".custom-select__trigger")
          ?.setAttribute("aria-expanded", "false");
      });
    });
  })();

  // WhatsApp: solo dígitos y máximo 10
  const phone = document.getElementById("c_whatsapp");
  if (phone) {
    const sanitizePhone = () => {
      phone.value = (phone.value || "").replace(/[^\d]/g, "").slice(0, 10);
    };
    phone.addEventListener("input", sanitizePhone);
    phone.addEventListener("paste", () => setTimeout(sanitizePhone, 0));
  }
});

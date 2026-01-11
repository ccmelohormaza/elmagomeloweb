const btn = document.getElementById("navToggle");
const menu = document.getElementById("menu");

// Abrir / cerrar con el botón ☰
btn.addEventListener("click", () => {
  menu.classList.toggle("open");
});

// Cerrar al tocar una opción del menú
menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
    });
  });

// programacion de reproductor de video 
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".video-wrapper");
  const video = document.getElementById("heroVideo");
  const playBtn = document.getElementById("heroPlayBtn");
  const poster = wrapper?.querySelector(".video-poster");

  if (!wrapper || !video || !playBtn || !poster) return;

  const setPlaying = (isPlaying) => {
    wrapper.classList.toggle("is-playing", isPlaying);
  };

  // ▶️ Reproducir desde botón o poster (sin reiniciar)
  const playVideo = () => {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.then(() => setPlaying(true)).catch(() => {});
    } else {
      setPlaying(true);
    }
  };

  playBtn.addEventListener("click", playVideo);
  poster.addEventListener("click", playVideo);

  // ⏸️ Pausar con click en el video
  video.addEventListener("click", () => {
    if (!video.paused) video.pause();
  });

  // ✅ Doble clic: fullscreen (desde video o desde poster)
  const toggleFullscreen = () => {
    const doc = document;
    const isFs = doc.fullscreenElement || doc.webkitFullscreenElement;

    if (!isFs) {
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen(); // Safari
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen(); // Safari
    }
  };

  video.addEventListener("dblclick", toggleFullscreen);
  poster.addEventListener("dblclick", (e) => {
    e.preventDefault();
    toggleFullscreen();
  });

  // Al pausar/terminar → vuelve poster + botón (sin reiniciar)
  video.addEventListener("pause", () => setPlaying(false));
  video.addEventListener("ended", () => setPlaying(false));
});


//programacion boton para subir scrooll de celular
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("toTopBtn");
  if (!btn) return;

  const MOBILE_MAX = 900;         // mismo breakpoint que vienes usando
  const HIDE_AFTER_MS = 5000;     // 5 segundos
  const SHOW_AFTER_SCROLL = 200;  // aparece después de bajar 200px

  let hideTimer = null;

  const isMobile = () => window.innerWidth <= MOBILE_MAX;

  const scheduleHide = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      btn.classList.add("is-hidden");
      btn.classList.remove("is-visible");
    }, HIDE_AFTER_MS);
  };

  const showBtn = () => {
    if (!isMobile()) return;

    // solo mostrar si ya bajó un poco
    if (window.scrollY < SHOW_AFTER_SCROLL) {
      btn.style.display = "none";
      return;
    }

    btn.style.display = "flex";
    btn.classList.add("is-visible");
    btn.classList.remove("is-hidden");
    scheduleHide();
  };

  const hideNow = () => {
    btn.classList.add("is-hidden");
    btn.classList.remove("is-visible");
  };

  // Click: subir arriba + ocultar luego
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    scheduleHide();
  });

  // Mostrar al hacer scroll
  window.addEventListener("scroll", () => {
    showBtn();
  }, { passive: true });

  // Mostrar si toca la pantalla / mueve el dedo (inactividad)
  ["touchstart", "touchmove"].forEach(evt => {
    window.addEventListener(evt, () => showBtn(), { passive: true });
  });

  // Si cambian tamaño/orientación
  window.addEventListener("resize", () => {
    if (!isMobile()) {
      btn.style.display = "none";
      clearTimeout(hideTimer);
      return;
    }
    // recalcula según scroll actual
    if (window.scrollY < SHOW_AFTER_SCROLL) btn.style.display = "none";
    else showBtn();
  });

  // Estado inicial
  if (isMobile() && window.scrollY >= SHOW_AFTER_SCROLL) showBtn();
  else btn.style.display = "none";
});





// scroll galeria 
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("galleryTrack");
  if (!track) return;

  const prev = document.querySelector(".gallery__btn--prev");
  const next = document.querySelector(".gallery__btn--next");

  if (!prev || !next) return;

  const step = () => {
    const card = track.querySelector(".gallery__card");
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return (card ? card.getBoundingClientRect().width : 300) + gap;
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };

  prev.addEventListener("click", () => {
    track.scrollBy({ left: -step(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    track.scrollBy({ left: step(), behavior: "smooth" });
  });

  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  update(); // estado inicial
});


//videos de galeria 
document.addEventListener("DOMContentLoaded", () => {
  const wrappers = document.querySelectorAll(".gallery .video-wrapper");

  wrappers.forEach(wrapper => {
    const video = wrapper.querySelector("video");
    const poster = wrapper.querySelector(".video-poster");

    if (!video || !poster) return;

    let isActive = false;        // 🎬 fue activado por click
    let isPaused = false;       // ⏸️ pausa manual
    let savedTime = 0;          // 🧠 tiempo guardado

    const showPoster = () => {
      wrapper.classList.remove("is-playing");
    };

    const hidePoster = () => {
      wrapper.classList.add("is-playing");
    };

    /* =====================
       🖱️ HOVER
    ===================== */
    wrapper.addEventListener("mouseenter", () => {
      video.muted = true;
      video.currentTime = 0;

      video.play().catch(() => {});
      hidePoster();
    });

    wrapper.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;   // hover siempre reinicia
      showPoster();
    });

    /* =====================
       🖱️ CLICK
    ===================== */
    wrapper.addEventListener("click", () => {

      // PRIMER CLICK → modo activo desde 0
      if (!isActive) {
        isActive = true;
        isPaused = false;
        savedTime = 0;

        video.muted = false;
        video.currentTime = 0;
        video.play().catch(() => {});
        hidePoster();
        return;
      }

      // SI está reproduciendo → pausa
      if (!video.paused) {
        savedTime = video.currentTime;
        video.pause();
        isPaused = true;
        showPoster();
        return;
      }

      // SI estaba pausado → continúa desde donde quedó
      if (isPaused) {
        video.muted = false;
        video.currentTime = savedTime;
        video.play().catch(() => {});
        hidePoster();
        isPaused = false;
      }
    });

    /* =====================
       🎬 FIN DEL VIDEO
    ===================== */
    video.addEventListener("ended", () => {
      isActive = false;
      isPaused = false;
      savedTime = 0;
      video.currentTime = 0;
      showPoster();
    });
  });
});



// PORTAFOLIO
document.addEventListener("DOMContentLoaded", () => {
  const services = document.querySelectorAll(".portfolio__service");
  const videos = Array.from(document.querySelectorAll(".portfolio__service video"));

  const mq = window.matchMedia("(max-width: 1000px)");
  const isMobile = () => mq.matches;

  // Config base para todos
  videos.forEach(v => {
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.preload = "metadata";
  });

  // Helper: detener y volver al poster (100% efectivo en móvil)
  const resetToPoster = (video) => {
    try {
      video.pause();
      video.currentTime = 0;

      // Fuerza repintado del poster en Safari/iOS
      const sources = Array.from(video.querySelectorAll("source"));
      const srcs = sources.map(s => s.getAttribute("src"));

      // vacía sources
      sources.forEach(s => s.removeAttribute("src"));
      video.load();

      // restaura sources
      sources.forEach((s, i) => s.setAttribute("src", srcs[i] || ""));
      video.load();
    } catch (e) {
      // fallback suave
      video.pause();
      video.currentTime = 0;
      video.load();
    }
  };

  // ---- DESKTOP: solo hover (nada de autoplay)
  const setupDesktop = () => {
    // limpia observers mobile si existieran
    services.forEach(s => {
      s.onmouseenter = null;
      s.onmouseleave = null;
    });

    // asegúrate de que estén parados
    videos.forEach(v => {
      v.autoplay = false;
      resetToPoster(v); // deja el poster visible
    });

    services.forEach(service => {
      const video = service.querySelector("video");
      if (!video) return;

      service.onmouseenter = () => {
        video.play().catch(() => {});
      };

      service.onmouseleave = () => {
        resetToPoster(video);
      };
    });
  };

  // ---- MOBILE: autoplay por visibilidad + unlock
  const setupMobile = () => {
    // quita hover handlers
    services.forEach(s => {
      s.onmouseenter = null;
      s.onmouseleave = null;
    });

    // al iniciar, deja todos en poster
    videos.forEach(v => resetToPoster(v));

    // desbloqueo: con el primer toque habilita play()
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;

      // “calienta” el permiso de reproducción
      videos.forEach(v => {
        v.play().catch(() => {});
        resetToPoster(v);
      });

      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
    };

    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("pointerdown", unlock, { passive: true });

    // Observer: reproduce solo el que se ve; pausa los demás
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        const video = target.querySelector("video");
        if (!video) return;

        if (isIntersecting) {
          // pausa los otros para que no queden varios sonando
          videos.forEach(v => {
            if (v !== video) resetToPoster(v);
          });

          video.play().catch(() => {});
        } else {
          resetToPoster(video);
        }
      });
    }, { threshold: 0.35 });

    services.forEach(s => io.observe(s));
  };

  // Inicial
  if (isMobile()) setupMobile();
  else setupDesktop();

  // cambio de tamaño / rotación
  mq.addEventListener?.("change", () => {
    if (isMobile()) setupMobile();
    else setupDesktop();
  });
});


//cuando se de clic en reservar ahora te selecciona el servicio y se mueve el scrooll al select para que la persona no se pierda 

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const servicio = params.get("servicio");

  const select = document.getElementById("servicio");
  if (!select) return; // no estamos en reservas.html

  if (servicio) {
    // selecciona el servicio
    select.value = servicio;

    // intenta subir al contenedor del campo (el div.field)
    const field = select.closest(".field") || select;

    // espera a que el navegador pinte y luego hace scroll
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        field.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }
});




/// importante cuando se de en el boton reservar desde el portafolio se selecciona la opcion en el formulario de reserva //
document.addEventListener("DOMContentLoaded", () => {
  const selectServicio = document.getElementById("servicio");
  if (!selectServicio) return;

  const params = new URLSearchParams(window.location.search);
  const servicio = params.get("servicio");

  if (servicio) {
    selectServicio.value = servicio;
    // Opcional: disparar change si tienes lógica adicional
    selectServicio.dispatchEvent(new Event("change"));
  }
});






/// CARGANDO LOGO //
(function () {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add("loader--hide");
    setTimeout(() => loader.remove(), 450);
  };

  window.addEventListener("load", hideLoader);
  setTimeout(hideLoader, 8000);
})();




/// intro 
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introMagic");
  if (!intro) return;

  // 1) Espera a que se vea el logo + pulse
  setTimeout(() => {
    intro.classList.add("is-dissolving");
  }, 1400);

  // 2) Cuando termina el “polvo”, se va el overlay
  setTimeout(() => {
    intro.classList.add("is-hide");
  }, 2500);

  // 3) Lo removemos del DOM
  setTimeout(() => {
    intro.remove();
  }, 3100);
});


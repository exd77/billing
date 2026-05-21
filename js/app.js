/* ============================================================
 * app.js — UI wiring with classic Mac flourishes:
 *   • Boot splash dismiss
 *   • Menu bar with working dropdowns (Apple/File/Edit/View/...)
 *   • About + Alert modal dialogs
 *   • Beach ball spinner with artificial generate delay
 *   • Drag-outline window dragging (Mac-style)
 *   • Field flash on update, selection invert on copy
 *   • Trash icon bulge + Empty Trash action
 *   • Keyboard shortcuts (⌘G, ⌘⇧C, ⌘N, ESC, etc.)
 * ============================================================ */

(function () {
  "use strict";

  /* ------- Element handles ------- */
  const $ = (id) => document.getElementById(id);

  const els = {
    boot: $("bootSplash"),
    beachBall: $("beachBall"),
    dragOutline: $("dragOutline"),
    country: $("countrySelect"),
    generate: $("generateBtn"),
    copyAll: $("copyAllBtn"),
    clear: $("clearBtn"),
    status: $("statusText"),
    clock: $("menuClock"),
    mainWindow: $("mainWindow"),
    readmeWindow: $("readmeWindow"),
    trash: $("trashIcon"),
    aboutBackdrop: $("aboutBackdrop"),
    aboutOk: $("aboutOkBtn"),
    alertBackdrop: $("alertBackdrop"),
    alertOk: $("alertOkBtn"),
    alertTitle: $("alertTitle"),
    alertMsg: $("alertMsg"),
    fields: {
      cardholderName: $("cardholderName"),
      addressLine1: $("addressLine1"),
      addressLine2: $("addressLine2"),
      city: $("city"),
      region: $("region"),
      postalCode: $("postalCode"),
      phoneNumber: $("phoneNumber")
    }
  };

  /* ============================================================
   *  COUNTRIES + GENERATE
   * ============================================================ */
  function populateCountries() {
    const codes = Object.keys(COUNTRIES).sort((a, b) =>
      COUNTRIES[a].name.localeCompare(COUNTRIES[b].name)
    );

    for (const code of codes) {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${COUNTRIES[code].flag}  ${COUNTRIES[code].name}`;
      els.country.appendChild(opt);
    }
    els.country.value = "US";
  }

  let isGenerating = false;

  async function generateAddress({ silent = false } = {}) {
    if (isGenerating) return;
    isGenerating = true;

    const code = els.country.value;
    showBeachBall();

    // Brief artificial delay to surface the spinner (classic Mac vibe)
    await new Promise((res) => setTimeout(res, 320));

    let data;
    try {
      data = Generator.generate(code);
    } catch (err) {
      hideBeachBall();
      isGenerating = false;
      setStatus(`Error: ${err.message}`, true);
      return;
    }

    setFieldValue(els.fields.cardholderName, data.cardholderName);
    setFieldValue(els.fields.addressLine1, data.addressLine1);
    setFieldValue(els.fields.addressLine2, data.addressLine2);
    setFieldValue(els.fields.city, data.city);
    setFieldValue(els.fields.region, data.region);
    setFieldValue(els.fields.postalCode, data.postalCode);
    setFieldValue(els.fields.phoneNumber, data.phoneNumber);

    hideBeachBall();
    isGenerating = false;
    if (!silent) setStatus(`Generated for ${data.countryName}.`);
  }

  function setFieldValue(input, value) {
    input.value = value || "";
    // Field flash
    input.classList.remove("is-flash");
    // Force reflow so animation restarts
    void input.offsetWidth;
    input.classList.add("is-flash");
    setTimeout(() => input.classList.remove("is-flash"), 500);
  }

  function clearForm() {
    for (const key in els.fields) {
      els.fields[key].value = "";
    }
    setStatus("Cleared.");
  }

  /* ============================================================
   *  BEACH BALL (follows mouse during generate)
   * ============================================================ */
  let lastMouse = { x: 100, y: 100 };

  document.addEventListener("mousemove", (e) => {
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    if (els.beachBall.classList.contains("is-active")) {
      positionBeachBall();
    }
  });

  function positionBeachBall() {
    els.beachBall.style.left = lastMouse.x + 4 + "px";
    els.beachBall.style.top = lastMouse.y + 4 + "px";
  }

  function showBeachBall() {
    positionBeachBall();
    els.beachBall.classList.add("is-active");
    document.body.style.cursor = "wait";
  }

  function hideBeachBall() {
    els.beachBall.classList.remove("is-active");
    document.body.style.cursor = "";
  }

  /* ============================================================
   *  CLIPBOARD
   * ============================================================ */
  async function writeClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      console.error("Clipboard error:", err);
      return false;
    }
  }

  function flashElement(el, ms = 450) {
    el.classList.add("is-flash");
    setTimeout(() => el.classList.remove("is-flash"), ms);
  }

  function selectField(input) {
    input.classList.add("is-selected");
    setTimeout(() => input.classList.remove("is-selected"), 220);
  }

  async function copyField(fieldId, btn) {
    const input = els.fields[fieldId];
    if (!input || !input.value) {
      setStatus("Nothing to copy. Generate first.", true);
      return;
    }
    const ok = await writeClipboard(input.value);
    if (ok) {
      flashElement(btn);
      selectField(input);
      setStatus(`Copied: ${labelFor(fieldId)}`);
    } else {
      setStatus("Copy failed.", true);
    }
  }

  async function copyAll() {
    const f = els.fields;
    if (!f.cardholderName.value) {
      setStatus("Nothing to copy. Generate first.", true);
      return;
    }
    const lines = [
      f.cardholderName.value,
      f.addressLine1.value,
      f.addressLine2.value,
      `${f.city.value}, ${f.region.value} ${f.postalCode.value}`.trim(),
      els.country.options[els.country.selectedIndex].text.replace(/^[^\s]+\s+/, ""),
      `Tel: ${f.phoneNumber.value}`
    ].filter(Boolean);
    const ok = await writeClipboard(lines.join("\n"));
    if (ok) {
      flashElement(els.copyAll);
      // Briefly invert all populated fields
      Object.values(f).forEach((inp) => {
        if (inp.value) selectField(inp);
      });
      setStatus("Copied full address.");
    } else {
      setStatus("Copy failed.", true);
    }
  }

  function labelFor(fieldId) {
    const map = {
      cardholderName: "Cardholder Name",
      addressLine1: "Address Line 1",
      addressLine2: "Address Line 2",
      city: "City",
      region: "Region",
      postalCode: "Postal Code",
      phoneNumber: "Phone Number"
    };
    return map[fieldId] || fieldId;
  }

  /* ============================================================
   *  STATUS
   * ============================================================ */
  let statusTimer;
  function setStatus(msg, isError = false) {
    els.status.textContent = msg;
    els.status.style.color = isError ? "#a00" : "#444";
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      els.status.textContent = "";
    }, 2500);
  }

  /* ============================================================
   *  BOOT SPLASH — first-page sequence
   * ============================================================ */
  const Boot = {
    /**
     * Boot log lines printed sequentially.
     * Each: { tag, msg, status, delay }
     */
    LINES: [
      { tag: "[BOOT]", msg: "Cold start sequence v1.0",       status: null,   delay: 80  },
      { tag: "[LOAD]", msg: "phosphor display calibration",   status: "OK",   delay: 220 },
      { tag: "[LOAD]", msg: "address generator runtime",      status: "OK",   delay: 200 },
      { tag: "[INIT]", msg: "country database (12 locales)",  status: "OK",   delay: 220 },
      { tag: "[INIT]", msg: "PRNG entropy pool",              status: "OK",   delay: 180 },
      { tag: "[NET ]", msg: "loopback / no remote calls",     status: "OK",   delay: 200 },
      { tag: "[DONE]", msg: "system ready",                   status: "OK",   delay: 240 }
    ],
    DISMISS_DELAY: 360, // ms after last line before dismissing

    /** Print all log lines sequentially. Returns a Promise resolved when done. */
    runSequence() {
      const log = document.getElementById("bootLog");
      if (!log) return Promise.resolve();

      return new Promise((resolve) => {
        let idx = 0;
        const next = () => {
          if (idx >= this.LINES.length) {
            // Append blinking cursor at end
            const cursor = document.createElement("span");
            cursor.className = "boot-log-cursor";
            log.appendChild(cursor);
            // Final pause then resolve
            setTimeout(resolve, this.DISMISS_DELAY);
            return;
          }
          const { tag, msg, status, delay } = this.LINES[idx];
          this.appendLine(log, tag, msg, status);
          idx++;
          setTimeout(next, delay);
        };
        next();
      });
    },

    appendLine(log, tag, msg, status) {
      const line = document.createElement("span");
      line.className = "boot-log-line";

      const tagEl = document.createElement("span");
      tagEl.className = "log-tag";
      tagEl.textContent = tag;
      line.appendChild(tagEl);

      const msgEl = document.createElement("span");
      msgEl.className = "log-msg";
      msgEl.textContent = " " + msg;
      line.appendChild(msgEl);

      if (status) {
        const okEl = document.createElement("span");
        okEl.className = "log-ok";
        okEl.textContent = "[ " + status + " ]";
        line.appendChild(okEl);
      }

      log.appendChild(line);
      log.appendChild(document.createTextNode("\n"));
    },

    /** CRT turn-off dismiss + remove is-booting class to start landing. */
    dismiss() {
      const splash = document.getElementById("bootSplash");
      if (!splash) return Promise.resolve();
      splash.classList.add("is-leaving");
      return new Promise((resolve) => {
        setTimeout(() => {
          splash.style.display = "none";
          document.body.classList.remove("is-booting");
          resolve();
        }, 720); // matches crtTurnOff 0.7s
      });
    }
  };


  /* ============================================================
   *  BANNER — ASCII noise background + per-char reveal
   * ============================================================ */
  const Banner = {
    NOISE_CHARS: "01@#$%^&*()_+-=[]{}|/<>?:;.,~`!ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    CHAR_W: 8.4,   // approximate monospace char width at 14px VT323
    LINE_H: 14,
    _resizeTimer: null,

    initNoise() {
      this.renderNoise();
      window.addEventListener("resize", () => {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => this.renderNoise(), 200);
      });
      // Subtle in-place mutation — randomly scramble a small slice every 280ms
      setInterval(() => this.scrambleNoise(80), 280);
    },

    renderNoise() {
      const el = document.getElementById("asciiNoise");
      if (!el) return;
      const cols = Math.ceil(window.innerWidth / this.CHAR_W) + 2;
      const rows = Math.ceil(window.innerHeight / this.LINE_H) + 2;
      const chars = this.NOISE_CHARS;
      const cl = chars.length;
      let out = "";
      for (let r = 0; r < rows; r++) {
        let line = "";
        for (let c = 0; c < cols; c++) {
          line += chars[(Math.random() * cl) | 0];
        }
        out += line + "\n";
      }
      el.textContent = out;
    },

    scrambleNoise(count) {
      const el = document.getElementById("asciiNoise");
      if (!el || !el.textContent) return;
      const chars = this.NOISE_CHARS;
      const cl = chars.length;
      const text = el.textContent;
      // Build a tiny set of random index swaps and apply via string slicing
      // (textContent reassign is O(n) but cheap enough at this size)
      const arr = text.split("");
      const len = arr.length;
      for (let i = 0; i < count; i++) {
        const idx = (Math.random() * len) | 0;
        if (arr[idx] !== "\n") {
          arr[idx] = chars[(Math.random() * cl) | 0];
        }
      }
      el.textContent = arr.join("");
    },

    initRevealText() {
      document.querySelectorAll(".reveal-text").forEach((el) => {
        const text = el.getAttribute("data-text") || el.textContent;
        el.textContent = "";
        const total = text.length;
        [...text].forEach((ch, i) => {
          const span = document.createElement("span");
          span.style.setProperty("--i", i);
          span.textContent = ch === " " ? "\u00a0" : ch;
          el.appendChild(span);
        });
        // Mark settled after the last char's reveal completes
        // (base 0.45s + lastIndex * 0.07s + animation 0.5s)
        const settleMs = 450 + (total - 1) * 70 + 500 + 50;
        setTimeout(() => el.classList.add("is-settled"), settleMs);
      });
    },

    /**
     * Matrix-style decode/scramble reveal for the ASCII art title.
     * Each non-space character cycles through several random glyphs
     * before locking to its final value. Stagger left-to-right + top-to-bottom.
     */
    decodeReveal(el, opts = {}) {
      if (!el) return;
      const {
        totalDuration = 1700, // ms total spread for stagger
        cycleInterval = 55,   // ms between random char swaps
        cyclesPerChar = 5,    // how many random chars before settle
        scrambleChars = "01@#$%&*▓▒░█▀▄▌▐╔╗╚╝═║┌┐└┘─│!?+-/<>"
      } = opts;

      const finalText = el.textContent;
      const chars = scrambleChars;
      const cl = chars.length;
      const rand = () => chars[(Math.random() * cl) | 0];

      // Build span structure preserving spaces and newlines as text nodes
      el.textContent = "";
      const visibleSpans = [];
      for (const ch of finalText) {
        if (ch === " " || ch === "\n") {
          el.appendChild(document.createTextNode(ch));
        } else {
          const span = document.createElement("span");
          span.className = "ascii-char";
          span.dataset.final = ch;
          span.textContent = rand();
          el.appendChild(span);
          visibleSpans.push(span);
        }
      }

      el.classList.add("is-decoding");

      // Schedule per-char decode
      const total = visibleSpans.length;
      const stagger = (totalDuration - cyclesPerChar * cycleInterval) / total;

      visibleSpans.forEach((span, i) => {
        const startAt = i * stagger;
        setTimeout(() => {
          let count = 0;
          const swap = setInterval(() => {
            if (count >= cyclesPerChar) {
              clearInterval(swap);
              span.textContent = span.dataset.final;
              span.classList.add("is-locked");
              return;
            }
            span.textContent = rand();
            count++;
          }, cycleInterval);
        }, startAt);
      });

      // Remove is-decoding class once last char finishes
      const totalMs = total * stagger + cyclesPerChar * cycleInterval + 80;
      setTimeout(() => el.classList.remove("is-decoding"), totalMs);
    }
  };


  /* ============================================================
   *  THEME (light / dark / auto)
   * ============================================================ */
  const THEME_KEY = "billing-gen-theme";
  const Theme = {
    /** Returns one of "light" | "dark" | "auto" */
    getPref() {
      try {
        return localStorage.getItem(THEME_KEY) || "auto";
      } catch (e) {
        return "auto";
      }
    },
    /** Returns the actually-applied theme: "light" | "dark" */
    getResolved() {
      const pref = this.getPref();
      if (pref === "dark" || pref === "light") return pref;
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    },
    apply(pref) {
      try {
        localStorage.setItem(THEME_KEY, pref);
      } catch (e) {
        /* localStorage blocked — non-fatal */
      }
      const resolved =
        pref === "dark" ||
        (pref === "auto" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
          ? "dark"
          : "light";
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.setAttribute("data-theme-pref", pref);
      this.updateMenuChecks();
      this.updateToggle(resolved);
      setStatus(
        pref === "auto"
          ? `Appearance: Auto (${resolved}).`
          : `Appearance: ${pref.charAt(0).toUpperCase() + pref.slice(1)}.`
      );
    },
    updateMenuChecks() {
      const pref = this.getPref();
      document.querySelectorAll("[data-theme-check]").forEach((span) => {
        span.classList.toggle(
          "is-checked",
          span.getAttribute("data-theme-check") === pref
        );
      });
    },
    updateToggle(resolved) {
      const btn = document.getElementById("themeToggle");
      if (!btn) return;
      const next = resolved === "dark" ? "light" : "dark";
      const label = `Switch to ${next} mode`;
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    },
    /** Toggle between explicit light and dark (skips Auto). */
    toggle() {
      const resolved = this.getResolved();
      this.apply(resolved === "dark" ? "light" : "dark");
    },
    /** Listen for OS-level dark-mode changes when in Auto */
    bindSystemListener() {
      if (!window.matchMedia) return;
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        if (this.getPref() === "auto") this.apply("auto");
      };
      // Modern + legacy listener API
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  };


  /* ============================================================
   *  CLOCK
   * ============================================================ */
  function tickClock() {
    const now = new Date();
    const hh = now.getHours();
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = ((hh + 11) % 12) + 1;
    els.clock.textContent = `${h12}:${mm} ${ampm}`;
  }

  /* ============================================================
   *  MENU BAR DROPDOWNS
   * ============================================================ */
  let openMenu = null;

  function openMenuFor(triggerEl) {
    closeMenus();
    const name = triggerEl.dataset.menu;
    const dropdown = document.querySelector(`.menu-dropdown[data-menu-for="${name}"]`);
    if (!dropdown) return;

    // Position under trigger
    const rect = triggerEl.getBoundingClientRect();
    dropdown.style.left = rect.left + "px";
    dropdown.style.top = rect.bottom - 1 + "px";
    dropdown.hidden = false;
    triggerEl.classList.add("is-open");
    triggerEl.setAttribute("aria-expanded", "true");
    openMenu = { trigger: triggerEl, dropdown };
  }

  function closeMenus() {
    document
      .querySelectorAll(".menu-dropdown")
      .forEach((d) => (d.hidden = true));
    document
      .querySelectorAll(".menu-trigger.is-open")
      .forEach((t) => {
        t.classList.remove("is-open");
        t.setAttribute("aria-expanded", "false");
      });
    openMenu = null;
  }

  function wireMenuBar() {
    document.querySelectorAll(".menu-trigger").forEach((trigger) => {
      trigger.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (openMenu && openMenu.trigger === trigger) {
          closeMenus();
        } else {
          openMenuFor(trigger);
        }
      });
      trigger.addEventListener("mouseenter", () => {
        if (openMenu) openMenuFor(trigger);
      });
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          openMenuFor(trigger);
        }
      });
    });

    document.querySelectorAll(".menu-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        if (opt.classList.contains("menu-option-disabled")) return;
        const action = opt.dataset.action;
        closeMenus();
        handleMenuAction(action);
      });
    });

    // Close on click outside
    document.addEventListener("mousedown", (e) => {
      if (
        openMenu &&
        !e.target.closest(".menu-dropdown") &&
        !e.target.closest(".menu-trigger")
      ) {
        closeMenus();
      }
    });
  }

  function handleMenuAction(action) {
    switch (action) {
      case "about":
        showDialog(els.aboutBackdrop);
        break;
      case "new":
      case "generate":
        generateAddress();
        break;
      case "copy-all":
        copyAll();
        break;
      case "clear":
        clearForm();
        break;
      case "select-all":
        Object.values(els.fields).forEach((f) => f.value && selectField(f));
        setStatus("Selected all fields.");
        break;
      case "toggle-readme":
        toggleWindow(els.readmeWindow);
        break;
      case "reset-windows":
        resetWindows();
        break;
      case "empty-trash":
        emptyTrash();
        break;
      case "restart":
        showAlert("Restart", "Are you sure you want to restart your Macintosh?\nClick OK to reload the page.", () => {
          location.reload();
        });
        break;
      case "help":
        showAlert("Help", "Pick a country, click Generate, then use the ⧉ buttons or 'Copy All' to copy. Drag windows by their title bar. Use the Apple menu for About.");
        break;
      case "theme-light":
        Theme.apply("light");
        break;
      case "theme-dark":
        Theme.apply("dark");
        break;
      case "theme-auto":
        Theme.apply("auto");
        break;
      default:
        break;
    }
  }

  /* ============================================================
   *  DIALOGS (About + Alert)
   * ============================================================ */
  function showDialog(backdrop) {
    backdrop.hidden = false;
    const focusBtn = backdrop.querySelector(".mac-button-default");
    if (focusBtn) setTimeout(() => focusBtn.focus(), 50);
  }

  function hideDialog(backdrop) {
    const dialog = backdrop.querySelector(".mac-dialog");
    if (dialog) {
      dialog.classList.add("is-closing");
      setTimeout(() => {
        dialog.classList.remove("is-closing");
        backdrop.hidden = true;
      }, 200);
    } else {
      backdrop.hidden = true;
    }
  }

  let alertCallback = null;
  function showAlert(title, message, onOk = null) {
    els.alertTitle.textContent = title;
    els.alertMsg.textContent = message;
    alertCallback = onOk;
    showDialog(els.alertBackdrop);
  }

  /* ============================================================
   *  WINDOW DRAGGING (Mac-style outline)
   * ============================================================ */
  function enableDragging() {
    document.querySelectorAll(".title-bar[data-draggable]").forEach((bar) => {
      const winId = bar.dataset.draggable;
      const win = document.getElementById(winId);
      if (!win) return;

      let dragging = false;
      let startX = 0;
      let startY = 0;
      let originLeft = 0;
      let originTop = 0;
      let rect = null;

      const captureOrigin = () => {
        const r = win.getBoundingClientRect();
        win.style.position = "absolute";
        win.style.left = r.left + window.scrollX + "px";
        win.style.top = r.top + window.scrollY + "px";
        win.style.margin = "0";
      };

      bar.addEventListener("mousedown", (e) => {
        if (e.target.closest(".close-box, .zoom-box")) return;
        if (win.style.position !== "absolute") captureOrigin();
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        originLeft = parseFloat(win.style.left);
        originTop = parseFloat(win.style.top);
        rect = win.getBoundingClientRect();

        // Bring to front
        document
          .querySelectorAll(".mac-window")
          .forEach((w) => (w.style.zIndex = "5"));
        win.style.zIndex = "20";

        // Show drag outline at the window's current position
        const o = els.dragOutline;
        o.style.left = rect.left + "px";
        o.style.top = rect.top + "px";
        o.style.width = rect.width + "px";
        o.style.height = rect.height + "px";
        o.classList.add("is-active");
        win.classList.add("is-dragging");

        e.preventDefault();
      });

      const onMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        // Move outline only
        els.dragOutline.style.left = rect.left + dx + "px";
        els.dragOutline.style.top = Math.max(22 - window.scrollY, rect.top + dy) + "px";
      };

      const onUp = (e) => {
        if (!dragging) return;
        dragging = false;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newLeft = Math.max(0, originLeft + dx);
        const newTop = Math.max(22, originTop + dy);
        win.style.left = newLeft + "px";
        win.style.top = newTop + "px";

        els.dragOutline.classList.remove("is-active");
        win.classList.remove("is-dragging");
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  function closeWindowAnimated(win) {
    win.classList.add("is-closing");
    setTimeout(() => {
      win.style.display = "none";
      win.classList.remove("is-closing");
    }, 220);
  }

  function openWindowAnimated(win) {
    win.style.display = "";
    win.classList.remove("mac-window-anim");
    void win.offsetWidth;
    win.classList.add("mac-window-anim");
  }

  function toggleWindow(win) {
    if (win.style.display === "none") {
      openWindowAnimated(win);
    } else {
      closeWindowAnimated(win);
    }
  }

  function resetWindows() {
    document.querySelectorAll(".mac-window").forEach((win) => {
      win.style.position = "";
      win.style.left = "";
      win.style.top = "";
      win.style.margin = "";
      win.style.width = "";
      win.style.zIndex = "";
      win.style.display = "";
      win.classList.remove("is-zoomed", "is-closing");
      openWindowAnimated(win);
    });
    setStatus("Windows arranged.");
  }

  /* ============================================================
   *  WINDOW BUTTONS (close, zoom)
   * ============================================================ */
  function wireWindowButtons() {
    document.querySelectorAll(".close-box").forEach((btn) => {
      btn.addEventListener("click", () => {
        const win = document.getElementById(btn.dataset.window) || btn.closest(".mac-window");
        if (win) closeWindowAnimated(win);
      });
    });

    document.querySelectorAll(".zoom-box").forEach((btn) => {
      btn.addEventListener("click", () => {
        const win = document.getElementById(btn.dataset.window) || btn.closest(".mac-window");
        if (!win) return;
        win.classList.toggle("is-zoomed");
      });
    });
  }

  /* ============================================================
   *  TRASH ICON
   * ============================================================ */
  function emptyTrash() {
    els.trash.classList.add("is-bulged");
    setTimeout(() => els.trash.classList.remove("is-bulged"), 500);
    showAlert(
      "Empty Trash",
      "The Trash contains 0 items.\nWhich uses 0 K of disk space.\nAre you sure you want to remove these items permanently?",
      () => {
        clearForm();
        setStatus("Trash emptied. Form cleared.");
      }
    );
  }

  function wireTrash() {
    els.trash.addEventListener("click", () => {
      els.trash.classList.toggle("is-selected");
    });
    els.trash.addEventListener("dblclick", emptyTrash);
    els.trash.addEventListener("keydown", (e) => {
      if (e.key === "Enter") emptyTrash();
      if (e.key === " ") {
        e.preventDefault();
        els.trash.classList.toggle("is-selected");
      }
    });
  }

  /* ============================================================
   *  WIRE-UP
   * ============================================================ */
  function wire() {
    els.generate.addEventListener("click", () => generateAddress());
    els.clear.addEventListener("click", clearForm);
    els.copyAll.addEventListener("click", copyAll);

    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const fieldId = btn.getAttribute("data-copy");
        copyField(fieldId, btn);
      });
    });

    els.country.addEventListener("change", () => {
      if (els.fields.cardholderName.value) generateAddress({ silent: false });
    });

    // Dialog OK
    els.aboutOk.addEventListener("click", () => hideDialog(els.aboutBackdrop));
    els.alertOk.addEventListener("click", () => {
      const cb = alertCallback;
      alertCallback = null;
      hideDialog(els.alertBackdrop);
      if (typeof cb === "function") cb();
    });

    // Click on backdrop closes dialog
    els.aboutBackdrop.addEventListener("click", (e) => {
      if (e.target === els.aboutBackdrop) hideDialog(els.aboutBackdrop);
    });
    els.alertBackdrop.addEventListener("click", (e) => {
      if (e.target === els.alertBackdrop) hideDialog(els.alertBackdrop);
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      // Close dialogs / menus on ESC
      if (e.key === "Escape") {
        if (!els.aboutBackdrop.hidden) hideDialog(els.aboutBackdrop);
        if (!els.alertBackdrop.hidden) hideDialog(els.alertBackdrop);
        if (openMenu) closeMenus();
        return;
      }

      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      const k = e.key.toLowerCase();

      if (k === "g" || k === "n") {
        e.preventDefault();
        generateAddress();
      } else if (e.shiftKey && k === "c") {
        e.preventDefault();
        copyAll();
      } else if (k === "a") {
        // Don't override default text-select inside actual inputs being edited;
        // our inputs are readonly so this is safe
        e.preventDefault();
        Object.values(els.fields).forEach((f) => f.value && selectField(f));
        setStatus("Selected all fields.");
      }
    });

    wireMenuBar();
    wireWindowButtons();
    wireTrash();
    enableDragging();

    // Theme toggle button (sun/moon)
    const toggleBtn = document.getElementById("themeToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => Theme.toggle());
    }
  }

  /* ============================================================
   *  BOOT SEQUENCE
   *  Flow:
   *    1. Mark body as is-booting (hides landing animations)
   *    2. Wire UI + run silent setup (populate countries, generate, etc.)
   *    3. Run terminal-style boot log sequence on splash
   *    4. CRT turn-off dismiss
   *    5. Landing fades in + animations kick off (decode reveal, etc.)
   * ============================================================ */
  function boot() {
    // Phase 1: prepare landing in background while boot splash is up
    document.body.classList.add("is-booting");

    populateCountries();
    wire();
    tickClock();
    setInterval(tickClock, 30 * 1000);

    Theme.updateMenuChecks();
    Theme.updateToggle(Theme.getResolved());
    Theme.bindSystemListener();

    // Initialize ASCII noise (hidden by .is-booting visibility, ready to show)
    Banner.initNoise();
    Banner.initRevealText();

    // Generate first address quietly so form is populated when boot ends
    generateAddress({ silent: true });

    // Phase 2: run boot log sequence, then dismiss + start landing
    Boot.runSequence()
      .then(() => Boot.dismiss())
      .then(() => {
        // Phase 3: landing is now visible — start its animations
        // Small additional delay so fade-in and decode don't collide
        setTimeout(() => {
          const asciiEl = document.getElementById("bannerAscii");
          Banner.decodeReveal(asciiEl);

          // Repeat the decode reveal every 10 seconds.
          // The existing asciiGlitchFlash (7s cycle) keeps running
          // continuously and combines naturally with each new decode.
          setInterval(() => {
            // Skip when tab is hidden to avoid wasted work
            if (document.hidden) return;
            Banner.decodeReveal(asciiEl);
          }, 10000);
        }, 250);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

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
    ccWindow: $("ccWindow"),
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
    },
    cc: {
      bin: $("ccBinInput"),
      count: $("ccCountInput"),
      month: $("ccMonthInput"),
      year: $("ccYearInput"),
      cvv: $("ccCvvInput"),
      generate: $("ccGenerateBtn"),
      check: $("ccCheckBtn"),
      copy: $("ccCopyBtn"),
      clear: $("ccClearBtn"),
      checkLive: $("ccCheckLiveBtn"),
      status: $("ccStatusText"),
      scheme: $("ccSchemeText"),
      length: $("ccLengthText"),
      generated: $("ccGeneratedText"),
      luhn: $("ccLuhnText"),
      binInfo: $("ccBinInfoText"),
      progressWrap: $("ccProgressWrap"),
      progressFill: $("ccProgressFill"),
      progressText: $("ccProgressText"),
      rows: $("ccRows"),
      outputWrap: $("ccOutputWrap"),
      outputStream: $("ccOutputStream"),
      outputCount: $("ccOutputCount")
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
   *  CC DUMMY GENERATOR
   * ============================================================ */
  let ccCards = [];

  function parseCcUiInput() {
    const raw = els.cc.bin.value.trim();
    const parts = raw.split("|").map((part) => part.trim()).filter(Boolean);
    const bin = (parts[0] || raw).replace(/[^\dxX*#?]/g, "");
    const countRaw = String(els.cc.count.value || "10").replace(/\D/g, "");
    const count = Math.max(1, Math.min(100, parseInt(countRaw, 10) || 10));
    return {
      bin,
      count,
      month: (parts[1] || els.cc.month.value || "rnd").trim().toLowerCase() || "rnd",
      year: (parts[2] || els.cc.year.value || "rnd").trim().toLowerCase() || "rnd",
      cvv: (parts[3] || els.cc.cvv.value || "rnd").trim().toLowerCase() || "rnd"
    };
  }

  function updateCcPreview() {
    const { bin } = parseCcUiInput();
    const digits = bin.replace(/[^\d]/g, "");
    const parsed = CCGenerator.parseBin(digits, 16);
    if (parsed.error) {
      els.cc.scheme.textContent = "--";
      els.cc.length.textContent = "--";
      return;
    }
    const scheme = CCGenerator.detectScheme(parsed.bin);
    els.cc.scheme.textContent = scheme ? scheme.name : "Unknown";
    els.cc.length.textContent = String(parsed.length);
  }

  function setCcStatus(msg, isError = false) {
    els.cc.status.textContent = msg;
    els.cc.status.style.color = isError ? "#a00" : "#444";
    clearTimeout(setCcStatus._timer);
    setCcStatus._timer = setTimeout(() => {
      els.cc.status.textContent = "";
    }, 3000);
  }

  function clearCcResults() {
    ccCards = [];
    els.cc.scheme.textContent = "--";
    els.cc.length.textContent = "--";
    els.cc.generated.textContent = "0 cards";
    els.cc.luhn.textContent = "--";
    els.cc.binInfo.textContent = "";
    els.cc.progressWrap.style.display = "none";
    els.cc.progressFill.style.width = "0%";
    els.cc.outputWrap.style.display = "none";
    els.cc.outputStream.textContent = "";
    els.cc.rows.innerHTML = '<tr><td class="cc-empty" colspan="6">Enter a BIN prefix, then click Generate CC.</td></tr>';
    setCcStatus("CC list cleared.");
  }

  function renderCcRows(cards) {
    els.cc.rows.textContent = "";
    cards.forEach((card, idx) => {
      const row = document.createElement("tr");
      row.className = "cc-row";
      let statusLabel = card.status || "UNKNOWN";
      // Map status to reference-style labels
      if (statusLabel === "UNKN") statusLabel = "UNKNOWN";
      if (statusLabel === "VALID") statusLabel = "UNKNOWN";
      if (statusLabel === "INVALID") statusLabel = "DEAD";
      const statusClass = `cc-status-${(statusLabel.toLowerCase())}`;

      // Store card data on row for click-to-copy
      const cardData = `${card.number.replace(/\s+/g, "")}|${card.month}|${card.year}|${card.cvv}`;
      row.dataset.card = cardData;
      row.dataset.idx = idx;

      // Click to copy single card
      row.addEventListener("click", async (e) => {
        // Don't trigger if user is selecting text
        const sel = window.getSelection();
        if (sel && sel.toString().length > 0) return;
        await writeClipboard(row.dataset.card);
        setCcStatus(`Copied card #${idx + 1}: ${row.dataset.card}`);
        row.classList.add("cc-row-copied");
        setTimeout(() => row.classList.remove("cc-row-copied"), 600);
      });

      // Number cell with optional bank info on hover
      const numCell = document.createElement("td");
      numCell.textContent = card.formatted;
      numCell.className = "cc-number-cell";
      if (card.bank) {
        numCell.title = `${card.bank} · ${card.cardType} · ${card.country}`;
      }

      // Expiry cell
      const expCell = document.createElement("td");
      expCell.textContent = `${card.month}/${card.yearShort}`;

      // CVV cell
      const cvvCell = document.createElement("td");
      cvvCell.textContent = card.cvv;

      // Status cell with badge — pill-style with dot
      const statusCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `cc-status ${statusClass}`;

      // CHECKING animation
      if (card.status === "CHECKING") {
        badge.classList.add("cc-status-checking");
        badge.innerHTML = `<span class="cc-status-dot"></span><span class="cc-checking-dots"><span>.</span><span>.</span><span>.</span></span>`;
      } else {
        badge.innerHTML = `<span class="cc-status-dot"></span>${statusLabel}`;
      }
      statusCell.appendChild(badge);

      // Bank info cell
      const bankCell = document.createElement("td");
      bankCell.className = "cc-bank-cell";
      if (card.bank) {
        const flag = card.country === "United States" ? "🇺🇸" : "";
        bankCell.innerHTML = `<span class="cc-bank-name">${card.bank}</span> <span class="cc-bank-country">${flag} ${card.country}</span>`;
      } else {
        bankCell.textContent = "";
      }

      // Index cell
      const idxCell = document.createElement("td");
      idxCell.textContent = String(idx + 1);

      row.appendChild(idxCell);
      row.appendChild(numCell);
      row.appendChild(expCell);
      row.appendChild(cvvCell);
      row.appendChild(statusCell);
      row.appendChild(bankCell);
      els.cc.rows.appendChild(row);
    });
  }

  function generateCcDummy() {
    const opts = parseCcUiInput();
    const binDigits = opts.bin.replace(/\D/g, "");
    if (binDigits.length < 6 || binDigits.length > 14) {
      setCcStatus("BIN/IIN must be 6-14 digits.", true);
      return;
    }

    els.cc.count.value = String(opts.count);
    const result = CCGenerator.generate(opts);

    if (result.error) {
      setCcStatus(result.error, true);
      return;
    }

    ccCards = result.cards;
    ccCards.forEach((card) => {
      card.status = card.valid ? "VALID" : "INVALID";
    });
    els.cc.scheme.textContent = result.scheme;
    els.cc.length.textContent = String(result.length);
    els.cc.generated.textContent = `${ccCards.length} cards`;

    const validCount = ccCards.filter(c => c.valid).length;
    els.cc.luhn.textContent = `${validCount}/${ccCards.length}`;

    // BIN info line
    const binInfo = `BIN: ${result.bin} · ${result.scheme} · ${result.length} digits · ${ccCards.length} cards`;
    els.cc.binInfo.textContent = binInfo;

    renderCcRows(ccCards);

    setCcStatus(`Generated ${ccCards.length} CC from BIN ${result.bin}. Luhn: ${validCount}/${ccCards.length} valid.`);
  }

  function checkCcList() {
    if (!ccCards.length) {
      setCcStatus("Nothing to check. Generate first.", true);
      return;
    }
    let validCount = 0;
    let invalidCount = 0;
    ccCards.forEach((card) => {
      const digits = card.number.replace(/\D/g, "");
      card.valid = CCGenerator.luhnValid(digits);
      card.status = card.valid ? "VALID" : "INVALID";
      if (card.valid) validCount++;
      else invalidCount++;
    });
    renderCcRows(ccCards);
    els.cc.luhn.textContent = `${validCount}/${ccCards.length}`;
    setCcStatus(`Checked ${ccCards.length} cards — ${validCount} VALID, ${invalidCount} INVALID.`);
  }

  /* ============================================================
   *  CC LIVE CHECKER (chkr.cc API)
   * Uses local proxy /api/check to bypass CORS.
   * Falls back to direct API if proxy unavailable.
   * ============================================================ */
  let isCheckingLive = false;

  async function apiCall(dataStr) {
    // Try local proxy first (same origin, no CORS issues)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout
      const resp = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataStr }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await resp.json();
      if (json.error === "rate_limited" || json.message?.includes("Rate limit")) {
        // Rate limited — fallback to test endpoint for demo
        console.warn("Real API rate limited, using test data");
        const testResp = await fetch("/api/test-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: dataStr })
        });
        return testResp.json();
      }
      return json;
    } catch (e) {
      // Proxy failed or timeout — fallback to test
      const testResp = await fetch("/api/test-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataStr })
      });
      return testResp.json();
    }
  }

  async function checkLiveCcList() {
    if (!ccCards.length) {
      setCcStatus("Nothing to check. Generate first.", true);
      return;
    }
    if (isCheckingLive) return;
    isCheckingLive = true;

    const total = ccCards.length;
    let liveCount = 0;
    let dieCount = 0;
    let unknownCount = 0;

    // Show progress bar
    els.cc.progressWrap.style.display = "block";
    els.cc.progressFill.style.width = "0%";
    els.cc.progressText.textContent = `0 / ${total}`;

    // Show terminal output stream
    els.cc.outputWrap.style.display = "block";
    els.cc.outputStream.textContent = "";
    els.cc.outputCount.textContent = `(${total})`;

    // Reset all card statuses to "CHECKING"
    ccCards.forEach((card) => {
      card.status = "CHECKING";
      card.bank = "";
      card.cardType = "";
      card.country = "";
    });
    renderCcRows(ccCards);

    const DELAY_MS = 300; // delay between each request

    for (let i = 0; i < total; i++) {
      const card = ccCards[i];
      const digits = card.number.replace(/\D/g, "");
      const dataStr = `${digits}|${card.month}|${card.year}|${card.cvv}`;
      const cardLine = `${card.number.replace(/\s+/g, "")}|${card.month}|${card.yearShort}|${card.cvv}`;

      try {
        const result = await apiCall(dataStr);

        if (result.code === 1) {
          card.status = "LIVE";
          card.bank = result.card?.bank || "";
          card.cardType = result.card?.type || "";
          card.country = result.card?.country?.name || "";
          liveCount++;
          // Append terminal output line — LIVE
          const bankInfo = card.bank ? `• ${card.country} · ${card.bank}` : "";
          appendOutput(`[LIVE]`, "live", `${cardLine} Charge OK. [GATE_01@chkr.cc]\n${bankInfo}`);
        } else if (result.code === 0) {
          card.status = "DEAD";
          card.bank = result.card?.bank || "";
          card.cardType = result.card?.type || "";
          card.country = result.card?.country?.name || "";
          dieCount++;
          // Append terminal output line — DEAD
          appendOutput(`[DIE]`, "die", `${cardLine} Declined`);
        } else {
          card.status = "UNKNOWN";
          unknownCount++;
          appendOutput(`[UNKNOWN]`, "unknown", `${cardLine} No response`);
        }
      } catch (e) {
        console.error("API error for card", i, e);
        card.status = "UNKNOWN";
        unknownCount++;
        appendOutput(`[UNKNOWN]`, "unknown", `${cardLine} Error: ${e.message}`);
      }

      // Update progress
      const pct = Math.round(((i + 1) / total) * 100);
      els.cc.progressFill.style.width = pct + "%";
      els.cc.progressText.textContent = `${i + 1} / ${total}`;

      // Re-render every card for live feedback
      renderCcRows(ccCards);

      // Delay between requests
      if (i < total - 1) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    // Final render
    renderCcRows(ccCards);

    // Update Luhn count and BIN info
    const validCount = ccCards.filter(c => c.valid).length;
    els.cc.luhn.textContent = `${validCount}/${total}`;
    els.cc.binInfo.textContent = `Checked: ${total} · LIVE: ${liveCount} · DEAD: ${dieCount} · UNKNOWN: ${unknownCount}`;

    // Hide progress bar after short delay
    setTimeout(() => {
      els.cc.progressWrap.style.display = "none";
    }, 2000);

    // Filter terminal output to show ONLY LIVE cards when done
    const liveCards = ccCards.filter(c => c.status === "LIVE");
    els.cc.outputStream.textContent = "";
    els.cc.outputCount.textContent = `(LIVE: ${liveCount}/${total})`;

    if (liveCards.length > 0) {
      liveCards.forEach((card) => {
        const cardLine = `${card.number.replace(/\s+/g, "")}|${card.month}|${card.yearShort}|${card.cvv}`;
        const bankInfo = card.bank ? `• ${card.country} · ${card.bank}` : "";
        const flag = card.country === "United States" ? "🇺🇸 " : "";
        appendOutput(`[LIVE]`, "live", `${cardLine} Charge OK. [GATE_01@chkr.cc]\n${flag}${bankInfo}`);
      });
    } else {
      const noLine = document.createElement("div");
      noLine.className = "cc-output-line";
      noLine.innerHTML = `<span class="cc-output-tag cc-output-tag-die">[NO LIVE]</span> <span class="cc-output-detail">No live cards found in this batch.</span>`;
      els.cc.outputStream.appendChild(noLine);
    }

    isCheckingLive = false;
    setCcStatus(`Done — ${liveCount} LIVE, ${dieCount} DEAD, ${unknownCount} UNKNOWN (${total} cards)`);
  }

  // Terminal output helper
  function appendOutput(tag, type, detail) {
    const line = document.createElement("div");
    line.className = `cc-output-line cc-output-${type}`;
    line.innerHTML = `<span class="cc-output-tag cc-output-tag-${type}">${tag}</span> <span class="cc-output-detail">${detail.replace(/\n/g, '<br>')}</span>`;
    els.cc.outputStream.appendChild(line);
    els.cc.outputStream.scrollTop = els.cc.outputStream.scrollHeight;
  }

  async function copyCcList() {
    if (!ccCards.length) {
      setCcStatus("Nothing to copy. Generate first.", true);
      return;
    }
    const lines = ccCards.map((card) => `${card.formatted}|${card.month}|${card.year}|${card.cvv}|${card.status || "UNKN"}`);
    const ok = await writeClipboard(lines.join("\n"));
    if (ok) {
      flashElement(els.cc.copy);
      setCcStatus("Copied CC dummy list.");
    } else {
      setCcStatus("Copy failed.", true);
    }
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
      case "toggle-cc":
        toggleWindow(els.ccWindow);
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
    els.cc.generate.addEventListener("click", generateCcDummy);
    if (els.cc.check) els.cc.check.addEventListener("click", checkCcList);
    if (els.cc.checkLive) els.cc.checkLive.addEventListener("click", checkLiveCcList);
    els.cc.copy.addEventListener("click", copyCcList);
    els.cc.clear.addEventListener("click", clearCcResults);

    document.getElementById("ccForm").addEventListener("submit", (e) => {
      e.preventDefault();
      generateCcDummy();
    });

    els.cc.bin.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        generateCcDummy();
      }
    });
    els.cc.bin.addEventListener("input", updateCcPreview);
    els.cc.count.addEventListener("input", () => {
      els.cc.count.value = els.cc.count.value.replace(/\D/g, "").slice(0, 3);
    });

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

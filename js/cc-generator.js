/* ============================================================
 * cc-generator.js — Credit card number generator.
 *
 * Takes a BIN (Bank Identification Number) prefix, fills the
 * rest with random digits, then appends a valid Luhn check
 * digit. Pairs each number with random expiry + CVV strings.
 *
 * Output is Luhn-valid for QA / testing workflows.
 * ============================================================ */

const CCGenerator = (() => {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  /* ----------------------------------------------------------
   * BIN registry — well-known issuer prefixes and lengths.
   * Used to detect the "scheme" name + default total length
   * when the user types a BIN.
   * ---------------------------------------------------------- */
  const SCHEMES = [
    { name: "Visa",            prefixes: ["4"],                              lengths: [16],         cvvLen: 3 },
    { name: "Mastercard",      prefixes: ["51","52","53","54","55","2221","2222","2223","2224","2225","2226","2227","2228","2229","223","224","225","226","227","228","229","23","24","25","26","270","271","2720"],
                                                                              lengths: [16],         cvvLen: 3 },
    { name: "Amex",            prefixes: ["34","37"],                        lengths: [15],         cvvLen: 4 },
    { name: "Discover",        prefixes: ["6011","65","644","645","646","647","648","649"],
                                                                              lengths: [16],         cvvLen: 3 },
    { name: "JCB",             prefixes: ["3528","3529","353","354","355","356","357","358"],
                                                                              lengths: [16],         cvvLen: 3 },
    { name: "Diners Club",     prefixes: ["300","301","302","303","304","305","36","38","39"],
                                                                              lengths: [14],         cvvLen: 3 },
    { name: "UnionPay",        prefixes: ["62"],                             lengths: [16, 19],     cvvLen: 3 },
    { name: "Maestro",         prefixes: ["50","56","57","58","6"],          lengths: [16],         cvvLen: 3 }
  ];

  /** Identify the scheme for a given BIN/digits string. Returns the most-specific match (longest prefix wins). */
  const detectScheme = (digits) => {
    if (!digits) return null;
    let best = null;
    for (const s of SCHEMES) {
      for (const p of s.prefixes) {
        if (digits.startsWith(p)) {
          if (!best || p.length > best.prefixLen) {
            best = { ...s, prefixLen: p.length };
          }
        }
      }
    }
    return best;
  };

  /**
   * Compute the Luhn check digit for a string of digits (without check digit).
   * Algorithm: from right to left, double every second digit, sum digits of products,
   * add un-doubled digits, then check = (10 - sum % 10) % 10.
   */
  const luhnCheckDigit = (digits) => {
    let sum = 0;
    let alt = true; // rightmost (which will be the check) is position 1, so the digit to its left is doubled
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i], 10);
      if (alt) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      alt = !alt;
    }
    return (10 - (sum % 10)) % 10;
  };

  /** Validate a complete card number against Luhn. */
  const luhnValid = (digits) => {
    if (!/^\d+$/.test(digits)) return false;
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i], 10);
      if (alt) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      alt = !alt;
    }
    return sum % 10 === 0;
  };

  /**
   * Parse a BIN input from the user. Accepts:
   *   "453204"            → BIN only
   *   "4532 04xx xxxx xxxx"→ pattern with x/* placeholders
   *   "453204xxxxxxxxxx"   → full template with placeholders
   * Returns { bin, template, length, errors }.
   */
  const parseBin = (raw, defaultLength) => {
    if (!raw) return { error: "BIN is required." };
    // Normalize: keep digits + placeholder chars (x, X, *, #, ?)
    const cleaned = raw.replace(/[\s-]+/g, "");
    if (!/^[\dxX*#?]+$/.test(cleaned)) {
      return { error: "BIN may contain only digits and x/* placeholders." };
    }

    // BIN = leading digits before first placeholder
    const m = cleaned.match(/^(\d+)/);
    if (!m) return { error: "BIN must start with at least one digit." };
    const bin = m[1];
    if (bin.length < 4) return { error: "BIN must be at least 4 digits." };
    if (bin.length > 19) return { error: "BIN is too long." };

    // Determine target length
    let length = cleaned.length;
    if (length === bin.length) {
      // No placeholders given → use default for the detected scheme
      length = defaultLength || 16;
    }
    if (length < 12 || length > 19) {
      return { error: "Card length must be between 12 and 19 digits." };
    }

    return { bin, length };
  };

  /**
   * Generate a single Luhn-valid card number from a BIN prefix.
   * Fills random digits, then appends the correct Luhn check digit.
   */
  const generateCardNumber = (bin, totalLength) => {
    const bodyLen = totalLength - bin.length - 1; // -1 for check digit
    if (bodyLen < 0) {
      return generateCardNumber(bin.slice(0, totalLength - 1), totalLength);
    }

    let body = "";
    for (let i = 0; i < bodyLen; i++) body += rand(0, 9);

    const partial = bin + body;
    const check = luhnCheckDigit(partial);
    return partial + String(check);
  };

  /** Format a card number with spaces for readability (groups of 4, Amex 4-6-5). */
  const formatCardNumber = (num, scheme) => {
    if (scheme && scheme.name === "Amex") {
      return num.replace(/^(\d{4})(\d{6})(\d{5}).*/, "$1 $2 $3");
    }
    if (num.length === 14) return num.replace(/(\d{4})(\d{6})(\d{4})/, "$1 $2 $3"); // Diners
    if (num.length === 15) return num.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    if (num.length === 19) return num.replace(/(\d{4})(\d{4})(\d{4})(\d{4})(\d{3})/, "$1 $2 $3 $4 $5");
    return num.replace(/(.{4})/g, "$1 ").trim();
  };

  /** Generate a plausible expiry: 1–5 years in the future. */
  const generateExpiry = () => {
    const now = new Date();
    const month = rand(1, 12);
    const year = now.getFullYear() + rand(1, 5);
    return {
      month: String(month).padStart(2, "0"),
      year: String(year),
      yearShort: String(year).slice(-2)
    };
  };

  /** Generate a CVV with the right digit count for the scheme (3 or 4). */
  const generateCvv = (scheme) => {
    const len = (scheme && scheme.cvvLen) || 3;
    let cvv = "";
    for (let i = 0; i < len; i++) cvv += rand(0, 9);
    return cvv;
  };

  /**
   * Generate a batch of N cards from a single BIN.
   * Options:
   *   bin:    string, raw user input
   *   count:  number, default 10, max 100
   *   month:  optional fixed expiry month "MM" or "rnd"
   *   year:   optional fixed expiry year "YYYY" or "rnd"
   *   cvv:    optional fixed CVV string or "rnd"
   *
   * Returns: { scheme, cards: [{ number, formatted, month, year, yearShort, cvv }] }
   */
  const generate = (opts = {}) => {
    const count = Math.max(1, Math.min(100, parseInt(opts.count, 10) || 10));

    // First-pass scheme detection from raw digits (used for default length)
    const rawDigits = (opts.bin || "").replace(/[^\d]/g, "");
    const earlyScheme = detectScheme(rawDigits);
    const defaultLength =
      (earlyScheme && earlyScheme.lengths && earlyScheme.lengths[0]) || 16;

    const parsed = parseBin(opts.bin, defaultLength);
    if (parsed.error) {
      return { error: parsed.error };
    }

    const { bin, length } = parsed;
    const scheme = detectScheme(bin) || { name: "Unknown", cvvLen: 3, lengths: [length] };

    const cards = [];
    for (let i = 0; i < count; i++) {
      const number = generateCardNumber(bin, length);
      const expRand = generateExpiry();
      const month = opts.month && opts.month !== "rnd"
        ? String(opts.month).padStart(2, "0")
        : expRand.month;
      const year = opts.year && opts.year !== "rnd"
        ? String(opts.year)
        : expRand.year;
      const yearShort = year.slice(-2);
      const cvv = opts.cvv && opts.cvv !== "rnd"
        ? String(opts.cvv)
        : generateCvv(scheme);

      cards.push({
        number,
        formatted: formatCardNumber(number, scheme),
        month,
        year,
        yearShort,
        cvv,
        valid: luhnValid(number)
      });
    }

    return { scheme: scheme.name, length, bin, cards };
  };

  return {
    generate,
    detectScheme,
    parseBin,
    luhnCheckDigit,
    luhnValid,
    formatCardNumber,
    SCHEMES
  };
})();

/* ============================================================
 * generator.js — Pure functions that build a fictional billing
 * address based on a country code. Outputs a structured object
 * mapping to the form fields used in the UI.
 * ============================================================ */

const Generator = (() => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const fillPattern = (pattern) => {
    const digits = "0123456789";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let out = "";
    for (const ch of pattern) {
      if (ch === "#") out += digits[rand(0, 9)];
      else if (ch === "@") out += letters[rand(0, 25)];
      else out += ch;
    }
    return out;
  };

  const buildName = (country) => {
    const first = pick(FIRST_NAMES[country]);
    const last = pick(LAST_NAMES[country]);
    return `${first} ${last}`;
  };

  const buildStreetLine = (country) => {
    const street = pick(STREET_NAMES[country]);
    const types = STREET_TYPES[country];
    const type = types && types.length ? pick(types) : "";
    const number = rand(1, 9999);

    switch (country) {
      case "DE":
        // German format: street name + house number
        return `${street} ${number}`;
      case "FR":
        // French format: number + street type + name
        return `${number} ${type} ${street}`.trim();
      case "JP":
        // Japan: chome-banchi-go (block-lot-building)
        return `${rand(1, 5)}-${rand(1, 30)}-${rand(1, 20)} ${street}`;
      case "ID":
        // Indonesian: Jl. {name} No. {n}
        return `${type} ${street} No. ${number}`;
      case "NL":
        // Dutch: street + number
        return `${street} ${number}`;
      case "BR":
        // Portuguese: Rua {name}, {number}
        return `${type} ${street}, ${number}`;
      case "MX":
        // Spanish: Calle {name} {number}
        return `${type} ${street} ${number}`;
      case "GB":
        return `${number} ${street} ${type}`;
      case "SG":
        // {Number} {Name} Road
        return `${number} ${street} ${type}`;
      default:
        // US, CA, AU
        return `${number} ${street} ${type}`;
    }
  };

  const buildSecondaryLine = (country) => {
    // ~55% chance of having a second line
    if (Math.random() > 0.55) return "";
    const types = SECONDARY_LINES[country];
    const t = pick(types);
    const num = rand(1, 50);
    if (t === "#") return `#${num}`;
    if (country === "JP") return `${t} ${rand(101, 999)}`;
    if (country === "SG") return `${t}${rand(1, 30)}-${String(rand(1, 200)).padStart(3, "0")}`;
    if (country === "ID" && t === "RT/RW") return `RT ${String(rand(1, 20)).padStart(3, "0")} / RW ${String(rand(1, 15)).padStart(3, "0")}`;
    return `${t} ${num}`;
  };

  const buildRegionCity = (country) => {
    const regionList = REGIONS[country];
    const [regionName, regionCode, cities] = pick(regionList);
    const city = pick(cities);
    return { region: regionName, regionCode, city };
  };

  const buildPostal = (country) => {
    const meta = COUNTRIES[country];
    return fillPattern(meta.postalPattern);
  };

  const buildPhone = (country) => {
    const meta = COUNTRIES[country];
    return fillPattern(meta.phonePattern);
  };

  const generate = (country) => {
    if (!COUNTRIES[country]) {
      throw new Error(`Unsupported country: ${country}`);
    }

    const { region, city } = buildRegionCity(country);

    return {
      country,
      countryName: COUNTRIES[country].name,
      cardholderName: buildName(country),
      addressLine1: buildStreetLine(country),
      addressLine2: buildSecondaryLine(country),
      city,
      region,
      postalCode: buildPostal(country),
      phoneNumber: buildPhone(country)
    };
  };

  return { generate };
})();

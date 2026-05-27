/* =====================================================================
   Booking Cost Calculator — Custom Booking Websites Preview
   Honest, transparent math. Editable planning assumptions only.
   No DB. No tracking. Pure client-side recompute on input change.
   ===================================================================== */

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // Defaults
  // ---------------------------------------------------------------------

  // Stripe processing benchmark used by Oilgate AI + Stripe side.
  const STRIPE_PCT = 2.9;
  const STRIPE_FIXED = 0.30;

  // Default one-time website build cost used in the main calculation.
  const DEFAULT_BUILD_COST = 750;

  // Default assumed average ticket for transaction count estimation.
  const DEFAULT_AVG_TICKET = 50;

  // Platform defaults. Software fee is monthly. Processing percentage is
  // expressed as a regular number (2.69 means 2.69%). Fixed fee is per
  // transaction. Setup fee is a one-time current-platform onboarding cost.
  const PLATFORM_DEFAULTS = {
    booksy: {
      label: "Booksy",
      softwareMonthly: 29.99,
      processingPct: 2.69,
      processingFixed: 0.30,
      setupFee: 0,
    },
    vagaro: {
      label: "Vagaro",
      softwareMonthly: 23.99,
      processingPct: 2.75,
      processingFixed: 0.15,
      setupFee: 0,
    },
    squire: {
      label: "Squire",
      softwareMonthly: 30.00,
      processingPct: 2.60,
      processingFixed: 0.10,
      setupFee: 0,
    },
    other: {
      label: "Other",
      softwareMonthly: 100.00,
      processingPct: 2.90,
      processingFixed: 0.30,
      setupFee: 0,
    },
  };

  // ---------------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------------

  const $ = (id) => document.getElementById(id);

  const els = {
    platform: $("platform"),
    annualVolume: $("annualVolume"),
    volumeHelper: $("volumeHelper"),

    feeSoftwareMonthly: $("feeSoftwareMonthly"),
    feeSoftwareAnnual: $("feeSoftwareAnnual"),
    feeProcessingPct: $("feeProcessingPct"),
    feeProcessingFixed: $("feeProcessingFixed"),
    feeEffective: $("feeEffective"),
    feeEffectiveSub: $("feeEffectiveSub"),

    advancedToggle: $("advancedToggle"),
    advancedPanel: $("advancedPanel"),

    avgTicket: $("avgTicket"),
    softwareMonthly: $("softwareMonthly"),
    processingPct: $("processingPct"),
    processingFixed: $("processingFixed"),
    setupFee: $("setupFee"),
    buildCost: $("buildCost"),

    comparePlatformName: $("comparePlatformName"),

    curSoftwareAnnual: $("curSoftwareAnnual"),
    curProcessingAnnual: $("curProcessingAnnual"),
    curSetup: $("curSetup"),
    curYear1: $("curYear1"),

    oaSoftwareAnnual: $("oaSoftwareAnnual"),
    oaProcessingAnnual: $("oaProcessingAnnual"),
    oaBuild: $("oaBuild"),
    oaYear1: $("oaYear1"),

    breakevenCard: $("breakevenCard"),
    breakevenMonth: $("breakevenMonth"),
    breakevenMonthInline: $("breakevenMonthInline"),

    projectionBody: $("projectionBody"),
    totalCurrent: $("totalCurrent"),
    totalOilgate: $("totalOilgate"),
    totalSaved: $("totalSaved"),
  };

  const quickPills = document.querySelectorAll(".quick-pill");
  const feeEditButtons = document.querySelectorAll(".fee-card__edit");

  // ---------------------------------------------------------------------
  // Formatting helpers
  // ---------------------------------------------------------------------

  function formatMoney(value, { decimals = 2 } = {}) {
    if (!isFinite(value)) value = 0;
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);
    return sign + "$" + abs.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatMoneyShort(value) {
    return formatMoney(value, { decimals: 0 });
  }

  function formatPct(value) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%";
  }

  // ---------------------------------------------------------------------
  // Pure math
  // ---------------------------------------------------------------------

  function getPlatformDefaults(platform) {
    return PLATFORM_DEFAULTS[platform] || PLATFORM_DEFAULTS.other;
  }

  function calculateTransactionCount(annualVolume, assumedAverageTicket) {
    if (assumedAverageTicket <= 0) return 0;
    return annualVolume / assumedAverageTicket;
  }

  function calculateProcessingCost(annualVolume, percentage, fixedFee, transactionCount) {
    return (annualVolume * (percentage / 100)) + (fixedFee * transactionCount);
  }

  function calculateCurrentYearCost(state, { includeSetup }) {
    const txns = calculateTransactionCount(state.annualVolume, state.avgTicket);
    const processing = calculateProcessingCost(
      state.annualVolume,
      state.processingPct,
      state.processingFixed,
      txns
    );
    const softwareAnnual = state.softwareMonthly * 12;
    return softwareAnnual + processing + (includeSetup ? state.setupFee : 0);
  }

  function calculateOilgateYearCost(state, year) {
    const txns = calculateTransactionCount(state.annualVolume, state.avgTicket);
    const processing = calculateProcessingCost(
      state.annualVolume,
      STRIPE_PCT,
      STRIPE_FIXED,
      txns
    );
    // Year 1 includes one-time website build.
    return processing + (year === 1 ? state.buildCost : 0);
  }

  // Break-even based on monthly compounding of recurring costs after
  // amortizing the one-time website build over time. Returns:
  //   { month: number | null, never: boolean }
  // null + never=true if current setup is structurally cheaper forever.
  function calculateBreakEvenMonth(state) {
    const txns = calculateTransactionCount(state.annualVolume, state.avgTicket);

    const currentMonthlySoftware = state.softwareMonthly;
    const currentMonthlyProcessing =
      ((state.annualVolume * (state.processingPct / 100)) + (state.processingFixed * txns)) / 12;
    const currentMonthlyRecurring = currentMonthlySoftware + currentMonthlyProcessing;

    const oaMonthlySoftware = 0;
    const oaMonthlyProcessing =
      ((state.annualVolume * (STRIPE_PCT / 100)) + (STRIPE_FIXED * txns)) / 12;
    const oaMonthlyRecurring = oaMonthlySoftware + oaMonthlyProcessing;

    // Oilgate AI must be cheaper monthly to ever recoup the build cost.
    const monthlySavings = currentMonthlyRecurring - oaMonthlyRecurring;

    if (monthlySavings <= 0) {
      return { month: null, never: true };
    }

    // Build cost (minus any setup the current platform saves you from paying)
    const upfrontGap = state.buildCost - state.setupFee;

    if (upfrontGap <= 0) {
      return { month: 1, never: false };
    }

    const months = upfrontGap / monthlySavings;
    return { month: Math.max(1, Math.ceil(months)), never: false };
  }

  // ---------------------------------------------------------------------
  // State assembly
  // ---------------------------------------------------------------------

  function readState() {
    const platform = els.platform.value;

    return {
      platform,
      platformLabel: getPlatformDefaults(platform).label,
      annualVolume: clampNumber(els.annualVolume.value, 0),
      avgTicket: clampNumber(els.avgTicket.value, 1, DEFAULT_AVG_TICKET),
      softwareMonthly: clampNumber(els.softwareMonthly.value, 0),
      processingPct: clampNumber(els.processingPct.value, 0),
      processingFixed: clampNumber(els.processingFixed.value, 0),
      setupFee: clampNumber(els.setupFee.value, 0),
      buildCost: clampNumber(els.buildCost.value, 0, DEFAULT_BUILD_COST),
    };
  }

  function clampNumber(raw, min = 0, fallback = 0) {
    const n = parseFloat(raw);
    if (!isFinite(n)) return fallback;
    return Math.max(min, n);
  }

  // Apply platform defaults to the advanced input fields. This is what
  // makes the fee cards "auto-populate" when the user changes platform.
  function applyPlatformDefaultsToInputs(platform) {
    const d = getPlatformDefaults(platform);
    els.softwareMonthly.value = d.softwareMonthly.toFixed(2);
    els.processingPct.value = d.processingPct.toFixed(2);
    els.processingFixed.value = d.processingFixed.toFixed(2);
    els.setupFee.value = d.setupFee.toFixed(0);
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  function renderFeeCards(state, txns, processingAnnual) {
    els.feeSoftwareMonthly.textContent = formatMoney(state.softwareMonthly);
    els.feeSoftwareAnnual.textContent = formatMoney(state.softwareMonthly * 12);
    els.feeProcessingPct.textContent = formatPct(state.processingPct);
    els.feeProcessingFixed.textContent = formatMoney(state.processingFixed);
    els.feeEffective.textContent = formatMoneyShort(processingAnnual);
    els.feeEffectiveSub.textContent =
      `on ${formatMoneyShort(state.annualVolume)} volume · ~${Math.round(txns).toLocaleString("en-US")} txns`;

    // helper under annual volume input
    const monthly = state.annualVolume / 12;
    els.volumeHelper.textContent =
      `≈ ${formatMoneyShort(monthly)}/mo · ~${Math.round(txns).toLocaleString("en-US")} txns/yr at ~${formatMoneyShort(state.avgTicket)} avg ticket`;
  }

  function renderComparison(state, txns) {
    const softwareAnnual = state.softwareMonthly * 12;
    const currentProcessingAnnual = calculateProcessingCost(
      state.annualVolume, state.processingPct, state.processingFixed, txns
    );
    const oaProcessingAnnual = calculateProcessingCost(
      state.annualVolume, STRIPE_PCT, STRIPE_FIXED, txns
    );

    const curYear1 = softwareAnnual + currentProcessingAnnual + state.setupFee;
    const oaYear1 = oaProcessingAnnual + state.buildCost;

    els.comparePlatformName.textContent = state.platformLabel;

    els.curSoftwareAnnual.textContent = formatMoney(softwareAnnual);
    els.curProcessingAnnual.textContent = formatMoney(currentProcessingAnnual);
    els.curSetup.textContent = formatMoney(state.setupFee);
    els.curYear1.textContent = formatMoney(curYear1);

    els.oaSoftwareAnnual.textContent = formatMoney(0);
    els.oaProcessingAnnual.textContent = formatMoney(oaProcessingAnnual);
    els.oaBuild.textContent = formatMoney(state.buildCost);
    els.oaYear1.textContent = formatMoney(oaYear1);

    return { currentProcessingAnnual, oaProcessingAnnual, softwareAnnual, curYear1, oaYear1 };
  }

  function renderBreakEven(state) {
    const result = calculateBreakEvenMonth(state);
    const textEl = els.breakevenCard.querySelector(".breakeven__text");
    const monthEl = els.breakevenCard.querySelector(".breakeven__month");
    const subEl = els.breakevenCard.querySelector(".breakeven__sub");

    if (result.never) {
      els.breakevenCard.classList.add("breakeven--never");
      textEl.textContent =
        "At these assumptions, your current platform stays cheaper month-to-month. Adjust volume, rates, or build cost to model a different scenario.";
      monthEl.textContent = "No break-even";
      subEl.textContent =
        "Savings here would come primarily from $0 monthly platform fee — try a higher software fee assumption to compare.";
      return;
    }

    els.breakevenCard.classList.remove("breakeven--never");
    textEl.textContent = "Ownership becomes cheaper than your current platform around:";
    monthEl.textContent = "Month " + result.month;
    subEl.textContent = "You start saving money from Month " + result.month + " onward.";
  }

  function renderProjectionTable(state, txns) {
    const softwareAnnual = state.softwareMonthly * 12;
    const currentProcessingAnnual = calculateProcessingCost(
      state.annualVolume, state.processingPct, state.processingFixed, txns
    );
    const oaProcessingAnnual = calculateProcessingCost(
      state.annualVolume, STRIPE_PCT, STRIPE_FIXED, txns
    );

    const rows = [];
    let totalCurrent = 0;
    let totalOilgate = 0;

    for (let y = 1; y <= 5; y++) {
      const cur = softwareAnnual + currentProcessingAnnual + (y === 1 ? state.setupFee : 0);
      const oa = oaProcessingAnnual + (y === 1 ? state.buildCost : 0);
      const diff = cur - oa; // positive = Oilgate saved you that much; negative = Oilgate cost more
      totalCurrent += cur;
      totalOilgate += oa;
      rows.push({ year: y, cur, oa, diff });
    }

    // Render
    els.projectionBody.innerHTML = rows.map((r) => {
      const diffClass = r.diff >= 0 ? "diff-good" : "diff-bad";
      const diffText = (r.diff >= 0 ? "+" : "−") + formatMoney(Math.abs(r.diff)).replace("-", "");
      return `
        <tr>
          <td>Year ${r.year}</td>
          <td>${formatMoney(r.cur)}</td>
          <td>${formatMoney(r.oa)}</td>
          <td class="${diffClass}">${diffText}</td>
        </tr>
      `;
    }).join("");

    els.totalCurrent.textContent = formatMoney(totalCurrent);
    els.totalOilgate.textContent = formatMoney(totalOilgate);

    const saved = totalCurrent - totalOilgate;
    els.totalSaved.textContent = (saved >= 0 ? "" : "−") + formatMoney(Math.abs(saved));
    if (saved < 0) {
      els.totalSaved.classList.add("is-loss");
    } else {
      els.totalSaved.classList.remove("is-loss");
    }
  }

  // ---------------------------------------------------------------------
  // Main recompute
  // ---------------------------------------------------------------------

  function recompute() {
    const state = readState();
    const txns = calculateTransactionCount(state.annualVolume, state.avgTicket);
    const currentProcessingAnnual = calculateProcessingCost(
      state.annualVolume, state.processingPct, state.processingFixed, txns
    );

    renderFeeCards(state, txns, currentProcessingAnnual);
    renderComparison(state, txns);
    renderBreakEven(state);
    renderProjectionTable(state, txns);
  }

  // ---------------------------------------------------------------------
  // Event wiring
  // ---------------------------------------------------------------------

  function onPlatformChange(platform) {
    // Sync select + quick pills
    if (els.platform.value !== platform) {
      els.platform.value = platform;
    }
    quickPills.forEach((p) => {
      p.classList.toggle("is-active", p.dataset.platform === platform);
    });
    applyPlatformDefaultsToInputs(platform);
    recompute();
  }

  function wireEvents() {
    els.platform.addEventListener("change", (e) => onPlatformChange(e.target.value));

    quickPills.forEach((p) => {
      p.addEventListener("click", () => onPlatformChange(p.dataset.platform));
    });

    // Live recompute for all inputs.
    const liveInputs = [
      els.annualVolume,
      els.avgTicket,
      els.softwareMonthly,
      els.processingPct,
      els.processingFixed,
      els.setupFee,
      els.buildCost,
    ];
    liveInputs.forEach((input) => {
      input.addEventListener("input", recompute);
      input.addEventListener("change", recompute);
    });

    // Advanced panel
    els.advancedToggle.addEventListener("click", () => {
      const open = !els.advancedPanel.hasAttribute("hidden");
      if (open) {
        els.advancedPanel.setAttribute("hidden", "");
        els.advancedToggle.innerHTML = 'Advanced edits <span aria-hidden="true">▾</span>';
      } else {
        els.advancedPanel.removeAttribute("hidden");
        els.advancedToggle.innerHTML = 'Hide advanced <span aria-hidden="true">▴</span>';
      }
    });

    // Pencil buttons on fee cards open advanced panel and focus the matching field.
    feeEditButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.edit;
        els.advancedPanel.removeAttribute("hidden");
        els.advancedToggle.innerHTML = 'Hide advanced <span aria-hidden="true">▴</span>';
        const focusEl =
          target === "software" ? els.softwareMonthly :
          target === "processing" ? els.processingPct :
          null;
        if (focusEl) {
          focusEl.focus();
          focusEl.select();
        }
      });
    });

    // Smooth scroll for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // ---------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    // Ensure defaults are synced into advanced inputs on first load (matches Booksy)
    applyPlatformDefaultsToInputs(els.platform.value || "booksy");
    wireEvents();
    recompute();
  });

})();

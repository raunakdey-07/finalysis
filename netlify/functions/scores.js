// Utility: Color spectrum for scores
function colorSpectrum(score, good, bad, min = null, max = null) {
  // Linear interpolate between red, yellow, green
  // good: high value is good? (true) or low value is good? (false)
  let percent;
  if (min !== null && max !== null) {
    percent = (score - min) / (max - min);
    percent = Math.max(0, Math.min(1, percent));
  } else {
    percent = good ? Math.min(1, Math.max(0, score / 10)) : Math.max(0, Math.min(1, 1 - score / 10));
  }
  // 0 = red, 0.5 = yellow, 1 = green
  const r = percent < 0.5 ? 255 : Math.round(255 - (percent - 0.5) * 2 * 255);
  const g = percent < 0.5 ? Math.round(percent * 2 * 255) : 255;
  return `rgb(${r},${g},0)`;
}

// Altman Z-Score
function calcAltman(mod, marketCap) {
  try {
    const bs = mod.balanceSheetHistory.balanceSheetStatements[0];
    const ic = mod.incomeStatementHistory.incomeStatementHistory[0];
    const ta = bs.totalAssets;
    const wc = bs.totalCurrentAssets - bs.totalCurrentLiabilities;
    const re = bs.retainedEarnings;
    const ebit = ic.ebit || ic.operatingIncome;
    const tl = bs.totalLiab;
    const sales = ic.totalRevenue;
    const x1 = wc / ta;
    const x2 = re / ta;
    const x3 = ebit / ta;
    const x4 = marketCap / tl;
    const x5 = sales / ta;
    const score = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;
    let interpretation, color;
    if (score > 2.99) { interpretation = "Low bankruptcy risk"; color = colorSpectrum(1, true, false); }
    else if (score > 1.81) { interpretation = "Medium bankruptcy risk"; color = colorSpectrum(0.5, true, false); }
    else { interpretation = "High bankruptcy risk"; color = colorSpectrum(0, true, false); }
    return { score, interpretation, color };
  } catch (e) {
    return { score: NaN, interpretation: "Data unavailable", color: "#888" };
  }
}

// Piotroski F-Score
function calcPiotroski(mod) {
  try {
    const bs = mod.balanceSheetHistory.balanceSheetStatements;
    const ic = mod.incomeStatementHistory.incomeStatementHistory;
    const cf = mod.cashflowStatementHistory.cashflowStatements;
    if (bs.length < 2 || ic.length < 2 || cf.length < 2) throw new Error();
    let score = 0;
    let details = [];
    // 1. ROA > 0
    const roa0 = ic[0].netIncome / bs[0].totalAssets;
    if (roa0 > 0) score++;
    // 2. CFO > 0
    if (cf[0].totalCashFromOperatingActivities > 0) score++;
    // 3. ROA increasing
    const roa1 = ic[1].netIncome / bs[1].totalAssets;
    if (roa0 > roa1) score++;
    // 4. CFO > ROA
    if ((cf[0].totalCashFromOperatingActivities / bs[0].totalAssets) > roa0) score++;
    // 5. Lower leverage
    if ((bs[0].longTermDebt || 0) < (bs[1].longTermDebt || 0)) score++;
    // 6. Higher current ratio
    const cr0 = bs[0].totalCurrentAssets / bs[0].totalCurrentLiabilities;
    const cr1 = bs[1].totalCurrentAssets / bs[1].totalCurrentLiabilities;
    if (cr0 > cr1) score++;
    // 7. No dilution
    if ((bs[0].commonStock || 0) <= (bs[1].commonStock || 0)) score++;
    // 8. Higher gross margin
    const gm0 = ic[0].grossProfit / ic[0].totalRevenue;
    const gm1 = ic[1].grossProfit / ic[1].totalRevenue;
    if (gm0 > gm1) score++;
    // 9. Higher asset turnover
    const at0 = ic[0].totalRevenue / bs[0].totalAssets;
    const at1 = ic[1].totalRevenue / bs[1].totalAssets;
    if (at0 > at1) score++;
    let interpretation, color;
    if (score >= 8) { interpretation = "Strong financial health"; color = colorSpectrum(1, true, false); }
    else if (score >= 5) { interpretation = "Average financial health"; color = colorSpectrum(0.5, true, false); }
    else { interpretation = "Weak financial health"; color = colorSpectrum(0, true, false); }
    return { score, interpretation, color };
  } catch (e) {
    return { score: NaN, interpretation: "Data unavailable", color: "#888" };
  }
}

// Beneish M-Score
function calcBeneish(mod) {
  try {
    const bs = mod.balanceSheetHistory.balanceSheetStatements;
    const ic = mod.incomeStatementHistory.incomeStatementHistory;
    const cf = mod.cashflowStatementHistory.cashflowStatements;
    if (bs.length < 2 || ic.length < 2 || cf.length < 2) throw new Error();
    // Use t = 0, t-1
    const t = 0, t1 = 1;
    // DSRI
    const dsri = ((bs[t].netReceivables / ic[t].totalRevenue) / (bs[t1].netReceivables / ic[t1].totalRevenue));
    // GMI
    const gm_t = (ic[t].totalRevenue - ic[t].costOfRevenue) / ic[t].totalRevenue;
    const gm_t1 = (ic[t1].totalRevenue - ic[t1].costOfRevenue) / ic[t1].totalRevenue;
    const gmi = gm_t1 / gm_t;
    // AQI
    const aqi = ((1 - ((bs[t].totalCurrentAssets + (bs[t].propertyPlantEquipmentNet || 0)) / bs[t].totalAssets)) /
                 (1 - ((bs[t1].totalCurrentAssets + (bs[t1].propertyPlantEquipmentNet || 0)) / bs[t1].totalAssets)));
    // SGI
    const sgi = ic[t].totalRevenue / ic[t1].totalRevenue;
    // DEPI
    const dep_t = (cf[t].depreciation || 1) / ((bs[t].propertyPlantEquipmentNet || 1) + (cf[t].depreciation || 1));
    const dep_t1 = (cf[t1].depreciation || 1) / ((bs[t1].propertyPlantEquipmentNet || 1) + (cf[t1].depreciation || 1));
    const depi = dep_t1 / dep_t;
    // SGAI
    const sgai = (ic[t].sellingGeneralAdministrative / ic[t].totalRevenue) /
                 (ic[t1].sellingGeneralAdministrative / ic[t1].totalRevenue);
    // LVGI
    const lvgi = ((bs[t].totalCurrentLiabilities + (bs[t].longTermDebt || 0)) / bs[t].totalAssets) /
                 ((bs[t1].totalCurrentLiabilities + (bs[t1].longTermDebt || 0)) / bs[t1].totalAssets);
    // TATA
    const tata = (ic[t].netIncome - cf[t].totalCashFromOperatingActivities) / bs[t].totalAssets;
    // M-Score
    const score = -4.84 + 0.92*dsri + 0.528*gmi + 0.404*aqi + 0.892*sgi + 0.115*depi - 0.172*sgai + 4.679*tata - 0.327*lvgi;
    let interpretation, color;
    if (score > -1.78) { interpretation = "Possible earnings manipulation"; color = colorSpectrum(0, false, true); }
    else { interpretation = "Unlikely manipulation"; color = colorSpectrum(1, false, true); }
    return { score, interpretation, color };
  } catch (e) {
    return { score: NaN, interpretation: "Data unavailable", color: "#888" };
  }
}

// Ohlson O-Score
function calcOhlson(mod) {
  try {
    const bs = mod.balanceSheetHistory.balanceSheetStatements;
    const ic = mod.incomeStatementHistory.incomeStatementHistory;
    const cf = mod.cashflowStatementHistory.cashflowStatements;
    if (bs.length < 2 || ic.length < 2 || cf.length < 2) throw new Error();
    const t = 0, t1 = 1;
    const TA = bs[t].totalAssets;
    const TL = bs[t].totalLiab;
    const CA = bs[t].totalCurrentAssets;
    const CL = bs[t].totalCurrentLiabilities;
    const WC = CA - CL;
    const NI = ic[t].netIncome;
    const NI1 = ic[t1].netIncome;
    const FFO = cf[t].totalCashFromOperatingActivities;
    const GNP = 100; // Placeholder, ideally use US GNP deflator
    const X = TL > TA ? 1 : 0;
    const Y = (NI < 0 && NI1 < 0) ? 1 : 0;
    const CHIN = (NI - NI1) / (Math.abs(NI) + Math.abs(NI1));
    // O-Score formula
    const score = -1.32 - 0.407 * Math.log(TA / GNP) + 6.03 * (TL / TA) - 1.43 * (WC / TA) +
      0.0757 * (CL / CA) - 2.57 * X - 1.83 * (NI / TA) - 1.83 * (FFO / TL) +
      0.285 * Y - 0.521 * CHIN;
    // Probability
    const prob = 1 / (1 + Math.exp(-score));
    let interpretation, color;
    if (prob > 0.5) { interpretation = "High bankruptcy risk"; color = colorSpectrum(0, false, true); }
    else if (prob > 0.3) { interpretation = "Moderate bankruptcy risk"; color = colorSpectrum(0.5, false, true); }
    else { interpretation = "Low bankruptcy risk"; color = colorSpectrum(1, false, true); }
    return { score, prob, interpretation, color };
  } catch (e) {
    return { score: NaN, prob: NaN, interpretation: "Data unavailable", color: "#888" };
  }
}

module.exports = { calcAltman, calcPiotroski, calcBeneish, calcOhlson };

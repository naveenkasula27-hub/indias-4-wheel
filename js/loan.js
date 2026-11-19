// ============ STANDALONE LOAN ELIGIBILITY PAGE ============

// fetchWithTimeout is defined globally in admin/config.js (loaded before
// this file) — cold-start-tolerant, falls back instead of leaving the
// submit button stuck for 8-10+ seconds.

function fallbackLoanEligibility({ carPrice, downPayment = 0, monthlyIncome, existingEmis = 0, employmentType = 'salaried', creditScoreBand = '750+', tenureMonths = 60 }) {
  const loanRequired = Math.max(0, carPrice - downPayment);
  const foirCap = employmentType === 'salaried' ? 0.55 : 0.45;
  const affordableEmi = Math.max(0, monthlyIncome * foirCap - existingEmis);
  const rateTable = { '750+': 11.0, '700-749': 12.5, '650-699': 14.0, 'below-650': 16.5, 'no-history': 15.0 };
  const interestRate = rateTable[creditScoreBand] ?? 13.5;
  const r = interestRate / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const maxLoanByEmi = affordableEmi > 0 ? Math.round((affordableEmi * (factor - 1)) / (r * factor)) : 0;
  const eligibleAmount = Math.max(0, Math.min(loanRequired, maxLoanByEmi));
  const emi = eligibleAmount > 0 ? Math.round((eligibleAmount * r * factor) / (factor - 1)) : 0;
  const shortfall = Math.max(0, loanRequired - eligibleAmount);
  return { loanRequired, eligibleAmount, interestRate, emi, tenureMonths, shortfall, isEligible: eligibleAmount >= loanRequired * 0.5 };
}

document.addEventListener('DOMContentLoaded', () => {
  const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : null;
  const form = document.getElementById('loanForm');

  const prefillPrice = new URLSearchParams(window.location.search).get('price');
  if (prefillPrice) document.getElementById('qCarPrice').value = prefillPrice;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      carPrice: +document.getElementById('qCarPrice').value,
      downPayment: +document.getElementById('qDownPayment').value || 0,
      monthlyIncome: +document.getElementById('qIncome').value,
      existingEmis: +document.getElementById('qExistingEmi').value || 0,
      employmentType: document.getElementById('qEmployment').value,
      creditScoreBand: document.getElementById('qCreditBand').value,
      tenureMonths: +document.getElementById('qTenure').value,
    };

    let result;
    try {
      if (!apiBase) throw new Error('no api');
      const res = await fetchWithTimeout(`${apiBase}/loan/eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('api failed');
      result = await res.json();
    } catch {
      result = fallbackLoanEligibility(payload);
    }

    const box = document.getElementById('loanResultBox');
    box.style.display = 'block';
    document.getElementById('loanEligibleAmount').textContent = `₹ ${result.eligibleAmount.toLocaleString('en-IN')}`;
    document.getElementById('loanDetails').textContent =
      `At ${result.interestRate}% interest over ${result.tenureMonths} months — EMI ₹${result.emi.toLocaleString('en-IN')}/mo`;
    document.getElementById('loanShortfallNote').textContent = result.shortfall > 0
      ? `This covers ${Math.round((result.eligibleAmount / result.loanRequired) * 100)}% of the ₹${result.loanRequired.toLocaleString('en-IN')} you need. You may need a higher down payment or a co-applicant for the rest.`
      : 'This fully covers the loan amount you need.';
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle?.addEventListener('click', () => {
    const open = mainNav.style.display === 'flex';
    mainNav.style.display = open ? 'none' : 'flex';
    mainNav.style.flexDirection = 'column';
    mainNav.style.position = 'absolute';
    mainNav.style.top = '76px';
    mainNav.style.left = '0';
    mainNav.style.right = '0';
    mainNav.style.background = '#fff';
    mainNav.style.padding = '18px 24px';
    mainNav.style.boxShadow = '0 10px 24px rgba(11,42,91,0.12)';
  });
});

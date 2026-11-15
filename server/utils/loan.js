// Standard reducing-balance EMI formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
function computeEmi(principal, annualRatePct, tenureMonths) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return Math.round(principal / tenureMonths);
  const factor = Math.pow(1 + r, tenureMonths);
  return Math.round((principal * r * factor) / (factor - 1));
}

/**
 * Loan eligibility: based on monthly income, existing EMI obligations,
 * employment type and credit score band, following the common
 * FOIR (Fixed Obligation to Income Ratio) approach used by Indian lenders.
 */
function checkEligibility({ carPrice, downPayment = 0, monthlyIncome, existingEmis = 0, employmentType = 'salaried', creditScoreBand = '750+', tenureMonths = 60 }) {
  const loanRequired = Math.max(0, carPrice - downPayment);

  // Max allowed FOIR (obligations / income) varies by employment type.
  const foirCap = employmentType === 'salaried' ? 0.55 : 0.45;
  const maxMonthlyObligation = monthlyIncome * foirCap;
  const affordableEmi = Math.max(0, maxMonthlyObligation - existingEmis);

  // Interest rate tier by credit score band.
  const rateTable = {
    '750+': 9.5,
    '700-749': 10.5,
    '650-699': 12.0,
    'below-650': 14.5,
    'no-history': 13.0,
  };
  const interestRate = rateTable[creditScoreBand] ?? 11.5;

  // Back-solve max loan amount the affordable EMI can support at this rate/tenure.
  const r = interestRate / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const maxLoanByEmi = affordableEmi > 0 ? Math.round((affordableEmi * (factor - 1)) / (r * factor)) : 0;

  const eligibleAmount = Math.max(0, Math.min(loanRequired, maxLoanByEmi));
  const isEligible = eligibleAmount >= loanRequired * 0.5 && monthlyIncome > 0;
  const emi = eligibleAmount > 0 ? computeEmi(eligibleAmount, interestRate, tenureMonths) : 0;
  const shortfall = Math.max(0, loanRequired - eligibleAmount);

  return {
    loanRequired,
    eligibleAmount,
    interestRate,
    tenureMonths,
    emi,
    isEligible,
    shortfall,
    foirCap,
    affordableEmi: Math.round(affordableEmi),
  };
}

module.exports = { computeEmi, checkEligibility };

// ============ SHARED ACROSS PAGES: CITY PICKER + CUSTOMER SESSION STATE ============

document.addEventListener('DOMContentLoaded', () => {
  // City picker — persists the chosen city across pages
  const citySelect = document.getElementById('cityBtn');
  if (citySelect) {
    const savedCity = localStorage.getItem('i4w_city');
    if (savedCity && [...citySelect.options].some(o => o.value === savedCity)) {
      citySelect.value = savedCity;
    }
    citySelect.addEventListener('change', () => {
      localStorage.setItem('i4w_city', citySelect.value);
    });
  }

  // Header "Login" link reflects whether a customer is signed in
  const loginLink = document.getElementById('headerLoginLink');
  const customerName = localStorage.getItem('i4w_customer_name');
  if (loginLink && customerName) {
    loginLink.textContent = `Hi, ${customerName.split(' ')[0]}`;
    loginLink.href = 'account.html';
  }
});

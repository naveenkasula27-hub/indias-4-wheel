// Floating WhatsApp + Call buttons, injected on every page that includes
// this script — one place to update the number instead of 13 copies of
// the same HTML. Uses the same placeholder number already shown on
// contact.html (+91 90000 00000) — replace both there and here with the
// real business number before going live.
(function () {
  const PHONE_DISPLAY = '+91 90000 00000';
  const PHONE_E164 = '919000000000'; // no + or spaces, as wa.me/tel: expect

  const wrap = document.createElement('div');
  wrap.className = 'floating-contact';
  wrap.innerHTML = `
    <a href="tel:+${PHONE_E164}" class="floating-contact-btn floating-call" aria-label="Call us" title="Call ${PHONE_DISPLAY}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    </a>
    <a href="https://wa.me/${PHONE_E164}?text=${encodeURIComponent("Hi, I'd like to know more about India's 4 Wheel.")}" class="floating-contact-btn floating-whatsapp" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.33 5l-1.41 5.15 5.27-1.38a9.93 9.93 0 0 0 4.77 1.21h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.84 14.24c-.25.7-1.45 1.33-2 1.42-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.68-.63-2.96-1.28-4.89-4.25-5.04-4.45-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.84 2.07.91 2.22.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.45.54-.15.15-.3.31-.13.61.17.3.77 1.27 1.65 2.06 1.14 1.01 2.1 1.33 2.4 1.48.3.15.48.13.65-.08.18-.2.76-.89.96-1.19.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.22.57.35.08.12.08.72-.17 1.42z"/></svg>
    </a>
  `;
  document.body.appendChild(wrap);
})();

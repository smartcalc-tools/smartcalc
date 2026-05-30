// =========================
// SMARTCALC LAYOUT ENGINE
// FAST + SIMPLE + CLEAN
// =========================

const navbar = `
<nav class="navbar">
  <div class="nav-container">

    <a href="/index.html" class="logo">SmartCalc ⚡</a>

    <ul class="nav-links">
      <li><a href="/index.html">Home</a></li>
      <li><a href="/about.html">About</a></li>
      <li><a href="/contact.html">Contact</a></li>
      <li><a href="/privacy-policy.html">Privacy</a></li>
    </ul>

  </div>
</nav>
`;

const footer = `
<footer class="footer">
  <div class="footer-container">

    <div>
      <h3>SmartCalc ⚡</h3>
      <p>Smart financial calculators for everyone.</p>
    </div>

    <div class="footer-links">
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
      <a href="/privacy-policy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </div>

  </div>

  <div class="footer-bottom">
    © 2026 SmartCalc
  </div>
</footer>
`;

function initLayout() {
  document.body.insertAdjacentHTML("afterbegin", navbar);
  document.body.insertAdjacentHTML("beforeend", footer);
}

document.addEventListener("DOMContentLoaded", initLayout);
let chart;

// ================= FORMAT =================
function format(num) {
  if (!isFinite(num) || isNaN(num)) return "₹0";
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

const el = (id) => document.getElementById(id);

// ================= MODE =================
function getMode() {
  return el("mode")?.value || "basic";
}

// ================= SIP (REALISTIC MONTHLY COMPOUND) =================
function calculateSIP(P, rate, years, stepUp = 0) {
  const r = rate / 100 / 12;
  const months = years * 12;

  let value = 0;
  let invested = 0;
  let data = [];
  let yearly = [];
  let monthly = P;

  for (let i = 1; i <= months; i++) {

    // yearly step-up
    if (i > 1 && (i - 1) % 12 === 0) {
      monthly *= (1 + stepUp / 100);
    }

    invested += monthly;

    // compound monthly
    value = value * (1 + r) + monthly;

    data.push(value);

    if (i % 12 === 0) yearly.push(value);
  }

  return { value, invested, data, yearly };
}

// ================= FD (FIXED DEPOSIT REALISTIC) =================
function calculateFD(monthly, rate, years) {
  const r = rate / 100 / 12;
  const months = years * 12;

  let value = 0;
  let data = [];
  let yearly = [];

  for (let i = 1; i <= months; i++) {

    // FD behaves like deposit accumulating + compounding monthly
    value += monthly;
    value *= (1 + r);

    data.push(value);

    if (i % 12 === 0) yearly.push(value);
  }

  return { value, data, yearly };
}

// ================= RD (REALISTIC MONTHLY RD) =================
function calculateRD(monthly, rate, years) {
  const r = rate / 100 / 12;
  const months = years * 12;

  let value = 0;
  let data = [];
  let yearly = [];

  for (let i = 1; i <= months; i++) {

    value += monthly;
    value *= (1 + r);

    data.push(value);

    if (i % 12 === 0) yearly.push(value);
  }

  return { value, data, yearly };
}

// ================= REVERSE SIP (IMPROVED BINARY SEARCH) =================
function reverseSIP(target, rate, years) {
  const r = rate / 100 / 12;
  const months = years * 12;

  let low = 0;
  let high = target;
  let result = 0;

  for (let i = 0; i < 40; i++) {

    let mid = (low + high) / 2;
    let value = 0;

    for (let j = 1; j <= months; j++) {
      value = value * (1 + r) + mid;
    }

    if (value >= target) {
      result = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return result;
}

// ================= INSIGHT ENGINE =================
function insight(diff, sip, fd) {

  const mult = sip.invested > 0 ? (sip.value / sip.invested).toFixed(1) : 0;

  if (diff > 0) {
    return `
🚀 SIP is ahead by <strong>${format(diff)}</strong><br><br>

📈 Compounding effect creates exponential growth.<br>
💰 Wealth multiplier: <strong>${mult}x</strong><br><br>

⚠️ FD is stable but loses against inflation over time.<br><br>

👉 Best for long-term wealth: SIP
`;
  }

  return `
🛡️ FD is safer and stable.<br><br>

📊 SIP is volatile but higher return potential.<br><br>

👉 Best for safety: FD
`;
}

// ================= CHART =================
function updateChart(sipData, fdData, rdData, invested) {

  const labels = sipData.map((_, i) => i + 1);

  if (chart) chart.destroy();

  chart = new Chart(el("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "SIP",
          data: sipData,
          borderWidth: 2,
          tension: 0.35
        },
        {
          label: "FD",
          data: fdData,
          borderWidth: 2,
          tension: 0.35
        },
        {
          label: "RD",
          data: rdData,
          borderWidth: 2,
          tension: 0.35
        },
        {
          label: "Invested",
          data: Array(labels.length).fill(invested),
          borderDash: [5, 5],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#fff" } }
      },
      scales: {
        x: { ticks: { color: "#9fb0d1" } },
        y: { ticks: { color: "#9fb0d1" } }
      }
    }
  });
}

// ================= MAIN CALC =================
function calculate() {

  const mode = getMode();

  const amount = +el("amount")?.value || 0;
  const years = +el("time")?.value || 0;

  const sipRate = +el("sipRate")?.value || 0;
  const fdRate = +el("fdRate")?.value || 0;
  const rdRate = +el("rdRate")?.value || 0;
  const stepUp = +el("stepUp")?.value || 0;
  const inflation = +el("inflation")?.value || 0;

  if (amount <= 0 || years <= 0) return;

  const sip = calculateSIP(amount, sipRate, years, stepUp);
  const fd = calculateFD(amount, fdRate, years);
  const rd = calculateRD(amount, rdRate, years);

  const diff = sip.value - fd.value;

  const realSIP = sip.value / Math.pow(1 + inflation / 100, years);
  const realFD = fd.value / Math.pow(1 + inflation / 100, years);

  // ================= MODES =================
  if (mode === "basic") {
    el("sipValue").innerText = format(sip.value);
    el("fdValue").innerText = format(fd.value);
    el("winner").innerText = diff > 0 ? "SIP 🚀" : "FD 🛡️";
  }

  else if (mode === "compare") {
    el("sipValue").innerText = format(realSIP);
    el("fdValue").innerText = format(realFD);
    el("winner").innerText = diff > 0 ? "SIP 🚀 (Real)" : "FD 🛡️ (Real)";
  }

  else if (mode === "goal") {

    const target = 1000000;
    const required = reverseSIP(target, sipRate, years);

    el("sipValue").innerText = "₹" + format(required);
    el("fdValue").innerText = "Target ₹10,00,000";
    el("winner").innerText = "🎯 Reverse SIP Planner";
  }

  // ================= UI =================
  el("insightText").innerHTML = insight(diff, sip, fd);

  el("sipLow").innerText = format(calculateSIP(amount, 8, years).value);
  el("sipMid").innerText = format(calculateSIP(amount, 12, years).value);
  el("sipHigh").innerText = format(calculateSIP(amount, 18, years).value);

  // TABLE
  let html = "";
  for (let i = 0; i < years; i++) {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${format(sip.yearly[i] || 0)}</td>
        <td>${format(fd.yearly[i] || 0)}</td>
        <td>${format((sip.yearly[i] || 0) - (fd.yearly[i] || 0))}</td>
      </tr>
    `;
  }

  el("tableBody").innerHTML = html;

  // CHART
  updateChart(sip.data, fd.data, rd.data, sip.invested);
}

// ================= INIT =================
function init() {

  ["amount","time","sipRate","fdRate","rdRate","stepUp","inflation","mode"]
  .forEach(id => {
    el(id)?.addEventListener("input", calculate);
    el(id)?.addEventListener("change", calculate);
  });

  calculate();
}

// ================= SHARE =================
el("copyBtn")?.addEventListener("click", () => {
  navigator.clipboard.writeText("SIP vs FD vs RD Smart Engine 🚀");
  alert("Copied!");
});

el("waBtn")?.addEventListener("click", () => {
  window.open("https://wa.me/?text=Smart Investment Engine 🚀", "_blank");
});

window.addEventListener("DOMContentLoaded", init);
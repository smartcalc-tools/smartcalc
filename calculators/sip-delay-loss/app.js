let chart;

// ================= HELPERS =================
const el = (id) => document.getElementById(id);

function format(num) {
  if (!isFinite(num)) return "₹0";
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ================= SIP WITH STEP-UP + FREQ =================
function calcSIP(P, rate, years, stepUp = 0, freq = 12) {

  const r = rate / 100 / freq;
  const periods = years * freq;

  let value = 0;
  let invested = 0;

  let growth = [];

  let currentP = P;

  for (let i = 1; i <= periods; i++) {

    // Step-up yearly
    if (i > 1 && (i - 1) % freq === 0) {
      currentP *= (1 + stepUp / 100);
    }

    invested += currentP;

    value = (value + currentP) * (1 + r);

    growth.push(value);
  }

  return { value, invested, growth };
}

// ================= MAIN =================
function calculate() {

  const amount = +el("amount")?.value || 0;
  const rate = +el("rate")?.value || 0;
  const years = +el("years")?.value || 0;
  const delay = +el("delay")?.value || 0;

  const stepUp = +el("stepUp")?.value || 0;
  const inflation = +el("inflation")?.value || 0;
  const freq = +el("frequency")?.value || 12;

  if (amount <= 0 || rate <= 0 || years <= 0) return;

  const totalPeriods = years * freq;
  const delayPeriods = delay * freq;

  // ================= EARLY =================
  const early = calcSIP(amount, rate, years, stepUp, freq);

  // ================= LATE =================
  const lateYears = Math.max(years - delay, 0);
  const late = calcSIP(amount, rate, lateYears, stepUp, freq);

  // ================= LOSS =================
  const loss = early.value - late.value;
  const lossPercent = early.value > 0 ? (loss / early.value) * 100 : 0;

  // ================= INFLATION =================
  let realEarly = early.value;
  let realLate = late.value;

  if (inflation > 0) {
    const inf = inflation / 100;

    realEarly = early.value / Math.pow(1 + inf, years);
    realLate = late.value / Math.pow(1 + inf, lateYears);
  }

  // ================= LIFE WEALTH HOOK =================
  const monthlyLoss = loss / (years * 12 || 1);
  const monthsLost = Math.floor(loss / (amount || 1));

  // ================= UI =================
  el("earlyInvested").innerText = format(early.invested);
  el("earlyValue").innerText = format(early.value);

  el("lateValue").innerText = format(late.value);

  el("loss").innerText = format(loss);
  el("lossPercent").innerText = lossPercent.toFixed(1) + "%";

  // ================= INSIGHT =================
  el("insightText").innerHTML = `
🚨 <b>${delay} year delay</b> = <b>${format(loss)}</b> loss<br>
📉 You lose <b>${lossPercent.toFixed(1)}%</b> wealth<br>
🧠 That's like wasting <b>${monthsLost} months</b> of investing<br>
📊 Real Value (after inflation): <b>${format(realEarly)}</b>
`;

  // ================= DATA ALIGN =================
  let earlyData = [];
  let lateData = [];

  for (let i = 0; i < totalPeriods; i++) {

    earlyData.push(
      early.growth[i] || early.growth[early.growth.length - 1] || 0
    );

    if (i < delayPeriods) {
      lateData.push(0);
    } else {
      const idx = i - delayPeriods;
      lateData.push(
        late.growth[idx] || late.growth[late.growth.length - 1] || 0
      );
    }
  }

  updateChart(earlyData, lateData, freq);

  // ================= TABLE =================
  let html = "";

  for (let i = 0; i < totalPeriods; i += freq) {

    const e = earlyData[i] || 0;
    const l = lateData[i] || 0;

    html += `
<tr>
<td>${i / freq + 1}</td>
<td>${format(e)}</td>
<td>${format(l)}</td>
<td>${format(e - l)}</td>
</tr>`;
  }

  el("tableBody").innerHTML = html;

  // ================= CSV STORE =================
  window._csvData = { earlyData, lateData };
}

// ================= CHART =================
function updateChart(early, late, freq) {

  const canvas = el("chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: early.map((_, i) => i + 1),
      datasets: [
        {
          label: "Start Early",
          data: early,
          borderColor: "#00f5a0",
          tension: 0.4,
          borderWidth: 2
        },
        {
          label: "Start Late",
          data: late,
          borderColor: "#ff4d4f",
          tension: 0.4,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#aaa",
            maxTicksLimit: 8
          }
        },
        y: {
          ticks: {
            color: "#aaa",
            callback: v => "₹" + Math.round(v / 1000) + "K"
          }
        }
      }
    }
  });
}

// ================= DOWNLOAD =================
function downloadChart() {
  const canvas = el("chart");
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = "sip-delay-chart.png";
  link.href = canvas.toDataURL();
  link.click();
}

function downloadCSV() {

  if (!window._csvData) return;

  let csv = "Period,Start Early,Start Late\n";

  window._csvData.earlyData.forEach((v, i) => {
    csv += `${i + 1},${v},${window._csvData.lateData[i]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "sip-delay-data.csv";
  link.click();
}

// ================= SHARE =================
function setupShare() {
  el("waBtn")?.addEventListener("click", () => {
    const text = `I lost ${el("loss").innerText} by delaying SIP 😳`;
    window.open("https://wa.me/?text=" + encodeURIComponent(text));
  });

  el("copyBtn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(el("loss").innerText);
    alert("Copied!");
  });
}

// ================= TABLE =================
function toggleTable() {
  const wrapper = el("tableWrapper");
  const btn = el("toggleTable");

  const show = wrapper.style.display === "none";

  wrapper.style.display = show ? "block" : "none";
  btn.innerText = show ? "Hide ▲" : "Show ▼";
}

// ================= CHIPS =================
function setupChips() {
  document.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const d = btn.getAttribute("data-delay");
      if (d) {
        el("delay").value = d;
        calculate();
      }
    });
  });
}

// ================= ADVANCED TOGGLE =================
function setupAdvanced() {
  el("toggleAdvanced")?.addEventListener("click", () => {
    const box = el("advancedBox");

    const open = box.style.display === "block";
    box.style.display = open ? "none" : "block";

    el("toggleAdvanced").innerText =
      open ? "⚙️ Advanced Settings ▼" : "⚙️ Advanced Settings ▲";
  });
}

// ================= INIT =================
const autoCalc = debounce(calculate, 300);

function init() {

  setupShare();
  setupChips();
  setupAdvanced();

  document.querySelectorAll("input, select").forEach(i => {
    i.addEventListener("input", autoCalc);
  });

  el("downloadChart")?.addEventListener("click", downloadChart);
  el("downloadCSV")?.addEventListener("click", downloadCSV);
  el("toggleTable")?.addEventListener("click", toggleTable);

  calculate();
}

window.addEventListener("DOMContentLoaded", init);
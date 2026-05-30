// ================= INIT =================
let chart;
let mode = "investment"; // investment | goal

// ================= FORMAT =================
function format(num) {
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

// ================= COMPOUNDING =================
function getN(compounding) {
  if (compounding === "yearly") return 1;
  if (compounding === "monthly") return 12;
  if (compounding === "daily") return 365;
  return 1;
}

// ================= FUTURE VALUE =================
function futureValue(P, r, t, n) {
  return P * Math.pow(1 + r / n, n * t);
}

// ================= GOAL MODE =================
function requiredInvestment(FV, r, t, n) {
  return FV / Math.pow(1 + r / n, n * t);
}

// ================= CALCULATE =================
function calculate() {

  let amount = +document.getElementById("amount").value || 0;
  let rate = +document.getElementById("rate").value || 0;
  let years = +document.getElementById("time").value || 0;
  let inflation = +document.getElementById("inflation").value || 0;

  let compounding = document.getElementById("compounding").value;
  let n = getN(compounding);

  let r = rate / 100;
  let inf = inflation / 100;

  if (years <= 0 || r <= 0) return;

  let FV, invested;

  // ================= MODE =================
  if (mode === "investment") {
    invested = amount;
    FV = futureValue(amount, r, years, n);
  } else {
    FV = amount;
    invested = requiredInvestment(amount, r, years, n);
  }

  // ================= INFLATION ADJUST =================
  let realFV = FV / Math.pow(1 + inf, years);

  // ================= METRICS =================
  let gain = FV - invested;
  let multiplier = (FV / invested).toFixed(1);
  let cagr = ((Math.pow(FV / invested, 1 / years) - 1) * 100).toFixed(1);

  // ================= UI =================
  document.getElementById("futureValue").innerText = format(FV);
  document.getElementById("invested").innerText = format(invested);
  document.getElementById("realValue").innerText = format(realFV);

  document.getElementById("gain").innerText = format(gain);
  document.getElementById("cagr").innerText = cagr + "%";
  document.getElementById("multiplier").innerText = multiplier + "x";

  // ================= INSIGHT =================
  let insight = `
  Your money grows <b>${multiplier}x</b> in ${years} years 🚀.
  <br>${Math.round((gain / FV) * 100)}% comes from compounding.
  <br>Real value after inflation: <b>${format(realFV)}</b>
  `;

  document.getElementById("insight").innerHTML = insight;

  // ================= GRAPH DATA =================
  let labels = [];
  let futureLine = [];
  let investedLine = [];
  let realLine = [];

  for (let i = 0; i <= years; i++) {

    let fv = futureValue(invested, r, i, n);
    let real = fv / Math.pow(1 + inf, i);

    labels.push(i + "y");
    futureLine.push(fv);
    investedLine.push(invested);
    realLine.push(real);
  }

  // ================= SCENARIOS =================
  let scenarios = [0.08, 0.12, 0.18];
  let scenarioData = scenarios.map(rate => {
    return labels.map((_, i) =>
      futureValue(invested, rate, i, n)
    );
  });

  // ================= CHART =================
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Future Value",
          data: futureLine,
          borderWidth: 2
        },
        {
          label: "Invested",
          data: investedLine,
          borderDash: [5, 5]
        },
        {
          label: "Real Value",
          data: realLine,
          borderWidth: 2
        },
        {
          label: "Conservative (8%)",
          data: scenarioData[0],
          borderWidth: 1
        },
        {
          label: "Expected (12%)",
          data: scenarioData[1],
          borderWidth: 1
        },
        {
          label: "Aggressive (18%)",
          data: scenarioData[2],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#aaa"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#888" }
        },
        y: {
          ticks: { color: "#888" }
        }
      }
    }
  });
}

// ================= MODE SWITCH =================
document.getElementById("modeToggle").addEventListener("change", (e) => {
  mode = e.target.value;
  calculate();
});

// ================= RISK AUTO RATE =================
document.getElementById("risk").addEventListener("change", (e) => {
  let val = e.target.value;

  if (val === "low") rate.value = 8;
  if (val === "medium") rate.value = 12;
  if (val === "high") rate.value = 18;

  calculate();
});

// ================= AUTO UPDATE =================
["amount","rate","time","inflation","compounding"].forEach(id => {
  document.getElementById(id).addEventListener("input", calculate);
});

// ================= INIT =================
calculate();
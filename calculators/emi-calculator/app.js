// ================= INIT =================
let isYears = true;
let pieChart, lineChart;

// ================= FORMAT ₹ =================
function format(num) {
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

// ================= EMI FORMULA =================
function getEMI(P, r, n) {
  return (P * r * Math.pow(1 + r, n)) /
         (Math.pow(1 + r, n) - 1);
}

// ================= CALCULATE =================
function calculate() {

  let P = +amount.value || 0;
  let annualRate = +rate.value || 0;
  let tenure = +tenureInput.value || 0;
  let extra = +extraInput.value || 0;
  let lumpSum = +lumpSumInput.value || 0;

  let n = isYears ? tenure * 12 : tenure;
  let r = annualRate / 12 / 100;

  if (P <= 0 || r <= 0 || n <= 0) return;

  // ================= WITHOUT PREPAYMENT =================
  let emi = getEMI(P, r, n);

  let bal1 = P;
  let interest1 = 0;

  let labels1 = [];
  let balances1 = [];

  for (let i = 1; i <= n; i++) {
    let interest = bal1 * r;
    let principal = emi - interest;
    bal1 -= principal;
    interest1 += interest;

    labels1.push(i);
    balances1.push(bal1 > 0 ? bal1 : 0);
  }

  let total1 = P + interest1;

  // ================= WITH PREPAYMENT =================
  let bal2 = Math.max(P - lumpSum, 0);
  let interest2 = 0;
  let months = 0;

  let labels2 = [];
  let balances2 = [];
  let tableHTML = "";

  while (bal2 > 0) {

    let interest = bal2 * r;
    let principal = emi - interest + extra;

    if (principal <= 0) break;
    if (principal > bal2) principal = bal2;

    bal2 -= principal;
    interest2 += interest;
    months++;

    labels2.push(months);
    balances2.push(bal2 > 0 ? bal2 : 0);

    if (months <= 60) {
      tableHTML += `
        <tr>
          <td>${months}</td>
          <td>${format(emi)}</td>
          <td>${format(principal)}</td>
          <td>${format(interest)}</td>
          <td>${format(bal2)}</td>
        </tr>
      `;
    }

    if (months > 600) break;
  }

  let total2 = P + interest2;

  // ================= SAVINGS =================
  let savedInterest = Math.max(interest1 - interest2, 0);
  let savedMonths = Math.max(n - months, 0);

  // ================= UI =================

  // WITHOUT PREPAYMENT
  emiEl.innerText = format(emi);
  interestEl.innerText = format(interest1);
  totalEl.innerText = format(total1);

  // WITH PREPAYMENT
  emiNewEl.innerText = format(emi);
  interestNewEl.innerText = format(interest2);
  newTenureEl.innerText = Math.round(months / 12) + " yrs";

  // SAVINGS
  savedInterestEl.innerText = format(savedInterest);
  savedTimeEl.innerText = savedMonths + " months";
  newTenureText.innerText = Math.round(months / 12) + " yrs";

  tableBody.innerHTML = tableHTML;

  // ================= INSIGHT =================
  insightText.innerText =
    savedInterest > 0
      ? `You save ${format(savedInterest)} and finish ${savedMonths} months earlier 🚀`
      : `Add prepayment to reduce interest and tenure`;

  // ================= PIE CHART =================
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieChartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Principal", "Interest"],
      datasets: [{
        data: [P, interest2]
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      }
    }
  });

  // ================= LINE CHART (🔥 IMPROVED) =================
  if (lineChart) lineChart.destroy();

  lineChart = new Chart(lineChartCanvas, {
    type: "line",
    data: {
      labels: labels1, // full timeline
      datasets: [
        {
          label: "Without Prepayment",
          data: balances1,
          borderWidth: 2,
          tension: 0.4
        },
        {
          label: "With Prepayment",
          data: balances2,
          borderWidth: 3,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#9fb0d1" }
        },
        y: {
          ticks: { color: "#9fb0d1" }
        }
      }
    }
  });
}

// ================= ELEMENTS =================
const amount = document.getElementById("amount");
const rate = document.getElementById("rate");
const tenureInput = document.getElementById("tenure");
const extraInput = document.getElementById("extra");
const lumpSumInput = document.getElementById("lumpSum");

const emiEl = document.getElementById("emi");
const interestEl = document.getElementById("interest");
const totalEl = document.getElementById("total");

const emiNewEl = document.getElementById("emiNew");
const interestNewEl = document.getElementById("interestNew");

const savedInterestEl = document.getElementById("savedInterest");
const savedTimeEl = document.getElementById("savedTime");
const newTenureEl = document.getElementById("newTenure");
const newTenureText = document.getElementById("newTenureText");

const tableBody = document.getElementById("tableBody");
const insightText = document.getElementById("insightText");

const pieChartCanvas = document.getElementById("pieChart");
const lineChartCanvas = document.getElementById("lineChart");

// ================= LOAN TYPE =================
loanType.addEventListener("change", e => {
  if (e.target.value === "home") {
    rate.value = 8.5;
    tenureInput.value = 20;
  }
  if (e.target.value === "car") {
    rate.value = 9.5;
    tenureInput.value = 7;
  }
  if (e.target.value === "personal") {
    rate.value = 13;
    tenureInput.value = 5;
  }
  calculate();
});

// ================= TOGGLE =================
yearsBtn.onclick = () => {
  isYears = true;
  yearsBtn.classList.add("active");
  monthsBtn.classList.remove("active");
  calculate();
};

monthsBtn.onclick = () => {
  isYears = false;
  monthsBtn.classList.add("active");
  yearsBtn.classList.remove("active");
  calculate();
};

// ================= AUTO =================
["amount","rate","tenure","extra","lumpSum"].forEach(id=>{
  document.getElementById(id).addEventListener("input", calculate);
});

// ================= TABLE =================
toggleTable.onclick = () => {
  tableContainer.classList.toggle("hidden");
};

// ================= SHARE =================
copyBtn.onclick = () => {
  navigator.clipboard.writeText(`My EMI is ${emiEl.innerText} using SmartCalc`);
  alert("Copied!");
};

waBtn.onclick = () => {
  window.open(`https://wa.me/?text=My EMI is ${emiEl.innerText}`, "_blank");
};

// ================= INIT =================
calculate();

const prepayToggle = document.getElementById("prepayToggle");
const prepayBox = document.getElementById("prepayBox");

prepayToggle.onclick = () => {
  prepayBox.classList.toggle("hidden");

  prepayToggle.innerText = prepayBox.classList.contains("hidden")
    ? "➕ Add Prepayment (Save Interest)"
    : "➖ Remove Prepayment";
};
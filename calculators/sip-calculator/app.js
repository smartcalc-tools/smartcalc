// ========================================
// SMARTCALC ULTRA SIP CALCULATOR
// Premium Optimized JS
// ========================================


// ========================================
// ELEMENTS
// ========================================

const mode =
document.getElementById("mode");

const amount =
document.getElementById("amount");

const time =
document.getElementById("time");

const rate =
document.getElementById("rate");

const inflationToggle =
document.getElementById(
  "inflationToggle"
);

const inflationBox =
document.getElementById(
  "inflationBox"
);

const inflation =
document.getElementById(
  "inflation"
);

const stepUp =
document.getElementById(
  "stepUp"
);

const frequency =
document.getElementById(
  "frequency"
);

const investedEl =
document.getElementById(
  "invested"
);

const futureValueEl =
document.getElementById(
  "futureValue"
);

const profitEl =
document.getElementById(
  "profit"
);

const realValueEl =
document.getElementById(
  "realValue"
);

const doubleTimeEl =
document.getElementById(
  "doubleTime"
);

const insightText =
document.getElementById(
  "insightText"
);

const tableBody =
document.getElementById(
  "tableBody"
);

const chartCanvas =
document.getElementById(
  "chart"
);

const toggleAdvancedBtn =
document.getElementById(
  "toggleAdvanced"
);

const advancedBox =
document.getElementById(
  "advancedBox"
);

const toggleTable =
document.getElementById(
  "toggleTable"
);

const tableWrapper =
document.getElementById(
  "tableWrapper"
);

const downloadChartBtn =
document.getElementById(
  "downloadChart"
);

const downloadCSVBtn =
document.getElementById(
  "downloadCSV"
);

const waBtn =
document.getElementById(
  "waBtn"
);

const copyBtn =
document.getElementById(
  "copyBtn"
);


// ========================================
// GLOBALS
// ========================================

let chart = null;

let chartData = [];


// ========================================
// FORMATTERS
// ========================================

function formatCurrency(value){

  return "₹" +
  Math.round(value)
  .toLocaleString("en-IN");

}

function formatCompact(value){

  return new Intl.NumberFormat(
    "en-IN",
    {
      notation:"compact",
      maximumFractionDigits:1
    }
  ).format(value);

}


// ========================================
// DEBOUNCE
// ========================================

function debounce(
  fn,
  delay = 200
){

  let timer;

  return (...args)=>{

    clearTimeout(timer);

    timer = setTimeout(()=>{

      fn(...args);

    }, delay);

  };

}

const autoCalc =
debounce(calculate, 120);


// ========================================
// EVENTS
// ========================================

[
  mode,
  amount,
  time,
  rate,
  inflation,
  stepUp,
  frequency
].forEach(el=>{

  el.addEventListener(
    "input",
    autoCalc
  );

});


// ========================================
// INFLATION TOGGLE
// ========================================

inflationToggle.addEventListener(
  "change",
  ()=>{

    inflationBox.style.display =

    inflationToggle.value === "yes"
    ? "block"
    : "none";

    calculate();

  }
);


// ========================================
// ADVANCED TOGGLE
// ========================================

toggleAdvancedBtn.addEventListener(
  "click",
  ()=>{

    const isOpen =

    advancedBox.style.display ===
    "block";

    advancedBox.style.display =

    isOpen
    ? "none"
    : "block";

    toggleAdvancedBtn.innerHTML =

    isOpen
    ? "Advanced Settings ▼"
    : "Advanced Settings ▲";

  }
);


// ========================================
// TABLE TOGGLE
// ========================================

toggleTable.addEventListener(
  "click",
  ()=>{

    const isOpen =

    tableWrapper.style.display ===
    "block";

    tableWrapper.style.display =

    isOpen
    ? "none"
    : "block";

    toggleTable.innerHTML =

    isOpen
    ? "Show ▼"
    : "Hide ▲";

  }
);


// ========================================
// MAIN CALCULATOR
// ========================================

function calculate(){

  // ===============================
  // VALUES
  // ===============================

  const P =
  parseFloat(amount.value) || 0;

  const years =
  parseFloat(time.value) || 0;

  const annualRate =
  (
    parseFloat(rate.value) || 0
  ) / 100;

  const inflationRate =
  (
    parseFloat(inflation.value) || 0
  ) / 100;

  const stepUpRate =
  (
    parseFloat(stepUp.value) || 0
  ) / 100;

  const compounding =
  parseInt(frequency.value);

  // ===============================
  // VALIDATION
  // ===============================

  if(
    P <= 0 ||
    years <= 0 ||
    annualRate <= 0
  ){

    resetUI();

    return;

  }

  // ===============================
  // VARIABLES
  // ===============================

  let totalInvested = 0;

  let futureValue = 0;

  let futureArray = [];

  let investedArray = [];

  let yearlyTable = [];

  // ========================================
  // SIP CALCULATION
  // ========================================

  if(mode.value === "sip"){

    let currentInvestment = P;

    const monthlyRate =
    annualRate / 12;

    const totalMonths =
    years * 12;

    futureValue = 0;

    for(
      let month = 1;
      month <= totalMonths;
      month++
    ){

      futureValue =

      (
        futureValue +
        currentInvestment
      ) *
      (1 + monthlyRate);

      totalInvested +=
      currentInvestment;

      // yearly
      if(month % 12 === 0){

        const year =
        month / 12;

        futureArray.push(
          futureValue
        );

        investedArray.push(
          totalInvested
        );

        yearlyTable.push({

          year,

          invested:
          totalInvested,

          value:
          futureValue,

          profit:
          futureValue -
          totalInvested

        });

        // step up
        currentInvestment *=

        (
          1 +
          stepUpRate
        );

      }

    }

  }

  // ========================================
  // LUMPSUM CALCULATION
  // ========================================

  else{

    totalInvested = P;

    for(
      let year = 1;
      year <= years;
      year++
    ){

      futureValue =

      P *
      Math.pow(
        (
          1 +
          annualRate /
          compounding
        ),
        compounding *
        year
      );

      futureArray.push(
        futureValue
      );

      investedArray.push(
        totalInvested
      );

      yearlyTable.push({

        year,

        invested:
        totalInvested,

        value:
        futureValue,

        profit:
        futureValue -
        totalInvested

      });

    }

  }

  // ========================================
  // PROFITS
  // ========================================

  const profit =

  futureValue -
  totalInvested;

  // ========================================
  // REAL VALUE
  // ========================================

  let realValue =
  futureValue;

  if(
    inflationToggle.value ===
    "yes"
  ){

    realValue =

    futureValue /

    Math.pow(
      (
        1 +
        inflationRate
      ),
      years
    );

  }

  // ========================================
  // RULE OF 72
  // ========================================

  const doubleYears =

  72 /
  (annualRate * 100);

  // ========================================
  // UPDATE UI
  // ========================================

  investedEl.innerHTML =

  formatCurrency(
    totalInvested
  );

  futureValueEl.innerHTML =

  formatCurrency(
    futureValue
  );

  profitEl.innerHTML =

  formatCurrency(
    profit
  );

  realValueEl.innerHTML =

  formatCurrency(
    realValue
  );

  doubleTimeEl.innerHTML =

  doubleYears.toFixed(1) +
  " Years";

  // ========================================
  // INSIGHTS
  // ========================================

  const wealthMultiplier =

  (
    futureValue /
    totalInvested
  ).toFixed(1);

  insightText.innerHTML = `
  
    🚀 Your investment of
    <b>${formatCurrency(totalInvested)}</b>
    can grow into
    <b style="
      color:#ffd36b;
    ">
      ${formatCurrency(futureValue)}
    </b>
    over
    <b>${years} years</b>.

    <br><br>

    📈 Estimated profit:
    <b style="
      color:#00f5a0;
    ">
      ${formatCurrency(profit)}
    </b>

    <br><br>

    💎 Wealth growth:
    <b>
      ${wealthMultiplier}x
    </b>

    through the power of
    compounding.
  
  `;

  // ========================================
  // TABLE
  // ========================================

  renderTable(yearlyTable);

  // ========================================
  // CHART
  // ========================================

  drawChart(
    futureArray,
    investedArray
  );

  // ========================================
  // STORE DATA
  // ========================================

  chartData = yearlyTable;

}


// ========================================
// RESET UI
// ========================================

function resetUI(){

  investedEl.innerHTML =
  "₹0";

  futureValueEl.innerHTML =
  "₹0";

  profitEl.innerHTML =
  "₹0";

  realValueEl.innerHTML =
  "₹0";

  doubleTimeEl.innerHTML =
  "—";

  tableBody.innerHTML = "";

  insightText.innerHTML =
  "Enter values to calculate investment growth.";

}


// ========================================
// TABLE RENDER
// ========================================

function renderTable(data){

  tableBody.innerHTML = "";

  data.forEach(row=>{

    tableBody.innerHTML += `
    
      <tr>

        <td>
          ${row.year}
        </td>

        <td>
          ${formatCurrency(
            row.invested
          )}
        </td>

        <td>
          ${formatCurrency(
            row.value
          )}
        </td>

        <td style="
          color:#00f5a0;
          font-weight:700;
        ">
          ${formatCurrency(
            row.profit
          )}
        </td>

      </tr>
    
    `;

  });

}


// ========================================
// CHART
// ========================================

function drawChart(
  futureData,
  investedData
){

  if(chart){

    chart.destroy();

  }

  const ctx =
  chartCanvas.getContext("2d");

  const gradient1 =
  ctx.createLinearGradient(
    0,
    0,
    0,
    400
  );

  gradient1.addColorStop(
    0,
    "rgba(255,211,107,0.4)"
  );

  gradient1.addColorStop(
    1,
    "rgba(255,211,107,0)"
  );

  const gradient2 =
  ctx.createLinearGradient(
    0,
    0,
    0,
    400
  );

  gradient2.addColorStop(
    0,
    "rgba(124,92,255,0.25)"
  );

  gradient2.addColorStop(
    1,
    "rgba(124,92,255,0)"
  );

  chart = new Chart(ctx,{

    type:"line",

    data:{

      labels:

      futureData.map(
        (_,i)=>
        `Year ${i+1}`
      ),

      datasets:[

        {

          label:
          "Future Value",

          data:
          futureData,

          borderColor:
          "#ffd36b",

          backgroundColor:
          gradient1,

          borderWidth:3,

          fill:true,

          tension:0.4,

          pointRadius:3

        },

        {

          label:
          "Invested Amount",

          data:
          investedData,

          borderColor:
          "#7c5cff",

          backgroundColor:
          gradient2,

          borderWidth:3,

          fill:true,

          tension:0.4,

          pointRadius:3

        }

      ]

    },

    options:{

      responsive:true,

      maintainAspectRatio:false,

      interaction:{
        intersect:false,
        mode:"index"
      },

      plugins:{

        legend:{

          labels:{
            color:"#fff"
          }

        }

      },

      scales:{

        x:{

          ticks:{
            color:"#aaa"
          },

          grid:{
            color:
            "rgba(255,255,255,0.05)"
          }

        },

        y:{

          ticks:{
            color:"#aaa",

            callback:value=>

            "₹" +
            formatCompact(value)

          },

          grid:{
            color:
            "rgba(255,255,255,0.05)"
          }

        }

      }

    }

  });

}


// ========================================
// WHATSAPP SHARE
// ========================================

waBtn.addEventListener(
  "click",
  ()=>{

    const message = `
    
🚀 SmartCalc SIP Result

💰 Invested:
${investedEl.innerText}

📈 Future Value:
${futureValueEl.innerText}

💎 Profit:
${profitEl.innerText}

Try SmartCalc now!
    
    `;

    window.open(

      "https://wa.me/?text=" +

      encodeURIComponent(
        message
      )

    );

  }
);


// ========================================
// COPY RESULT
// ========================================

copyBtn.addEventListener(
  "click",
  async ()=>{

    const text = `
    
Invested:
${investedEl.innerText}

Future Value:
${futureValueEl.innerText}

Profit:
${profitEl.innerText}
    
    `;

    await navigator
    .clipboard
    .writeText(text);

    copyBtn.innerHTML =
    "Copied ✓";

    setTimeout(()=>{

      copyBtn.innerHTML =
      "Copy";

    },1500);

  }
);


// ========================================
// DOWNLOAD CHART
// ========================================

downloadChartBtn
.addEventListener(
  "click",
  ()=>{

    const link =
    document.createElement("a");

    link.download =
    "smartcalc-chart.png";

    link.href =
    chart.toBase64Image();

    link.click();

  }
);


// ========================================
// DOWNLOAD CSV
// ========================================

downloadCSVBtn
.addEventListener(
  "click",
  ()=>{

    let csv =

    "Year,Invested,Future Value,Profit\n";

    chartData.forEach(row=>{

      csv +=
      `${row.year},${row.invested},${row.value},${row.profit}\n`;

    });

    const blob =
    new Blob(
      [csv],
      {
        type:"text/csv"
      }
    );

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href = url;

    a.download =
    "smartcalc-data.csv";

    a.click();

    URL.revokeObjectURL(
      url
    );

  }
);


// ========================================
// INITIAL LOAD
// ========================================

calculate();
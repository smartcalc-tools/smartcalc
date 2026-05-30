// ===== ELEMENTS =====
const daily = document.getElementById("daily");
const years = document.getElementById("years");
const rate = document.getElementById("rate");

const yVal = document.getElementById("yVal");
const rVal = document.getElementById("rVal");

const investedEl = document.getElementById("invested");
const finalEl = document.getElementById("final");
const profitEl = document.getElementById("profit");
const profitText = document.getElementById("profitText");

const calcBtn = document.getElementById("calcBtn");
const resetBtn = document.getElementById("resetBtn");

// ===== CHART =====
let chart;

// ===== DEBOUNCE (IMPORTANT FOR PERFORMANCE) =====
function debounce(fn, delay = 200){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), delay);
  };
}

const autoCalc = debounce(calc, 150);

// ===== RANGE UI =====
years.oninput = () => {
  yVal.innerText = years.value;
  autoCalc();
};

rate.oninput = () => {
  rVal.innerText = rate.value;
  autoCalc();
};

// ===== DAILY INPUT AUTO =====
daily.oninput = autoCalc;

// ===== QUICK BUTTONS =====
document.querySelectorAll(".quick button").forEach(btn=>{
  btn.onclick = () => {
    document.querySelectorAll(".quick button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    daily.value = btn.dataset.amt;
    calc(); // instant (no delay)
  };
});

// ===== RESET =====
resetBtn.onclick = () => {
  daily.value = 100;
  years.value = 10;
  rate.value = 12;

  yVal.innerText = 10;
  rVal.innerText = 12;

  calc();
};

// ===== OPTIONAL BUTTON (still works) =====
calcBtn.onclick = calc;

// ===== MAIN FUNCTION =====
function calc(){
  let d = +daily.value || 0;
  let y = +years.value || 0;
  let r = (rate.value || 0) / 100;

  let invested = d * 365 * y;
  let value = 0;

  let futureArr = [];
  let investArr = [];

  for(let i = 1; i <= y * 365; i++){
    value = (value + d) * (1 + r/365);

    if(i % 365 === 0){
      futureArr.push(value);
      investArr.push(d * 365 * (i/365));
    }
  }

  // ===== RESULTS =====
  investedEl.innerText = "₹" + invested.toLocaleString("en-IN");
  finalEl.innerText = "₹" + Math.round(value).toLocaleString("en-IN");

  let profit = value - invested;
  profitEl.innerText = "₹" + Math.round(profit).toLocaleString("en-IN");
  profitText.innerText = "₹" + Math.round(profit).toLocaleString("en-IN");

  drawChart(futureArr, investArr);
}

// ===== CHART =====
function drawChart(future, invested){
  if(chart) chart.destroy();

  const ctx = document.getElementById("chart").getContext("2d");

  const greenGradient = ctx.createLinearGradient(0,0,0,300);
  greenGradient.addColorStop(0,"rgba(0,255,156,0.4)");
  greenGradient.addColorStop(1,"rgba(0,255,156,0)");

  const blueGradient = ctx.createLinearGradient(0,0,0,300);
  blueGradient.addColorStop(0,"rgba(80,120,255,0.3)");
  blueGradient.addColorStop(1,"rgba(80,120,255,0)");

  chart = new Chart(ctx,{
    type:"line",
    data:{
      labels: future.map((_,i)=>"Year " + (i+1)),
      datasets:[
        {
          label:"Future Value",
          data:future,
          borderColor:"#00ff9c",
          backgroundColor:greenGradient,
          fill:true,
          tension:0.4
        },
        {
          label:"Invested Amount",
          data:invested,
          borderColor:"#4f7cff",
          backgroundColor:blueGradient,
          fill:true,
          tension:0.4
        }
      ]
    },
    options:{
      responsive:true,
      animation: {
        duration: 600 // smooth animation
      },
      plugins:{
        legend:{labels:{color:"#fff"}},
        tooltip:{
          callbacks:{
            label:(ctx)=> ctx.dataset.label + ": ₹" + ctx.raw.toLocaleString("en-IN")
          }
        }
      },
      scales:{
        x:{ticks:{color:"#aaa"}},
        y:{
          ticks:{
            color:"#aaa",
            callback:(v)=>"₹"+(v/1000)+"k"
          }
        }
      }
    }
  });
}

// ===== SHARE =====
document.getElementById("waBtn").onclick = ()=>{
  const text = `My investment grows to ${finalEl.innerText} 🚀`;
  window.open("https://wa.me/?text=" + encodeURIComponent(text));
};

document.getElementById("copyBtn").onclick = ()=>{
  navigator.clipboard.writeText(finalEl.innerText);
  alert("Copied!");
};

// ===== INITIAL RUN =====
calc();
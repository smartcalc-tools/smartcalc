// Google Analytics

const script = document.createElement("script");

script.async = true;

script.src =
"https://www.googletagmanager.com/gtag/js?id=G-LX8EHV1BNR";

document.head.appendChild(script);

window.dataLayer =
window.dataLayer || [];

function gtag(){
  dataLayer.push(arguments);
}

window.gtag = gtag;

gtag("js", new Date());

gtag("config", "G-LX8EHV1BNR");

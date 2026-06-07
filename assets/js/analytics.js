// Google Analytics

const script = document.createElement("script");

script.async = true;

script.src =
"https://www.googletagmanager.com/gtag/js?id=G-GVCXD3GYF3";

document.head.appendChild(script);

window.dataLayer =
window.dataLayer || [];

function gtag(){
  dataLayer.push(arguments);
}

window.gtag = gtag;

gtag("js", new Date());

gtag("config", "G-GVCXD3GYF3");

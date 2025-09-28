function randColor(){return'#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}
function adjustBrightness(hex,amt){let col=parseInt(hex.slice(1),16),r=(col>>16)+amt,g=(col>>8&255)+amt,b=(col&255)+amt;
r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function randGradient(){let a=randColor(),b=adjustBrightness(a,Math.random()>.5?80:-80);
return 'linear-gradient(90deg, '+a+', '+b+')'}
function generateGradientMap(cats){const map={};cats.forEach(cat=>map[cat]=randGradient());return map}
function applyGradients(){document.querySelectorAll('.category-header').forEach(el=>{
 if(el.dataset._grad_applied)return; el.style.background=randGradient(); el.dataset._grad_applied=1})}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',applyGradients)}else{applyGradients()}
const observer=new MutationObserver(()=>{applyGradients()});
observer.observe(document.documentElement||document.body,{childList:true,subtree:true});
window.generateGradientMap=generateGradientMap;

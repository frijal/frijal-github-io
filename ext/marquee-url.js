(function(global){
"use strict";

var MarqueeDynamic = {};

MarqueeDynamic.initMarqueeDynamic = async function(containerId, defaultSpeed=0.2, refreshInterval=60000){
  const container = document.getElementById(containerId);
  const inner = document.getElementById("marquee-inner");
  const speedRange = document.getElementById("speedRange");
  if(!container || !inner) return;

  let left = 0, speed = defaultSpeed;

  async function loadArticles(){
    try{
      const res = await fetch('/artikel.json');
      const data = await res.json();
      const currentFile = location.pathname.split('/').pop();
      let category = null;

      for(const cat in data){
        if(data[cat].some(arr=>arr[1]===currentFile)){
          category = cat;
          break;
        }
      }
      if(!category) return;

      const articles = data[category].map(arr=>{
        const file = arr[1].startsWith('artikel/') ? arr[1] : 'artikel/' + arr[1];
        return {title: arr[0], file};
      }).sort(()=>0.5-Math.random());

      inner.innerHTML = articles.map(a=>`<a href="${a.file}">${a.title}</a>`).join(' • ') + ' • ' + articles.map(a=>`<a href="${a.file}">${a.title}</a>`).join(' • ');

    }catch(e){
      console.error('Gagal load artikel.json:', e);
      inner.textContent = 'Gagal memuat artikel.';
    }
  }

  function step(){
    left -= speed;
    if(left <= -inner.scrollWidth/2) left = 0;
    inner.style.transform = "translateX("+left+"px)";
    requestAnimationFrame(step);
  }

  await loadArticles();
  step();

  if(speedRange) speedRange.addEventListener("input", function(e){
    speed = parseFloat(e.target.value);
  });

  setInterval(loadArticles, refreshInterval);
};

global.MarqueeDynamic = MarqueeDynamic;

})(this);

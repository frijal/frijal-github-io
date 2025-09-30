(function(global,factory){
  if(typeof exports==="object"&&typeof module==="object") module.exports=factory();
  else if(typeof define==="function"&&define.amd) define(["exports"],factory);
  else global.MarqueeDynamic=factory();
})(this,function(exports){
"use strict";
exports.initMarqueeDynamic=function(containerId,defaultSpeed=0.2,refreshInterval=60000){
  const container=document.getElementById(containerId);
  const inner=document.getElementById("marquee-inner");
  const speedRange=document.getElementById("speedRange");
  if(!container||!inner)return;
  let left=0,speed=defaultSpeed;

  async function loadArticles(){
    try{
      const res=await fetch('/artikel.json');
      const data=await res.json();
      const currentFile=location.pathname.split('/').pop();
      let category=null;
      for(const cat in data)
        if(data[cat].some(arr=>arr[1]===currentFile)){category=cat;break}
      if(!category)return;
      const articles=data[category].map(arr=>({title:arr[0],file:arr[1]})).sort(()=>0.5-Math.random());
      const content=articles.map(a=>`<a href="artikel/${a.file}">${a.title}</a>`).join(' • ');
      inner.innerHTML=content+' • '+content;
    }catch(e){console.error('Gagal load artikel.json:',e);inner.textContent='Gagal memuat artikel.'}
  }

  function step(){left-=speed;if(left<=-inner.scrollWidth/2)left=0;inner.style.transform="translateX("+left+"px)";requestAnimationFrame(step)}

  document.addEventListener("DOMContentLoaded",async function(){await loadArticles();step()});

  if(speedRange)speedRange.addEventListener("input",function(e){speed=parseFloat(e.target.value)});
  setInterval(loadArticles,refreshInterval);
};
return exports;
});

(function(global,factory){
  if(typeof exports==="object"&&typeof module==="object")
    module.exports=factory();
  else if(typeof define==="function"&&define.amd)
    define(["exports"],factory);
  else
    global.MarqueeDynamic=factory();
})(this,function(exports){
  "use strict";

  exports.initMarqueeDynamic=function(containerId, defaultSpeed=0.2, refreshInterval=60000){
    const container=document.getElementById(containerId);
    const inner=document.getElementById("marquee-inner");
    const speedRange=document.getElementById("speedRange");
    if(!container||!inner) return;

    let left=0;
    let speed=defaultSpeed;
    let totalWidth=0;

    async function updateMarquee(){
      try{
        const res=await fetch("/artikel/artikel.json");
        const data=await res.json();
        const currentFile=location.pathname.split("/").pop();

        // Temukan kategori
        let category=null;
        for(const cat in data){
          if(data[cat].some(arr=>arr[1]===currentFile)){
            category=cat; break;
          }
        }
        if(!category) return;

        const articles=data[category];
        inner.innerHTML=articles.map(a=>`<a href="artikel/${a[1]}">${a[0]}</a>`).join(" • ");
        totalWidth=inner.scrollWidth;
        left=0;
      }catch(e){
        console.error("Gagal load artikel.json:",e);
      }
    }

    function step(){
      left-=speed;
      if(left<=-totalWidth) left=0;
      inner.style.transform="translateX("+left+"px)";
      requestAnimationFrame(step);
    }

    document.addEventListener("DOMContentLoaded", ()=>{
      updateMarquee();
      step();
    });

    if(speedRange){
      speedRange.addEventListener("input", e=>{
        speed=parseFloat(e.target.value);
      });
    }

    // Refresh artikel otomatis
    setInterval(updateMarquee, refreshInterval);
  };

  return exports;
});

(function(global, factory){
  if(typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if(typeof define === "function" && define.amd)
    define(["exports"], factory);
  else
    global.MarqueeDynamic = factory();
})(this, function(exports){
  "use strict";

  exports.initMarqueeDynamic = function(containerId, defaultSpeed = 0.2){
    const container = document.getElementById(containerId);
    const inner = document.getElementById("marquee-inner");
    const speedRange = document.getElementById("speedRange");

    if(!container || !inner) return;

    let left = 0;
    let speed = defaultSpeed;

    function step(){
      left -= speed;
      if(left <= -inner.scrollWidth / 2) left = 0;
      inner.style.transform = "translateX(" + left + "px)";
      requestAnimationFrame(step);
    }

    // Jalankan step setelah DOM siap
    document.addEventListener("DOMContentLoaded", step);

    // Slider kontrol kecepatan
    if(speedRange){
      speedRange.addEventListener("input", function(e){
        speed = parseFloat(e.target.value);
      });
    }
  };

  return exports;
});

(function(global, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if (typeof define === "function" && define.amd)
    define(["exports"], factory);
  else
    global.MarqueeDynamic = factory();
})(this, function(exports) {
  "use strict";

  exports.initMarqueeDynamic = function(containerId, defaultSpeed = 0.2, refreshInterval = 60000) {
    const container = document.getElementById(containerId);
    const inner = document.getElementById("marquee-inner");
    const speedRange = document.getElementById("speedRange");

    if (!container || !inner) return;

    let left = 0;
    let speed = defaultSpeed;

    function step() {
      left -= speed;
      if (left <= -inner.scrollWidth / 2) left = 0;
      inner.style.transform = "translateX(" + left + "px)";
      requestAnimationFrame(step);
    }

    // Jalankan step setelah DOM siap
    document.addEventListener("DOMContentLoaded", step);

    // Slider input untuk mengubah kecepatan
    if (speedRange) {
      speedRange.addEventListener("input", function(e) {
        speed = parseFloat(e.target.value);
      });
    }
  };

  Object.defineProperty(exports, "__esModule", { value: true });

  return exports;
});

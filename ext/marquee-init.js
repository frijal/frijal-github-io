import { initMarqueeDynamic } from './marquee.js';

document.addEventListener('DOMContentLoaded', () => {
  initMarqueeDynamic('marquee-bottom', 1, 60000); 
  // 1 = speed, 60000 = refresh setiap 60 detik
});

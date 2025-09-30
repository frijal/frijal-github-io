/* Container marquee */
#marquee-bottom {
  position: relative;
  width: 100%;
  overflow: hidden; /* harus hidden supaya marquee terlihat */
  background: #111;
  color: #fff;
  white-space: nowrap;
}

/* Konten marquee */
#marquee-inner {
  display: inline-block;
  white-space: nowrap;
  transform: translateX(0);
}

/* Slider vertikal */
#speedRange {
  position: fixed;
  right: 15px;
  top: 50%;
  transform: rotate(-90deg) translateY(-50%);
  transform-origin: center;
  width: 120px;  /* panjang slider */
  height: 6px;   /* tebal slider */
  background: #555; /* agar track terlihat */
  -webkit-appearance: none;
  appearance: none;
  z-index: 999;
}

/* Thumb slider Chrome/Safari */
#speedRange::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
}

/* Thumb slider Firefox */
#speedRange::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
}

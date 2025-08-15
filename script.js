// Auto scroll effect
const slider = document.getElementById("clientSlider");
let scrollAmount = 0;

function autoScroll() {
  if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
    slider.scrollLeft = 0; // رجوع للبداية
  } else {
    slider.scrollLeft += 1; // سرعة الحركة
  }
}

let scrollInterval = setInterval(autoScroll, 20); // كل 20ms تتحرك

// إيقاف الحركة أثناء السحب اليدوي
slider.addEventListener("mouseenter", () => clearInterval(scrollInterval));
slider.addEventListener("mouseleave", () => {
  scrollInterval = setInterval(autoScroll, 20);
});

// Auto scroll effect
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add scroll-triggered animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
        entry.target.style.opacity = '1';
      }
    });
  }, observerOptions);

  // Observe feature cards and steps
  document.querySelectorAll('.feature-card, .step').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });

  // Add floating animation to logo
  const logo = document.querySelector('.logo');
  if (logo) {
    setInterval(() => {
      logo.style.animation = 'bounce 2s ease';
      setTimeout(() => {
        logo.style.animation = '';
      }, 2000);
    }, 10000);
  }
  const slider = document.querySelector(".client-slider");

  // Check if slider exists before trying to use it
  if (slider) {
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
  }

  // Form handling
  const form = document.getElementById('serviceFormElement');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault(); // منع إعادة تحميل الصفحة

      const templateParams = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        email_to: 'hshmhshm72@gmail.com' // هذا هو الايميل اللي توصله الرسائل
      };

      emailjs.send('service_q7s2525t435te', 'YOUR_TEMPLATE_ID', templateParams)
        .then(function(response) {
           alert('تم إرسال الطلب بنجاح!');
           form.reset();
        }, function(error) {
           alert('حدث خطأ، حاول مرة أخرى.');
           console.log(error);
        });
    });
  }
});
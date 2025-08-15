// Auto scroll effect
const slider = document.querySelector(".client-slider");
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
<!-- ربط مكتبة EmailJS -->
<script src="https://cdn.emailjs.com/dist/email.min.js"></script>
<script>
  (function(){
      emailjs.init("YOUR_USER_ID"); // حطي هنا User ID من EmailJS
  })();

const form = document.getElementById('serviceFormElement');

form.addEventListener('submit', function(e) {
  e.preventDefault(); // منع إعادة تحميل الصفحة

  const templateParams = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    service: document.getElementById('service').value
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
  <script>
  const form = document.getElementById('serviceFormElement');

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
  </script>


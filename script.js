// main.js

document.addEventListener("DOMContentLoaded", () => {
  // زر الرجوع للأعلى
  const toTopBtn = document.createElement("button");
  toTopBtn.textContent = "⬆️";
  Object.assign(toTopBtn.style, {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    padding: "10px",
    borderRadius: "50%",
    fontSize: "18px",
    backgroundColor: "#4b3b69",
    color: "#fff",
    border: "none",
    display: "none",
    cursor: "pointer",
    zIndex: 1000,
    transition: "0.3s ease"
  });
  document.body.appendChild(toTopBtn);

  window.addEventListener("scroll", () => {
    toTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
  });

  toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // فتح المودال
  window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
  };

  // إغلاق المودال
  window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
  };

  // إغلاق عند الضغط خارج المودال
  window.addEventListener("click", (e) => {
    document.querySelectorAll(".modal").forEach(modal => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  });

  // الأسئلة الشائعة
  document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
      const answer = q.nextElementSibling;
      const isOpen = answer.classList.contains("show");

      document.querySelectorAll(".faq-question").forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(".faq-answer").forEach(a => a.classList.remove("show"));

      if (!isOpen) {
        q.classList.add("active");
        answer.classList.add("show");
      }
    });
  });
});
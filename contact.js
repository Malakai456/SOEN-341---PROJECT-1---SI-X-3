document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
  };

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    const msgEl = document.getElementById("successMessage");

    if (data.success) {
      msgEl.style.display = "block";
      msgEl.textContent = "✅ Your message was sent successfully!";
      document.getElementById("contactForm").reset();
      setTimeout(() => (msgEl.style.display = "none"), 3000);
    } else {
      alert(data.message || "Something went wrong.");
    }
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Server error. Please try again later.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const ticketType = document.getElementById("ticketType");
    const priceField = document.getElementById("priceField");
    const form = document.getElementById("createEventForm");
    const message = document.getElementById("message");
  
    // Show or hide price field
    ticketType.addEventListener("change", () => {
      if (ticketType.value === "paid") {
        priceField.style.display = "block";
        priceField.querySelector("input").setAttribute("required", "true");
      } else {
        priceField.style.display = "none";
        priceField.querySelector("input").removeAttribute("required");
      }
    });
  
    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
  
      fetch("addEvent.php", {
        method: "POST",
        body: formData
      })
        .then((res) => res.text())
        .then((data) => {
          message.innerText = data;
          form.reset();
          priceField.style.display = "none";
        })
        .catch((err) => {
          console.error(err);
          message.innerText = "Error submitting event.";
        });
    });
  });
  
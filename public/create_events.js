
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createEventForm");
  const ticketType = document.getElementById("ticketType");
  const priceField = document.getElementById("priceField");
  const message = document.getElementById("message");

  ticketType.addEventListener("change", () => {
    if (ticketType.value === "paid") {
      priceField.style.display = "block";
      priceField.querySelector("input").setAttribute("required", "true");
    } else {
      priceField.style.display = "none";
      priceField.querySelector("input").removeAttribute("required");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const eventData = {
      org_id: 1, 
      title: formData.get("title"),
      description: formData.get("description"),
      event_date: formData.get("event_date"),
      event_time: formData.get("event_time"),
      location_name: formData.get("location_name"),
      capacity: formData.get("capacity"),
      ticket_policy: formData.get("ticket_policy"),
      price: formData.get("price") || 0
    };

    fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    })
      .then(res => res.text())
      .then(data => {
        message.innerText = data;
        form.reset();
        priceField.style.display = "none";
      })
      .catch(err => {
        console.error(err);
        message.innerText = "❌ Error submitting event.";
      });
  });
});

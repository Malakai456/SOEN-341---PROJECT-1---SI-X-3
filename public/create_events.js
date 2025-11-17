
// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("createEventForm");
//   const ticketType = document.getElementById("ticketType");
//   const priceField = document.getElementById("priceField");
//   const message = document.getElementById("message");
//     const imageUpload = document.getElementById("eventImageUpload");
//   const preview = document.getElementById("imagePreview");

//   ticketType.addEventListener("change", () => {
//     if (ticketType.value === "paid") {
//       priceField.style.display = "block";
//       priceField.querySelector("input").setAttribute("required", "true");
//     } else {
//       priceField.style.display = "none";
//       priceField.querySelector("input").removeAttribute("required");
//     }
//   });

//     imageUpload.addEventListener("change", () => {
//     const file = imageUpload.files[0];
//     if (file) {
//       preview.src = URL.createObjectURL(file);
//       preview.style.display = "block";
//     }
//   });

//   form.addEventListener("submit", (e) => {
//     e.preventDefault();
//     const formData = new FormData(form);

//     const eventData = {
//       org_id: 1, 
//       title: formData.get("title"),
//       description: formData.get("description"),
//       event_date: formData.get("event_date"),
//       event_time: formData.get("event_time"),
//       location_name: formData.get("location_name"),
//       capacity: formData.get("capacity"),
//       ticket_policy: formData.get("ticket_policy"),
//       price: formData.get("price") || 0
//     };

//     fetch("http://localhost:5000/api/events", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(eventData)
//     })
//       .then(res => res.text())
//       .then(data => {
//         message.innerText = data;
//         form.reset();
//         priceField.style.display = "none";
//       })
//       .catch(err => {
//         console.error(err);
//         message.innerText = "Error submitting event.";
//       });
//   });
// });
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createEventForm");
  const ticketType = document.getElementById("ticketType");
  const priceField = document.getElementById("priceField");
  const message = document.getElementById("message");
  const imageUpload = document.getElementById("eventImageUpload");
  const preview = document.getElementById("imagePreview");

  // ----------------- PRICE FIELD LOGIC -----------------
  ticketType.addEventListener("change", () => {
    if (ticketType.value === "paid") {
      priceField.style.display = "block";
      priceField.querySelector("input").required = true;
    } else {
      priceField.style.display = "none";
      priceField.querySelector("input").required = false;
    }
  });

  // ----------------- IMAGE PREVIEW -----------------
  imageUpload.addEventListener("change", () => {
    const file = imageUpload.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });

  // ----------------- FORM SUBMIT -----------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);   // <-- IMPORTANT

    fd.append("org_id", 1);          // replace later when login works

    try {
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        body: fd   // <-- NO HEADERS, NO JSON
      });

      const text = await res.text();
      message.textContent = text;

      form.reset();
      preview.style.display = "none";
      priceField.style.display = "none";

    } catch (err) {
      console.error(err);
      message.textContent = "Error submitting event";
    }
  });
});

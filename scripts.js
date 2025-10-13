async function registerUser() {

    const first_name = document.getElementById('firstname').value.trim();
    const last_name = document.getElementById('lastname').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();

    const newClient = { first_name, last_name, username, password, phone, email, address };

try{
        
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newClient),
        });

        if (response.ok) {
            alert('Registration successful!');
            window.location.href = './login.html';
        } else {
            const error = await response.text();
            alert('Error: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to register. Please try again later.');
    }
}



async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const user = await response.json();
           localStorage.setItem('currentUser', JSON.stringify(user));
           alert('Login successful!');
          
            window.location.href = './events.html';
        } else {
            const error = await response.text();
            alert('Login failed: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to login. Please try again later.');
    }
}

// function buyEvent(title, location, price) {
//     const confirmPurchase = confirm(`Buy ticket for "${title}"?`);
//     if (!confirmPurchase) return;

//     // Send to server
//     fetch('http://localhost:5000/buyEvent', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             title: title,
//                location: location,
//             price: parseInt(price, 10)
         
//         })
//     })
//     console.log(price)
//     .then(res => res.json())
//     .then(data => {
//         console.log('Server response:', data);
//         alert(data.message);
//     })
//     .catch(err => {
//         console.error('Error sending event to server:', err);
//         alert('Failed to save event.');
//     });
// }
function buyEvent(title, details, location, date, time, price) {
    const confirmPurchase = confirm(`Are you sure you want a ticket for "${title}"?`);
    if (!confirmPurchase) return;

    // Load calendar from localStorage
    let calendar = JSON.parse(localStorage.getItem('userCalendar')) || [];

    // Add new event
    calendar.push({ title, details, location, date, time, price });

    // Save back
    localStorage.setItem('userCalendar', JSON.stringify(calendar));

    alert(`Ticket for "${title}" added to your personal calendar!`);
}


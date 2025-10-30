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
function buyEvent(title, details, location, date, time, price) {
    const confirmPurchase = confirm(`Are you sure you want a ticket for "${title}"?`);
    if (!confirmPurchase) return;

    const ticketId = 'TICKET-' + Math.floor(Math.random() * 1000000);
    const ticketUrl = location.origin + '/ticket.html?ticketId=' + ticketId;

    const ticketData = {
        firstName: JSON.parse(localStorage.getItem('currentUser'))?.first_name || 'Guest',
        lastName: JSON.parse(localStorage.getItem('currentUser'))?.last_name || '',
        eventName: title,
        eventDetails: details,
        eventLocation: location,
        eventDate: date,
        eventTime: time,
        eventPrice: price,
        eventImage: title.toLowerCase().replace(/\s+/g,'') + '.png', 
        ticketId: ticketId,
        ticketUrl: ticketUrl
    };

    sessionStorage.setItem('lastTicket', JSON.stringify(ticketData));

    let calendar = JSON.parse(localStorage.getItem('userCalendar')) || [];
    calendar.push({ title, details, location, date, time, price, ticketId });
    localStorage.setItem('userCalendar', JSON.stringify(calendar));

    window.location.href = '/ticket.html';
}

// ADDED LOGIN + REGISTER FOR EVENT ORGANIZER
async function registerEventOrganizer() {
    const first_name = document.getElementById('firstname').value.trim();
    const last_name = document.getElementById('lastname').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();

    const newEventOrg = { first_name, last_name, username, password, phone, email, address, user_role: 'event organizer' };

try{
        
        const response = await fetch('http://localhost:5000/registerEventOrg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEventOrg),
        });

        if (response.ok) {
            alert('Registration successful!');
            window.location.href = './loginOrganizer.html';
        } else {
            const error = await response.text();
            alert('Error: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to register. Please try again later.');
    }
}


async function loginEventOrganizer() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/loginEventOrg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const user = await response.json();
           localStorage.setItem('currentUser', JSON.stringify(user));
           alert('Login successful!');
          
            window.location.href = './create_events.html';
        } else {
            const error = await response.text();
            alert('Login failed: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to login. Please try again later.');
    }
}


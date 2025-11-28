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
        
        const response = await fetch('http://localhost:5001/register', {
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
        const response = await fetch('http://localhost:5001/login', {
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

    const newEventOrg = { first_name, last_name, username, phone, email, address, password };
console.log(newEventOrg)
try{
        
        const response = await fetch('http://localhost:5001/registerEventOrg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEventOrg),
        });

        if (response.ok) {
            alert('Registration successful!');
            window.location.href = '/loginOrganizer.html';
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
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) {
    alert('Please enter username and password.');
    return;
  }

  try {
    const res = await fetch('/loginEventOrg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const msg = await res.text().catch(()=>'Login failed');
      alert('Login failed: ' + msg);
      return;
    }

    const data = await res.json();
    const status = data.status ?? 'approved';

    const organizer = {
      user_id:    data.user_id,
      username:   data.username ?? '',
      first_name: data.first_name ?? '',
      last_name:  data.last_name ?? '',
      email:      data.email ?? '',
      status,
      role: 'organizer'
    };
    localStorage.setItem('currentOrganizer', JSON.stringify(organizer));

    localStorage.setItem('currentUser', JSON.stringify({
      user_id:    organizer.user_id,
      username:   organizer.username,
      first_name: organizer.first_name,
      last_name:  organizer.last_name,
      email:      organizer.email,
      role:       'organizer'
    }));

    if (status !== 'approved') {
      alert(`Your organizer account is "${status}". Please wait for admin approval.`);
      return;
    }

    alert('Login successful!');
    window.location.href = './create_events.html';
  } catch (err) {
    console.error(err);
    alert('Failed to login. Please try again later.');
  }
}
function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null'); // { user_id, username } or null
  } catch {
    return null;
  }
}

function showLoggedUser() {
  const user = getLoggedUser();
  const display = document.querySelector('.username-display');
  const logoutBtn = document.querySelector('.logout-btn');

  if (user) {
    if (display)  display.textContent = user.username;
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    if (display)  display.textContent = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function logoutUser() {
  localStorage.removeItem('currentUser');
  alert('Logged out!');
  window.location.href = 'login.html';
}





function gotoTicket(data) {

  sessionStorage.setItem('lastTicket', JSON.stringify(data));
  window.location.href = 'ticket.html';
}

async function buyEvent(event_id, title, details, location, date, time, price) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) {
    alert('Please log in first.');
    window.location.href = 'login.html';
    return;
  }

  const confirmPurchase = confirm(`Are you sure you want to buy a ticket for "${title || 'this event'}"?`);
  if (!confirmPurchase) return;

  try {
   
    const res = await fetch('http://localhost:5001/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, event_id })
    });

  

    if (!res.ok) {
      const msg = await res.text();
      alert(msg || 'Could not complete purchase.');
      return;
    }
    let userCalendar = JSON.parse(localStorage.getItem('userCalendar')) || [];
    userCalendar.push({
        title: title,
        date: date,
        time: time,
        details: details,
        location: location,
        price: price
    });
    localStorage.setItem('userCalendar', JSON.stringify(userCalendar));
    const ticketId = 'TICKET-' + Math.floor(Math.random() * 1000000);
  

    const ticketUrl = `${window.location.origin}/verify.html?ticketId=${ticketId}`;
   

    const ticketData = {
      ticketId,
      ticketUrl,
      firstName: user.first_name,
      lastName: user.last_name,
      eventName: title,
      eventDetails: details,
      eventLocation: location,
      eventDate: date,
      eventTime: time,
      eventPrice: price,
      eventImage: title?.toLowerCase().replace(/\s+/g, '') + '.png'
    };

    gotoTicket(ticketData);
  } catch (err) {
    console.error(' buyEvent crashed:', err);
   
  }
}


document.addEventListener('click', (e) => {
  const btn = e.target.closest('.buy-button');
  if (!btn) return;
  const id = Number(btn.getAttribute('data-event-id'));
  if (!id) return;
  buyEvent(
    id,
    btn.getAttribute('data-title') || '',
    btn.getAttribute('data-desc') || '',
    btn.getAttribute('data-location') || '',
    btn.getAttribute('data-date') || '',
    btn.getAttribute('data-time') || '',
    btn.getAttribute('data-price') || ''
  );
});



// LOGIN FOR ADMIN
async function loginAdmin() {
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  // Hardcoded 
  const ADMIN_USER = 'soen341';
  const ADMIN_PASS = '123';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    alert('Welcome Admin!');
    localStorage.setItem('adminLoggedIn', 'true');
    window.location.href = 'admin.html';
  } else {
    alert(' Invalid credentials, try again.');
  }
}

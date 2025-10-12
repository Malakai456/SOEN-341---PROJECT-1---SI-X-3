//helpers
const isLoggedIn = () => !!sessionStorage.getItem('user');

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user')); }
  catch { return null; }
};

// Look & read event details from card event
function extractEventFromCard(cardEl) {
  const titleEl = cardEl.querySelector('h3');
  const imgEl   = cardEl.querySelector('img');
  const ps      = Array.from(cardEl.querySelectorAll('p'));

  const getLine = (label) => {
    const p = ps.find(p => p.innerText.trim().toLowerCase().startsWith(label.toLowerCase()));
    if (!p) return '';
    return p.innerText.replace(/^[^:]+:\s*/i, '').trim(); // strip "Label: " part
  };

//Returns details
  return {
    eventName:     (titleEl?.innerText || '').trim() || '(Untitled Event)',
    eventDate:     getLine('Date'),
    eventTime:     getLine('Time'),
    eventLocation: getLine('Location'),
    eventPrice:    getLine('Price').replace(/^\$/, ''),          
    eventImage:    imgEl?.getAttribute('src') || 'placeholder.png'
  };
}

//one listener for all of our buy-buttons
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('eventGrid');
  if (!grid) return;

  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.buy-button');
    if (!btn) return;                          

    //1) Check if logged in
    if (!isLoggedIn()) {                      
      alert('Please log in first.');
      location.href = 'login.html';
      return;
    }

    //Card associated with the ongoing button click
    const card = btn.closest('.event-card');  
    if (!card) return;

    const eventData = extractEventFromCard(card);

    if (!confirm(`Buy ticket for "${eventData.eventName}" on ${eventData.eventDate}?`)) return;


    //2)calling backend to create a real ticket
    const user = getUser() || { userId: 1, firstName: 'Guest', lastName: '' }; // ensures our userId exists
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId,                       
        eventName: eventData.eventName,
        eventDate: eventData.eventDate,
        eventTime: eventData.eventTime,
        eventLocation: eventData.eventLocation,
        eventPrice: eventData.eventPrice,
        eventImage: eventData.eventImage
      })
    });

    if (!res.ok) {
      alert('Purchase failed');
      return;
    }

    const serverTicket = await res.json();  // { ticketId, token, ticketUrl, ... } from server

    // Create ticket object the rest of app needs
    const ticket = {
      ...serverTicket,
      firstName: user.firstName,
      lastName:  user.lastName
    };

    sessionStorage.setItem('lastTicket', JSON.stringify(ticket));          
    document.dispatchEvent(new CustomEvent('ticket:created', { detail: ticket })); 

    // Hand off to ticket page (defined in ticket.js)
    gotoTicket(ticket);
  });
});

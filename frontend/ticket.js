window.gotoTicket = function (data) {
  sessionStorage.setItem('lastTicket', JSON.stringify(data));
  const u = new URL(window.location.origin + '/ticket.html');
  if (data.ticketId) u.searchParams.set('ticketId', data.ticketId);
  window.location.href = u.toString();
};



document.addEventListener('DOMContentLoaded', () => {
  // 1) Load our ticket object that purchase.js stored
  let data = null;
  try { data = JSON.parse(sessionStorage.getItem('lastTicket')); } catch {}
  if (!data) {
    document.body.innerHTML = `
      <main style="max-width:800px;margin:24px auto;padding:16px;">
        <h2>Could not load your ticket.</h2>
        <p>Return to <a href="events.html">Events</a> and try again.</p>
      </main>`;
    return;
  }

  // 2) Filling the UI
  const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();
  document.getElementById('thanks').textContent =
    `Thank you ${fullName} for purchasing a ticket!`;
  document.getElementById('fullName').textContent      = fullName;
  document.getElementById('eventName').textContent     = data.eventName ?? '';
  document.getElementById('eventDate').textContent     = data.eventDate ?? '';
  document.getElementById('eventTime').textContent     = data.eventTime ?? '';
  document.getElementById('eventLocation').textContent = data.eventLocation ?? '';
  document.getElementById('eventPrice').textContent    = data.eventPrice ?? '';
  document.getElementById('ticketId').textContent      = data.ticketId ?? '';
  document.getElementById('eventImage').src            = data.eventImage ?? 'placeholder.png';

  // 3) Generate a unique QR code! (Text will be different per ticket)
  new QRCode(document.getElementById('qrcode'), {
    text: data.ticketUrl,
    width: 256,
    height: 256
  });

  //Link version of QR code
  document.getElementById('verifyLink').textContent = data.ticketUrl;
  document.getElementById('verifyLink').href = data.ticketUrl;
});
function getLoggedUser() {
  try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
  catch { return null; }
}

//build headers with x-user-id so server knows who you are
function adminHeaders() {
  const me = getLoggedUser();
  const h = { 'Content-Type': 'application/json' };
  if (me?.user_id) h['x-user-id'] = String(me.user_id);
  return h;
}

// Render helper
function renderRows(rows) {
  const tbody = document.querySelector('#pending tbody');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6">No pending requests!</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(u => `
    <tr>
      <td>${u.user_id}</td>
      <td>${(u.first_name || '')} ${(u.last_name || '')}</td>
      <td>${u.username || ''}</td>
      <td>${u.email || ''}</td>
      <td>${(u.created_at || '').toString().replace('T',' ').slice(0,16)}</td>
      <td>
        <button onclick="decide(${u.user_id}, 'approve')">Approve</button>
        <button onclick="decide(${u.user_id}, 'reject')">Reject</button>
      </td>
    </tr>
  `).join('');
}

// Fetch and fill the table
async function loadPending() {
  const msg = document.getElementById('msg');
  const tbody = document.querySelector('#pending tbody');
  tbody.innerHTML = '<tr><td colspan="6">Loading…</td></tr>';

  const res = await fetch('/api/admin/organizers/pending', { headers: adminHeaders() });

  if (res.status === 401) { msg.textContent = 'Please log in first.'; tbody.innerHTML = ''; return; }
  if (res.status === 403) { msg.textContent = 'Access denied: admin only.'; tbody.innerHTML = ''; return; }
  if (!res.ok)          { msg.textContent = 'Failed to load pending list.'; tbody.innerHTML = ''; return; }

  const rows = await res.json();
  msg.textContent = '';
  renderRows(rows);
}

// Approve or reject
async function decide(userId, decision) {
  const ok = confirm(`${decision.toUpperCase()} organizer for user ${userId}?`);
  if (!ok) return;

  const res = await fetch(`/api/admin/organizers/${userId}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify({ decision })
  });

  const msg = document.getElementById('msg');
  if (res.status === 401) { msg.textContent = 'Please log in first.'; return; }
  if (res.status === 403) { msg.textContent = 'Access denied: admin only.'; return; }

  if (!res.ok) {
    const data = await res.json().catch(()=>({}));
    msg.textContent = `❌ Failed: ${data.message || data.error || res.status}`;
    return;
  }

  msg.textContent = `✅ ${decision}d user ${userId}`;
  await loadPending();
}

document.addEventListener('DOMContentLoaded', loadPending);

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    firstname: document.getElementById('firstname').value.trim(),
    lastname: document.getElementById('lastname').value.trim(),
    username: document.getElementById('username').value.trim(),
    password: document.getElementById('password').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim()
  };

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const msg = await res.text();
    if (res.ok) {
      alert('✅ ' + msg);
      document.getElementById('registerForm').reset();
    } else {
      alert('❌ ' + msg);
    }
  } catch (err) {
    alert('⚠️ Network error: ' + err.message);
  }
});

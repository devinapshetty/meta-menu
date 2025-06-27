document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('login-name').value.trim();
  const phone = document.getElementById('login-phone').value.trim();

  if (!name || !phone) {
    alert('Please enter both name and phone number');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, phone })
    });
    if (!response.ok) throw new Error('Failed to register/login');
    const data = await response.json();
    // Store customer info in localStorage
    localStorage.setItem('customerId', data.customerId);
    localStorage.setItem('customerName', name);
    localStorage.setItem('customerPhone', phone);
    window.location.href = 'menu.html';
  } catch (err) {
    alert('Login/registration failed. Please try again.');
  }
}); 
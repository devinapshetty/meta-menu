document.addEventListener('DOMContentLoaded', () => {
  let currentCustomer = null;
  let currentOrder = [];

  // DOM Elements
  const customerSection = document.getElementById('customer-section');
  const menuSection = document.getElementById('menu-section');
  const orderSection = document.getElementById('order-section');
  const registerBtn = document.getElementById('register-customer');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Event Listeners
  registerBtn.addEventListener('click', registerCustomer);
  checkoutBtn.addEventListener('click', checkout);

  async function registerCustomer() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();

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
        body: JSON.stringify({
          name: name,
          phone: phone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register customer');
      }

      const data = await response.json();
      currentCustomer = {
        id: data.customerId,
        name: name,
        phone: phone
      };

      // Update UI
      customerSection.style.display = 'none';
      menuSection.style.display = 'block';
      orderSection.style.display = 'block';

      // Load menu and start price updates
      await loadMenu();
      startPriceUpdates();
    } catch (error) {
      console.error('Error registering customer:', error);
      alert('Failed to register customer. Please try again.');
    }
  }

  async function loadMenu() {
    try {
      const response = await fetch('http://localhost:8000/api/menu');
      
      if (!response.ok) {
        throw new Error('Failed to load menu');
      }

      const menuItems = await response.json();
      renderMenu(menuItems);
    } catch (error) {
      console.error('Error loading menu:', error);
      alert('Failed to load menu. Please refresh the page.');
    }
  }

  function renderMenu(menuItems) {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'col-md-4 mb-4 menu-item';
      itemElement.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${item.item_name}</h5>
            <p class="card-text">
              <span class="price" data-item-id="${item.item_id}">$${Number(item.real_time_price).toFixed(2)}</span>
              <small class="text-muted d-block">Base price: $${Number(item.base_price).toFixed(2)}</small>
              <small class="text-muted">Ordered ${item.order_count} times</small>
            </p>
            <button class="btn btn-primary order-btn" data-item-id="${item.item_id}">
              Order Now
            </button>
          </div>
        </div>
      `;
      menuContainer.appendChild(itemElement);
    });

    // Add event listeners to order buttons
    document.querySelectorAll('.order-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const itemId = e.target.getAttribute('data-item-id');
        await placeOrder(itemId);
      });
    });
  }

  async function placeOrder(itemId) {
    try {
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: currentCustomer.id,
          itemId: parseInt(itemId)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const order = await response.json();
      currentOrder.push(order);
      updateOrderSummary();

      // Highlight price change
      const priceElement = document.querySelector(`.price[data-item-id="${itemId}"]`);
      priceElement.classList.add('price-change');
      setTimeout(() => {
        priceElement.classList.remove('price-change');
      }, 1500);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }

  function updateOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';
    
    let total = 0;
    
    currentOrder.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Item #${order.item_id}</td>
        <td>$${Number(order.order_price).toFixed(2)}</td>
      `;
      orderItemsContainer.appendChild(row);
      total += Number(order.order_price);
    });
    
    document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
  }

  function startPriceUpdates() {
    setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/menu');
        
        if (!response.ok) return;
        
        const menuItems = await response.json();
        
        menuItems.forEach(item => {
          const priceElement = document.querySelector(`.price[data-item-id="${item.item_id}"]`);
          if (priceElement) {
            const currentPrice = parseFloat(priceElement.textContent.replace('$', ''));
            if (currentPrice !== item.real_time_price) {
              priceElement.textContent = `$${Number(item.real_time_price).toFixed(2)}`;
              priceElement.classList.add('price-change');
              setTimeout(() => {
                priceElement.classList.remove('price-change');
              }, 1500);
            }
          }
        });
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  async function checkout() {
    try {
      const response = await fetch(`http://localhost:8000/api/bill/${currentCustomer.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to calculate bill');
      }

      const bill = await response.json();
      // Show Bill section instead of alert
      document.getElementById('bill-message').textContent = `Thank you, ${currentCustomer.name}!`;
      document.getElementById('bill-total').textContent = `Your total is: $${Number(bill.total).toFixed(2)}`;
      document.getElementById('bill-section').style.display = 'block';
      customerSection.style.display = 'none';
      menuSection.style.display = 'none';
      orderSection.style.display = 'none';
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to process checkout. Please try again.');
    }
  }

  // New Order button logic
  document.getElementById('new-order-btn').addEventListener('click', () => {
    resetOrder();
    document.getElementById('bill-section').style.display = 'none';
  });

  function resetOrder() {
    currentCustomer = null;
    currentOrder = [];
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    customerSection.style.display = 'block';
    menuSection.style.display = 'none';
    orderSection.style.display = 'none';
    document.getElementById('order-items').innerHTML = '';
    document.getElementById('order-total').textContent = '$0.00';
  }
});
document.addEventListener('DOMContentLoaded', () => {
  // Get customer info from localStorage
  const customerId = localStorage.getItem('customerId');
  const customerName = localStorage.getItem('customerName');
  const customerPhone = localStorage.getItem('customerPhone');

  if (!customerId) {
    window.location.href = 'login.html';
    return;
  }

  let currentCustomer = { id: customerId, name: customerName, phone: customerPhone };
  let currentOrder = [];

  // DOM Elements
  const menuItemsContainer = document.getElementById('menu-items');
  const orderSection = document.getElementById('order-section');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Only run if #menu-items exists
  if (!menuItemsContainer) return;

  // Load menu and start price updates
  loadMenu();
  startPriceUpdates();

  checkoutBtn.addEventListener('click', checkout);
  document.getElementById('new-order-btn').addEventListener('click', () => {
    resetOrder();
    document.getElementById('bill-section').style.display = 'none';
  });

  async function loadMenu() {
    try {
      const response = await fetch('http://localhost:8000/api/menu');
      if (!response.ok) throw new Error('Failed to load menu');
      const menuItems = await response.json();
      renderMenu(menuItems);
    } catch (error) {
      console.error('Error loading menu:', error);
      alert('Failed to load menu. Please refresh the page.');
    }
  }

  function renderMenu(menuItems) {
    menuItemsContainer.innerHTML = '';
    menuItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'menu-item mb-4';
      itemElement.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <div class="menu-header">
              <h5 class="card-title">${item.item_name}</h5>
            </div>
            <div class="menu-price">₹${Number(item.real_time_price).toFixed(2)}</div>
            <div class="menu-base">Base: ₹${Number(item.base_price).toFixed(2)}</div>
            <div class="menu-order-count">Ordered ${item.order_count} times</div>
            <div class="menu-btn-row">
              <button class="btn btn-primary order-btn" data-item-id="${item.item_id}">
                Order Now
              </button>
            </div>
          </div>
        </div>
      `;
      itemElement.querySelector('.order-btn').addEventListener('click', async (e) => {
        await placeOrder(item.item_id, item.item_name);
      });
      menuItemsContainer.appendChild(itemElement);
    });
  }

  async function placeOrder(itemId, itemName) {
    try {
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: currentCustomer.id, itemId: parseInt(itemId) })
      });
      if (!response.ok) throw new Error('Failed to place order');
      const order = await response.json();
      order.item_name = itemName;
      currentOrder.push(order);
      updateOrderSummary();
      // Highlight price change
      const priceElement = document.querySelector(`.price[data-item-id="${itemId}"]`);
      if (priceElement) {
        priceElement.classList.add('price-change');
        setTimeout(() => priceElement.classList.remove('price-change'), 1500);
      }
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
        <td>${order.item_name || 'Item'}</td>
        <td>₹${Number(order.order_price).toFixed(2)}</td>
      `;
      orderItemsContainer.appendChild(row);
      total += Number(order.order_price);
    });
    document.getElementById('order-total').textContent = `₹${total.toFixed(2)}`;
  }

  function startPriceUpdates() {
    setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/menu');
        if (!response.ok) return;
        const menuItems = await response.json();
        menuItems.forEach(item => {
          const priceElement = document.querySelector(`.price[data-item-id=\"${item.item_id}\"]`);
          if (priceElement) {
            const currentPrice = parseFloat(priceElement.textContent.replace('₹', ''));
            if (currentPrice !== item.real_time_price) {
              priceElement.textContent = `₹${Number(item.real_time_price).toFixed(2)}`;
              priceElement.classList.add('price-change');
              setTimeout(() => priceElement.classList.remove('price-change'), 1500);
            }
          }
        });
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, 5000);
  }

  async function checkout() {
    try {
      const response = await fetch(`http://localhost:8000/api/bill/${currentCustomer.id}`);
      if (!response.ok) throw new Error('Failed to calculate bill');
      const bill = await response.json();
      document.getElementById('bill-message').textContent = `Thank you, ${currentCustomer.name}!`;
      document.getElementById('bill-total').textContent = `Your total is: ₹${Number(bill.total).toFixed(2)}`;
      document.getElementById('bill-section').style.display = 'block';
      orderSection.style.display = 'none';
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to process checkout. Please try again.');
    }
  }

  function resetOrder() {
    currentOrder = [];
    document.getElementById('order-items').innerHTML = '';
    document.getElementById('order-total').textContent = '₹0.00';
    orderSection.style.display = 'block';
    loadMenu();
  }
}); 
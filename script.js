// DOM Elements
const orderForm = document.getElementById('order-form');
const modal = document.getElementById('confirmation-modal');
const closeModalBtn = document.querySelector('.close-modal');
const summaryItems = document.getElementById('summary-items');
const orderTotal = document.getElementById('order-total');
const confirmationDetails = document.getElementById('confirmation-details');

// Menu items with prices
const menuItems = {
    pork: { name: 'Homemade Pork Dumplings', price: 0.50 }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initQuantityControls();
    initFormValidation();
    setMinDate();
    updateOrderSummary();
});

// Set minimum date to today
function setMinDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

// Initialize quantity controls
function initQuantityControls() {
    // Plus buttons
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.item;
            const input = document.getElementById(`qty-${itemId}`);
            const currentValue = parseInt(input.value);
            input.value = currentValue + 1;
            updateOrderSummary();
        });
    });

    // Plus 5 buttons
    document.querySelectorAll('.qty-btn.plus-5').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.item;
            const input = document.getElementById(`qty-${itemId}`);
            const currentValue = parseInt(input.value);
            input.value = currentValue + 5;
            updateOrderSummary();
        });
    });

    // Plus 10 buttons
    document.querySelectorAll('.qty-btn.plus-10').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.item;
            const input = document.getElementById(`qty-${itemId}`);
            const currentValue = parseInt(input.value);
            input.value = currentValue + 10;
            updateOrderSummary();
        });
    });

    // Minus buttons
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.item;
            const input = document.getElementById(`qty-${itemId}`);
            const currentValue = parseInt(input.value);
            if (currentValue > 0) {
                input.value = currentValue - 1;
                updateOrderSummary();
            }
        });
    });

    // Direct input changes
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', () => {
            let value = parseInt(input.value);
            if (isNaN(value) || value < 0) value = 0;
            input.value = value;
            updateOrderSummary();
        });
    });
}

// Update order summary
function updateOrderSummary() {
    let total = 0;
    let summaryHTML = '';
    let hasItems = false;

    Object.keys(menuItems).forEach(itemId => {
        const input = document.getElementById(`qty-${itemId}`);
        const quantity = parseInt(input.value);

        if (quantity > 0) {
            hasItems = true;
            const item = menuItems[itemId];
            const itemTotal = quantity * item.price;
            total += itemTotal;

            summaryHTML += `
                <div class="summary-item">
                    <span>${item.name} x ${quantity}</span>
                    <span>$${itemTotal.toFixed(2)}</span>
                </div>
            `;
        }
    });

    if (!hasItems) {
        summaryHTML = '<p style="color: #666; text-align: center;">No items selected</p>';
    }

    summaryItems.innerHTML = summaryHTML;
    orderTotal.textContent = `$${total.toFixed(2)}`;
}

// Form validation
function initFormValidation() {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Check if at least one item is selected
        let hasItems = false;
        Object.keys(menuItems).forEach(itemId => {
            const input = document.getElementById(`qty-${itemId}`);
            if (parseInt(input.value) > 0) {
                hasItems = true;
            }
        });

        if (!hasItems) {
            alert('Please select at least one item to order.');
            return;
        }

        // Validate form
        if (!orderForm.checkValidity()) {
            orderForm.reportValidity();
            return;
        }

        // Process order
        processOrder();
    });
}

// Process the order
function processOrder() {
    // Gather order data
    const formData = new FormData(orderForm);
    const orderData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        orderType: formData.get('order-type'),
        date: formData.get('date'),
        time: formData.get('time'),
        instructions: formData.get('instructions'),
        items: []
    };

    // Gather items
    let total = 0;
    Object.keys(menuItems).forEach(itemId => {
        const quantity = parseInt(formData.get(`qty-${itemId}`));
        if (quantity > 0) {
            const item = menuItems[itemId];
            const itemTotal = quantity * item.price;
            total += itemTotal;
            orderData.items.push({
                name: item.name,
                quantity: quantity,
                price: item.price,
                total: itemTotal
            });
        }
    });

    orderData.total = total;

    // Format date for display
    const dateObj = new Date(orderData.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Format time for display
    const timeHour = parseInt(orderData.time);
    const formattedTime = timeHour >= 12
        ? `${timeHour === 12 ? 12 : timeHour - 12}:00 PM`
        : `${timeHour}:00 AM`;

    // Build confirmation details
    let itemsList = orderData.items.map(item =>
        `${item.name} x ${item.quantity}`
    ).join('<br>');

    confirmationDetails.innerHTML = `
        <p><strong>Order Number:</strong> #${generateOrderNumber()}</p>
        <p><strong>Name:</strong> ${orderData.name}</p>
        <p><strong>Email:</strong> ${orderData.email}</p>
        <p><strong>Phone:</strong> ${orderData.phone}</p>
        <p><strong>${orderData.orderType === 'delivery' ? 'Delivery Address' : 'Pickup'}:</strong> ${orderData.orderType === 'delivery' ? orderData.address : 'In-store pickup'}</p>
        <p><strong>Date & Time:</strong> ${formattedDate} at ${formattedTime}</p>
        <p><strong>Items:</strong><br>${itemsList}</p>
        <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
        ${orderData.instructions ? `<p><strong>Special Instructions:</strong> ${orderData.instructions}</p>` : ''}
    `;

    // Show modal
    showModal();

    // Reset form
    orderForm.reset();
    document.querySelectorAll('.qty-input').forEach(input => {
        input.value = 0;
    });
    updateOrderSummary();

    // Log order (in real app, this would be sent to server)
    console.log('Order submitted:', orderData);
}

// Generate random order number
function generateOrderNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Modal functions
function showModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on button click
closeModalBtn.addEventListener('click', closeModal);

// Close modal on outside click
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

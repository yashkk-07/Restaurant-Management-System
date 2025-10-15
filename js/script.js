document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the order page and then display the cart
    if (document.getElementById('cartItems')) {
        displayCart();
    }
});

// Function to add an item to the cart
function addToCart(itemName, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: itemName, price: price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${itemName} has been added to your cart!`);
}

// Function to display cart items on the order page
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty. Add some delicious items from our menu!</p>';
        cartTotalContainer.innerHTML = '';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = ''; // Clear existing items

    cart.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        `;
        cartItemsContainer.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    cartTotalContainer.textContent = `Total: ₹${total.toFixed(2)}`;
}

// Function to simulate placing an order
function placeOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
    }
    alert('Your order has been placed successfully! Thank you for dining with us.');
    // Here you would typically send data to a server
}

// Function to generate and show a bill
function generateBill() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Cannot generate a bill for an empty cart.');
        return;
    }

    let billContent = '--- The Spice Factory Bill ---\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        billContent += `${item.name} (x${item.quantity}) - ₹${itemTotal.toFixed(2)}\n`;
        total += itemTotal;
    });

    billContent += '\n--------------------------------\n';
    billContent += `Total Amount: ₹${total.toFixed(2)}\n`;
    billContent += '--------------------------------\n\n';
    billContent += 'Thank you for your visit!';

    alert(billContent);
    // Clear cart after billing
    localStorage.removeItem('cart');
    displayCart();
}

// Handle reservation form submission
function handleReservation(event) {
    event.preventDefault(); // Prevent form from submitting the default way
    const name = document.getElementById('fullName').value;
    if (name) {
        alert(`Thank you, ${name}! Your table has been booked. A confirmation will be sent to you shortly.`);
        document.getElementById('reservationForm').reset();
    } else {
        alert('Please fill in your name to make a reservation.');
    }
}

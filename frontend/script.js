// Final, Full-Stack Ready JavaScript
class RestaurantApp {
    constructor() {
        // The address of your running backend server.
        this.apiBaseUrl = 'http://localhost:3000'; 
        this.db = {
            food: [], // Will be populated from the backend API
            categories: ['Starters', 'Lunch', 'Snacks', 'Breads', 'Desserts'],
            user: null, // Will hold the logged-in user session data
            order: [],  // Holds the current cart items
            lastConfirmedOrder: null, // Holds the finalized order for the bill page
        };
        this.init = this.init.bind(this);
    }

    init() {
        // Event listeners for forms and buttons
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.login(e));
        document.getElementById('admin-password-submit')?.addEventListener('click', () => this.verifyAdminPassword());
        document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
        document.getElementById('food-item-form').addEventListener('submit', (e) => this.handleFoodFormSubmit(e));
        
        this.loadUserFromStorage(); // Check if a user session already exists
        this.navigateTo('home');
    }

    // --- User Session Persistence ---
    saveUserToStorage() {
        sessionStorage.setItem('restaurant_user', JSON.stringify(this.db.user));
        sessionStorage.setItem('restaurant_order', JSON.stringify(this.db.order));
        sessionStorage.setItem('restaurant_last_order', JSON.stringify(this.db.lastConfirmedOrder));
    }

    loadUserFromStorage() {
        const user = sessionStorage.getItem('restaurant_user');
        const order = sessionStorage.getItem('restaurant_order');
        const lastOrder = sessionStorage.getItem('restaurant_last_order');
        if (user) this.db.user = JSON.parse(user);
        if (order) this.db.order = JSON.parse(order);
        if (lastOrder) this.db.lastConfirmedOrder = JSON.parse(lastOrder);
    }

    // --- UI State Management (Loading Spinners & Toasts) ---
    setLoading(isLoading, buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<span class="spinner"></span>`;
        } else {
            button.disabled = false;
            if(button.dataset.originalText) button.innerHTML = button.dataset.originalText;
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;
        const colors = { success: 'bg-green-500', error: 'bg-red-500' };
        const toast = document.createElement('div');
        toast.className = `text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in ${colors[type]}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // --- Core Navigation and UI Update ---
    navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(`${pageId}-page`)?.classList.add('active');
        window.scrollTo(0, 0);
        this.updateUI();
    }
    
    updateUI() {
        const cartButton = document.getElementById('cart-button');
        const cartCount = document.getElementById('cart-count');
        
        if (this.db.user) {
            document.getElementById('login-button').classList.add('hidden');
            document.getElementById('user-info').classList.remove('hidden');
            cartButton.classList.remove('hidden');
            document.getElementById('user-table').textContent = `Table: ${this.db.user.table}`;
            cartCount.textContent = this.db.order.reduce((sum, item) => sum + item.quantity, 0);
        } else {
            document.getElementById('login-button').classList.remove('hidden');
            document.getElementById('user-info').classList.add('hidden');
            cartButton.classList.add('hidden');
        }

        const activePage = document.querySelector('.page.active');
        if (activePage?.id === 'menu-page') this.renderMenu();
        if (activePage?.id === 'order-page') this.renderOrder();
        if (activePage?.id === 'admin-page') this.renderAdminPanel();
        if (activePage?.id === 'bill-page') this.renderBill(); // Render the bill page
    }

    // --- Authentication & Order (with API Calls to MongoDB) ---
    async login(event) {
        event.preventDefault();
        this.setLoading(true, 'login-submit-button');
        const userData = {
            name: document.getElementById('name').value,
            mobile: document.getElementById('mobile').value,
            table: document.getElementById('table').value,
        };
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            this.db.user = data;
            this.saveUserToStorage();
            this.navigateTo('menu');
            this.showToast('Login Successful!', 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.setLoading(false, 'login-submit-button');
        }
    }

    logout() {
        this.db.user = null;
        this.db.order = [];
        this.db.lastConfirmedOrder = null; // Clear bill on logout
        sessionStorage.clear();
        this.navigateTo('home');
        this.showToast('Logged out.');
    }
    
    async handleConfirmOrder() {
        if (this.db.order.length === 0) return this.showToast('Your order is empty.', 'error');
        this.setLoading(true, 'confirm-order-button');
        
        const subtotal = this.db.order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAmount = subtotal * 1.05; // 5% tax
        const orderData = {
            userId: this.db.user._id,
            items: this.db.order.map(item => ({ foodId: item._id, name: item.name, quantity: item.quantity, price: item.price })),
            totalAmount: totalAmount,
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            // Store order details for the bill page
            this.db.lastConfirmedOrder = {
                items: [...this.db.order],
                subtotal: subtotal,
                tax: totalAmount - subtotal,
                totalAmount: totalAmount,
                orderId: data.orderId 
            };
            
            this.db.order = []; // Clear the cart
            this.saveUserToStorage();
            this.showToast('Order placed! Please proceed with payment.', 'success');
            this.navigateTo('bill'); // Navigate to the new bill page

        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.setLoading(false, 'confirm-order-button');
        }
    }

    handlePayment(method) {
        this.showToast(`Payment with ${method} successful. Thank you!`, 'success');
        this.db.lastConfirmedOrder = null; // Clear the completed bill
        this.saveUserToStorage();
        this.navigateTo('home');
    }
    
    // --- Menu & Cart Logic ---
    handleAddToOrder(itemId) {
        if (!this.db.user) return this.navigateTo('login');
        const foodItem = this.db.food.find(item => item._id === itemId);
        const orderItem = this.db.order.find(item => item._id === itemId);
        if (orderItem) {
            orderItem.quantity++;
        } else {
            this.db.order.push({ ...foodItem, quantity: 1 });
        }
        this.saveUserToStorage();
        this.updateUI();
        this.showToast(`${foodItem.name} added to order.`, 'success');
    }

    updateOrderItemQuantity(itemId, change) {
        const orderItem = this.db.order.find(item => item._id === itemId);
        if (orderItem) {
            orderItem.quantity += change;
            if (orderItem.quantity <= 0) {
                this.db.order = this.db.order.filter(item => item._id !== itemId);
            }
            this.saveUserToStorage();
            this.renderOrder();
            this.updateUI();
        }
    }
    
    // --- Page Rendering ---
    async renderMenu(filterCategory = 'All') {
        const container = document.getElementById('menu-items-container');
        if (!this.db.user) {
            container.innerHTML = `<div class="text-center py-12"><p class="text-xl mb-4">Please log in to see the menu.</p><button onclick="App.navigateTo('login')" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">Go to Login</button></div>`;
            return;
        }
        container.innerHTML = `<div class="text-center p-10"><span class="spinner" style="border-color: #f97316; border-right-color: transparent; width: 2rem; height: 2rem;"></span></div>`;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/food`);
            if (!response.ok) throw new Error('Could not fetch menu from server.');
            this.db.food = await response.json();
            
            const categoriesHTML = ['All', ...new Set(this.db.food.map(item => item.category))].map(category => {
                const isActive = category === filterCategory ? 'bg-orange-600 text-white' : 'bg-gray-200';
                return `<button onclick="App.renderMenu('${category}')" class="px-4 py-2 rounded-full font-semibold ${isActive} hover:bg-orange-500 hover:text-white transition shadow-sm">${category}</button>`;
            }).join('');

            const filteredFood = filterCategory === 'All' ? this.db.food : this.db.food.filter(item => item.category === filterCategory);
            const menuItemsHTML = filteredFood.map(item => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300">
                    <div class="h-48 bg-cover bg-center" style="background-image: url('https://source.unsplash.com/400x300/?${encodeURIComponent(item.name)}')"></div>
                    <div class="p-4 flex flex-col justify-between" style="min-height: 150px;">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                            <p class="text-gray-600 mb-4">₹${item.price}</p>
                        </div>
                        <button onclick="App.handleAddToOrder('${item._id}')" class="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 mt-auto font-bold transition transform hover:scale-105">Add to Order</button>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = `<div class="flex justify-center flex-wrap gap-3 mb-8">${categoriesHTML}</div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${menuItemsHTML || '<p class="col-span-full text-center">No items in this category.</p>'}</div>`;
        } catch (error) {
            container.innerHTML = `<p class="text-center text-red-500">${error.message}. Is the backend server running?</p>`;
        }
    }

    renderOrder() {
        const orderContent = document.getElementById('order-content');
        if (this.db.order.length === 0) {
            orderContent.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty.</p>'; return;
        }
        const subtotal = this.db.order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05;
        const total = subtotal + tax;
        const itemsHTML = this.db.order.map(item => `
            <div class="flex justify-between items-center border-b pb-4 mb-4">
                <div><span class="font-semibold text-lg">${item.name}</span>
                    <div class="flex items-center gap-3 text-sm mt-1">
                        <button onclick="App.updateOrderItemQuantity('${item._id}', -1)" class="bg-gray-200 rounded-full w-7 h-7 font-bold hover:bg-gray-300">-</button>
                        <span class="w-8 text-center font-semibold">${item.quantity}</span>
                        <button onclick="App.updateOrderItemQuantity('${item._id}', 1)" class="bg-gray-200 rounded-full w-7 h-7 font-bold hover:bg-gray-300">+</button>
                    </div>
                </div>
                <span class="font-semibold text-lg">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>`).join('');
            
        orderContent.innerHTML = `
            <div class="space-y-4">${itemsHTML}</div>
            <div class="mt-8 pt-4 border-t-2 border-dashed">
                <div class="flex justify-between text-lg"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
                <div class="flex justify-between text-gray-500"><span>Tax (5%)</span><span>₹${tax.toFixed(2)}</span></div>
                <div class="flex justify-between font-bold text-2xl mt-2 text-gray-800"><span>Total</span><span>₹${total.toFixed(2)}</span></div>
            </div>
            <button id="confirm-order-button" onclick="App.handleConfirmOrder()" class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-bold mt-8 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">Confirm & Place Order</button>`;
    }

    renderBill() {
        const billContent = document.getElementById('bill-content');
        if (!this.db.lastConfirmedOrder || this.db.lastConfirmedOrder.items.length === 0) {
            billContent.innerHTML = '<p class="text-center text-gray-500 py-8">No bill to display. Please place an order first.</p>';
            return;
        }

        const { items, subtotal, tax, totalAmount } = this.db.lastConfirmedOrder;

        const itemsHTML = items.map(item => `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <div>
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-sm text-gray-500">${item.quantity} x ₹${item.price.toFixed(2)}</p>
                </div>
                <span class="font-semibold">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        billContent.innerHTML = `
            <div class="text-center mb-6">
                <h3 class="text-xl font-bold">The Spice Factory</h3>
                <p class="text-sm text-gray-500">Thank you for your order!</p>
                <p class="text-sm text-gray-500">Table: ${this.db.user.table}</p>
            </div>
            <div class="space-y-2 mb-6">${itemsHTML}</div>
            <div class="mt-6 pt-4 border-t-2 border-dashed">
                <div class="flex justify-between text-lg"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
                <div class="flex justify-between text-gray-500"><span>Tax (5%)</span><span>₹${tax.toFixed(2)}</span></div>
                <div class="flex justify-between font-bold text-2xl mt-2 text-gray-800"><span>TOTAL</span><span>₹${totalAmount.toFixed(2)}</span></div>
            </div>
            <div class="mt-8">
                <h4 class="text-center font-semibold mb-4">Select Payment Method</h4>
                <div class="flex flex-col sm:flex-row gap-4">
                   <button onclick="App.handlePayment('Cash')" class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-bold flex items-center justify-center gap-2 transition"><i class="fas fa-money-bill-wave"></i>Cash</button>
                   <button onclick="App.handlePayment('Card')" class="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 font-bold flex items-center justify-center gap-2 transition"><i class="fas fa-credit-card"></i>Card</button>
                   <button onclick="App.handlePayment('Online')" class="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 font-bold flex items-center justify-center gap-2 transition"><i class="fab fa-google-pay"></i>Online</button>
                </div>
            </div>
        `;
    }
    
    // --- Admin Functions ---
    handleAdminAccess() { this.openModal('admin-password-modal'); }
    verifyAdminPassword() { if (document.getElementById('admin-password').value === 'admin123') { this.closeModal('admin-password-modal'); document.getElementById('admin-password').value=''; this.navigateTo('admin'); } else { this.showToast('Incorrect Password', 'error'); } }
    
    async renderAdminPanel() {
        const container = document.getElementById('admin-content');
        container.innerHTML = `<div class="text-center p-10"><span class="spinner" style="border-color: #4f46e5; border-right-color: transparent; width: 2rem; height: 2rem;"></span></div>`;
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/food`);
            if (!response.ok) throw new Error('Could not fetch data.');
            this.db.food = await response.json();
            const tableRows = this.db.food.map(item => `
                <tr class="hover:bg-gray-50">
                    <td class="py-3 px-4 border-b">${item.id}</td><td class="py-3 px-4 border-b">${item.name}</td><td class="py-3 px-4 border-b">₹${item.price}</td><td class="py-3 px-4 border-b">${item.category}</td>
                    <td class="py-3 px-4 border-b text-center">
                        <button onclick="App.openFoodItemModal('${item._id}')" class="text-blue-500 hover:text-blue-700 mr-4"><i class="fas fa-edit"></i></button>
                        <button onclick="App.handleDeleteFoodItem('${item._id}')" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`).join('');
            container.innerHTML = `<button onclick="App.openFoodItemModal()" class="bg-green-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-green-600 font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">Add New Food Item</button><div class="overflow-x-auto rounded-lg border"><table class="min-w-full bg-white"><thead class="bg-gray-800 text-white"><tr><th class="py-3 px-4 font-semibold text-sm text-left">ID</th><th class="py-3 px-4 font-semibold text-sm text-left">Name</th><th class="py-3 px-4 font-semibold text-sm text-left">Price</th><th class="py-3 px-4 font-semibold text-sm text-left">Category</th><th class="py-3 px-4 font-semibold text-sm text-center">Actions</th></tr></thead><tbody class="text-gray-700">${tableRows}</tbody></table></div>`;
        } catch (error) {
            container.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
        }
    }

    openFoodItemModal(itemId = null) {
        const form = document.getElementById('food-item-form');
        form.reset();
        document.getElementById('food-category').innerHTML = this.db.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        if (itemId) {
            const item = this.db.food.find(i => i._id === itemId);
            document.getElementById('food-modal-title').textContent = 'Edit Food Item';
            document.getElementById('food-id').value = item._id;
            document.getElementById('food-name').value = item.name;
            document.getElementById('food-price').value = item.price;
            document.getElementById('food-category').value = item.category;
        } else {
            document.getElementById('food-modal-title').textContent = 'Add Food Item';
            document.getElementById('food-id').value = '';
        }
        this.openModal('food-item-modal');
    }

    async handleFoodFormSubmit(event) {
        event.preventDefault();
        const foodData = { name: document.getElementById('food-name').value, price: parseFloat(document.getElementById('food-price').value), category: document.getElementById('food-category').value };
        const id = document.getElementById('food-id').value;
        const url = id ? `${this.apiBaseUrl}/api/food/${id}` : `${this.apiBaseUrl}/api/food`;
        const method = id ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(foodData) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            this.showToast(`Item ${id ? 'updated' : 'added'}!`, 'success');
            this.closeModal('food-item-modal');
            this.renderAdminPanel();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    handleDeleteFoodItem(itemId) {
        this.openModal('confirm-modal');
        document.getElementById('confirm-modal-yes').onclick = () => { this.closeModal('confirm-modal'); this.confirmDeleteItem(itemId); };
        document.getElementById('confirm-modal-no').onclick = () => this.closeModal('confirm-modal');
    }

    async confirmDeleteItem(itemId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/food/${itemId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete item.');
            this.showToast('Item deleted!', 'success');
            this.renderAdminPanel();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }
    
    // --- Modal Utilities ---
    openModal(modalId) { document.getElementById(modalId).style.display = 'flex'; }
    closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }
}

const App = new RestaurantApp();
App.init();
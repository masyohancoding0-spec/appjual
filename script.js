document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadingSpinner = document.getElementById('loadingSpinner');
    const productGrid = document.getElementById('productGrid');
    const productModal = document.getElementById('productModal');
    const cartModal = document.getElementById('cartModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalCategory = document.getElementById('modalCategory');
    const modalPrice = document.getElementById('modalPrice');
    const modalDescription = document.getElementById('modalDescription');
    const modalAddToCart = document.getElementById('modalAddToCart');
    const closeModal = document.getElementById('closeModal');
    const closeCartModal = document.getElementById('closeCartModal');
    const cartCount = document.getElementById('cartCount');
    const cartButton = document.getElementById('cartButton');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');
    const customerName = document.getElementById('customerName');
    const customerAddress = document.getElementById('customerAddress');
    const customerPhone = document.getElementById('customerPhone');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    // State
    let products = [];
    let cart = [];
    let currentProduct = null;
    
    // Fetch products from API
    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            products = await response.json();
            displayProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            showError('Gagal memuat produk. Silakan coba lagi nanti.');
        } finally {
            loadingSpinner.classList.add('hidden');
            productGrid.classList.remove('hidden');
        }
    }
    
    // Display products in grid
    function displayProducts() {
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer';
            
            // Convert price to Rupiah
            const priceInRupiah = convertToRupiah(product.price);
            
            productCard.innerHTML = `
                <div class="product-image-container h-48 overflow-hidden">
                    <img src="${product.image}" alt="${product.title}" class="w-full h-full object-contain p-4">
                </div>
                <div class="p-4">
                    <span class="text-xs text-gray-500 uppercase">${product.category}</span>
                    <h3 class="font-semibold text-lg mt-1 mb-2 line-clamp-2">${product.title}</h3>
                    <p class="text-blue-600 font-bold mb-3">${priceInRupiah}</p>
                    <button class="add-to-cart-btn w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200" data-id="${product.id}">
                        <i class="fas fa-cart-plus mr-2"></i> Tambah ke Keranjang
                    </button>
                </div>
            `;
            
            // Add click event to the card (excluding the button)
            productCard.addEventListener('click', function(e) {
                if (!e.target.closest('.add-to-cart-btn')) {
                    showProductDetail(product.id);
                }
            });
            
            productGrid.appendChild(productCard);
        });
        
        // Add event listeners to all "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
            });
        });
    }
    
    // Convert USD to Rupiah
    function convertToRupiah(usdAmount) {
        const exchangeRate = 15000; // $1 = Rp 15.000
        const rupiahAmount = usdAmount * exchangeRate;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(rupiahAmount);
    }
    
    // Show product detail in modal
    function showProductDetail(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        currentProduct = product;
        
        modalTitle.textContent = product.title;
        modalImage.src = product.image;
        modalImage.alt = product.title;
        modalCategory.textContent = product.category;
        modalPrice.textContent = convertToRupiah(product.price);
        modalDescription.textContent = product.description;
        
        productModal.classList.remove('hidden');
        productModal.classList.add('modal-enter');
    }
    
    // Add product to cart
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        updateCartCount();
        showToast(`${product.title} ditambahkan ke keranjang`);
        
        // Add bounce animation to cart icon
        cartButton.classList.add('cart-bounce');
        setTimeout(() => {
            cartButton.classList.remove('cart-bounce');
        }, 300);
    }
    
    // Update cart count
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // Show cart modal
    function showCart() {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Keranjang belanja kosong</p>
                </div>
            `;
            cartTotal.textContent = 'Rp 0';
        } else {
            renderCartItems();
            calculateCartTotal();
        }
        
        cartModal.classList.remove('hidden');
        cartModal.classList.add('modal-enter');
    }
    
    // Render cart items
    function renderCartItems() {
        cartItems.innerHTML = '';
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${convertToRupiah(item.price)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-quantity" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-remove" data-id="${item.id}">
                    <i class="fas fa-trash-alt"></i>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                decreaseQuantity(productId);
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                increaseQuantity(productId);
            });
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
    }
    
    // Calculate cart total
    function calculateCartTotal() {
        const total = cart.reduce((sum, item) => {
            return sum + (item.price * item.quantity * 15000); // Convert to Rupiah
        }, 0);
        
        cartTotal.textContent = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(total);
    }
    
    // Increase item quantity
    function increaseQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            renderCartItems();
            updateCartCount();
            calculateCartTotal();
        }
    }
    
    // Decrease item quantity
    function decreaseQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                removeFromCart(productId);
                return;
            }
            renderCartItems();
            updateCartCount();
            calculateCartTotal();
        }
    }
    
    // Remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        renderCartItems();
        updateCartCount();
        calculateCartTotal();
        
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Keranjang belanja kosong</p>
                </div>
            `;
        }
    }
    
    // Checkout process
    function checkout() {
        const name = customerName.value.trim();
        const address = customerAddress.value.trim();
        const phone = customerPhone.value.trim();
        
        if (!name) {
            showError('Nama lengkap harus diisi');
            return;
        }
        
        if (!address) {
            showError('Alamat pengiriman harus diisi');
            return;
        }
        
        if (!phone) {
            showError('Nomor WhatsApp harus diisi');
            return;
        }
        
        if (cart.length === 0) {
            showError('Keranjang belanja kosong');
            return;
        }
        
        // Format phone number (remove non-digit characters)
        const formattedPhone = phone.replace(/\D/g, '');
        
        // Create order summary
        let orderSummary = `Halo, saya ingin memesan produk berikut:\n\n`;
        orderSummary += `Nama: ${name}\n`;
        orderSummary += `Alamat: ${address}\n\n`;
        orderSummary += `Pesanan:\n`;
        
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity * 15000; // Convert to Rupiah
            total += itemTotal;
            orderSummary += `- ${item.title} (${item.quantity} pcs) = ${convertToRupiah(item.price * item.quantity)}\n`;
        });
        
        orderSummary += `\nTotal: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(total)}\n\n`;
        
        orderSummary += `Terima kasih.`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(orderSummary);
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Reset form and cart
        customerName.value = 'yohan';
        customerAddress.value = 'pulung';
        customerPhone.value = '085707808522';
        cart = [];
        updateCartCount();
        cartModal.classList.add('hidden');
        
        showToast('Pesanan berhasil dikirim via WhatsApp');
    }
    
    // Show toast notification
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.remove('translate-y-20', 'toast-hide');
        toast.classList.add('toast-show');
        
        setTimeout(() => {
            toast.classList.remove('toast-show');
            toast.classList.add('toast-hide');
        }, 3000);
    }
    
    // Show error message
    function showError(message) {
        toastMessage.textContent = message;
        toast.classList.remove('translate-y-20', 'bg-green-500', 'toast-hide');
        toast.classList.add('bg-red-500', 'toast-show');
        
        setTimeout(() => {
            toast.classList.remove('toast-show');
            toast.classList.add('toast-hide');
            toast.classList.remove('bg-red-500');
            toast.classList.add('bg-green-500');
        }, 3000);
    }
    
    // Event Listeners
    closeModal.addEventListener('click', function() {
        productModal.classList.add('hidden');
    });
    
    closeCartModal.addEventListener('click', function() {
        cartModal.classList.add('hidden');
    });
    
    modalAddToCart.addEventListener('click', function() {
        if (currentProduct) {
            addToCart(currentProduct.id);
        }
    });
    
    cartButton.addEventListener('click', function() {
        showCart();
    });
    
    checkoutButton.addEventListener('click', function() {
        checkout();
    });
    
    // Close modals when clicking outside
    productModal.addEventListener('click', function(e) {
        if (e.target === productModal) {
            productModal.classList.add('hidden');
        }
    });
    
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.classList.add('hidden');
        }
    });
    
    // Initialize the app
    fetchProducts();
});
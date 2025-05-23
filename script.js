document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
    });

    // Hero Slideshow (only needed if cart page has hero slides)
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        let currentHeroSlide = 0;
        
        function showHeroSlide(n) {
            heroSlides.forEach(slide => slide.classList.remove('active'));
            heroSlides[n].classList.add('active');
        }
        
        function nextHeroSlide() {
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
            showHeroSlide(currentHeroSlide);
        }
        
        setInterval(nextHeroSlide, 2000);
    }

    // Product Image Navigation (if any products shown in cart)
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const images = card.querySelectorAll('.product-images img');
        const prevBtn = card.querySelector('.prev-image');
        const nextBtn = card.querySelector('.next-image');
        let currentImage = 0;
        
        function showImage(n) {
            images.forEach(img => {
                img.classList.remove('active', 'hidden');
                img.classList.add('hidden');
            });
            images[n].classList.remove('hidden');
            images[n].classList.add('active');
        }
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentImage = (currentImage - 1 + images.length) % images.length;
                showImage(currentImage);
            });
            
            nextBtn.addEventListener('click', () => {
                currentImage = (currentImage + 1) % images.length;
                showImage(currentImage);
            });
        }
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        card.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});
        
        card.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                currentImage = (currentImage + 1) % images.length;
                showImage(currentImage);
            }
            if (touchEndX > touchStartX + 50) {
                currentImage = (currentImage - 1 + images.length) % images.length;
                showImage(currentImage);
            }
        }
    });

    // Cart Functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }
    
    function addToCart(id, name, price) {
        const productCard = document.querySelector(`.product-card [data-id="${id}"]`)?.closest('.product-card');
        const activeImage = productCard?.querySelector('.product-images img.active');
        const imageSrc = activeImage ? activeImage.src : `images/product${id}-1.jpg`;
        
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                quantity: 1,
                image: imageSrc
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${name} added to cart</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            addToCart(id, name, price);
        });
    });

    // Cart Page Specific Functionality
    if (document.querySelector('.cart-items-list')) {
        function renderCartItems() {
            const cartItemsList = document.querySelector('.cart-items-list');
            const subtotalEl = document.querySelector('.subtotal');
            
            if (cart.length === 0) {
                cartItemsList.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-bag"></i>
                        <h3>Your cart is empty</h3>
                        <a href="index.html#shop" class="btn">SHOP NOW</a>
                    </div>
                `;
                subtotalEl.textContent = '₦0';
                return;
            }
            
            cartItemsList.innerHTML = '';
            let subtotal = 0;
            
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p class="cart-item-price">₦${item.price.toLocaleString('en-NG')}</p>
                        <div class="cart-item-quantity">
                            <button class="decrease-quantity" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="increase-quantity" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <span class="remove-item" data-id="${item.id}">Remove</span>
                    </div>
                `;
                
                cartItemsList.appendChild(cartItemEl);
            });
            
            subtotalEl.textContent = `₦${subtotal.toLocaleString('en-NG')}`;
        }
        
        // Checkout Button Functionality
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert('Your cart is empty. Please add items before checkout.');
                return;
            }
            
            let whatsappMessage = "Hello BAMF Luxury!%0A%0AI want to purchase:%0A%0A";
            let total = 0;
            
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                whatsappMessage += `${index + 1}. *${encodeURIComponent(item.name)}*%0A` +
                                  `   - Qty: ${item.quantity}%0A` +
                                  `   - Price: ₦${item.price.toLocaleString('en-NG')}%0A` +
                                  `   - Subtotal: ₦${itemTotal.toLocaleString('en-NG')}%0A%0A`;
            });
            
            whatsappMessage += `*TOTAL: ₦${total.toLocaleString('en-NG')}*%0A%0APlease confirm availability.`;
            
            console.log("WhatsApp URL:", `https://wa.me/2348060702662?text=${whatsappMessage}`);
            window.open(`https://wa.me/2348060702662?text=${whatsappMessage}`, '_blank');
        });
        
        // Quantity controls
        document.querySelector('.cart-items-list').addEventListener('click', function(e) {
            if (e.target.classList.contains('increase-quantity')) {
                const id = e.target.getAttribute('data-id');
                const item = cart.find(item => item.id === id);
                if (item) {
                    item.quantity += 1;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    renderCartItems();
                }
            }
            
            if (e.target.classList.contains('decrease-quantity')) {
                const id = e.target.getAttribute('data-id');
                const item = cart.find(item => item.id === id);
                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    renderCartItems();
                }
            }
            
            if (e.target.classList.contains('remove-item')) {
                const id = e.target.getAttribute('data-id');
                cart = cart.filter(item => item.id !== id);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                renderCartItems();
            }
        });
        
        // Initial render
        renderCartItems();
        updateCartCount();
    }
});

// Notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #2cb67d;
        color: #0f0e17;
        padding: 15px 25px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1001;
    }
    
    .notification.show {
        opacity: 1;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(notificationStyles);
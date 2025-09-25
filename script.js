// Jay Stores Amazon-like E-Commerce JS

// --- State ---
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
let currentCategory = 'all';
let searchQuery = '';
let darkMode = localStorage.getItem('theme') === 'dark';

// --- Product & Banner Data ---

// --- Sample Data ---

// --- Sample Data ---
const products = [
  {id:1,name:"Wireless Headphones",category:"electronics",image:"https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80",price:1999,rating:4.5,desc:"High-quality wireless headphones with noise cancellation and 20h battery life."},
  {id:2,name:"Smart Watch",category:"electronics",image:"https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80",price:2999,rating:4.2,desc:"Track your fitness, heart rate, and notifications with this stylish smart watch."},
  {id:3,name:"Men's Sneakers",category:"fashion",image:"https://images.unsplash.com/photo-1517260911205-8a3bfa7b3c61?auto=format&fit=crop&w=400&q=80",price:1499,rating:4.0,desc:"Comfortable and trendy sneakers for everyday wear."},
  {id:4,name:"Designer Handbag",category:"fashion",image:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",price:2499,rating:4.7,desc:"Elegant handbag with premium finish and spacious compartments."},
  {id:5,name:"LED Table Lamp",category:"home",image:"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",price:799,rating:4.3,desc:"Energy-efficient LED lamp with adjustable brightness and touch controls."},
  {id:6,name:"Ceramic Vase",category:"home",image:"https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",price:599,rating:4.1,desc:"Modern ceramic vase to enhance your home decor."}
];

const banners = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80"
];
const dealOfDay = {
	...products[0],
	dealPrice: 1499,
	dealEnds: Date.now() + 1000 * 60 * 60 * 6 // 6 hours from now
};

// --- State ---
// --- DOM Elements ---
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryDropdown = document.getElementById('categoryDropdown');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartIcon = document.getElementById('cartIcon');
const floatingCart = document.getElementById('floatingCart');
const floatingCartCount = document.getElementById('floatingCartCount');
const wishlistIcon = document.getElementById('wishlistIcon');
const themeToggle = document.getElementById('themeToggle');

// --- Carousel ---
const carousel = document.getElementById('carousel');
const carouselTrack = carousel.querySelector('.carousel-track');
const prevBtn = carousel.querySelector('.carousel-btn.prev');
const nextBtn = carousel.querySelector('.carousel-btn.next');
let carouselIndex = 0;
let carouselTimer;
function renderCarousel() {
	carouselTrack.innerHTML = banners.map((src) =>
		`<div class="carousel-slide" style="background-image:url('${src}')"></div>`
	).join('');
	updateCarousel();
}
function updateCarousel() {
	carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
}
prevBtn.onclick = () => {
	carouselIndex = (carouselIndex - 1 + banners.length) % banners.length;
	updateCarousel();
};
nextBtn.onclick = () => {
	carouselIndex = (carouselIndex + 1) % banners.length;
	updateCarousel();
};
function startCarouselTimer() {
	carouselTimer = setInterval(() => { nextBtn.onclick(); }, 4000);
}
carousel.onmouseenter = () => clearInterval(carouselTimer);
carousel.onmouseleave = () => startCarouselTimer();

// --- Deal of the Day (Sidebar) ---
const dealImage = document.querySelector('.sidebar-deal .deal-image');
const dealTitle = document.getElementById('dealTitle');
const dealPrice = document.getElementById('dealPrice');
const dealTimer = document.getElementById('dealTimer');
const dealAddToCart = document.getElementById('dealAddToCart');
function renderDeal() {
	dealImage.style.backgroundImage = `url('${dealOfDay.image}')`;
	dealTitle.textContent = dealOfDay.name;
	dealPrice.innerHTML = `₹${dealOfDay.dealPrice} <span class='old-price' style='color:#888;text-decoration:line-through;font-size:0.95em;'>₹${dealOfDay.price}</span>`;
}
function updateDealTimer() {
	let left = Math.max(0, dealOfDay.dealEnds - Date.now());
	let h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000), s = Math.floor((left % 60000) / 1000);
	dealTimer.textContent = `${h}h ${m}m ${s}s`;
	if (left <= 0) dealAddToCart.disabled = true;
}
setInterval(updateDealTimer, 1000);
dealAddToCart.onclick = () => addToCart(dealOfDay.id, true);

// --- Product Grid ---
function renderProducts() {
	let filtered = products.filter(p =>
		(currentCategory === 'all' || p.category === currentCategory) &&
		p.name.toLowerCase().includes(searchQuery)
	);
	if (filtered.length === 0) {
		productGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;font-size:1.2em;padding:2em;">No products found.</div>';
		return;
	}
	productGrid.innerHTML = filtered.map(p => `
		<div class="product-card" data-id="${p.id}">
			<div class="product-image" style="background-image:url('${p.image}')"></div>
			<div class="product-title">${p.name}</div>
			<div class="product-rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))} <span style='color:#888;font-size:0.9em'>(${p.rating})</span></div>
			<div class="product-price">₹${p.price}</div>
			<button class="add-to-cart">Add to Cart</button>
			<div class="quick-view" title="Quick View">👁️</div>
		</div>
	`).join('');
}


// --- Cart & Wishlist ---
function addToCart(id, isDeal) {
	let item = cart.find(i => i.id === id);
	if (item) item.qty++;
	else cart.push({ id, qty: 1 });
	localStorage.setItem('cart', JSON.stringify(cart));
	updateCartCount();
	if (isDeal) dealAddToCart.textContent = 'Added!';
	setTimeout(() => { if (isDeal) dealAddToCart.textContent = 'Add to Cart'; }, 1200);
}
function addToWishlist(id) {
	if (!wishlist.includes(id)) wishlist.push(id);
	localStorage.setItem('wishlist', JSON.stringify(wishlist));
	updateWishlistIcon();
}
function updateCartCount() {
	let count = cart.reduce((a, b) => a + b.qty, 0);
	cartCount.textContent = count;
	floatingCartCount.textContent = count;
}
function updateWishlistIcon() {
	wishlistIcon.style.color = wishlist.length ? 'var(--primary)' : 'var(--secondary)';
}
// --- Cart Modal ---
function renderCartModal() {
	let modal = document.createElement('div');
	modal.className = 'modal open';
	let totalAmount = cart.reduce((sum, item) => sum + products.find(p=>p.id===item.id).price*item.qty, 0);
	modal.innerHTML = `<div class='modal-content cart-modal' style='min-width:400px;max-width:95vw;max-height:80vh;overflow-y:auto;'>
		<span class='close-modal'>&times;</span>
		<h2>Your Cart</h2>
		<div class='cart-items' style='margin:1em 0;max-height:300px;overflow-y:auto;'>${cart.length === 0 ? '<div style="color:#888;text-align:center;padding:2em;">Cart is empty.</div>' : cart.map(item => {
			let p = products.find(pr => pr.id === item.id);
			return `<div class='cart-item' style='display:flex;align-items:center;gap:1em;margin-bottom:1em;padding:1em;border:1px solid var(--border);border-radius:8px;'>
				<div style='width:60px;height:60px;background:url(${p.image}) center/cover;border-radius:6px;flex-shrink:0;'></div>
				<div style='flex:1;'>
					<div style='font-weight:bold;margin-bottom:0.3em;'>${p.name}</div>
					<div style='color:#2874f0;font-weight:bold;'>₹${p.price}</div>
				</div>
				<div style='display:flex;align-items:center;gap:0.5em;'>
					<button class='qty-btn' data-id='${p.id}' data-action='decrease' style='background:#f0f0f0;border:1px solid #ddd;width:30px;height:30px;border-radius:4px;cursor:pointer;'>-</button>
					<span style='min-width:30px;text-align:center;font-weight:bold;'>${item.qty}</span>
					<button class='qty-btn' data-id='${p.id}' data-action='increase' style='background:#f0f0f0;border:1px solid #ddd;width:30px;height:30px;border-radius:4px;cursor:pointer;'>+</button>
				</div>
				<button class='cart-remove' data-id='${p.id}' style='background:#ff6b6b;border:none;color:#fff;padding:0.4em 0.8em;border-radius:4px;cursor:pointer;margin-left:0.5em;'>Remove</button>
			</div>`;
		}).join('')}</div>
		${cart.length > 0 ? `
			<div style='border-top:2px solid var(--border);padding-top:1em;margin-top:1em;'>
				<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:1em;'>
					<span style='font-size:1.2em;font-weight:bold;'>Total: ₹${totalAmount}</span>
				</div>
				<div style='display:flex;gap:1em;'>
					<button id='clearCart' style='background:#ff6b6b;color:#fff;border:none;padding:0.7em 1.5em;border-radius:6px;cursor:pointer;flex:1;'>Clear Cart</button>
					<button id='placeOrder' style='background:#28a745;color:#fff;border:none;padding:0.7em 1.5em;border-radius:6px;cursor:pointer;flex:2;font-weight:bold;'>Place Order</button>
				</div>
			</div>
		` : ''}
	</div>`;
	document.body.appendChild(modal);
	modal.querySelector('.close-modal').onclick = () => modal.remove();
	
	// Quantity change buttons
	modal.querySelectorAll('.qty-btn').forEach(btn => btn.onclick = (e) => {
		let id = +btn.dataset.id;
		let action = btn.dataset.action;
		let item = cart.find(i => i.id === id);
		
		if (action === 'increase') {
			item.qty++;
		} else if (action === 'decrease' && item.qty > 1) {
			item.qty--;
		}
		
		localStorage.setItem('cart', JSON.stringify(cart));
		updateCartCount();
		modal.remove();
		renderCartModal();
	});
	
	// Remove item buttons
	modal.querySelectorAll('.cart-remove').forEach(btn => btn.onclick = (e) => {
		let id = +btn.dataset.id;
		cart = cart.filter(i => i.id !== id);
		localStorage.setItem('cart', JSON.stringify(cart));
		updateCartCount();
		modal.remove();
		if (cart.length > 0) renderCartModal();
	});
	
	// Clear cart button
	const clearCartBtn = modal.querySelector('#clearCart');
	if (clearCartBtn) {
		clearCartBtn.onclick = () => {
			cart = [];
			localStorage.setItem('cart', JSON.stringify(cart));
			updateCartCount();
			modal.remove();
			showPopup('Cart cleared!');
		};
	}
	
	// Place order button
	const placeOrderBtn = modal.querySelector('#placeOrder');
	if (placeOrderBtn) {
		placeOrderBtn.onclick = () => {
			let orderSummary = cart.map(item => {
				let p = products.find(pr => pr.id === item.id);
				return `${p.name} x ${item.qty}`;
			}).join(', ');
			
			// Simulate order placement
			cart = [];
			localStorage.setItem('cart', JSON.stringify(cart));
			updateCartCount();
			modal.remove();
			
			// Show order confirmation
			showOrderConfirmation(orderSummary, totalAmount);
		};
	}
	
	modal.onclick = e => { if (e.target === modal) modal.remove(); };
}

// Order confirmation function
function showOrderConfirmation(orderSummary, total) {
	let modal = document.createElement('div');
	modal.className = 'modal open';
	modal.innerHTML = `<div class='modal-content' style='text-align:center;max-width:500px;'>
		<span class='close-modal'>&times;</span>
		<div style='color:#28a745;font-size:3em;margin-bottom:0.5em;'>✓</div>
		<h2 style='color:#28a745;margin-bottom:1em;'>Order Placed Successfully!</h2>
		<div style='background:#f8f9fa;padding:1em;border-radius:8px;margin:1em 0;'>
			<div style='font-weight:bold;margin-bottom:0.5em;'>Order Summary:</div>
			<div style='color:#666;margin-bottom:0.5em;'>${orderSummary}</div>
			<div style='font-weight:bold;color:#2874f0;'>Total: ₹${total}</div>
		</div>
		<div style='color:#666;margin:1em 0;'>Order ID: #${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
		<div style='color:#666;font-size:0.9em;'>You will receive a confirmation email shortly.</div>
		<button onclick='this.closest(".modal").remove()' style='background:#2874f0;color:#fff;border:none;padding:0.7em 2em;border-radius:6px;cursor:pointer;margin-top:1em;'>Continue Shopping</button>
	</div>`;
	document.body.appendChild(modal);
	modal.querySelector('.close-modal').onclick = () => modal.remove();
	modal.onclick = e => { if (e.target === modal) modal.remove(); };
}
cartIcon.onclick = renderCartModal;
floatingCart.onclick = renderCartModal;
wishlistIcon.onclick = () => {
	let names = wishlist.map(id => products.find(p => p.id === id)?.name).filter(Boolean);
	showPopup(names.length ? 'Wishlist: ' + names.join(', ') : 'Wishlist is empty.');
};

// --- Filtering & Search ---
filterBtns.forEach(btn => btn.onclick = () => {
	filterBtns.forEach(b => b.classList.remove('active'));
	btn.classList.add('active');
	currentCategory = btn.dataset.category;
	categoryDropdown.value = currentCategory;
	renderProducts();
});
categoryDropdown.onchange = e => {
	currentCategory = e.target.value;
	filterBtns.forEach(b => b.classList.toggle('active', b.dataset.category === currentCategory));
	renderProducts();
};
searchInput.oninput = e => {
	searchQuery = e.target.value.toLowerCase();
	renderProducts();
};
document.querySelector('.search-bar').onsubmit = e => { e.preventDefault(); };

// --- Product Card Events ---
productGrid.onclick = e => {
	let card = e.target.closest('.product-card');
	if (!card) return;
	let id = +card.dataset.id;
	if (e.target.classList.contains('add-to-cart')) {
		addToCart(id);
		showPopup('Added to cart!');
	} else if (e.target.classList.contains('quick-view')) {
		openModal(products.find(p => p.id === id));
	} else {
		openModal(products.find(p => p.id === id));
	}
};

// --- Popup for Cart/Wishlist ---
function showPopup(msg) {
	let popup = document.createElement('div');
	popup.className = 'popup-msg';
	popup.textContent = msg;
	document.body.appendChild(popup);
	setTimeout(() => { popup.classList.add('show'); }, 10);
	setTimeout(() => { popup.classList.remove('show'); setTimeout(() => popup.remove(), 400); }, 1800);
}

// --- Dark/Light Mode ---
function setTheme(dark) {
	document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
	themeToggle.innerHTML = dark ? '🌙' : '☀️';
	localStorage.setItem('theme', dark ? 'dark' : 'light');
}
themeToggle.onclick = () => {
	darkMode = !darkMode;
	setTheme(darkMode);
};

// --- Init ---
function init() {
	renderCarousel();
	renderDeal();
	renderProducts();
	updateCartCount();
	updateWishlistIcon();
	setTheme(darkMode);
	updateDealTimer();
	startCarouselTimer();
}
document.addEventListener('DOMContentLoaded', init);
// (removed duplicate banners and modal block)

// --- Product Modal ---
const modal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalRating = document.getElementById('modalRating');
const modalPrice = document.getElementById('modalPrice');
const modalDesc = document.getElementById('modalDesc');
const modalAddToCart = document.getElementById('modalAddToCart');
const modalAddToWishlist = document.getElementById('modalAddToWishlist');
let modalProduct = null;
function openModal(product) {
	modalProduct = product;
	modalImage.style.backgroundImage = `url('${product.image}')`;
	modalTitle.textContent = product.name;
	modalRating.innerHTML = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5-Math.round(product.rating)) + ` <span style='color:#888;font-size:0.9em'>(${product.rating})</span>`;
	modalPrice.textContent = `₹${product.price}`;
	modalDesc.textContent = product.desc;
	modal.classList.add('open');
}
closeModal.onclick = () => modal.classList.remove('open');
modalAddToCart.onclick = () => addToCart(modalProduct.id);
modalAddToWishlist.onclick = () => addToWishlist(modalProduct.id);
window.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };

// --- Cart & Wishlist ---
function addToCart(id, isDeal) {
	let item = cart.find(i => i.id === id);
	if (item) item.qty++;
	else cart.push({ id, qty: 1 });
	localStorage.setItem('cart', JSON.stringify(cart));
	updateCartCount();
	if (isDeal) dealAddToCart.textContent = 'Added!';
	setTimeout(() => { if (isDeal) dealAddToCart.textContent = 'Add to Cart'; }, 1200);
}
function addToWishlist(id) {
	if (!wishlist.includes(id)) wishlist.push(id);
	localStorage.setItem('wishlist', JSON.stringify(wishlist));
	updateWishlistIcon();
}
function updateCartCount() {
	let count = cart.reduce((a, b) => a + b.qty, 0);
	cartCount.textContent = count;
	floatingCartCount.textContent = count;
}
function updateWishlistIcon() {
	wishlistIcon.style.color = wishlist.length ? 'var(--primary)' : 'var(--secondary)';
}
cartIcon.onclick = () => alert('Cart: ' + JSON.stringify(cart));
floatingCart.onclick = () => cartIcon.onclick();
wishlistIcon.onclick = () => alert('Wishlist: ' + wishlist.map(id => products.find(p => p.id === id)?.name).join(', '));

// --- Filtering & Search ---
filterBtns.forEach(btn => btn.onclick = () => {
	filterBtns.forEach(b => b.classList.remove('active'));
	btn.classList.add('active');
	currentCategory = btn.dataset.category;
	categoryDropdown.value = currentCategory;
	renderProducts();
});
categoryDropdown.onchange = e => {
	currentCategory = e.target.value;
	filterBtns.forEach(b => b.classList.toggle('active', b.dataset.category === currentCategory));
	renderProducts();
};
searchInput.oninput = e => {
	searchQuery = e.target.value.toLowerCase();
	renderProducts();
};
document.querySelector('.search-bar').onsubmit = e => { e.preventDefault(); };

// --- Product Card Events ---
productGrid.onclick = e => {
	let card = e.target.closest('.product-card');
	if (!card) return;
	let id = +card.dataset.id;
	if (e.target.classList.contains('add-to-cart')) {
		addToCart(id);
		showPopup('Added to cart!');
	} else if (e.target.classList.contains('quick-view')) {
		openModal(products.find(p => p.id === id));
	} else {
		openModal(products.find(p => p.id === id));
	}
};

// --- Popup for Cart/Wishlist ---
function showPopup(msg) {
	let popup = document.createElement('div');
	popup.className = 'popup-msg';
	popup.textContent = msg;
	document.body.appendChild(popup);
	setTimeout(() => { popup.classList.add('show'); }, 10);
	setTimeout(() => { popup.classList.remove('show'); setTimeout(() => popup.remove(), 400); }, 1800);
}

// --- Dark/Light Mode ---
function setTheme(dark) {
	document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
	themeToggle.innerHTML = dark ? '🌙' : '☀️';
	localStorage.setItem('theme', dark ? 'dark' : 'light');
}
themeToggle.onclick = () => {
	darkMode = !darkMode;
	setTheme(darkMode);
};

// --- Init ---
function init() {
	renderCarousel();
	renderDeal();
	renderProducts();
	updateCartCount();
	updateWishlistIcon();
	setTheme(darkMode);
	updateDealTimer();
	startCarouselTimer();
}
init();
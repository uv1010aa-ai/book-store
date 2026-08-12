let books = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

const booksContainer = document.getElementById("books");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const totalPrice = document.getElementById("total-price");
const searchInput = document.getElementById("search");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutBtn = document.getElementById("checkout-btn");
const toast = document.getElementById("toast");

function imageUrl(path) {
    const value = String(path || "").trim();
    if (/^https?:\/\//i.test(value)) return value;
    return encodeURI(value.replace(/^\.\//, ""));
}
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    }[c]));
}
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}
function renderBooks(list) {
    booksContainer.innerHTML = "";
    if (!list.length) {
        booksContainer.innerHTML = `<div class="no-results"><div class="empty-icon">🔎</div><h3>لم نجد كتبًا مطابقة</h3><p>جرّب اسمًا آخر أو ابحث باسم المؤلف أو التصنيف.</p></div>`;
        return;
    }
    list.forEach(book => {
        const card = document.createElement("article");
        card.className = "book-card";
        card.innerHTML = `
            <span class="used-badge">مستعمل</span>
            <a class="book-link" href="book.html?id=${book.id}">
                <img src="${imageUrl(book.image)}" alt="غلاف ${escapeHtml(book.title)}" loading="lazy">
                <div class="book-info">
                    <h3>${escapeHtml(book.title)}</h3>
                    <p>✍ ${escapeHtml(book.author)}</p>
                    <p>📂 ${escapeHtml(book.category)}</p>
                    <p class="price">${book.price} ريال</p>
                    <p class="availability">${book.available ? "🟢 متوفر" : "🔴 غير متوفر"}</p>
                </div>
            </a>
            <button class="add-btn" type="button" ${book.available ? "" : "disabled"}>${book.available ? "🛒 أضف إلى السلة" : "غير متوفر"}</button>`;
        card.querySelector(".add-btn").onclick = () => {
            addToCart(book);
            showToast(`تمت إضافة «${book.title}» إلى السلة`);
        };
        booksContainer.appendChild(card);
    });
}
function addToCart(book) {
    const existing = cart.find(item => item.id === book.id);
    if (existing) existing.quantity++;
    else cart.push({...book, quantity:1});
    saveCart();
}
function updateCart() {
    if (!cartItems) return;
    cartItems.innerHTML = "";
    let total = 0, count = 0;
    cart.forEach(book => {
        book.quantity = Math.max(1, Number(book.quantity) || 1);
        const subtotal = book.price * book.quantity;
        total += subtotal; count += book.quantity;
        const li = document.createElement("li");
        li.innerHTML = `
        <div class="cart-item">
            <img src="${imageUrl(book.image)}" alt="${escapeHtml(book.title)}" class="cart-image">
            <div class="cart-info">
                <h4>${escapeHtml(book.title)}</h4>
                <p>${book.price} ريال × ${book.quantity}</p>
                <strong>${subtotal} ريال</strong>
                <div class="cart-buttons">
                    <button class="minus" type="button">−</button><span>${book.quantity}</span>
                    <button class="plus" type="button">+</button>
                </div>
                <button class="delete" type="button">🗑 حذف</button>
            </div>
        </div>`;
        li.querySelector(".plus").onclick = () => {book.quantity++; saveCart();};
        li.querySelector(".minus").onclick = () => {
            book.quantity--;
            if (book.quantity <= 0) cart = cart.filter(x => x.id !== book.id);
            saveCart();
        };
        li.querySelector(".delete").onclick = () => {
            cart = cart.filter(x => x.id !== book.id); saveCart(); showToast("تم حذف الكتاب");
        };
        cartItems.appendChild(li);
    });
    if (!cart.length) cartItems.innerHTML = `<li class="cart-empty">🛍️ السلة فارغة<br><small>أضف كتابًا للبدء.</small></li>`;
    cartCount.textContent = count;
    totalPrice.textContent = total;
    localStorage.setItem("totalPrice", total);
    localStorage.setItem("totalItems", count);
}
clearCartBtn?.addEventListener("click", () => {
    if (cart.length && confirm("هل تريد إفراغ السلة بالكامل؟")) {cart=[]; saveCart(); showToast("تم إفراغ السلة");}
});
checkoutBtn?.addEventListener("click", () => {
    if (!cart.length) return showToast("السلة فارغة، أضف كتابًا أولًا");
    location.href = "checkout.html";
});
searchInput?.addEventListener("input", () => {
    const q = searchInput.value.trim().toLocaleLowerCase("ar");
    renderBooks(books.filter(b => `${b.title} ${b.author} ${b.category}`.toLocaleLowerCase("ar").includes(q)));
});
fetch("books.json").then(r => r.json()).then(data => {
    books = data.map(b => ({...b, category: String(b.category || "").trim()}));

    const category = new URLSearchParams(window.location.search).get("category");
    if (category) {
        const selectedCategory = category.trim();
        searchInput.value = selectedCategory;
        renderBooks(books.filter(b => b.category === selectedCategory));
    } else {
        renderBooks(books);
    }

    updateCart();
}).catch(() => {
    booksContainer.innerHTML = `<div class="no-results"><h3>تعذر تحميل الكتب</h3><p>تأكد من وجود books.json.</p></div>`;
});
const id = Number(new URLSearchParams(location.search).get("id"));
const details = document.getElementById("book-details");
const related = document.getElementById("related-container");
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
const imageUrl = p => {
    const v = String(p || "").trim();
    return /^https?:\/\//i.test(v) ? v : encodeURI(v.replace(/^\.\//, ""));
};
const esc = v => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
fetch("books.json").then(r=>r.json()).then(books=>{
 const b=books.find(x=>x.id===id);
 if(!b){details.innerHTML=`<div class="no-results"><h2>الكتاب غير موجود</h2><a class="back-home" href="index.html">العودة للمتجر</a></div>`;return;}
 document.title=`${b.title} - متجر الكتب المستعملة`;
 details.innerHTML=`<div class="book-details"><img class="book-detail-image" src="${imageUrl(b.image)}" alt="غلاف ${esc(b.title)}"><div class="book-content"><span class="used-badge static-badge">كتاب مستعمل</span><h1>${esc(b.title)}</h1><p><strong>✍ المؤلف:</strong> ${esc(b.author)}</p><p><strong>📚 التصنيف:</strong> ${esc(b.category)}</p><p class="detail-description"><strong>📖 الوصف:</strong> ${esc(b.description)}</p><div class="detail-price">${b.price} ريال</div><p class="availability">${b.available?"🟢 الكتاب متوفر":"🔴 غير متوفر"}</p><button id="add-detail" class="detail-add" ${b.available?"":"disabled"}>🛒 أضف إلى السلة</button></div></div>`;
 document.getElementById("add-detail").onclick=()=>{const x=cart.find(i=>i.id===b.id);x?x.quantity++:cart.push({...b,quantity:1});localStorage.setItem("cart",JSON.stringify(cart));toast("تمت إضافة الكتاب إلى السلة");};
 const same=books.filter(x=>x.id!==b.id&&x.category===b.category).slice(0,4);
 related.innerHTML=same.map(x=>`<a class="related-card" href="book.html?id=${x.id}"><img src="${imageUrl(x.image)}" alt="${esc(x.title)}"><strong>${esc(x.title)}</strong><span>${x.price} ريال</span></a>`).join("");
}).catch(()=>details.innerHTML=`<div class="no-results"><h2>تعذر تحميل البيانات</h2></div>`);

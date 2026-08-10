const products = [
  {id:'ruby',name:'Ruby Red',desc:'Sweet • rich • juicy',price:4.50,unit:'500g',color:'red',filter:'sweet',pos:'80% 45%',emoji:'🫑'},
  {id:'sun',name:'Sun Gold',desc:'Mellow • sunny • crisp',price:4.80,unit:'500g',color:'yellow',filter:'sweet',pos:'62% 78%',emoji:'🫑'},
  {id:'garden',name:'Garden Green',desc:'Fresh • bright • crunchy',price:3.90,unit:'500g',color:'green',filter:'crisp',pos:'59% 30%',emoji:'🫑'},
  {id:'rainbow',name:'Rainbow Box',desc:'A colourful mixed harvest',price:12.50,unit:'1.5kg',color:'mix',filter:'box',pos:'76% 60%',emoji:'📦'}
];
let cart = JSON.parse(localStorage.getItem('farmex-cart') || '{}');
let lastOrder = null;
const $ = s => document.querySelector(s);
const money = n => `$${n.toFixed(2)}`;

function renderProducts(filter='all'){
  $('#productGrid').innerHTML = products.filter(p=>filter==='all'||p.filter===filter).map((p,i)=>`<article class="product-card reveal visible" data-color="${p.color}">
    <div class="product-visual" style="--pos:${p.pos}"><span class="badge">${p.unit} • Farm fresh</span></div>
    <div class="product-info"><div class="product-title"><div><h3>${p.name}</h3><p>${p.desc}</p></div><strong>${money(p.price)}</strong></div></div>
    <button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to basket">+</button></article>`).join('');
}
function saveCart(){localStorage.setItem('farmex-cart',JSON.stringify(cart));renderCart()}
function renderCart(){
  const entries=Object.entries(cart).filter(([,q])=>q>0); const count=entries.reduce((s,[,q])=>s+q,0);
  $('#cartCount').textContent=count;
  $('#cartItems').innerHTML=entries.length?entries.map(([id,q])=>{const p=products.find(x=>x.id===id);return `<div class="cart-item"><div class="cart-thumb">${p.emoji}</div><div><h4>${p.name}</h4><div class="qty"><button data-change="${id}" data-delta="-1">−</button><span>${q}</span><button data-change="${id}" data-delta="1">+</button></div></div><div class="cart-price"><strong>${money(p.price*q)}</strong><button class="remove" data-remove="${id}">Remove</button></div></div>`}).join(''):`<div class="empty-cart"><span style="font-size:45px">🧺</span><b>Your basket is empty</b><span>Choose something fresh from this week’s harvest.</span></div>`;
  const total=entries.reduce((s,[id,q])=>s+products.find(p=>p.id===id).price*q,0);$('#cartTotal').textContent=money(total);$('#checkoutButton').disabled=!entries.length;$('#cartFooter').style.opacity=entries.length?'1':'.45';
}
function openCart(){closeCheckout();$('#cartDrawer').classList.add('open');$('#overlay').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false');document.body.classList.add('locked')}
function closeCart(){ $('#cartDrawer').classList.remove('open'); if(!$('#checkoutModal').classList.contains('open')){$('#overlay').classList.remove('open');document.body.classList.remove('locked')} }
function closeCheckout(){ $('#checkoutModal').classList.remove('open');if(!$('#cartDrawer').classList.contains('open')){$('#overlay').classList.remove('open');document.body.classList.remove('locked')} }
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
renderProducts();renderCart();

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add){const id=add.dataset.add;cart[id]=(cart[id]||0)+1;saveCart();toast(`${products.find(p=>p.id===id).name} added to your basket`)}
  const change=e.target.closest('[data-change]');if(change){cart[change.dataset.change]+=Number(change.dataset.delta);if(cart[change.dataset.change]<=0)delete cart[change.dataset.change];saveCart()}
  const remove=e.target.closest('[data-remove]');if(remove){delete cart[remove.dataset.remove];saveCart()}
});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.filter)}));
$('#cartButton').onclick=openCart;$('#closeCart').onclick=closeCart;$('#overlay').onclick=()=>{closeCart();closeCheckout()};$('#closeCheckout').onclick=closeCheckout;
$('#checkoutButton').onclick=()=>{if(!Object.keys(cart).length)return;closeCart();$('#checkoutFormWrap').style.display='block';$('#orderSuccess').classList.remove('show');$('#checkoutModal').classList.add('open');$('#overlay').classList.add('open');document.body.classList.add('locked')};
$('#checkoutForm').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const items=Object.entries(cart).map(([id,q])=>({...products.find(p=>p.id===id),q}));const total=items.reduce((s,p)=>s+p.price*p.q,0);lastOrder={number:`PP-${Date.now().toString().slice(-7)}`,date:new Date().toLocaleString(),...data,items,total};$('#checkoutFormWrap').style.display='none';$('#orderSuccess').classList.add('show');$('#successMessage').textContent=`Thank you, ${data.name}. Order ${lastOrder.number} has been saved. We’ll contact you on ${data.phone} to confirm delivery.`;cart={};saveCart();e.target.reset()});
$('#downloadReceipt').onclick=()=>{if(!lastOrder)return;const text=[`FARMEX — ORDER RECEIPT`,`Order: ${lastOrder.number}`,`Date: ${lastOrder.date}`,'',`Customer: ${lastOrder.name}`,`Phone: ${lastOrder.phone}`,`Email: ${lastOrder.email}`,`Deliver to: ${lastOrder.address}`,'','ITEMS',...lastOrder.items.map(p=>`${p.name} (${p.unit}) x ${p.q} — ${money(p.price*p.q)}`),'',`TOTAL: ${money(lastOrder.total)}`,`Payment and delivery will be confirmed by phone.`].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));a.download=`farmex-${lastOrder.number}.txt`;a.click();URL.revokeObjectURL(a.href)};
$('#doneButton').onclick=closeCheckout;
$('.menu-toggle').onclick=()=>{const nav=$('.site-header nav');nav.classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',nav.classList.contains('open'))};
document.querySelectorAll('.site-header nav a').forEach(a=>a.onclick=()=>$('.site-header nav').classList.remove('open'));
const observer=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');observer.unobserve(x.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeCheckout()}});

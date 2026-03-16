/**
 * MicroCommerce — E-Commerce REST API
 */
const express = require('express');
const crypto  = require('crypto');
const app = express();
app.use(express.json());

const products = new Map();
const carts = new Map();
const orders = new Map();

[
  { id:'p1', name:'Wireless Headphones', price:89.99, stock:45, category:'electronics', sku:'WH-001' },
  { id:'p2', name:'Mechanical Keyboard', price:129.99, stock:23, category:'electronics', sku:'MK-002' },
  { id:'p3', name:'USB-C Hub 7-port', price:49.99, stock:0, category:'accessories', sku:'HUB-003' },
].forEach(p => products.set(p.id, {...p, createdAt: new Date()}));

function calcTax(sub, rate=0.08) { return Math.round(sub*rate*100)/100; }

app.get('/api/products', (req,res) => {
  const {search, category, inStock, page=1, limit=20} = req.query;
  let items = [...products.values()];
  if (search) items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (category) items = items.filter(p => p.category===category);
  if (inStock==='true') items = items.filter(p => p.stock>0);
  const start = (page-1)*limit;
  res.json({items: items.slice(start, start+limit), total: items.length, page: +page});
});

app.get('/api/products/:id', (req,res) => {
  const p = products.get(req.params.id);
  if (!p) return res.status(404).json({error:'Not found'});
  res.json(p);
});

app.post('/api/products', (req,res) => {
  const {name, price, stock=0, category, sku} = req.body;
  if (!name||!price) return res.status(400).json({error:'name and price required'});
  const id = crypto.randomUUID();
  const p = {id,name,price:+price,stock:+stock,category,sku,createdAt:new Date()};
  products.set(id,p); res.status(201).json(p);
});

app.get('/api/cart/:sid', (req,res) => {
  const cart = carts.get(req.params.sid)||{items:[]};
  const sub = cart.items.reduce((s,i)=>s+i.price*i.qty,0);
  res.json({...cart, subtotal:Math.round(sub*100)/100, tax:calcTax(sub), total:Math.round((sub+calcTax(sub))*100)/100});
});

app.post('/api/cart/:sid/items', (req,res) => {
  const {productId, qty=1} = req.body;
  const p = products.get(productId);
  if (!p) return res.status(404).json({error:'Product not found'});
  if (p.stock < qty) return res.status(400).json({error:'Insufficient stock'});
  const cart = carts.get(req.params.sid)||{items:[]};
  const ex = cart.items.find(i=>i.productId===productId);
  if (ex) ex.qty+=+qty; else cart.items.push({productId,name:p.name,price:p.price,qty:+qty});
  carts.set(req.params.sid,cart); res.json(cart);
});

app.post('/api/orders', (req,res) => {
  const {sessionId, shippingAddress, email} = req.body;
  const cart = carts.get(sessionId);
  if (!cart||!cart.items.length) return res.status(400).json({error:'Cart is empty'});
  for (const item of cart.items) {
    const p = products.get(item.productId);
    if (!p||p.stock<item.qty) return res.status(400).json({error:`Insufficient stock: ${item.name}`});
  }
  cart.items.forEach(i => { products.get(i.productId).stock -= i.qty; });
  const sub = cart.items.reduce((s,i)=>s+i.price*i.qty,0);
  const tax = calcTax(sub);
  const orderId = 'ORD-'+crypto.randomUUID().slice(0,8).toUpperCase();
  const order = {id:orderId, email, items:cart.items, shippingAddress,
    subtotal:Math.round(sub*100)/100, tax, total:Math.round((sub+tax)*100)/100,
    status:'pending', paymentStatus:'unpaid', createdAt:new Date()};
  orders.set(orderId, order);
  carts.delete(sessionId);
  res.status(201).json(order);
});

app.get('/api/admin/analytics', (_,res) => {
  const all = [...orders.values()];
  res.json({total_orders:all.length, products:products.size,
    low_stock:[...products.values()].filter(p=>p.stock<5).map(p=>({id:p.id,name:p.name,stock:p.stock}))});
});

app.get('/health', (_,res) => res.json({status:'ok'}));
const PORT = process.env.PORT||3000;
app.listen(PORT, () => console.log(`MicroCommerce :${PORT}`));
module.exports = app;

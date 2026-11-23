// Demo Shop's page: lists the products, adds them to the cart through the API and shows the total at checkout.
const list = document.getElementById('products')
const count = document.querySelector('[data-testid="cart-count"]')
const checkout = document.getElementById('checkout')
const total = document.querySelector('[data-testid="order-total"]')
let products = []
let last = { count: 0, total: 0 }
// Each page has its own cart.
const cartId = Math.random().toString(36).slice(2)

function render(filter) {
  list.innerHTML = ''
  for (const product of products.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()))) {
    const row = document.createElement('li')
    row.dataset.testid = 'product-card'
    row.innerHTML = `<span class="name"></span> <span class="price">€${product.price}</span> <button type="button" data-testid="add-to-cart">Add to cart</button>`
    row.querySelector('.name').textContent = product.name
    row.querySelector('button').addEventListener('click', () => add(product.id))
    list.appendChild(row)
  }
}

async function add(productId) {
  const response = await fetch('/api/cart', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cartId, productId }) })
  last = await response.json()
  count.textContent = String(last.count)
  checkout.disabled = last.count === 0
}

checkout.addEventListener('click', () => {
  total.hidden = false
  total.textContent = `Total: €${last.total}`
})

document.getElementById('search').addEventListener('input', (event) => render(event.target.value))

fetch('/api/products').then((response) => response.json()).then((items) => { products = items; render('') })

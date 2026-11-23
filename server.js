// Demo Shop: the application under test of HelvetiQA's Change Radar scenario. No dependencies: Node's http module
// and a router of a few lines. PORT sets the port (4310 by default). /version says which commit runs.
const http = require('http')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const PRODUCTS = [
  { id: 1, name: 'Coffee mug', price: 12 },
  { id: 2, name: 'Tea towel', price: 8 },
  { id: 3, name: 'Notebook', price: 5 }
]
const carts = new Map()

function commit() {
  try { return execSync('git rev-parse HEAD', { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return '' }
}
const VERSION = { version: require('./package.json').version, sha: commit() }

function router() {
  const routes = []
  const add = (method) => (route, handler) => routes.push({ method, route, handler })
  return {
    get: add('GET'),
    post: add('POST'),
    handle(request, response) {
      const url = new URL(request.url, 'http://localhost')
      const found = routes.find((entry) => entry.method === request.method && entry.route === url.pathname)
      if (found) return found.handler(request, response)
      const file = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname)
      if (!file.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(file)) {
        response.writeHead(404).end('Not found')
        return
      }
      const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html'
      response.writeHead(200, { 'content-type': `${type}; charset=utf-8` }).end(fs.readFileSync(file))
    }
  }
}

const json = (response, status, body) => response.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body))
const readBody = (request) => new Promise((resolve) => {
  let text = ''
  request.on('data', (chunk) => { text += chunk })
  request.on('end', () => { try { resolve(JSON.parse(text || '{}')) } catch { resolve({}) } })
})

const app = router()

app.get('/version', (_request, response) => json(response, 200, VERSION))

app.get('/api/products', (_request, response) => json(response, 200, PRODUCTS))

app.post('/api/cart', async (request, response) => {
  const { cartId = 'default', productId } = await readBody(request)
  const product = PRODUCTS.find((item) => item.id === productId)
  if (!product) return json(response, 400, { error: 'Unknown product' })
  const items = carts.get(cartId) ?? []
  items.push(product)
  carts.set(cartId, items)
  json(response, 200, { count: items.length, total: items.reduce((sum, item) => sum + item.price, 0) })
})

const port = Number(process.env.PORT) || 4310
http.createServer((request, response) => app.handle(request, response)).listen(port, '127.0.0.1', () => {
  console.log(`Demo Shop ${VERSION.version} (${VERSION.sha.slice(0, 7) || 'no commit'}) on http://127.0.0.1:${port}`)
})

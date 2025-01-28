const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 8080;

//Middleware
app.use(express.json());

//Archivos JSON
const productsFile = './data/products.json';
const cartsFile = './data/carts.json';

//Leer archivos JSON
const readJSON = (file) => {
    try {
        if (!fs.existsSync(file)) return [];
        const data = fs.readFileSync(file, 'utf-8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error al leer ${file}:`, error);
        return [];
    }
};

//Escribir archivos JSON
const writeJSON = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error al escribir ${file}:`, error);
    }
};

//Probar para encontrar por ID
const findElement = (array, id) => array.find(e => e.id == id);


//RUTAS DE PRODUCTOS


//Obtener todos los productos
app.get('/api/products', (req, res) => res.json(readJSON(productsFile)));

//Obtener un producto por ID
app.get('/api/products/:pid', (req, res) => {
    const product = findElement(readJSON(productsFile), req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

//Agregar un nuevo producto
app.post('/api/products', (req, res) => {
    try {
        const products = readJSON(productsFile);
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || status === undefined || !stock || !category) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const newProduct = {
            id: products.length ? products[products.length - 1].id + 1 : 1,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails: thumbnails || []
        };

        products.push(newProduct);
        writeJSON(productsFile, products);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Eliminar un producto por ID
app.delete('/api/products/:pid', (req, res) => {
    let products = readJSON(productsFile);
    if (!products.some(p => p.id == req.params.pid)) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    products = products.filter(p => p.id != req.params.pid);
    writeJSON(productsFile, products);
    res.json({ message: `Producto con ID ${req.params.pid} eliminado correctamente` });
});


//RUTAS DE CARRITOS

//Obtener todos los carritos
app.get('/api/carts', (req, res) => res.json(readJSON(cartsFile)));

//Obtener un carrito por ID
app.get('/api/carts/:cid', (req, res) => {
    const cart = findElement(readJSON(cartsFile), req.params.cid);
    cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
});

//Crear carrito
app.post('/api/carts', (req, res) => {
    const carts = readJSON(cartsFile);
    const newCart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
    carts.push(newCart);
    writeJSON(cartsFile, carts);
    res.status(201).json(newCart);
});

//Agregar un producto a un carrito
app.post('/api/carts/:cid/product/:pid', (req, res) => {
    const carts = readJSON(cartsFile);
    const products = readJSON(productsFile);

    const cart = findElement(carts, req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const product = findElement(products, req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const productIndex = cart.products.findIndex(p => p.product == req.params.pid);
    productIndex !== -1 ? cart.products[productIndex].quantity += 1 : cart.products.push({ product: req.params.pid, quantity: 1 });

    writeJSON(cartsFile, carts);
    res.json(cart);
});

//Eliminar un producto de un carrito
app.delete('/api/carts/:cid/product/:pid', (req, res) => {
    const carts = readJSON(cartsFile);
    const cart = findElement(carts, req.params.cid);

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const productIndex = cart.products.findIndex(p => p.product == req.params.pid);
    if (productIndex === -1) return res.status(404).json({ error: 'Producto no encontrado en el carrito' });

    cart.products.splice(productIndex, 1);
    writeJSON(cartsFile, carts);
    res.json({ message: `Producto con ID ${req.params.pid} eliminado del carrito ${req.params.cid}` });
});

//Eliminar un carrito por ID
app.delete('/api/carts/:cid', (req, res) => {
    try {
        let carts = readJSON(cartsFile);
        if (!carts.some(c => c.id == req.params.cid)) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        carts = carts.filter(c => c.id != req.params.cid);
        writeJSON(cartsFile, carts);
        res.json({ message: `Carrito con ID ${req.params.cid} eliminado correctamente` });
    } catch (error) {
        console.error('Error al eliminar el carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Mi servidor
app.listen(PORT, () => console.log(`Servidor alojado en http://localhost:${PORT}`));

//BODY RAW POSTMAN
//{
//    "title": "NOTEBOOK GAMER",
//    "description": "ULTIMATE GAMER",
//    "code": "SKU123",
//    "price": 1800,
//    "status": true,
//    "stock": 10,
//    "category": "PC",
//    "thumbnails": ["img1.jpg", "img2.jpg"]
//}
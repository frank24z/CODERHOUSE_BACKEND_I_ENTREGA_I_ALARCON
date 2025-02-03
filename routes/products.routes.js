const express = require('express');
const fs = require('fs');

const router = express.Router();
const productsFile = './data/products.json';

//Leer JSON
const readJSON = () => {
    try {
        return JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
    } catch (error) {
        return [];
    }
};

//Escribir JSON
const writeJSON = (data) => {
    fs.writeFileSync(productsFile, JSON.stringify(data, null, 2));
};

//Obtener todos los productos
router.get('/', (req, res) => {
    res.json(readJSON());
});

//Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const product = readJSON().find(p => p.id == req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

//Agregar un nuevo producto
router.post('/', (req, res) => {
    const products = readJSON();
    const newProduct = { id: products.length ? products[products.length - 1].id + 1 : 1, ...req.body };
    
    products.push(newProduct);
    writeJSON(products);

    res.status(201).json(newProduct);
});

//Actualizar un producto
router.put('/:pid', (req, res) => {
    let products = readJSON();
    const index = products.findIndex(p => p.id == req.params.pid);

    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    products[index] = { ...products[index], ...req.body };
    writeJSON(products);

    res.json(products[index]);
});

//Eliminar un producto
router.delete('/:pid', (req, res) => {
    let products = readJSON();
    products = products.filter(p => p.id != req.params.pid);
    writeJSON(products);

    res.json({ message: `Producto con ID ${req.params.pid} eliminado correctamente` });
});

module.exports = router;

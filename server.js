const express = require('express');

const app = express();
const PORT = 8080;

//Middleware 
app.use(express.json());

//Mi rutas
const productsRoutes = require('./routes/products.routes');
const cartsRoutes = require('./routes/carts.routes');

app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

//Servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

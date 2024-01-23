const mongoose = require('mongoose');
const productoSchema = require('./productoSchema'); // Importar el esquema de productos

const categoriaSchema = new mongoose.Schema({
    categoria: String,
    productos: [productoSchema]
});

const Categoria = mongoose.model('Categoria', categoriaSchema);

module.exports = Categoria;
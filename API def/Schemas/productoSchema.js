const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    categoria: String, 
    enlace: String
}, { versionKey: false });

module.exports = productoSchema;
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    contraseña: String,
    tipo: String

}, { versionKey: false });

module.exports = usuarioSchema;
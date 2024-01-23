const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const productoSchema = require('./Schemas/productoSchema');
const usuarioSchema = require('./Schemas/usuarioSchema');

const app = express();
const port = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.json());

const LoveNoodModel = mongoose.model('LoveNoodModel', productoSchema, 'Productos');
const UsuarioModel = mongoose.model('UsuarioModel',usuarioSchema,'Usuario');

async function iniciarServidor() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/LoveNood', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Conexión exitosa a la base de datos');

        const categorias = await LoveNoodModel.distinct('categoria');
        crearRutas(categorias);

        app.get('/productos/propiedades', async (req, res) => {
            try {
                const propiedadesUnicas = await obtenerPropiedadesUnicas();
                const propiedades = propiedadesUnicas[0].properties;
                res.send(propiedades);
            } catch (error) {
                res.status(500).json({ error: 'Error al obtener las propiedades únicas' });
            }
        });

        app.get('/usuario/propiedades', async (req, res) => {
            try {
                const propiedadesUnicasUsuarios = await obtenerPropiedadesUnicasUsuario();
                const propiedades = propiedadesUnicasUsuarios[0].properties;
                res.send(propiedades);
            } catch (error) {
                res.status(500).json({ error: 'Error al obtener las propiedades únicas' });
            }
        });

        app.get('/usuarios', async (req, res) => {
            try {
                const usuarios = await UsuarioModel.find();
                res.status(200).json(usuarios);
            } catch (error) {
                res.status(500).json({ error: 'Error al obtener usuarios' });
            }
        });

        app.post('/productos', async (req, res) => {
            try {
                const nuevoProducto = req.body;
                console.log('Datos del producto recibidos:', nuevoProducto);
        
                if (!nuevoProducto.categoria) {
                    return res.status(400).json({ error: 'La categoría del producto es obligatoria' });
                }
        
                const productoAgregado = await LoveNoodModel.create(nuevoProducto);
                res.status(200).json(productoAgregado);
            } catch (error) {
                console.error('Error al agregar el producto:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        });

        app.post('/usuario', async (req, res) => {
            try {
                const nuevoUsuario = req.body;
                console.log('Datos del Usuario recibidos:', nuevoUsuario);
        
                if (!nuevoUsuario.nombre) {
                    return res.status(400).json({ error: 'El nombre del Usuario es obligatorio' });
                }
        
                const usuarioAgregado = await UsuarioModel.create(nuevoUsuario);
                res.status(200).json(usuarioAgregado);
            } catch (error) {
                console.error('Error al agregar el usuario:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        });
        

        app.listen(port, () => {
            console.log('Servidor escuchando en el puerto ${port}');
        });
        } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        throw err;
        }
        }

async function obtenerPropiedadesUnicas() {
    const propiedadesUnicas = await LoveNoodModel.aggregate([
        { $project: { properties: { $objectToArray: "$$ROOT" } } },
        { $unwind: "$properties" },
        { $group: { _id: null, properties: { $addToSet: "$properties.k" } } }
    ]);
    return propiedadesUnicas;
}

async function obtenerPropiedadesUnicasUsuario() {
    const propiedadesUnicas = await UsuarioModel.aggregate([
        { $project: { properties: { $objectToArray: "$$ROOT" } } },
        { $unwind: "$properties" },
        { $group: { _id: null, properties: { $addToSet: "$properties.k" } } }
    ]);
    return propiedadesUnicas;
}

function crearRutas(categorias) {
    app.get('/Categorias', (req, res) => {
        res.send(categorias);
    });

    console.log('Categorías disponibles:', categorias);

    categorias.forEach(categoria => {
        const ruta = `/productos/${categoria}`;
        app.get(ruta, async (req, res) => {
            try {
                const data = await LoveNoodModel.find({ categoria });
                const jsonData = JSON.stringify(data, null, 2);
                res.type('json').send(jsonData);

            } catch (error) {
                res.status(500).json({ error: 'Error al obtener productos' });
            }
        });

        console.log('Ruta creada para la categoría "${categoria}": ${ruta}');
    });
}

iniciarServidor();
const { validationResult } = require('express-validator');
const despacho = require('../models/despacho');

// Obtener todos los despachos
const getDespachos = async (req, res) => {
    try {
        const despachos = await despacho.find()
            .populate('id_lote')
            .populate('id_linea')
            .populate('id_empresa');
        res.json(despachos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un despacho por ID
const getDespachoById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const despacho = await Despacho.findById(req.params.id)
            .populate('id_lote')
            .populate('id_linea')
            .populate('id_empresa');
        if (!despacho) return res.status(404).json({ message: 'Despacho no encontrado' });
        res.json(despacho);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo despacho
const createDespacho = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const nuevoDespacho = new Despacho(req.body);
    try {
        const despachoGuardado = await nuevoDespacho.save();
        res.status(201).json(despachoGuardado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar un despacho existente
const updateDespacho = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const despachoActualizado = await Despacho.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!despachoActualizado) return res.status(404).json({ message: 'Despacho no encontrado' });
        res.json(despachoActualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un despacho
const deleteDespacho = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const despachoEliminado = await Despacho.findByIdAndDelete(req.params.id);
        if (!despachoEliminado) return res.status(404).json({ message: 'Despacho no encontrado' });
        res.json({ message: 'Despacho eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDespachos,
    getDespachoById,
    createDespacho,
    updateDespacho,
    deleteDespacho
};

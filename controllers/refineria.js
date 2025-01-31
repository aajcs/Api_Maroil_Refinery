const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const Refineria = require('../models/refineria');
const { generarJWT } = require('../helpers');



const refineriaGet = async(req = request, res = response) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, refineria ] = await Promise.all([
        Refineria.countDocuments(query),
        Refineria.find(query)
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.json({
        ubicacion,
        nombre,
        nit
    });
}

const refineriaPost = async(req, res = response) => {
    
    const { ubicacion, nombre, nit, } = req.body;
    const refineria = new Refineria ({ nombre, ubicacion, nit });

    /* Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt ); */

    // Guardar en BD
    await refineria.save();

    /*Generar el JWT
    const token = await generarJWT( refineria.id );

    res.json({
        usuario,
        token
    });*/
}

const refineriaPut = async(req, res = response) => {

    const { id } = req.params;
    const { _id, password, google, correo, ...resto } = req.body;

    if ( password ) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync( password, salt );
    }

    const usuario = await Usuario.findByIdAndUpdate( id, resto );

    res.json(usuario);
}

const refineriaPatch = (req, res = response) => {
    res.json({
        msg: 'patch API - usuariosPatch'
    });
}

const refineriaDelete = async(req, res = response) => {

    const { id } = req.params;
    const refineria = await Refineria.findByIdAndUpdate( id, { estado: false } );

    
    res.json(refineria);
}




module.exports = {
    refineriaGet,
    refineriaPost,
    refineriaPut,
    refineriaPatch,
    refineriaDelete,
}
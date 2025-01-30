
const { Schema, model } = require('mongoose');

const ContactosSchema = Schema({
    id_empresa: {
        type: Schema.Types.ObjectId,
        ref: 'Refineria',
        required: true
        },
    nombre: {
        type: String,
        required: [true, 'El Nombre es obligatorio']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true
    },
    direccion: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
    },
    telefono: {
        type: String,
        required: [true, 'El telefono es obligatorio'],
    },
    tipo: {
        type: Boolean,
        required: [true, 'Seleccione que tipo de contacto es'],
    },
    
});



ContactosSchema.methods.toJSON = function() {
    const { _id, ...contactos  } = this.toObject();
    contactos.id = _id;
    return contactos;
}

module.exports = model( 'Contactos', ContactosSchema );

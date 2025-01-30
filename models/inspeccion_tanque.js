const { Schema, model } = require('mongoose');

const Inspeccion_tanqueSchema = Schema({
   
    fecha: {
        type: Date,
        required: [true, 'Fecha de inspección obligatoria']
    },
    hora: {
        type: Date,
        required: [true, 'Hora de inspección obligatoria']
    },
    id_tanque: {
            type: Schema.Types.ObjectId,
            ref: 'Tanque',
            required: true
    },
    almacenamiento: {
        type: Number,
        required: [true, 'Almacenamiento obligatorio'],
    },
    presion: {
        type: Number,
        required: [true, 'Presión del tanque obligatorio'],
    },
    temperatura: {
        type: Number,
        required: [true, 'Temperatura del tanque obligatoria'],
    },
    densidad: {
        type: Number,
        required: [true, 'Densidad del material almacenado al momento de inspección es obligatorio'],
    },
    caudal: {
        type: Number,
        required: [true, 'Caudal del material almacenado al momento de inspección es obligatorio'],
    },
    impurezas: {
        type: Number,
        required: [true, 'Porcentaje de impurezas al momento de inspección es obligatorio'],
    },
       
},
{
    timestamps: true,
    versionKey: false
  }
);



inspeccion_tanqueSchema.methods.toJSON = function() {
    const {_id, ...tanque  } = this.toObject();
    tanque.id = _id;
    return inspeccion_tanque;
}

module.exports = model( 'Inspeccion_tanque', inspeccion_tanqueSchema );

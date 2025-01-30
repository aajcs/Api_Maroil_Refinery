const { Schema, model } = require('mongoose');

const Lotes_productoSchema = Schema({
   
    id_empresa: {
        type: Schema.Types.ObjectId,
        ref: 'Refineria',
        required: true
        },
    producto: {
        type: String, /*deberia ser una lista pre cargada de productos*/
        required: [true, 'Descripción del producto obligatoria']
        },   
    fecha: {
        type: Date,
        required: [true, 'Fecha de lote obligatoria']
    },
    gravedad: {
        type:  Number,
        required: [true, '% Api requerido']
    },
    azufre: {
            type: Number,
            required: [true, '% de Azufre requerido']
    },
    viscocidad: {
        type: Number,
        required: [true, '% de de Viscocidad requerido']
},
    origen: {
        type: String,
        required: [true, 'Origen del lote obligatorio'],
    },
    temperatura: {
        type: Number,
        required: [true, 'Temperatura del lote obligatorio'],
    },
    presion: {
        type: String,
        required: [true, 'Presión del lote obligatorio'],
    },
    valor: {
        type: Number,
        required: [true, 'Valor del lote en $ es necesario.'],
    },
    
       
},

{
    timestamps: true,
    versionKey: false
  }

);



inspeccion_tanqueSchema.methods.toJSON = function() {
    const { _id, ...lotes_producto  } = this.toObject();
    lotes_producto.id = _id;
    return lotes_producto;
}

module.exports = model( 'Lotes_producto', inspeccion_tanqueSchema );

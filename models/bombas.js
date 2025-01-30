const { Schema, model } = require('mongoose');

const BombaSchema = Schema({
   
    id_empresa: {
        type: Schema.Types.ObjectId,
        ref: 'Refineria',
        required: true
        },

    ubicacion: {
        type: String,
        required: [true, 'Ubicación física de la bomba es necesaria']
    },
    status: {
        type: Boolean,
        required: [true, 'Estatus de bomba obligatorio']
    },
    apertura: {
        type: Number,
        required: [true, '% de apertura necesario']
    },
    rpm: {
        type: Number,
        required: [true, 'RPM es obligatorio']
    },
    caudal: {
        type: Number,
        required: [true, 'Caudal de bomba es obligatorio']
    },
        
  },
  {
    timestamps: true,
    versionKey: false
  });


BombaSchema.methods.toJSON = function() {
    const { _id, ...bomba } = this.toObject();
    bomba.id = _id;
    return bomba;
}

module.exports = model( 'Bomba', contactosSchema );

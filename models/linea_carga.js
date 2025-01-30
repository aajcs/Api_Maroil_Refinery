const { Schema, model } = require('mongoose');

const Linea_cargaSchema = Schema({
       ubicacion: {
        type: Date,
        required: [true, 'Fecha de recepción obligatoria']
    },
        
  },
  {
    timestamps: true,
    versionKey: false
  }
);


 linea_cargaSchema.methods.toJSON = function() {
    const { _id, ...linea_carga } = this.toObject();
    linea_carga.id = _id;
    return linea_carga;
}

module.exports = model( 'Linea_carga', contactosSchema );

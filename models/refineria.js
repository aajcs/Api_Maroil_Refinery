const { Schema, model } = require('mongoose');

const RefineriaSchema = Schema({
   
    ubicacion: {
        type: String,
        required: [true, 'Ubicación física de la refineria es necesaria']
    },
    
    nit: {
        type: String,
        required: [true, 'NIT es necesario']
                     
    }    
  },
  {
    timestamps: true,
    versionKey: false
  });


RefineriaSchema.methods.toJSON = function() {
    const { _id, ...refineria } = this.toObject();
    refineria.id = _id;
    return refineria;
}

module.exports = model( 'Refineria', contactosSchema );

const { Schema, model } = require('mongoose');

const RefineriaSchema = Schema({
   
    ubicacion: {
        type: String,
        required: [true, 'Ubicación física de la refineria es necesaria']
    },
    
    nombre: {
      type: String,
      required: [true, 'NIT es necesario']
                   
  },    

    nit: {
        type: String,
        required: [true, 'NIT es necesario']  
        }    

        
  },
  {
    timestamps: true,
     });


RefineriaSchema.methods.toJSON = function() {
    const { __v,_id, ...refineria } = this.toObject();
    refineria.id = _id;
    return refineria;
}

module.exports = model( 'Refineria', RefineriaSchema );

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true },
    vin: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    mileage: { type: String, required: true },
    year: { type: String, required: true },
    price: { type: String, required: true },
    zipCode: { type: String, required: true },
    createDate: { type: String, required: true },
    updateDate: { type: String, required: true },
  },
);

module.exports = mongoose.model('Vehicle', vehicleSchema);

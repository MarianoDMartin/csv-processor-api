const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const ProviderConfigModel = require('../Models/providerConfigModel');
const VehicleModel = require('../Models/vehicleModel');

const validateRow = (row) => row.UUID && row.VIN && row.Make && row.Model && row.Mileage && row.Year && row.Price && row['Zip Code'] && row['Create Date'] && row['Update Date'];

const createVehicle = (row) => ({
  uuid: row.UUID,
  vin: row.VIN,
  make: row.Make,
  model: row.Model,
  mileage: row.Mileage,
  year: row.Year,
  price: row.Price,
  zipCode: row['Zip Code'],
  createDate: row['Create Date'],
  updateDate: row['Update Date'],
});

const processVehiclesCsv = async (req, res) => {
  if (req.file === undefined || req.body.provider === undefined) {
    return res.status(400).send({ message: 'Please send a file and provider' });
  }

  const providerConfig = await ProviderConfigModel.findOne({ providerName: req.body.provider });
  if (!providerConfig) {
    return res.status(400).send({ message: 'The provider name does not exist, please check the request' });
  }
  const headers = providerConfig.configuration.split(';');
  const vehicles = [];
  const invalidRows = [];
  let err;

  const end = new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(req.file.path))
      .pipe(csv.parse({ headers, delimiter: ';', ignoreEmpty: true }))
      .validate((row) => validateRow(row))
      .on('error', (error) => {
        err = error;
        reject(error);
      })
      .on('data', (row) => {
        vehicles.push(createVehicle(row));
      })
      .on('data-invalid', (row, rowNumber) => {
        invalidRows.push({
          rowNumber,
          row,
        });
      })
      .on('end', () => {
        resolve();
      });
  });

  await end.catch((error) => {
    err = error;
  });

  if (err) {
    return res.status(409).send({
      message: `Error parsing the file: ${req.file.originalname}`,
      error: err.message,
    });
  }

  if (invalidRows.length > 0) {
    return res.status(409).send({
      message: 'There are invalid rows in the input file',
      invalidRows,
    });
  }

  await VehicleModel.insertMany(vehicles);
  return res.status(200).send({
    message: `Uploaded the file successfully: ${req.file.originalname}`,
    vehiclesUploaded: vehicles,
  });
};

module.exports = {
  processVehiclesCsv,
};

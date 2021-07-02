const processorControllers = require('../Controllers/processor.controllers');
const uploadMiddleware = require('../Middlewares/upload.middleware');

module.exports = (app) => {
  app.post('/processvehiclescsv', uploadMiddleware.single('file'), processorControllers.processVehiclesCsv);
};

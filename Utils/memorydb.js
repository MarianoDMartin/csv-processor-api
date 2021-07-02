const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const ProviderConfigModel = require('../Models/providerConfigModel');

const initMongoDb = async () => {
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();

  if (uri) {
    process.env.DB_URI = uri;
    // eslint-disable-next-line no-console
    console.log('MongoDB in memory database initialized: ', process.env.DB_URI);
    mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const providerConfig = new ProviderConfigModel({
      providerName: 'ProviderA',
      configuration: 'UUID;VIN;Make;Model;Mileage;Year;Price;Zip Code;Create Date;Update Date',
    });
    providerConfig.save();
  }
};

module.exports = { initMongoDb };

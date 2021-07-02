const mongoose = require('mongoose');

const providerConfigurationSchema = new mongoose.Schema(
  {
    providerName: { type: String, required: true },
    configuration: { type: String, required: true },
  },
);

module.exports = mongoose.model('ProviderConfiguration', providerConfigurationSchema);

const { processVehiclesCsv } = require('./processor.controllers');
const ProviderConfigModel = require('../Models/providerConfigModel');
const VehicleModel = require('../Models/vehicleModel');

describe('processVehiclesCsv should', () => {
  const req = {
    body: {},
  };
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  const res = mockResponse();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('return a 200 status code and save vehicles in the database', async () => {
    const providerConfiguration = {
      providerName: 'ProviderA',
      configuration: 'UUID;VIN;Make;Model;Mileage;Year;Price;Zip Code;Create Date;Update Date',
    };
    req.file = {
      path: './Controllers/testFiles/correct.csv',
      originalname: 'input',
    };
    req.body.provider = 'ProviderA';
    jest.spyOn(ProviderConfigModel, 'findOne').mockImplementationOnce(() => Promise.resolve(providerConfiguration));
    jest.spyOn(VehicleModel, 'insertMany').mockImplementationOnce(() => Promise.resolve());
    await processVehiclesCsv(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const { message, vehiclesUploaded } = res.send.mock.calls[0][0];
    expect(message).toBe('Uploaded the file successfully: input');
    expect(vehiclesUploaded.length).toBe(2);
  });

  it('return a 400 status code without sending the provider', async () => {
    req.file = '/file';
    delete req.body.provider;
    await processVehiclesCsv(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Please send a file and provider' });
  });

  it('return a 400 status code without sending the file', async () => {
    delete req.file;
    req.body.provider = 'provider';
    await processVehiclesCsv(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Please send a file and provider' });
  });

  it('return a 400 status code if the provider does not exist', async () => {
    jest.spyOn(ProviderConfigModel, 'findOne').mockImplementationOnce(() => Promise.resolve());
    req.file = '/file';
    req.body.provider = 'non-existing-provider';
    await processVehiclesCsv(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'The provider name does not exist, please check the request' });
  });

  it('return a 409 status code if the input file has an error', async () => {
    const providerConfiguration = {
      providerName: 'ProviderB',
      configuration: 'UUID;Another Column;Make;Model;Mileage;Year;Price;Zip Code;Create Date;Update Date',
    };
    req.file = {
      path: './Controllers/testFiles/malformed.csv',
      originalname: 'input',
    };
    req.body.provider = 'ProviderA';
    jest.spyOn(ProviderConfigModel, 'findOne').mockImplementationOnce(() => Promise.resolve(providerConfiguration));
    jest.spyOn(VehicleModel, 'insertMany').mockImplementationOnce(() => Promise.resolve());
    await processVehiclesCsv(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    const { message, error } = res.send.mock.calls[0][0];
    expect(message).toBe('Error parsing the file: input');
    expect(error).toBe('Unexpected Error: column header mismatch expected: 10 columns got: 11');
  });

  it('return a 409 status code if there are missing data (VIN missing)', async () => {
    const providerConfiguration = {
      providerName: 'ProviderB',
      configuration: 'UUID;Another Column;Make;Model;Mileage;Year;Price;Zip Code;Create Date;Update Date',
    };
    req.file = {
      path: './Controllers/testFiles/correct.csv',
      originalname: 'input',
    };
    req.body.provider = 'ProviderA';
    jest.spyOn(ProviderConfigModel, 'findOne').mockImplementationOnce(() => Promise.resolve(providerConfiguration));
    jest.spyOn(VehicleModel, 'insertMany').mockImplementationOnce(() => Promise.resolve());
    await processVehiclesCsv(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    const { message, invalidRows } = res.send.mock.calls[0][0];
    expect(message).toBe('There are invalid rows in the input file');
    expect(invalidRows.length).toBe(2);
  });
});

const express = require('express');
const setProcessorRoutes = require('./Routes/processor.routes');
const { initMongoDb } = require('./Utils/memorydb');

initMongoDb();

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

setProcessorRoutes(app);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening port 3000');
});

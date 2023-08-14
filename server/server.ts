import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';

const app = express();

const port = 3000;

const clientApp = path.join(__dirname, '../build');

const privateKeyPath = path.join(__dirname, '../server.key');
const certificatePath = path.join(__dirname, '../server.crt');

app.use(express.static(clientApp));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientApp, 'index.html'));
});

const serverOptions = {
  key: fs.readFileSync(privateKeyPath),
  cert: fs.readFileSync(certificatePath),
};

https.createServer(serverOptions, app).listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
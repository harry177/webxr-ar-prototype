import express from 'express';
import path from 'path';

const app = express();

const port = 3000;

const clientApp = path.join(__dirname, '../build');

app.use(express.static(clientApp));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientApp, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
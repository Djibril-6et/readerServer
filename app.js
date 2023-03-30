const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 7001;

app.use('/pdf-files', express.static('pdf-files'));

app.get('/pdfs', (req, res) => {
  const pdfDirectory = './pdf-files';

  fs.readdir(pdfDirectory, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la lecture du dossier');
      return;
    }

    const pdfFiles = files.filter(file => path.extname(file) === '.pdf');
    const pdfUrls = pdfFiles.map(file => `http://${req.headers.host}/pdf-files/${file}`);

    res.json(pdfUrls);
  });
});

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
}); 
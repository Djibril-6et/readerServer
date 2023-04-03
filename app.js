const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 7001;

app.use('/pdf-files', express.static('pdf-files'));

app.get('/scans/:subfolder?/:file?', (req, res) => {
  const pdfDirectory = './pdf-files';

  const subfolder = req.params.subfolder || '';
  const file = req.params.file || '';

  if (!subfolder) {
    fs.readdir(pdfDirectory, (err, files) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la lecture du dossier');
        return;
      }

      const subfolders = files.filter(file => fs.lstatSync(path.join(pdfDirectory, file)).isDirectory());
      res.json(subfolders);
    });
  } else {
    const folderPath = path.join(pdfDirectory, subfolder);

    if (!fs.existsSync(folderPath)) {
      res.status(404).send('Le dossier spécifié n\'existe pas');
      return;
    }

    if (!file) {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error(err);
          res.status(500).send('Erreur lors de la lecture du dossier');
          return;
        }

        const pdfFiles = files.filter(file => path.extname(file) === '.pdf' || path.extname(file) === '.jpeg');
        const pdfUrls = pdfFiles.map(file => `http://${req.headers.host}/scans/${subfolder}/${file}`);

        res.json(pdfUrls);
      });
    } else {
      const filePath = path.join(folderPath, file);

      if (!fs.existsSync(filePath)) {
        res.status(404).send('Le fichier spécifié n\'existe pas');
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      if (extension !== '.pdf' && extension !== '.jpeg') {
        res.status(400).send('Le fichier doit être un PDF ou un JPEG');
        return;
      }

      res.sendFile(path.resolve(filePath));
    }
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});

const express = require("express");
const app = express();
const admin = require("firebase-admin");
const fs = require("fs");
const readline = require("readline");
const csvparser = require("csv-parser");
const Joi = require("joi");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const schema = Joi.object({
  country: Joi.string().required(),
  departement: Joi.string().required(),
  name: Joi.string().required(),
  adress: Joi.string().required(),
  tel: Joi.string().required(),
  title: Joi.string().required(),
  realAdress: Joi.string().required(),
  email: Joi.string().email().required(),
});

const db = admin.firestore().collection("no-SQL");
const object = {};

// Middleware pour le parsing du corps des requêtes
app.use(express.json());

// Importer les données du fichier CSV
app.post("/import", (req, res) => {
  const cheminFichierCSV = req.body.cheminFichierCSV;
  dataImport(cheminFichierCSV)
    .then((result) => res.send(result))
    .catch((error) => res.status(500).send({ error: error.message }));
});

// Créer un nouvel object
app.post("/object", (req, res) => {
  const data = req.body;

  const { error } = schema.validate(data);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  createData(data)
    .then((result) => res.send(result))
    .catch((error) => res.status(500).send({ error: error.message }));
});

// Lire les données
app.get("/object", (req, res) => {
  readData()
    .then((result) => res.send(result))
    .catch((error) => res.status(500).send({ error: error.message }));
});

// Récupérer un document spécifique
app.get("/object/:id", (req, res) => {
  const id = req.params.id;

  db.doc(id)
    .get()
    .then((doc) => {
      if (doc.exists) {
        res.status(200).json(doc.data());
      } else {
        res.status(404).json({ message: "Document non trouvé." });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération du document." });
    });
});

app.get("/object/max-occurrences/:param", (req, res) => {
  const param = req.params.param;
  readDataMaxOccu(param)
    .then((result) => res.send(result))
    .catch((error) => res.status(500).send({ error: error.message }));
});

// Mettre à jour une donnée
app.put("/object/:id", (req, res) => {
  const id = req.params.id;
  const champsMaj = req.body;
  updateData(id, champsMaj)
    .then((result) => res.send(result))
    .catch((error) => res.status(500).send({ error: error.message }));
});

// Supprimer une donnée
app.delete("/object/:id", (req, res) => {
  const id = req.params.id;
  deleteData(id)
    .then((result) => res.send(result))
    .catch((error) => res.status(500).send({ error: error.message }));
});

// Fonction pour importer les données depuis un fichier CSV
// function dataImport(cheminFichierCSV) {
//   return new Promise((resolve, reject) => {
//     const fichierStream = fs.createReadStream(cheminFichierCSV);
//     const rl = readline.createInterface({
//       input: fichierStream,
//       crlfDelay: Infinity,
//     });

//     let isFirstLine = true;
//     let champs;
//     const promises = [];
//     let totalLignes = 0;
//     let lignesImportees = 0;

//     rl.on('line', (ligne) => {
//       if (isFirstLine) {
//         champs = ligne.split(',');
//         isFirstLine = false;
//       } else {
//         const valeurs = ligne.split(',');

//         const document = {};
//         champs.forEach((champ, index) => {
//           document[champ] = valeurs[index];
//         });

//         const promise = db.add(document);
//         promises.push(promise);

//         totalLignes++;
//       }
//     });

//     rl.on('close', () => {
//       Promise.all(promises)
//         .then(() => {
//           lignesImportees = totalLignes;
//           resolve({
//             message: 'Importation terminée.',
//             lignesImportees,
//           });
//         })
//         .catch((erreur) => {
//           reject(erreur);
//         });
//     });
//   });
// }

// function dataImport(cheminFichierCSV) {
// fs.createReadStream(cheminFichierCSV)
//     .pipe(csvparser())
//     .on('data', (row) => {
//       db.add(row);
//     })
//     .on('end', () => {
//       console.log('Insertion des données terminée.');
//     });
// }

function dataImport(cheminFichierCSV) {
  return new Promise((resolve, reject) => {
    const results = [];
    let totalLignes = 0;
    let lignesImportees = 0;

    fs.createReadStream(cheminFichierCSV)
      .pipe(csvparser())
      .on("data", (data) => {
        results.push(data);
        totalLignes++;
      })
      .on("end", () => {
        const promises = results.map((data) => {
          return db.add(data);
        });

        Promise.all(promises)
          .then(() => {
            lignesImportees = totalLignes;
            resolve({
              message: "Importation terminée.",
              lignesImportees,
            });
          })
          .catch((erreur) => {
            reject(erreur);
          });
      })
      .on("error", (erreur) => {
        reject(erreur);
      });
  });
}

// Fonction pour créer un nouvel object
function createData(object) {
  return db
    .add(object)
    .then((docRef) => {
      return {
        message: "Document ajouté avec ID : " + docRef.id,
      };
    })
    .catch((error) => {
      throw new Error("Erreur lors de l'ajout du document : " + error);
    });
}

// Fonction pour lire les données
function readData() {
  return db
    .get()
    .then((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      return data;
    })
    .catch((erreur) => {
      throw new Error("Erreur lors de la lecture des données : " + erreur);
    });
}

// Fonction pour lire les données par ordre asc
function readDataMaxOccu(param) {
  return db
    .where(param, "!=", "")
    .orderBy(param, "asc")
    .limit(1)
    .get()
    .then((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      return data;
    })
    .catch((erreur) => {
      throw new Error("Erreur lors de la lecture des données : " + erreur);
    });
}

// Fonction pour mettre à jour une donnée
function updateData(id, champsMaj) {
  return db
    .doc(id)
    .update(champsMaj)
    .then(() => {
      return {
        message: "Document mis à jour avec succès.",
      };
    })
    .catch((erreur) => {
      throw new Error("Erreur lors de la mise à jour du document : " + erreur);
    });
}

// Fonction pour supprimer une donnée
function deleteData(id) {
  return db
    .doc(id)
    .delete()
    .then(() => {
      return {
        message: "Document supprimé avec succès.",
      };
    })
    .catch((erreur) => {
      throw new Error("Erreur lors de la suppression du document : " + erreur);
    });
}

// Démarrer le serveur
app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});


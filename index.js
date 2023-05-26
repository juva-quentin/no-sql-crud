const admin = require("firebase-admin");
const fs = require("fs");
const readline = require("readline");


const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const db = admin.firestore().collection("no-SQL");
const objet = {};



function dataImport(cheminFichierCSV) {
  const fichierStream = fs.createReadStream(cheminFichierCSV);
  const rl = readline.createInterface({
    input: fichierStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let champs;
  const promises = [];
  let totalLignes = 0;
  let lignesImportees = 0;

  rl.on('line', (ligne) => {
    if (isFirstLine) {
      champs = ligne.split(',');
      isFirstLine = false;
    } else {
      const valeurs = ligne.split(',');

      const document = {};
      champs.forEach((champ, index) => {
        document[champ] = valeurs[index];
      });

      const promise = db.add(document);
      promises.push(promise);

      totalLignes++;
    }
  });

  rl.on('close', () => {
    console.log('Importation en cours...');

    Promise.all(promises)
      .then(() => {
        lignesImportees = totalLignes;
        console.log('Importation terminée.');
        console.log('Lignes importées :', lignesImportees);
        menu();
      })
      .catch((erreur) => {
        console.error('Erreur lors de l\'importation des documents :', erreur);
      });
  });
}
 

  function createData(object) {

    db.add(objet)
      .then((docRef) => {
        console.log('Document ajouté avec ID :', docRef.id);
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout du document :', error);
      });
  }
  
  


function readData() {
  db.get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
      });
      menu();
    })
    .catch((erreur) => {
      console.error("Erreur lors de la lecture des données :", erreur);
      menu();
    });
}


function updateData(id, champsMaj) {
  db.doc(id)
    .update(champsMaj)
    .then(() => {
      console.log("Document mis à jour avec succès.");
      menu();
    })
    .catch((erreur) => {
      console.error("Erreur lors de la mise à jour du document :", erreur);
      menu();
    });
}


function deleteData(id) {
  db.doc(id)
    .delete()
    .then(() => {
      console.log("Document supprimé avec succès.");
      menu();
    })
    .catch((erreur) => {
      console.error("Erreur lors de la suppression du document :", erreur);
      menu();
    });
}

function askObj() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Entrez le nom du champ (ou tapez "fin" pour arrêter) : ', (champ) => {
    if (champ.toLowerCase() === 'fin') {
      rl.close();
      createData(objet);
    } else {
      rl.question('Entrez la valeur : ', (valeur) => {
        objet[champ] = valeur;
        askObj();
      });
    }
  });
}


function menu() {
  console.log("\nMenu principal :");
  console.log("1. Importer les données du fichier CSV");
  console.log("2. Créer un nouvel objet");
  console.log("3. Lire les données");
  console.log("4. Mettre à jour une donnée");
  console.log("5. Supprimer une donnée");
  console.log("6. Quitter");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Veuillez choisir une action : ", (reponse) => {
    switch (reponse) {
      case "1":
        rl.question(
          "Veuillez saisir le chemin du fichier CSV : ",
          (cheminFichier) => {
            dataImport(cheminFichier);
            rl.close();
          }
        );
        break;
      case "2":
        Object.keys(objet).forEach(key => {
          delete object[key];
        })
        askObj();
        break;
      case "3":
        readData();
        break;
      case "4":
        rl.question(
          "Veuillez saisir l'ID du document à mettre à jour : ",
          (id) => {
            rl.question(
              "Veuillez saisir les champs à mettre à jour (au format champ:valeur,) : ",
              (champs) => {
                const champsMaj = {};
                const champsArray = champs.split(",");
                champsArray.forEach((champ) => {
                  const [nomChamp, valeurChamp] = champ.split(":");
                  champsMaj[nomChamp.trim()] = valeurChamp.trim();
                });
                updateData(id, champsMaj);
                rl.close();
              }
            );
          }
        );
        break;
      case "5":
        rl.question("Veuillez saisir l'ID du document à supprimer : ", (id) => {
          deleteData(id);
          rl.close();
        });
        break;
      case "6":
        rl.close();
        break;
      default:
        console.log("Action non valide. Veuillez choisir une option valide.");
        menu();
        break;
    }
  });
}

menu();

# Procédure d'installation

## Installation de Homebrew

Dans le terminal :
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

## Installation de Node

1. Dans le terminal :
	```bash
	brew install node
	```
2. Pour vérifier la version de Node.js, saisissez :
	```bash
	Node --version
	```

3. Et pour vérifier la version de npm, lancez cette commande :
	```bash
	npm --version
	```

## Installation de git

Dans un terminal :
```bash
brew install git
```
1.  Collez le texte ci-dessous en indiquant l’adresse e-mail de votre compte sur GitHub.
    
    ```shell
    $ ssh-keygen -t ed25519-sk -C "YOUR_EMAIL"
    ```
    
    **Remarque :**  Si la commande échoue et que l’erreur  `invalid format`  ou  `feature not supported,`  se produit, vous utilisez peut-être une clé de sécurité matérielle qui ne prend pas en charge l’algorithme Ed25519. Entrez plutôt la commande suivante.
    
    ```shell
    $ ssh-keygen -t ecdsa-sk -C "your_email@example.com"
    ```
    
2.  Quand vous y êtes invité, appuyez sur le bouton de votre clé de sécurité matérielle.
    
3.  Quand vous êtes invité à entrer un fichier dans lequel enregistrer la clé, appuyez sur Entrée pour accepter l’emplacement du fichier par défaut.
    
    ```shell
    > Enter a file in which to save the key (/Users/YOU/.ssh/id_ed25519_sk): [Press enter]
    ```
    
4.  Quand vous êtes invité à taper une phrase secrète, appuyez sur  **Entrée**.
    
    ```shell
    > Enter passphrase (empty for no passphrase): [Type a passphrase]
    > Enter same passphrase again: [Type passphrase again]
    ```
    
5.  Ajoutez la clé SSH à votre compte sur GitHub. Pour plus d’informations, consultez « [Ajout d’une nouvelle clé SSH à votre compte GitHub](https://docs.github.com/fr/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) ».



## Utiliser le crud

1. Dans un terminal, cloner le repo avec cette commande en vous plaçant la ou vous souhaitez que le projet soit :
	```bash
	git clone git@github.com:juva-quentin/no-sql-crud.git
	```
2. Une fois le projet cloné, il faut installer les dépendances nécessaires pour firebase :
	```bash
	npm install firebase-admin fs readline
	```
3. Lancer le projet :
	```bash
	node index.js          
	```

## Utiliser le serveur API

1. Une fois le projet cloné, il faut installer les dépendances nécessaires pour firebase :
	```bash
	npm install firebase-admin fs readline express csv-parser joi
2. Lancer le projet :
	```bash
	node server.js          
	```
3. Ensuite, via le swagger.yaml, en l'important sur postman ou via https://editor.swagger.io/ , vous pouvez faire des appels a la bdd via L'API
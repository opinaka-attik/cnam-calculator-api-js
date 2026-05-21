Oui — voici une version **Node.js / JavaScript** de la calculatrice, avec une petite API HTTP, des tests **Jest**, un **Dockerfile** et un **docker-compose.yml**. Pour rester simple et pédagogique, je prends le module HTTP natif de Node.js plutôt qu’Express, et Jest reste un choix standard pour les tests automatisés en JavaScript. [docs.docker](https://docs.docker.com/guides/nodejs/containerize/)

## Structure

Cette structure sépare la logique métier, le serveur HTTP et les tests, exactement comme dans les versions PHP et Java. C’est plus clair pour montrer aux élèves la différence entre “le calcul” et “l’API”. [blog.appsignal](https://blog.appsignal.com/2024/11/27/unit-testing-in-nodejs-with-jest.html)

```txt
calculator-api-node/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .dockerignore
├── src/
│   ├── calculator.js
│   └── server.js
└── tests/
    └── calculator.test.js
```

## Fichiers

Une API Node.js simple peut être exposée avec le module `http` natif, puis conteneurisée avec une image `node` et un `docker-compose.yml` minimal. Docker documente bien la containerisation d’applications Node.js avec ce type d’approche. [semaphore](https://semaphore.io/community/tutorials/dockerizing-a-node-js-web-application)

### `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### `docker-compose.yml`

```yaml
services:
  api:
    build: .
    container_name: node-calculator-api
    ports:
      - "3000:3000"
    volumes:
      - ./:/app
      - /app/node_modules

  test:
    build: .
    container_name: node-calculator-test
    command: npm test
    volumes:
      - ./:/app
      - /app/node_modules
```

### `.dockerignore`

```txt
node_modules
npm-debug.log
```

### `package.json`

Jest s’ajoute comme dépendance de développement, puis les scripts `start` et `test` permettent de lancer soit le serveur, soit les tests. Cette organisation est très classique dans les projets Node.js. [browserstack](https://www.browserstack.com/guide/unit-testing-for-nodejs-using-jest)

```json
{
  "name": "calculator-api-node",
  "version": "1.0.0",
  "description": "API Node.js simple de calculatrice avec Jest et Docker",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

### `src/calculator.js`

```javascript
/**
 * Cette classe contient uniquement la logique métier.
 * Elle ne dépend ni de HTTP ni de Docker.
 */
class Calculator {
  /**
   * Additionne deux nombres.
   */
  add(a, b) {
    return a + b;
  }

  /**
   * Soustrait b à a.
   */
  subtract(a, b) {
    return a - b;
  }

  /**
   * Multiplie deux nombres.
   */
  multiply(a, b) {
    return a * b;
  }

  /**
   * Divise a par b.
   * On lève une erreur si b vaut 0.
   */
  divide(a, b) {
    if (b === 0) {
      throw new Error("Division par zéro impossible.");
    }

    return a / b;
  }
}

module.exports = Calculator;
```

### `src/server.js`

Le serveur lit les paramètres `operation`, `a` et `b` dans l’URL, puis renvoie une réponse JSON. Avec le module `http` natif, les élèves voient directement le lien entre la requête et le traitement sans couche supplémentaire. [stackoverflow](https://stackoverflow.com/questions/63042140/simple-node-http-server-unit-test)

```javascript
const http = require("http");
const url = require("url");
const Calculator = require("./calculator");

const calculator = new Calculator();
const PORT = 3000;

/**
 * Fonction qui gère les requêtes HTTP.
 */
function requestHandler(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (pathname !== "/calculate") {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Route introuvable." }, null, 2));
    return;
  }

  const operation = query.operation;
  const a = query.a;
  const b = query.b;

  if (operation === undefined || a === undefined || b === undefined) {
    res.statusCode = 400;
    res.end(
      JSON.stringify(
        { error: "Paramètres attendus : operation, a, b" },
        null,
        2
      )
    );
    return;
  }

  const numberA = Number(a);
  const numberB = Number(b);

  if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
    res.statusCode = 400;
    res.end(
      JSON.stringify(
        { error: "Les paramètres a et b doivent être des nombres." },
        null,
        2
      )
    );
    return;
  }

  try {
    let result;

    switch (operation) {
      case "add":
        result = calculator.add(numberA, numberB);
        break;
      case "subtract":
        result = calculator.subtract(numberA, numberB);
        break;
      case "multiply":
        result = calculator.multiply(numberA, numberB);
        break;
      case "divide":
        result = calculator.divide(numberA, numberB);
        break;
      default:
        res.statusCode = 400;
        res.end(
          JSON.stringify(
            { error: "Opération inconnue. Utiliser : add, subtract, multiply, divide" },
            null,
            2
          )
        );
        return;
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify(
        {
          operation,
          a: numberA,
          b: numberB,
          result
        },
        null,
        2
      )
    );
  } catch (error) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: error.message }, null, 2));
  }
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
```

### `tests/calculator.test.js`

Jest permet ici de tester la classe métier sans lancer le serveur HTTP, ce qui correspond bien à l’idée du test unitaire. C’est aussi la forme de test la plus simple à faire comprendre au début. [browserstack](https://www.browserstack.com/guide/unit-testing-for-nodejs-using-jest)

```javascript
const Calculator = require("../src/calculator");

describe("Calculator", () => {
  test("add additionne deux nombres", () => {
    const calculator = new Calculator();
    expect(calculator.add(2, 3)).toBe(5);
  });

  test("subtract soustrait deux nombres", () => {
    const calculator = new Calculator();
    expect(calculator.subtract(10, 4)).toBe(6);
  });

  test("multiply multiplie deux nombres", () => {
    const calculator = new Calculator();
    expect(calculator.multiply(6, 7)).toBe(42);
  });

  test("divide divise deux nombres", () => {
    const calculator = new Calculator();
    expect(calculator.divide(20, 5)).toBe(4);
  });

  test("divide lève une erreur si on divise par zéro", () => {
    const calculator = new Calculator();
    expect(() => calculator.divide(10, 0)).toThrow("Division par zéro impossible.");
  });
});
```

## Commandes

Avec cette configuration, tu peux lancer l’API avec Docker Compose puis lancer les tests Jest dans un second service. Docker Compose est bien adapté à ce type de projet Node.js simple avec un service pour l’application et un autre pour les tests. [cloudbees](https://www.cloudbees.com/blog/using-docker-compose-for-nodejs-development)

### Construire et démarrer l’API

```bash
docker compose up --build api
```

API disponible ici :

```txt
http://localhost:3000/calculate
```

### Lancer les tests Jest

```bash
docker compose run --rm test
```

## Tests curl

Comme pour PHP et Java, il faut protéger l’URL avec des guillemets si elle contient `&`, sinon le shell l’interprète mal. Ce comportement vient du shell, pas de Node.js. [stackoverflow](https://stackoverflow.com/questions/13339469/how-to-include-an-character-in-a-bash-curl-statement)

### Exemples corrects

```bash
curl "http://localhost:3000/calculate?operation=add&a=4&b=2"
```

```bash
curl "http://localhost:3000/calculate?operation=subtract&a=10&b=3"
```

```bash
curl "http://localhost:3000/calculate?operation=multiply&a=6&b=7"
```

```bash
curl "http://localhost:3000/calculate?operation=divide&a=20&b=5"
```

### Cas d’erreur

```bash
curl "http://localhost:3000/calculate?operation=divide&a=10&b=0"
```

```bash
curl "http://localhost:3000/calculate"
```

## Résultats attendus

Les réponses attendues sont simples et lisibles, ce qui est utile en cours pour faire le lien entre paramètres de requête, logique métier et JSON de réponse. [testim](https://www.testim.io/blog/node-js-unit-testing-get-started-quickly-with-examples/)

- Addition :

```json
{
  "operation": "add",
  "a": 4,
  "b": 2,
  "result": 6
}
```

- Division par zéro :

```json
{
  "error": "Division par zéro impossible."
}
```

- Paramètres manquants :

```json
{
  "error": "Paramètres attendus : operation, a, b"
}
```

## Point pédagogique

Cette version permet d’expliquer très simplement :
- une classe JavaScript métier ;
- un serveur HTTP natif Node.js ;
- des tests unitaires Jest ;
- un lancement reproductible avec Docker et Docker Compose. [docs.docker](https://docs.docker.com/guides/nodejs/containerize/)

Je peux maintenant te donner aussi une **version Express.js** de la même calculatrice, mais celle-ci en HTTP natif est la plus simple pour un usage pédagogique.
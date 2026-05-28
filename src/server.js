const http = require("http");
const url = require("url");
const Calculator = require("./calculator");

const calculator = new Calculator();
const PORT = process.env.PORT || 3000;

/**
 * Fonction qui gère les requêtes HTTP.
 * Exportée pour permettre les tests d'intégration.
 */
function requestHandler(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
    }

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

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
}

module.exports = { requestHandler, server };

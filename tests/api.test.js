const http = require("http");
const { requestHandler } = require("../src/server");

/**
 * Helper : envoie une requête HTTP à l'instance de test et résout avec { status, body }.
 */
function request(server, path) {
    return new Promise((resolve, reject) => {
        const addr = server.address();
        const options = {
            hostname: "127.0.0.1",
            port: addr.port,
            path,
            method: "GET",
        };
        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        });
        req.on("error", reject);
        req.end();
    });
}

describe("API /calculate", () => {
    let server;

    beforeAll((done) => {
        server = http.createServer(requestHandler);
        server.listen(0, "127.0.0.1", done);
    });

    afterAll((done) => {
        server.close(done);
    });

    describe("GET /calculate — cas nominaux", () => {
        it("devrait retourner 200 avec le résultat de l'addition", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=2&b=3");
            expect(status).toBe(200);
            expect(body.result).toBe(5);
            expect(body.operation).toBe("add");
            expect(body.a).toBe(2);
            expect(body.b).toBe(3);
        });

        it("devrait retourner 200 avec le résultat de la soustraction", async () => {
            const { status, body } = await request(server, "/calculate?operation=subtract&a=10&b=4");
            expect(status).toBe(200);
            expect(body.result).toBe(6);
        });

        it("devrait retourner 200 avec le résultat de la multiplication", async () => {
            const { status, body } = await request(server, "/calculate?operation=multiply&a=6&b=7");
            expect(status).toBe(200);
            expect(body.result).toBe(42);
        });

        it("devrait retourner 200 avec le résultat de la division", async () => {
            const { status, body } = await request(server, "/calculate?operation=divide&a=20&b=5");
            expect(status).toBe(200);
            expect(body.result).toBe(4);
        });

        it("devrait retourner un résultat décimal pour une division non entière", async () => {
            const { status, body } = await request(server, "/calculate?operation=divide&a=10&b=3");
            expect(status).toBe(200);
            expect(body.result).toBeCloseTo(3.333);
        });
    });

    describe("GET /calculate — erreurs 400", () => {
        it("devrait retourner 400 quand on divise par zéro", async () => {
            const { status, body } = await request(server, "/calculate?operation=divide&a=10&b=0");
            expect(status).toBe(400);
            expect(body.error).toBe("Division par zéro impossible.");
        });

        it("devrait retourner 400 quand un paramètre est manquant", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=2");
            expect(status).toBe(400);
            expect(body.error).toMatch(/Paramètres attendus/);
        });

        it("devrait retourner 400 quand a n'est pas un nombre", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=abc&b=3");
            expect(status).toBe(400);
            expect(body.error).toMatch(/doivent être des nombres/);
        });

        it("devrait retourner 400 pour une opération inconnue", async () => {
            const { status, body } = await request(server, "/calculate?operation=modulo&a=10&b=3");
            expect(status).toBe(400);
            expect(body.error).toMatch(/Opération inconnue/);
        });
    });

    describe("GET — autres routes", () => {
        it("devrait retourner 404 pour une route inconnue", async () => {
            const { status, body } = await request(server, "/unknown");
            expect(status).toBe(404);
            expect(body.error).toBe("Route introuvable.");
        });
    });
});

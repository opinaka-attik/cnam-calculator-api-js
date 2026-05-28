const http = require("http");
const { requestHandler } = require("../src/server");

/**
 * Helper : envoie une requête HTTP à l'instance de test.
 * Résout avec { status, headers, body }.
 */
function request(server, path, method = "GET") {
    return new Promise((resolve, reject) => {
        const addr = server.address();
        const req = http.request(
            { hostname: "127.0.0.1", port: addr.port, path, method },
            (res) => {
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: JSON.parse(data),
                }));
            }
        );
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

    // ─── Headers communs ──────────────────────────────────────────────────────
    describe("Headers de réponse", () => {
        it("devrait retourner Content-Type application/json sur une requête valide", async () => {
            const { headers } = await request(server, "/calculate?operation=add&a=1&b=2");
            expect(headers["content-type"]).toMatch(/application\/json/);
        });

        it("devrait retourner le header CORS Access-Control-Allow-Origin", async () => {
            const { headers } = await request(server, "/calculate?operation=add&a=1&b=2");
            expect(headers["access-control-allow-origin"]).toBe("*");
        });

        it("devrait retourner Content-Type application/json sur une erreur 400", async () => {
            const { headers } = await request(server, "/calculate?operation=add&a=2");
            expect(headers["content-type"]).toMatch(/application\/json/);
        });

        it("devrait retourner Content-Type application/json sur une erreur 404", async () => {
            const { headers } = await request(server, "/unknown");
            expect(headers["content-type"]).toMatch(/application\/json/);
        });
    });

    // ─── Preflight CORS (OPTIONS) ─────────────────────────────────────────────
    describe("OPTIONS /calculate — preflight CORS", () => {
        it("devrait retourner 204 pour une requête OPTIONS", async () => {
            const { status } = await request(server, "/calculate", "OPTIONS");
            expect(status).toBe(204);
        });

        it("devrait retourner les headers CORS nécessaires sur OPTIONS", async () => {
            const { headers } = await request(server, "/calculate", "OPTIONS");
            expect(headers["access-control-allow-origin"]).toBe("*");
            expect(headers["access-control-allow-methods"]).toMatch(/GET/);
        });
    });

    // ─── Cas nominaux ─────────────────────────────────────────────────────────
    describe("GET /calculate — cas nominaux", () => {
        it.each([
            ["add",      2,  3,  5 ],
            ["subtract", 10, 4,  6 ],
            ["multiply", 6,  7,  42],
            ["divide",   20, 5,  4 ],
        ])("devrait retourner 200 pour %s(%s, %s) = %s", async (operation, a, b, expected) => {
            const { status, body } = await request(
                server, `/calculate?operation=${operation}&a=${a}&b=${b}`
            );
            expect(status).toBe(200);
            expect(body.result).toBe(expected);
            expect(body.operation).toBe(operation);
            expect(body.a).toBe(a);
            expect(body.b).toBe(b);
        });

        it("devrait retourner un résultat décimal pour une division non entière", async () => {
            const { status, body } = await request(server, "/calculate?operation=divide&a=10&b=3");
            expect(status).toBe(200);
            expect(body.result).toBeCloseTo(3.333);
        });
    });

    // ─── Erreurs 400 ──────────────────────────────────────────────────────────
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

    // ─── Autres routes ────────────────────────────────────────────────────────
    describe("GET — autres routes", () => {
        it("devrait retourner 404 pour une route inconnue", async () => {
            const { status, body } = await request(server, "/unknown");
            expect(status).toBe(404);
            expect(body.error).toBe("Route introuvable.");
        });
    });
});

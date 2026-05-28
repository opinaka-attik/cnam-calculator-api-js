const http = require("http");
const { requestHandler } = require("../src/server");
const { request } = require("./helpers/http");

describe("API /calculate", () => {
    let server;

    beforeAll((done) => {
        server = http.createServer(requestHandler);
        server.listen(0, "127.0.0.1", done);
    });

    afterAll((done) => {
        server.close(done);
    });

    // ─── Performance ──────────────────────────────────────────────────────────
    describe("Performance", () => {
        it("devrait répondre en moins de 100ms sur une requête valide", async () => {
            const { duration } = await request(server, "/calculate?operation=add&a=1&b=2");
            expect(duration).toBeLessThan(100);
        });

        it("devrait répondre en moins de 100ms sur une erreur 400", async () => {
            const { duration } = await request(server, "/calculate?operation=add&a=2");
            expect(duration).toBeLessThan(100);
        });
    });

    // ─── Headers communs ──────────────────────────────────────────────────────
    describe("Headers de réponse", () => {
        it("devrait retourner Content-Type application/json sur une requête valide", async () => {
            const { headers } = await request(server, "/calculate?operation=add&a=1&b=2");
            expect(headers["content-type"]).toMatch(/application\/json/);
        });

        it("devrait retourner le header CORS Access-Control-Allow-Origin: *", async () => {
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
        it("devrait retourner 204 sans body pour une requête OPTIONS", async () => {
            const { status, body } = await request(server, "/calculate", "OPTIONS");
            expect(status).toBe(204);
            expect(body).toBeNull();
        });

        it("devrait retourner les headers CORS nécessaires sur OPTIONS", async () => {
            const { headers } = await request(server, "/calculate", "OPTIONS");
            expect(headers["access-control-allow-origin"]).toBe("*");
            expect(headers["access-control-allow-methods"]).toMatch(/GET/);
        });
    });

    // ─── Cas nominaux ─────────────────────────────────────────────────────────
    describe("GET /calculate — cas nominaux", () => {
        it.each`
            operation      | a     | b    | expected
            ${'add'}       | ${2}  | ${3} | ${5}
            ${'subtract'}  | ${10} | ${4} | ${6}
            ${'multiply'}  | ${6}  | ${7} | ${42}
            ${'divide'}    | ${20} | ${5} | ${4}
            ${'add'}       | ${-5} | ${-3}| ${-8}
            ${'subtract'}  | ${-5} | ${-3}| ${-2}
            ${'multiply'}  | ${-3} | ${-4}| ${12}
            ${'divide'}    | ${-10}| ${-2}| ${5}
        `("devrait retourner 200 pour $operation($a, $b) = $expected", async ({ operation, a, b, expected }) => {
            const { status, body } = await request(
                server, `/calculate?operation=${operation}&a=${a}&b=${b}`
            );
            expect(status).toBe(200);
            expect(body).toMatchObject({
                operation,
                a,
                b,
                result: expected,
            });
        });

        it("devrait retourner un résultat décimal pour une division non entière", async () => {
            const { status, body } = await request(server, "/calculate?operation=divide&a=10&b=3");
            expect(status).toBe(200);
            expect(body.result).toBeCloseTo(3.333);
        });
    });

    // ─── Erreurs 400 ──────────────────────────────────────────────────────────
    describe("GET /calculate — erreurs 400", () => {
        it("devrait retourner 400 avec la structure d'erreur correcte quand on divise par zéro", async () => {
            const { status, body } = await request(server, "/calculate?operation=divide&a=10&b=0");
            expect(status).toBe(400);
            expect(body).toMatchObject({ error: "Division par zéro impossible." });
        });

        it("devrait retourner 400 quand le paramètre b est manquant", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=2");
            expect(status).toBe(400);
            expect(body.error).toMatch(/Paramètres attendus/);
        });

        it("devrait retourner 400 quand le paramètre a est manquant", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&b=2");
            expect(status).toBe(400);
            expect(body.error).toMatch(/Paramètres attendus/);
        });

        it("devrait retourner 400 quand a n'est pas un nombre", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=abc&b=3");
            expect(status).toBe(400);
            expect(body.error).toMatch(/doivent être des nombres/);
        });

        it("devrait retourner 400 quand b n'est pas un nombre", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=3&b=abc");
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
        it("devrait retourner 404 avec la structure d'erreur correcte pour une route inconnue", async () => {
            const { status, body } = await request(server, "/unknown");
            expect(status).toBe(404);
            expect(body).toMatchObject({ error: "Route introuvable." });
        });
    });
});

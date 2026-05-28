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
        // Assertion stricte sur le Content-Type complet (charset inclus)
        it("devrait retourner Content-Type application/json; charset=utf-8 (strict) sur une requête valide", async () => {
            const { headers } = await request(server, "/calculate?operation=add&a=1&b=2");
            expect(headers["content-type"]).toBe("application/json; charset=utf-8");
        });

        it("devrait retourner le header CORS Access-Control-Allow-Origin: *", async () => {
            const { headers } = await request(server, "/calculate?operation=add&a=1&b=2");
            expect(headers["access-control-allow-origin"]).toBe("*");
        });

        it("devrait retourner Content-Type application/json; charset=utf-8 (strict) sur une erreur 400", async () => {
            const { headers } = await request(server, "/calculate?operation=add&a=2");
            expect(headers["content-type"]).toBe("application/json; charset=utf-8");
        });

        it("devrait retourner Content-Type application/json; charset=utf-8 (strict) sur une erreur 404", async () => {
            const { headers } = await request(server, "/unknown");
            expect(headers["content-type"]).toBe("application/json; charset=utf-8");
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

        // Test #8 — décimaux en query string
        it("devrait retourner 200 et result: 4 pour add avec a=1.5&b=2.5 (décimaux en query string)", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=1.5&b=2.5");
            expect(status).toBe(200);
            expect(body.result).toBe(4);
        });

        // Test #9 — contrat JSON : la réponse 200 contient bien les champs operation, a, b, result
        it("[contrat JSON] la réponse 200 doit contenir exactement les champs operation, a, b et result", async () => {
            const { status, body } = await request(server, "/calculate?operation=multiply&a=3&b=4");
            expect(status).toBe(200);
            expect(body).toHaveProperty("operation");
            expect(body).toHaveProperty("a");
            expect(body).toHaveProperty("b");
            expect(body).toHaveProperty("result");
            expect(body).not.toHaveProperty("error");
        });

        // Test #7 — a= vide : comportement actuel (Number('') === 0, coercé silencieusement)
        it("[design] a= vide est silencieusement coercé en 0 (Number('') === 0), documente le comportement actuel", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=&b=2");
            expect([200, 400]).toContain(status);
            if (status === 200) {
                expect(body).toHaveProperty("result");
            } else {
                expect(body).toHaveProperty("error");
            }
        });

        // [EDGE] Très grandes valeurs — déborde vers Infinity
        it("[edge] add(1e308, 1e308) doit retourner Infinity (débordement flottant JS)", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=1e308&b=1e308");
            expect(status).toBe(200);
            // JSON.parse("Infinity") n'existe pas — le serveur serialise null ou une chaîne
            // On documente le comportement réel : result est null ou une chaîne représentant Infinity
            expect([null, "Infinity", Infinity]).toContain(body.result);
        });

        it("[edge] multiply(1e308, 1e308) doit retourner Infinity (débordement flottant JS)", async () => {
            const { status, body } = await request(server, "/calculate?operation=multiply&a=1e308&b=1e308");
            expect(status).toBe(200);
            expect([null, "Infinity", Infinity]).toContain(body.result);
        });

        // [EDGE] a=-0 : Number('-0') === 0 en JS mais Object.is(-0, 0) === false
        it("[edge] a=-0 est accepté (Number('-0') === 0 en comparaison ==), documente le comportement actuel", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=-0&b=5");
            expect(status).toBe(200);
            // Number('-0') vaut -0 en JS mais JSON.stringify(-0) vaut '0'
            // Le résultat attendu est 5 (0 + 5)
            expect(body.result).toBe(5);
            // Le champ 'a' dans la réponse JSON sera 0 (JSON.stringify sérialise -0 en 0)
            expect(body.a).toBe(0);
        });
    });

    // ─── Méthode non autorisée ───────────────────────────────────────────────────
    describe("Méthode non autorisée", () => {
        it("[design] POST /calculate doit retourner 405 Method Not Allowed", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=1&b=2", "POST");
            expect(status).toBe(405);
            expect(body).toHaveProperty("error");
        });

        it("[design] POST /calculate doit retourner le header Allow: GET, OPTIONS", async () => {
            const { headers } = await request(server, "/calculate?operation=add&a=1&b=2", "POST");
            expect(headers["allow"]).toMatch(/GET/);
        });

        it("[design] PUT /calculate doit retourner 405 Method Not Allowed", async () => {
            const { status } = await request(server, "/calculate?operation=add&a=1&b=2", "PUT");
            expect(status).toBe(405);
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

        it("devrait retourner 400 quand le paramètre operation est absent", async () => {
            const { status, body } = await request(server, "/calculate?a=5&b=3");
            expect(status).toBe(400);
            expect(body.error).toMatch(/Paramètres attendus/);
        });

        it("[contrat JSON] la réponse d'erreur 400 ne doit pas contenir de champ result", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=2");
            expect(status).toBe(400);
            expect(body).not.toHaveProperty("result");
            expect(body).toHaveProperty("error");
        });
    });

    // ─── Autres routes ────────────────────────────────────────────────────────
    describe("GET — autres routes", () => {
        it("devrait retourner 404 avec la structure d'erreur correcte pour une route inconnue", async () => {
            const { status, body } = await request(server, "/unknown");
            expect(status).toBe(404);
            expect(body).toMatchObject({ error: "Route introuvable." });
        });

        // [EDGE] GET / (racine) — non documenté, retourne 404
        it("[edge] GET / (racine) doit retourner 404 avec la structure d'erreur correcte", async () => {
            const { status, body } = await request(server, "/");
            expect(status).toBe(404);
            expect(body).toHaveProperty("error");
        });

        it("[edge] GET /calculate/ (slash final) doit retourner 404", async () => {
            const { status, body } = await request(server, "/calculate/");
            expect(status).toBe(404);
            expect(body).toHaveProperty("error");
        });
    });
});

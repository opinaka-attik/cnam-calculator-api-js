const http = require("http");
const { requestHandler } = require("../src/server");

/**
 * Helper : envoie une requ\u00eate HTTP \u00e0 l'instance de test.
 * R\u00e9sout avec { status, headers, body }.
 * body vaut null si la r\u00e9ponse n'a pas de contenu (ex: OPTIONS 204).
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
                    body: data ? JSON.parse(data) : null,
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

    // \u2500\u2500\u2500 Headers communs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    describe("Headers de r\u00e9ponse", () => {
        it("devrait retourner Content-Type application/json sur une requ\u00eate valide", async () => {
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

    // \u2500\u2500\u2500 Preflight CORS (OPTIONS) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    describe("OPTIONS /calculate \u2014 preflight CORS", () => {
        it("devrait retourner 204 sans body pour une requ\u00eate OPTIONS", async () => {
            const { status, body } = await request(server, "/calculate", "OPTIONS");
            expect(status).toBe(204);
            expect(body).toBeNull();
        });

        it("devrait retourner les headers CORS n\u00e9cessaires sur OPTIONS", async () => {
            const { headers } = await request(server, "/calculate", "OPTIONS");
            expect(headers["access-control-allow-origin"]).toBe("*");
            expect(headers["access-control-allow-methods"]).toMatch(/GET/);
        });
    });

    // \u2500\u2500\u2500 Cas nominaux \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    describe("GET /calculate \u2014 cas nominaux", () => {
        it.each`
            operation      | a     | b    | expected
            ${'add'}       | ${2}  | ${3} | ${5}
            ${'subtract'}  | ${10} | ${4} | ${6}
            ${'multiply'}  | ${6}  | ${7} | ${42}
            ${'divide'}    | ${20} | ${5} | ${4}
        `("devrait retourner 200 pour $operation($a, $b) = $expected", async ({ operation, a, b, expected }) => {
            const { status, body } = await request(
                server, `/calculate?operation=${operation}&a=${a}&b=${b}`
            );
            expect(status).toBe(200);
            expect(body.result).toBe(expected);
            expect(body.operation).toBe(operation);
            expect(body.a).toBe(a);
            expect(body.b).toBe(b);
        });

        it("devrait retourner un r\u00e9sultat d\u00e9cimal pour une division non enti\u00e8re", async () => {
            const { status, body } = await request(server, "/calculate?operation=divide&a=10&b=3");
            expect(status).toBe(200);
            expect(body.result).toBeCloseTo(3.333);
        });
    });

    // \u2500\u2500\u2500 Erreurs 400 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    describe("GET /calculate \u2014 erreurs 400", () => {
        it("devrait retourner 400 quand on divise par z\u00e9ro", async () => {
            const { status, body } = await request(server, "/calculate?operation=divide&a=10&b=0");
            expect(status).toBe(400);
            expect(body.error).toBe("Division par z\u00e9ro impossible.");
        });

        it("devrait retourner 400 quand le param\u00e8tre b est manquant", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=2");
            expect(status).toBe(400);
            expect(body.error).toMatch(/Param\u00e8tres attendus/);
        });

        it("devrait retourner 400 quand le param\u00e8tre a est manquant", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&b=2");
            expect(status).toBe(400);
            expect(body.error).toMatch(/Param\u00e8tres attendus/);
        });

        it("devrait retourner 400 quand a n'est pas un nombre", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=abc&b=3");
            expect(status).toBe(400);
            expect(body.error).toMatch(/doivent \u00eatre des nombres/);
        });

        it("devrait retourner 400 quand b n'est pas un nombre", async () => {
            const { status, body } = await request(server, "/calculate?operation=add&a=3&b=abc");
            expect(status).toBe(400);
            expect(body.error).toMatch(/doivent \u00eatre des nombres/);
        });

        it("devrait retourner 400 pour une op\u00e9ration inconnue", async () => {
            const { status, body } = await request(server, "/calculate?operation=modulo&a=10&b=3");
            expect(status).toBe(400);
            expect(body.error).toMatch(/Op\u00e9ration inconnue/);
        });
    });

    // \u2500\u2500\u2500 Autres routes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    describe("GET \u2014 autres routes", () => {
        it("devrait retourner 404 pour une route inconnue", async () => {
            const { status, body } = await request(server, "/unknown");
            expect(status).toBe(404);
            expect(body.error).toBe("Route introuvable.");
        });
    });
});

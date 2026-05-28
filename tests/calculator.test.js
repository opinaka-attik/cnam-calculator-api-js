const Calculator = require("../src/calculator");

describe("Calculator", () => {
    let calculator;

    beforeEach(() => {
        calculator = new Calculator();
    });

    describe("add", () => {
        it.each`
            a      | b     | expected
            ${2}   | ${3}  | ${5}
            ${-5}  | ${-3} | ${-8}
            ${-5}  | ${3}  | ${-2}
            ${7}   | ${0}  | ${7}
        `("devrait retourner $a + $b = $expected", ({ a, b, expected }) => {
            expect(calculator.add(a, b)).toBe(expected);
        });

        it("devrait additionner deux nombres décimaux (0.1 + 0.2 ≈ 0.3)", () => {
            expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
        });

        // Test #1 — coercion silencieuse : null est converti en 0 par JS
        it("[coercion] add(null, 2) devrait retourner 2 (null coercé en 0)", () => {
            expect(calculator.add(null, 2)).toBe(2);
        });
    });

    describe("subtract", () => {
        it.each`
            a      | b     | expected
            ${10}  | ${4}  | ${6}
            ${3}   | ${10} | ${-7}
            ${5}   | ${0}  | ${5}
            ${-5}  | ${-3} | ${-2}
        `("devrait retourner $a - $b = $expected", ({ a, b, expected }) => {
            expect(calculator.subtract(a, b)).toBe(expected);
        });

        it("devrait soustraire deux nombres décimaux (0.3 - 0.1 ≈ 0.2)", () => {
            expect(calculator.subtract(0.3, 0.1)).toBeCloseTo(0.2);
        });

        // Test #2 — coercion silencieuse : undefined produit NaN
        it("[coercion] subtract(undefined, 5) devrait retourner NaN (undefined non coercé)", () => {
            expect(calculator.subtract(undefined, 5)).toBeNaN();
        });
    });

    describe("multiply", () => {
        it.each`
            a      | b      | expected
            ${6}   | ${7}   | ${42}
            ${0}   | ${999} | ${0}
            ${-3}  | ${-4}  | ${12}
            ${3}   | ${-4}  | ${-12}
        `("devrait retourner $a * $b = $expected", ({ a, b, expected }) => {
            expect(calculator.multiply(a, b)).toBe(expected);
        });

        it("devrait multiplier deux nombres décimaux (0.1 * 0.2 ≈ 0.02)", () => {
            expect(calculator.multiply(0.1, 0.2)).toBeCloseTo(0.02);
        });

        // Test #3 — coercion silencieuse : une chaîne non numérique produit NaN
        it("[coercion] multiply('abc', 3) devrait retourner NaN (chaîne non numérique)", () => {
            expect(calculator.multiply("abc", 3)).toBeNaN();
        });
    });

    describe("divide", () => {
        describe("cas nominaux", () => {
            it.each`
                a       | b     | expected
                ${20}   | ${5}  | ${4}
                ${0}    | ${5}  | ${0}
                ${-10}  | ${-2} | ${5}
            `("devrait retourner $a / $b = $expected", ({ a, b, expected }) => {
                expect(calculator.divide(a, b)).toBe(expected);
            });

            it("devrait retourner un nombre décimal pour une division non entière (10 / 3 ≈ 3.333)", () => {
                expect(calculator.divide(10, 3)).toBeCloseTo(3.333);
            });

            // Test #4 — coercion : NaN en entrée produit NaN en sortie
            it("[coercion] divide(NaN, 5) devrait retourner NaN (NaN non filtré)", () => {
                expect(calculator.divide(NaN, 5)).toBeNaN();
            });

            // Test #5 — décimal négatif non couvert précédemment
            it("devrait retourner -3.5 pour divide(-7, 2)", () => {
                expect(calculator.divide(-7, 2)).toBe(-3.5);
            });
        });

        describe("cas d'erreur", () => {
            it("devrait lever une Error avec le bon message quand on divise par zéro", () => {
                expect(() => calculator.divide(10, 0))
                    .toThrow(new Error("Division par zéro impossible."));
            });
        });
    });
});

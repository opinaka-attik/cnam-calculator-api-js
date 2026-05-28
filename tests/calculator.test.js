const Calculator = require("../src/calculator");

describe("Calculator", () => {
    let calculator;

    beforeEach(() => {
        calculator = new Calculator();
    });

    describe("add", () => {
        it.each([
            [2,    3,   5 ],
            [-5,  -3,  -8 ],
            [-5,   3,  -2 ],
            [ 7,   0,   7 ],
        ])("devrait retourner %s + %s = %s", (a, b, expected) => {
            expect(calculator.add(a, b)).toBe(expected);
        });

        it("devrait additionner deux nombres décimaux", () => {
            expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
        });
    });

    describe("subtract", () => {
        it.each([
            [10,  4,   6],
            [ 3, 10,  -7],
            [ 5,  0,   5],
            [-5, -3,  -2],
        ])("devrait retourner %s - %s = %s", (a, b, expected) => {
            expect(calculator.subtract(a, b)).toBe(expected);
        });

        it("devrait soustraire deux nombres décimaux", () => {
            expect(calculator.subtract(0.3, 0.1)).toBeCloseTo(0.2);
        });
    });

    describe("multiply", () => {
        it.each([
            [ 6,    7,   42],
            [ 0,  999,    0],
            [-3,   -4,   12],
            [ 3,   -4,  -12],
        ])("devrait retourner %s * %s = %s", (a, b, expected) => {
            expect(calculator.multiply(a, b)).toBe(expected);
        });

        it("devrait multiplier deux nombres décimaux", () => {
            expect(calculator.multiply(0.1, 0.2)).toBeCloseTo(0.02);
        });
    });

    describe("divide", () => {
        it.each([
            [20,  5,  4],
            [ 0,  5,  0],
            [-10, -2, 5],
        ])("devrait retourner %s / %s = %s", (a, b, expected) => {
            expect(calculator.divide(a, b)).toBe(expected);
        });

        it("devrait retourner un nombre décimal pour une division non entière", () => {
            expect(calculator.divide(10, 3)).toBeCloseTo(3.333);
        });

        it("devrait lever une erreur de type Error avec le bon message quand on divise par zéro", () => {
            expect(() => calculator.divide(10, 0))
                .toThrow(new Error("Division par zéro impossible."));
        });
    });
});

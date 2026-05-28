const Calculator = require("../src/calculator");

describe("Calculator", () => {
    let calculator;

    beforeEach(() => {
        calculator = new Calculator();
    });

    describe("add", () => {
        test("devrait additionner deux nombres positifs", () => {
            expect(calculator.add(2, 3)).toBe(5);
        });

        test("devrait additionner un nombre négatif et un nombre positif", () => {
            expect(calculator.add(-5, 3)).toBe(-2);
        });

        test("devrait retourner le même nombre quand on ajoute zéro", () => {
            expect(calculator.add(7, 0)).toBe(7);
        });

        test("devrait additionner deux nombres décimaux", () => {
            expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
        });
    });

    describe("subtract", () => {
        test("devrait soustraire deux nombres positifs", () => {
            expect(calculator.subtract(10, 4)).toBe(6);
        });

        test("devrait retourner un nombre négatif quand b est plus grand que a", () => {
            expect(calculator.subtract(3, 10)).toBe(-7);
        });

        test("devrait retourner le même nombre quand on soustrait zéro", () => {
            expect(calculator.subtract(5, 0)).toBe(5);
        });

        test("devrait soustraire deux nombres négatifs", () => {
            expect(calculator.subtract(-5, -3)).toBe(-2);
        });
    });

    describe("multiply", () => {
        test("devrait multiplier deux nombres positifs", () => {
            expect(calculator.multiply(6, 7)).toBe(42);
        });

        test("devrait retourner zéro quand un des opérandes est zéro", () => {
            expect(calculator.multiply(0, 999)).toBe(0);
        });

        test("devrait retourner un nombre positif en multipliant deux négatifs", () => {
            expect(calculator.multiply(-3, -4)).toBe(12);
        });

        test("devrait retourner un nombre négatif en multipliant un positif et un négatif", () => {
            expect(calculator.multiply(3, -4)).toBe(-12);
        });
    });

    describe("divide", () => {
        test("devrait diviser deux nombres positifs", () => {
            expect(calculator.divide(20, 5)).toBe(4);
        });

        test("devrait retourner un nombre décimal pour une division non entière", () => {
            expect(calculator.divide(10, 3)).toBeCloseTo(3.333);
        });

        test("devrait retourner zéro quand le numérateur est zéro", () => {
            expect(calculator.divide(0, 5)).toBe(0);
        });

        test("devrait diviser deux nombres négatifs", () => {
            expect(calculator.divide(-10, -2)).toBe(5);
        });

        test("devrait lever une erreur quand on divise par zéro", () => {
            expect(() => calculator.divide(10, 0)).toThrow("Division par zéro impossible.");
        });

        test("devrait lever une erreur de type Error quand on divise par zéro", () => {
            expect(() => calculator.divide(10, 0)).toThrow(Error);
        });
    });
});

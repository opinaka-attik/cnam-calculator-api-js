
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
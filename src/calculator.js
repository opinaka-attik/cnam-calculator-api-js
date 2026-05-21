
/**
 * Cette classe contient uniquement la logique métier.
 * Elle ne dépend ni de HTTP ni de Docker.
 */
class Calculator {
    /**
     * Additionne deux nombres.
     */
    add(a, b) {
        return a + b;
    }

    /**
     * Soustrait b à a.
     */
    subtract(a, b) {
        return a - b;
    }

    /**
     * Multiplie deux nombres.
     */
    multiply(a, b) {
        return a * b;
    }

    /**
     * Divise a par b.
     * On lève une erreur si b vaut 0.
     */
    divide(a, b) {
        if (b === 0) {
            throw new Error("Division par zéro impossible.");
        }

        return a / b;
    }
}

module.exports = Calculator;
import _Big from "big.js";
import _Decimal from "decimal.js-light";
import JSBI from "jsbi";
import invariant from "tiny-invariant";
import toFormat from "toformat";

import { BigintIsh, Rounding } from "../../constants";

const Decimal = toFormat(_Decimal);
const Big = toFormat(_Big);

const toSignificantRounding = {
    [Rounding.ROUND_DOWN]: Decimal.ROUND_DOWN,
    [Rounding.ROUND_HALF_UP]: Decimal.ROUND_HALF_UP,
    [Rounding.ROUND_UP]: Decimal.ROUND_UP,
};

const toFixedRounding = {
    [Rounding.ROUND_DOWN]: _Big.roundDown,
    [Rounding.ROUND_HALF_UP]: _Big.roundHalfUp,
    [Rounding.ROUND_UP]: _Big.roundUp,
};

export default class Fraction {
    public readonly numerator: JSBI;
    public readonly denominator: JSBI;

    public constructor(numerator: BigintIsh, denominator: BigintIsh = JSBI.BigInt(1)) {
        this.numerator = JSBI.BigInt(numerator);
        this.denominator = JSBI.BigInt(denominator);
    }

    // performs floor division
    public get quotient(): JSBI {
        return JSBI.divide(this.numerator, this.denominator);
    }

    // remainder after floor division
    public get remainder(): Fraction {
        return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator);
    }

    public invert(): Fraction {
        return new Fraction(this.denominator, this.numerator);
    }

    public add(other: Fraction | BigintIsh): Fraction {
        const otherParsed = other instanceof Fraction ? other : new Fraction(JSBI.BigInt(other));
        if (JSBI.equal(this.denominator, otherParsed.denominator)) {
            return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator);
        }
        return new Fraction(
            JSBI.add(
                JSBI.multiply(this.numerator, otherParsed.denominator),
                JSBI.multiply(otherParsed.numerator, this.denominator),
            ),
            JSBI.multiply(this.denominator, otherParsed.denominator),
        );
    }

    public subtract(other: Fraction | BigintIsh): Fraction {
        const otherParsed = other instanceof Fraction ? other : new Fraction(JSBI.BigInt(other));
        if (JSBI.equal(this.denominator, otherParsed.denominator)) {
            return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator);
        }
        return new Fraction(
            JSBI.subtract(
                JSBI.multiply(this.numerator, otherParsed.denominator),
                JSBI.multiply(otherParsed.numerator, this.denominator),
            ),
            JSBI.multiply(this.denominator, otherParsed.denominator),
        );
    }

    public lessThan(other: Fraction | BigintIsh): boolean {
        const otherParsed = other instanceof Fraction ? other : new Fraction(JSBI.BigInt(other));
        return JSBI.lessThan(
            JSBI.multiply(this.numerator, otherParsed.denominator),
            JSBI.multiply(otherParsed.numerator, this.denominator),
        );
    }

    public equalTo(other: Fraction | BigintIsh): boolean {
        const otherParsed = other instanceof Fraction ? other : new Fraction(JSBI.BigInt(other));
        return JSBI.equal(
            JSBI.multiply(this.numerator, otherParsed.denominator),
            JSBI.multiply(otherParsed.numerator, this.denominator),
        );
    }

    public greaterThan(other: Fraction | BigintIsh): boolean {
        const otherParsed = other instanceof Fraction ? other : new Fraction(JSBI.BigInt(other));
        return JSBI.greaterThan(
            JSBI.multiply(this.numerator, otherParsed.denominator),
            JSBI.multiply(otherParsed.numerator, this.denominator),
        );
    }

    public multiply(other: Fraction | BigintIsh): Fraction {
        const otherParsed = other instanceof Fraction ? other : new Fraction(JSBI.BigInt(other));
        return new Fraction(
            JSBI.multiply(this.numerator, otherParsed.numerator),
            JSBI.multiply(this.denominator, otherParsed.denominator),
        );
    }

    public divide(other: Fraction | BigintIsh): Fraction {
        const otherParsed = other instanceof Fraction ? other : new Fraction(JSBI.BigInt(other));
        return new Fraction(
            JSBI.multiply(this.numerator, otherParsed.denominator),
            JSBI.multiply(this.denominator, otherParsed.numerator),
        );
    }

    public toSignificant(
        significantDigits: number,
        format: object = { groupSeparator: "" },
        rounding: Rounding = Rounding.ROUND_HALF_UP,
    ): string {
        invariant(Number.isInteger(significantDigits), `${significantDigits} is not an integer.`);
        invariant(significantDigits > 0, `${significantDigits} is not positive.`);

        Decimal.set({ precision: significantDigits + 1, rounding: toSignificantRounding[rounding] });
        const quotient = new Decimal(this.numerator.toString())
            .div(this.denominator.toString())
            .toSignificantDigits(significantDigits);
        return (quotient as unknown as ToFormattable).toFormat(quotient.decimalPlaces(), format);
    }

    public toFixed(
        decimalPlaces: number,
        format: object = { groupSeparator: "" },
        rounding: Rounding = Rounding.ROUND_HALF_UP,
    ): string {
        invariant(Number.isInteger(decimalPlaces), `${decimalPlaces} is not an integer.`);
        invariant(decimalPlaces >= 0, `${decimalPlaces} is negative.`);

        Big.DP = decimalPlaces;
        Big.RM = toFixedRounding[rounding];
        return (
            new Big(this.numerator.toString()).div(this.denominator.toString()) as unknown as ToFormattable
        ).toFormat(decimalPlaces, format);
    }
}

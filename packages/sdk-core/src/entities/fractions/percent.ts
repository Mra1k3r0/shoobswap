import JSBI from "jsbi";
import { Rounding } from "../../constants";
import Fraction from "./fraction";

const _100_PERCENT = new Fraction(JSBI.BigInt(100));

export default class Percent extends Fraction {
    public override toSignificant(significantDigits: number = 5, format?: object, rounding?: Rounding): string {
        return this.multiply(_100_PERCENT).toSignificant(significantDigits, format, rounding);
    }

    public override toFixed(decimalPlaces: number = 2, format?: object, rounding?: Rounding): string {
        return this.multiply(_100_PERCENT).toFixed(decimalPlaces, format, rounding);
    }
}

export default class StringUtils {
    public static castToNumber( value: string ): number {
        const numbers = ['0','1','2','3','4','5','6','7','8','9'];
        const numberValuesOnly = value.split('').filter( x => numbers.includes(x) ).join('');
        return Number(numberValuesOnly);
    }
}
import {GenerateId} from "../../domain/util/GenerateId";
import {customAlphabet} from "nanoid";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const pidGenerator = customAlphabet(alphabet, 10);

// For product IDs, we only want digits (0-9) and we want exactly 6 digits
const numericAlphabet = '0123456789';
const productIdGenerator = customAlphabet(numericAlphabet, 6);

export class PidGenerator implements GenerateId {

    id(): string {
        return pidGenerator();
    }

    /**
     * Generate a product ID with exactly 6 digits
     * @returns A 6-digit numeric string
     */
    productId(): string {
        return productIdGenerator();
    }
}

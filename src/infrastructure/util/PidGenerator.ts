import {GenerateId} from "../../domain/util/GenerateId";
import {customAlphabet} from "nanoid";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const pidGenerator = customAlphabet(alphabet, 10);

export class PidGenerator implements GenerateId {

    id(): string {
        return pidGenerator();
    }
}
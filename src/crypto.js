import crypto from "node:crypto";
import util from "node:util";

export const randomBytes = util.promisify(crypto.randomBytes);

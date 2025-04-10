import crypto from "crypto";
import fs from "fs";

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
});

console.log("Public Key", publicKey);
console.log("Private key", privateKey);

fs.writeFileSync("keys/private.pem", privateKey);
fs.writeFileSync("keys/public.pem", publicKey);

import fs from "fs"
import rsaPemToJwk from "rsa-pem-to-jwk"

const privateKeyPem = fs.readFileSync("./keys/private.pem", 'utf8');
try {
    const jwk = rsaPemToJwk(privateKeyPem, { use: "sig" }, "public");

    console.log(JSON.stringify(jwk));
} catch (error) {
    console.log(error);

}

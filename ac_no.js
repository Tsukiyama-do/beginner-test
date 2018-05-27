/*
 * ac_no.js - generate keypair and account number, then save them to files.
 *
 * Copyright (c) 2018 Yuichi
 *
 * This software is licensed under the terms of the MIT License.
 * https://kjur.github.io/jsrsasign/license
 *
 * The above copyright and license notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * Please use '-h' option for this script usage.
 * ---------------------------------------------------------
 * DESCRIPTION
 *   This script generates RSA and EC public key pair and
 *   CSR(Certificate Signing Request), then save them as:
 *   - PKCS#8 PEM public key file
 *   - PKCS#8 PEM encrypted private key file
 *   - PEM CSR file
 *
 * USAGE
 *   Genearte yyy.{pub,prv,csr} by default
 *   (RSA 2048 with password "passwd" and CSR for /C=US/O=TEST)
 *   $ nodemon ac_no.js kama00001
 *
 */


var program = require('commander');
var rs = require('jsrsasign');
var rsu = require('jsrsasign-util');
var path = require('path');
var fs = require('fs');
const createKeccakHash = require('keccak');

program
  .version('1.0.2 (2018-Apr-28)')
  .description('generate keypair and account number of 40 hex, then save them to nickname.{pub,prv,csr} nickname.{hash}')
  .usage('[account nick name]')
  .parse(process.argv);

var nickname = program.args[0];

var dn = "/C=US/O=TEST";
var keyalg = "EC";
var keyopt, sigalg;
if (keyalg === "RSA") {
   keyopt = parseInt(2048);
   sigalg = "SHA256withRSA";
} else {
   keyopt = "secp256r1";
   sigalg = "SHA256withECDSA";
}
var pass = "hello";

var pubFile = "./master/" + nickname + ".pub";
var prvFile = "./master/" + nickname + ".prv";
var csrFile = "./master/" + nickname + ".csr";
var actFile = "./master/" + nickname + ".hash";

console.log("program.args.length=" + program.args.length);
console.log("program.args are nickname : " + program.args[0] + " dn : " + dn + " keyalg : " + keyalg + " curve : " + keyopt + " pass : " + pass );

console.log("generating keypair...");
var kp = rs.KEYUTIL.generateKeypair(keyalg, keyopt);
console.log("done.");
var prvKey = kp.prvKeyObj;
var pubKey = kp.pubKeyObj;

var csr = rs.asn1.csr.CSRUtil.newCSRPEM({
    subject: {str: dn},
    sbjpubkey: pubKey,
    sigalg: sigalg,
    sbjprvkey: prvKey
});

rsu.saveFile(pubFile, rs.KEYUTIL.getPEM(pubKey));
rsu.saveFile(prvFile, rs.KEYUTIL.getPEM(prvKey, "PKCS8PRV", pass));
rsu.saveFile(csrFile, csr);
console.log("Keypair is saved.")
const buffer1 = new Buffer(fs.readFileSync(pubFile));
const buffpk = Buffer.allocUnsafe(127);

buffer1.copy(buffpk, 0, 28,92)
buffer1.copy(buffpk, 64, 94,154)


// console.log("result is " + buffpk);

// console.log("hash is 256 " + createKeccakHash('keccak256').update(buffpk).digest('hex'));

console.log("hash is 256 - 20 bytes " + createKeccakHash('keccak256').update(buffpk).digest('hex').slice(-40));

rsu.saveFile(actFile,createKeccakHash('keccak256').update(buffpk).digest('hex').slice(-40));

console.log("all save done.");

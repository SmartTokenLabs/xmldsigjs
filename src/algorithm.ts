import { Convert } from "xmljs";
import { Application } from "./application";

export type BASE64 = string;

export interface IAlgorithm {
    algorithm: Algorithm;
    xmlNamespace: string;
    getAlgorithmName(): string;
}

export interface IHashAlgorithm extends IAlgorithm {
    getHash(xml: string): PromiseLike<ArrayBuffer>;
}

export interface IHashAlgorithmConstructable {
    new (): IHashAlgorithm;
}

export abstract class XmlAlgorithm implements IAlgorithm {
    algorithm: Algorithm;
    xmlNamespace: string;
    getAlgorithmName(): string {
        return this.xmlNamespace;
    }
}

export abstract class HashAlgorithm extends XmlAlgorithm implements IHashAlgorithm {
    getHash(xml: Uint8Array | string | Node) {
        // console.log("HashedInfo:", xml);
        let buf: ArrayBufferView;
        if (typeof xml === "string") {
            // C14N transforms
            buf = Convert.FromString(xml, "utf8");
        }
        else if (xml instanceof Uint8Array) {
            // base64 transform
            buf = xml;
        }
        else {
            // enveloped signature transform
            let txt = new XMLSerializer().serializeToString(xml);
            buf = Convert.FromString(txt, "utf8");
        }
        return Application.crypto.subtle.digest(this.algorithm, buf);
    }
}

export interface ISignatureAlgorithm extends IAlgorithm {
    getSignature(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm): PromiseLike<ArrayBuffer>;
    verifySignature(signedInfo: string, key: CryptoKey, signatureValue: string, algorithm?: Algorithm): PromiseLike<boolean>;
}

export interface ISignatureAlgorithmConstructable {
    new (): ISignatureAlgorithm;
}

export abstract class SignatureAlgorithm extends XmlAlgorithm implements ISignatureAlgorithm {
    /**
     * Sign the given string using the given key
     */
    getSignature(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm) {
        return Application.crypto.subtle.sign(algorithm as any, signingKey, Convert.FromString(signedInfo, "binary"));
    }

    /**
    * Verify the given signature of the given string using key
    */
    verifySignature(signedInfo: string, key: CryptoKey, signatureValue: string, algorithm?: Algorithm) {
        let _signatureValue = Convert.FromString(signatureValue, "binary");
        // console.log("SignatureValue:", Convert.ToBase64String(Convert.FromBufferString(_signatureValue)));
        let _signedInfo = Convert.FromString(signedInfo, "utf8");
        // console.log("SignedInfo:", Convert.FromBufferString(_signedInfo));
        return Application.crypto.subtle.verify((algorithm || this.algorithm) as any, key, _signatureValue, _signedInfo);
    }
}
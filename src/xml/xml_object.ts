import { XmlCollection, XmlObject } from "@tokenscript/xml-core";
import { XmlElement } from "@tokenscript/xml-core";

import { XmlSignature } from "./xml_names";

@XmlElement({
    localName: "xmldsig",
    namespaceURI: XmlSignature.NamespaceURI,
    prefix: XmlSignature.DefaultPrefix,
})
export abstract class XmlSignatureObject extends XmlObject { }

@XmlElement({
    localName: "xmldsig_collection",
    namespaceURI: XmlSignature.NamespaceURI,
    prefix: XmlSignature.DefaultPrefix,
})
export abstract class XmlSignatureCollection<I extends XmlSignatureObject> extends XmlCollection<I> { }

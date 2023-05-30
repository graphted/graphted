// import mxgraph and typscript libraries
import * as MxTypes from "mxgraph"; // <- import types only
import mx from "../mx";
import mxCodec from "./MxCodecFrameworkFix"; // <- fixes global required only for decoding (window[] call)

export function encode(obj:any) {
  //encode current style
  const encoder = new mxCodec();
  const currentStyleSheetXml = encoder.encode(obj);
  const currentStyleSheetXmlString = mx.mxUtils.getPrettyXml(currentStyleSheetXml);
  console.log("encoded:", obj, "\nto xml", currentStyleSheetXmlString);
  return currentStyleSheetXmlString;
}

/**
 * Requires begin and endUpdate environment
 * @param graph
 * @param xmlString
 * @returns The function returns the passed in object or the new instance if no object was given.
 */
export function decode(xmlString:string, into?: any) {
  const doc = mx.mxUtils.parseXml(xmlString);
  const codec = new mxCodec(doc);
  if (into) {
    return codec.decode(doc.documentElement, into);
  } else {
    return codec.decode(doc.documentElement);
  }
}

export function saveGraph(graph:MxTypes.mxGraph) {
  //encoded current stylesheet
  return encode(graph.getModel());
}


export function printDivGraph(id:string, graph:MxTypes.mxGraph, filename?:string) {
  // get page format default is A4
  let pageFormat = graph.pageFormat || mx.mxConstants.PAGE_FORMAT_A4_PORTRAIT;

  //scaling extracted from Editor.js
  let printScale = 1;

  // Workaround to match available paper size in actual print output
  printScale *= 0.75;
  // Applies print scale
  pageFormat = mx.mxRectangle.fromRectangle(pageFormat);
  pageFormat.width = Math.ceil(pageFormat.width * printScale);
  pageFormat.height = Math.ceil(pageFormat.height * printScale);
  //TODO: offer style options getPageFormats()
  const divContents = document.getElementById(id)?.innerHTML;
  if (divContents) {
    const a:Window = window.open("", "", "height="+pageFormat.height+", width="+pageFormat.width+"\"")!;
    const windowTitle = filename ? filename : "Print Preview";
    a.document.write("<html>");
    a.document.write("<head><title>" + windowTitle+ "</title></head>");
    a.document.write("<body>");
    a.document.write(divContents);
    a.document.write("</body></html>");
    a.document.close();
    a.print();
    a.close();
  } else {
    alert("no content available to be printed");
  }
}

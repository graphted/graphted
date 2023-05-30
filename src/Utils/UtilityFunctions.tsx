//* *********************************************** */
// General utility functions
//* *********************************************** */

import {mxCell, mxStylesheet, StyleMap} from "mxgraph";
import mx from "../mx";
import {RGBColor} from "react-color";
import cssColorNames from "css-color-names";

/**
 *
 * @param color color in RGBA format
 * @returns
 */
export function rgbaColorString(color:RGBColor) {
  if (color.a || color.a===0) {
    return `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`;
  } else {
    return `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ 1 })`;
  }
}

export function hexToRgba(hexColor:string) : RGBColor | undefined {
  // split into each color string
  const rgbHexPairs:string[]|null = hexColor.match(/(?!#).{1,2}/g);
  if (rgbHexPairs?.length === 3) {
    return {r: parseInt(rgbHexPairs[0], 16), g: parseInt(rgbHexPairs[1], 16), b: parseInt(rgbHexPairs[2], 16), a: 1};
  }
}

function isRgbaValid(color:RGBColor) {
  const isRValid = (color.r >= 0) && (color.r <= 255);
  const isGValid = (color.g >= 0) && (color.g <= 255);
  const isBValid = (color.b >= 0) && (color.b <= 255);
  // decimal percentage 0.0 - 1.0 or not defined
  const isAValid = color.a ? ((color.a >= 0) && (color.a <= 1)) : true;

  return (isRValid && isGValid && isBValid && isAValid);
}

export function rgbaToHexString(color:RGBColor) {
  const numToStr = (number:number) => number.toString(16).padStart(2, "0");
  // split into each color string
  return "#" + numToStr(color.r) + numToStr(color.g) + numToStr(color.b);
}

/**
 * Gets RGBA color from hex or css-colorname
 * @param color
 * @returns
 */
export function getRgba(color:string | undefined, useDefault= true): RGBColor | undefined {
  const defaultColor = {r: 255, g: 255, b: 255, a: 1};
  if ((color=== undefined || color === "none")) {
    console.error("color is undefinded");
    return useDefault ? defaultColor : undefined;
  }
  const colorString = color.toLowerCase().replaceAll(" ", "");

  // direct name
  // @ts-ignore
  const colorNameAsHex:string = cssColorNames[colorString];
  if (colorNameAsHex) return hexToRgba(colorNameAsHex)!;

  const rgbaColor = hexToRgba(colorString);
  if (rgbaColor && isRgbaValid(rgbaColor)) return rgbaColor;

  const rgbaRegexp = /^rgba\((?<r>\d{1,3}),(?<g>\d{1,3}),(?<b>\d{1,3}),(?<a>\d(?:.\d+)?)\)$/;
  const rgbaHexPairs = colorString.match(rgbaRegexp);

  if (rgbaHexPairs && rgbaHexPairs.groups) {
    const {r, g, b, a} = rgbaHexPairs.groups;
    return {r: Number(r), g: Number(g), b: Number(b), a: Number(a)};
  }

  console.error("color could not be parsed as RGBA");
  return useDefault ? defaultColor : undefined;
}

/**
 *
 * @param input
 * @param options
 * @returns
 */
export function isInputValid<Type>(input:Type, options:Type[]) {
  for (let i = 0; i < options.length; i++) {
    if (input === options[i]) {
      return true;
    }
  }
  return false;
}
/**
 *
 * @param input
 * @param min
 * @param max
 * @returns
 */
export function isNumberInRange(input:number, min:number, max:number) {
  if (input===null || input===undefined || input<min || input>max) {
    return false;
  }
  return true;
}

export function toCamelCase(input:string) {
  let camelCaseString="";
  for (let i = 0; i < input.length; i++) {
    if (input[i] === " " || input[i] === "\t" ) {
      camelCaseString+= input[i+1].toUpperCase();
      i++;
    } else {
      camelCaseString+= input[i];
    }
  }
  return camelCaseString;
}

export function splitCellToTypes(cells:mxCell[], onlyVisible:boolean = true) {
  const vertexCells:mxCell[] = [];
  const edgeCells:mxCell[] = [];
  const connectableCells:mxCell[] = [];
  const collapsedCells:mxCell[] = [];
  for (let i = 0; i< cells.length; i++) {
    const cell = cells[i];
    if (onlyVisible && !cell.isVisible()) continue;
    if (cell.isVertex() ) vertexCells.push(cell);
    if (cell.isEdge()) edgeCells.push(cell);
    if (cell.isConnectable()) connectableCells.push(cell);
    if (cell.isCollapsed()) collapsedCells.push(cell);
  }
  return {vertexCells, edgeCells, connectableCells, collapsedCells};
}


export function getVertexCells(cells:mxCell[]) {
  return cells.filter((cell) => cell.isVertex());
}

export function getEdgeCells(cells:mxCell[]) {
  return cells.filter((cell) => cell.isEdge());
}

export function getConnectedCells(cells:mxCell[]) {
  return cells.filter((cell) => cell.isConnectable());
}

export function getCollapsedCells(cells:mxCell[]) {
  return cells.filter((cell) => cell.isCollapsed());
}

function prepareCellStyleString(cellStyle:string) {
  return cellStyle && cellStyle.endsWith(";") ? cellStyle.slice(0, -1) : cellStyle;
}

function getStyleSetFromCellStyleString(cellStyle:string): Set<[string, any]> {
  cellStyle = prepareCellStyleString(cellStyle);
  if (cellStyle) {
    const cellStylesTable= cellStyle.split(";").map((pair) => pair.split("="));
    // @ts-ignore
    return new Set(cellStylesTable);
  }
  return new Set();
}

export function styleMapToCellString(styleMap:StyleMap) {
  // dashPattern contains leading space and requires spaces in between values
  //special case line pattern
  return mx.mxUtils.toString(styleMap).replaceAll(" = ", "=").replaceAll("\n", ";");
}

// return type given for mor compatibility with graph.getStylesheet().getDefault(Edge/Vertex)Style()
export function getStyleSet(cell:mxCell) : Set<[string, any]> {
  return getStyleSetFromCellStyleString(cell.getStyle());
}

// return type given for mor compatibility with graph.getStylesheet().getDefault(Edge/Vertex)Style()
export function getStyleSetFromStyleMap(styleMap:StyleMap) : Set<[string, any]> {
  return getStyleSetFromCellStyleString(styleMapToCellString(styleMap));
}

export function getStyleMapFromCellStyleString(cellStyle:string) {
  const cellStylesMap = new Map();
  if (cellStyle) {
    cellStyle.split(";").map((pair) => {
      const entry:string[] = pair.split("=");
      // ignore none valid key value pairs
      if (entry[0].length > 0 && entry[1].length > 0) {
        cellStylesMap.set(entry[0], entry[1]);
      }
    });
  }
  return cellStylesMap;
}

export function getAllStyleMapFromCellStyleString(cellStyle:string, cellStylesMap:Map<string, Set<any>> = new Map()) {
  if (cellStyle) {
    cellStyle.split(";").map((pair) => {
      const entry:string[] = pair.split("=");
      const savedElement = cellStylesMap.get(entry[0]);
      if (savedElement) {
        cellStylesMap.set(entry[0], savedElement.add(entry[1]));
      } else {
        const newSet:Set<any> = new Set();
        newSet.add(entry[1]);
        cellStylesMap.set(entry[0], newSet);
      }

    });
  }
  return cellStylesMap;
}


export function getStyleMap(cell:mxCell) {
  const cellStyle:string = prepareCellStyleString(cell.getStyle());
  return getStyleMapFromCellStyleString(cellStyle);
}

export function getStyleMapFromStyleMap(styleMap:StyleMap) : Set<[string, any]> {
  let cellStyle:string = mx.mxUtils.toString(styleMap);
  cellStyle = cellStyle.replaceAll(" ", "").replaceAll("\n", ";");
  return getStyleSetFromCellStyleString(cellStyle);
}

export function getStyleObject(cell:mxCell) {
  const cellStyle:string = prepareCellStyleString(cell.getStyle());
  if (cellStyle) {
    return Object.fromEntries(cellStyle.split(";").map((pair) => pair.split("=")));
  }
  return undefined;
}

export function unionOfSet<T>(setA:Set<T>, setB:Set<T>) {
  const _union = new Set(setA);
  for (const elem of setB) {
    _union.add(elem);
  }
  return _union;
}

/**
 * FIXME: extend to cell specific styles. Currently only loads defaults (edge/vertex)
 * @param vertexStyles
 * @param edgeStyles
 * @param key
 * @param fallback
 * @returns
 */
export function getFromCorrespondingMap(vertexStyles:Map<any, any>, edgeStyles:Map<any, any>, key:string, fallback?:any ) {
  if (vertexStyles && vertexStyles.size > 0) {
    return vertexStyles.get(key);
  } else if (edgeStyles && edgeStyles.size > 0) {
    return edgeStyles.get(key);
  } else {
    return fallback;
  }
}

/**
 * @param cell
 * @param styleSheet
 * @returns style for the given cell or defaultStyle given its celltype (edge or vertex)
 */
export function getCellStyleMapForCellShape(cell:mxCell, styleSheet: mxStylesheet) {
  const cellStyleMap = getStyleMap(cell);
  //FIXME: label and edgeLabel are not considered when only loading shape.
  const cellShape:string = cellStyleMap.get("shape"); // shape attribute is not always present
  const defaultStyle = cell.isVertex() ? styleSheet.getDefaultVertexStyle() : styleSheet.getDefaultEdgeStyle();
  const resultingStyle:StyleMap = {};

  // add original saved styles
  for (const [key, value] of cellStyleMap.entries()) {
    resultingStyle[key] = value;
  }

  // default styles according to shape
  const defaultCellStyle = styleSheet.getCellStyle(cellShape, defaultStyle);
  const defaultCellStyleMap: Map<any, any> = getStyleMapFromCellStyleString(styleMapToCellString(defaultCellStyle));

  for (const [key, value] of defaultCellStyleMap.entries()) {
    // add if not included
    if (!cellStyleMap.has(key) ) {
      resultingStyle[key] = value;
    }
  }

  return resultingStyle;
}

/**
 * return all selected attributes.
 */
export function getStyleAttributes(cells:mxCell[]) {
  let allStyles: Map<string, Set<any>> = new Map();
  for (let i=0; i<cells.length; i++) {
    const cell = cells[i];
    const cellStyle:string = prepareCellStyleString(cell.getStyle());
    allStyles = getAllStyleMapFromCellStyleString(cellStyle, allStyles);
  }
  return allStyles;
}


export function getStyleAttribute(cells:mxCell[], styleAttribute:string) {
  return getStyleAttributes(cells).get(styleAttribute);
}


// src: https://stackoverflow.com/a/56150320
export function jsonMapReplacer(key:any, value:any) {
  //TODO: create named entries "key": string, "value": string to be complient with xml2json
  if (value instanceof Map) {
    let entries:any[] = [];
    for (const [key, val] of value.entries()) {
      entries = entries.concat({"Entry": {"key": key, "value": val}});
    }
    return {
      dataType: "Map",
      // value: Array.from(value.entries()), // or with spread: value: [...value]
      value: entries,
    };
  } else {
    return value;
  }
}

// src: https://stackoverflow.com/a/56150320
export function jsonMapReviver(key:any, value:any) {
  //TODO: create named entries "key": string, "value": string to be complient with xml2json
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      const map = new Map();
      const entries:any[] = value.value;
      //FIXME: doesn't appear to be visible outside
      entries.map((entry) => {
        const key = entry.Entry.key;
        const value = entry.Entry.value;
        map.set(key, value);
      });
      // return new Map(value.value);
      return map;
    }
  }
  return value;
}


export function convertXmlToJson(xml:any):Object| null {
  let json = null;
  const xml2js = require("xml2js");
  const parser = new xml2js.Parser();
  parser.parseString(xml, function(err:any, result:any) {
    json = result;
  });
  return json;
}
/**
 *
 * @param obj Requires every variable in json to be named.
 * @param rootName
 * @returns
 */
export function convertJsonToXml(obj:Object, rootName?:string) {
  const xml2js = require("xml2js");
  const builder = new xml2js.Builder({headless: true, rootName: rootName});
  // const test = builder.buildObject(obj);
  //@ts-ignore
  return builder.buildObject(obj);

}


export function addToMap(input:Map<any, any>, added:Map<any, any>) {
  const result = new Map();
  input.forEach((key, value) => result.set(key, value));
  added.forEach((key, value) => result.set(key, value));
  return result;
}

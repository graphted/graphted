// import mxgraph and typscript libraries
import mx from "../mx";


export interface styleConstants {
    keys: string[];
    values: (string | null)[] | (number | null)[] | (boolean | null)[] | null[];
}

export interface styleFontConstants {
    key: string;
    value: number;
}

export interface simpleStyleEditorOption {
  name: string;
  code: string;
  value?: number;
}

export interface styleEditorOption {
    name: string;
    style: styleConstants;
}

export function getSubOptions(allOptions:any, startIndex:number, size:number = allOptions.length) {
  const subOptions = [];
  for (let i=startIndex; (i< allOptions.length) && (i< size); i++) {
    subOptions.push(allOptions[i]);
  }
  return subOptions;
}

/**
 * Given the current Styles options of a cell returns the corresponding option name
 * //TODO: refactor seems way to complicated
 * //FIXME: default.xml options seem to be favored over actual set options
 * @param optionCanditates
 * @param style
 * @returns option
 */
export function getOptionKeyFromStyle(optionCanditates:styleEditorOption[], styleMap:Map<string, any>) : styleEditorOption[] {
  if (styleMap.size === 0 ) return [];
  const result:styleEditorOption[] = [];
  // style exists in some options
  const possibleOptionCanditate:Set<styleEditorOption> = new Set();
  const possibleOptionStyles:Map<string, any> = new Map();
  for (const option of optionCanditates) {
    for (const styleKey of option.style.keys) {
      if (styleMap.has(styleKey)) {
        // only add options without null values
        possibleOptionCanditate.add(option);
        possibleOptionStyles.set(styleKey, styleMap.get(styleKey));
      }
    }
  }
  // each canditate check full style array in detail
  for (const option of possibleOptionCanditate) {
    console.log(option);
    // null values get filtered out of style attribute when applied
    let optionStyleValues:any[] = option.style.values;
    optionStyleValues = optionStyleValues.filter((val) => val !== null && val !== undefined);
    let isFullyIncluded = optionStyleValues.length === possibleOptionStyles.size;
    if (isFullyIncluded) {
      for (let i = 0; i< option.style.values.length; i++) {
        const styleKey = option.style.keys[i];
        const styleValue = option.style.values[i];
        // null values get filtered out of style attribute when applied
        if (styleValue === null || styleValue === undefined) continue;

        const checkedValue = possibleOptionStyles.get(styleKey);
        if (!possibleOptionStyles.has(styleKey) || !checkedValue || (styleValue !== checkedValue)) {
          isFullyIncluded = false;
        }
      }
      if (isFullyIncluded) {
        result.push(option);
      }
    }
  }

  //TODO: extend for load default styles and stencils
  return result;
}

export function addOptionToMap( option:styleEditorOption, inputMap:Map<string, any>) {
  if (option === undefined || option === null) return;
  for (let i = 0; i < option.style.keys.length; i++) {
    const key =option.style.keys[i];
    const val = option.style.values[i];
    if (val) {
      inputMap.set(key, val);
    }
  }
}


export function getConstantsPerOption() {
  // console.log(mx.mxConstants);
  //TODO: add all possible Constants to a grouped category since some belong to one option
  const possibleConstants = Object.values(mx.mxConstants);
  console.log(possibleConstants);

  for (const key in mx.mxConstants) {
    if (mx.mxConstants.hasOwnProperty(key)) {
      //@ts-ignore
      const value = mx.mxConstants[key];
      console.log(`${key}: ${value}`);
    }
  }

}

export function getBasicShapes() {
  const basicShapes = new Map();
  for (const key in mx.mxConstants) {
    if (mx.mxConstants.hasOwnProperty(key)) {
      //@ts-ignore
      const value = mx.mxConstants[key];
      if (key.startsWith("SHAPE_") ) {
        basicShapes.set(key, value);
      }
    }
  }
  return basicShapes;
}

//*************************************************/
//  Options presets
//*************************************************/

export function getFontFamiliyOptions() {
  return [
    {name: "Arial", code: "Arial"},
    {name: "Dialog", code: "Dialog"},
    {name: "Verdana", code: "Verdana"},
    {name: "Times New Roman", code: "Times"},
    {name: "Courier", code: "Courier"},
    {name: "Georgia", code: "Georgia"},
    {name: "Palatino", code: "Palatino"},
    {name: "Helvetica", code: "Helvetica"},
    {name: "Impact", code: "Impact"},
    {name: "Tahoma", code: "Tahoma"},
    {name: "Trebuchet MS", code: "\"trebuchet MS\""},
    {name: "Gill Sans", code: "\"Gill Sans\""},
    {name: "Lucida Sans", code: "\"lucida sans unicode\""},
  ];
}


export function getLineTypeOptions() {
  return [
    // for all types of cells
    {name: "Solid", style: {keys: [mx.mxConstants.STYLE_DASHED], values: ["0"]}},
    {name: "Dashed", style: {keys: [mx.mxConstants.STYLE_DASHED, mx.mxConstants.STYLE_DASH_PATTERN], values: ["1", null]}},
    {name: "Dotted", style: {keys: [mx.mxConstants.STYLE_DASHED, mx.mxConstants.STYLE_DASH_PATTERN], values: ["1", "1 3"]}},
    // available only for edges
    {name: "Sharp", style: {keys: [mx.mxConstants.STYLE_ROUNDED, mx.mxConstants.STYLE_CURVED], values: ["0", "0"]}},
    {name: "Rounded", style: {keys: [mx.mxConstants.STYLE_ROUNDED, mx.mxConstants.STYLE_CURVED], values: ["1", "0"]}},
    {name: "Curved", style: {keys: [mx.mxConstants.STYLE_ROUNDED, mx.mxConstants.STYLE_CURVED], values: ["0", "1"]}},
  ];
}

export function getGeneralLineTypeOptions() {
  return getSubOptions(getLineTypeOptions(), 0, 3);
}
/**
 * Extracted from Format.js of grapheditor example
 * @returns Options for text alignment inside cells
 */
export function getStyleLabelPositionOptions() {
  return [
    {name: "center", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_CENTER, mx.mxConstants.ALIGN_MIDDLE]}}, // -> default
    {name: "top", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_CENTER, mx.mxConstants.ALIGN_TOP]}},
    {name: "topLeft", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_LEFT, mx.mxConstants.ALIGN_TOP]}},
    {name: "topRight", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_RIGHT, mx.mxConstants.ALIGN_TOP]}},
    {name: "bottom", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_CENTER, mx.mxConstants.ALIGN_BOTTOM]}},
    {name: "bottomLeft", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_LEFT, mx.mxConstants.ALIGN_BOTTOM]}},
    {name: "bottomRight", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_RIGHT, mx.mxConstants.ALIGN_BOTTOM]}},
    {name: "left", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_LEFT, mx.mxConstants.ALIGN_MIDDLE]}},
    {name: "right", style: {keys: [mx.mxConstants.STYLE_LABEL_POSITION, mx.mxConstants.STYLE_VERTICAL_LABEL_POSITION], values: [mx.mxConstants.ALIGN_RIGHT, mx.mxConstants.ALIGN_MIDDLE]}},
  ];
}

export function getAdvancedLabelPositionOptions() {
  return [
    {name: "Left", style: {keys: [mx.mxConstants.STYLE_ALIGN], values: [mx.mxConstants.ALIGN_LEFT, mx.mxConstants.ALIGN_TOP]}},
    {name: "Center", style: {keys: [mx.mxConstants.STYLE_ALIGN], values: [mx.mxConstants.ALIGN_CENTER, mx.mxConstants.ALIGN_TOP]}},
    {name: "Right", style: {keys: [mx.mxConstants.STYLE_ALIGN], values: [mx.mxConstants.ALIGN_RIGHT, mx.mxConstants.ALIGN_TOP]}},
    {name: "Top", style: {keys: [mx.mxConstants.STYLE_ALIGN, mx.mxConstants.STYLE_VERTICAL_ALIGN], values: [mx.mxConstants.ALIGN_CENTER, mx.mxConstants.ALIGN_TOP]}},
    {name: "Top Left", style: {keys: [mx.mxConstants.STYLE_ALIGN, mx.mxConstants.STYLE_VERTICAL_ALIGN], values: [mx.mxConstants.ALIGN_LEFT, mx.mxConstants.ALIGN_TOP]}},
    {name: "Top Right", style: {keys: [mx.mxConstants.STYLE_ALIGN, mx.mxConstants.STYLE_VERTICAL_ALIGN], values: [mx.mxConstants.ALIGN_RIGHT, mx.mxConstants.ALIGN_TOP]}},
    {name: "Bottom", style: {keys: [mx.mxConstants.STYLE_ALIGN, mx.mxConstants.STYLE_VERTICAL_ALIGN], values: [mx.mxConstants.ALIGN_CENTER, mx.mxConstants.ALIGN_BOTTOM]}},
    {name: "Bottom Left", style: {keys: [mx.mxConstants.STYLE_ALIGN, mx.mxConstants.STYLE_VERTICAL_ALIGN], values: [mx.mxConstants.ALIGN_LEFT, mx.mxConstants.ALIGN_BOTTOM]}},
    {name: "Bottom Right", style: {keys: [mx.mxConstants.STYLE_ALIGN, mx.mxConstants.STYLE_VERTICAL_ALIGN], values: [mx.mxConstants.ALIGN_RIGHT, mx.mxConstants.ALIGN_BOTTOM]}},
  ];
}

export function getLabelWritingDirectionOptions() {
  return [
    // {name: "Automatic", style: {keys: [mx.mxConstants.STYLE_TEXT_DIRECTION], values: [mx.mxConstants.TEXT_DIRECTION_AUTO, mx.mxConstants.ALIGN_TOP]}},
    // {name: "Right to Left", style: {keys: [mx.mxConstants.STYLE_TEXT_DIRECTION], values: [mx.mxConstants.TEXT_DIRECTION_RTL, mx.mxConstants.ALIGN_TOP]}},
    // {name: "Left to Right", style: {keys: [mx.mxConstants.STYLE_TEXT_DIRECTION], values: [mx.mxConstants.TEXT_DIRECTION_LTR, mx.mxConstants.ALIGN_TOP]}},

    {name: "Automatic", style: {keys: [mx.mxConstants.STYLE_TEXT_DIRECTION], values: [mx.mxConstants.TEXT_DIRECTION_AUTO]}},
    {name: "Right to Left", style: {keys: [mx.mxConstants.STYLE_TEXT_DIRECTION], values: [mx.mxConstants.TEXT_DIRECTION_RTL]}},
    {name: "Left to Right", style: {keys: [mx.mxConstants.STYLE_TEXT_DIRECTION], values: [mx.mxConstants.TEXT_DIRECTION_LTR]}},

  ];
}

export function getFontEditingOptions() {
  return [
    {name: "Bold", style: {key: mx.mxConstants.STYLE_FONTSTYLE, value: mx.mxConstants.FONT_BOLD}},
    {name: "Italic", style: {key: mx.mxConstants.STYLE_FONTSTYLE, value: mx.mxConstants.FONT_ITALIC}},
    {name: "Strikethrough", style: {key: mx.mxConstants.STYLE_FONTSTYLE, value: mx.mxConstants.FONT_STRIKETHROUGH}},
    {name: "Underline", style: {key: mx.mxConstants.STYLE_FONTSTYLE, value: mx.mxConstants.FONT_UNDERLINE}},
  ];
}


export function getLabelPositionOptions() {
  return getSubOptions(getAdvancedLabelPositionOptions(), 0, 3);
}


export function getCellAlignmentOptions() {
  return [
    {name: "Left", code: mx.mxConstants.ALIGN_LEFT},
    {name: "Center", code: mx.mxConstants.ALIGN_CENTER},
    {name: "Right", code: mx.mxConstants.ALIGN_RIGHT},
    {name: "Top", code: mx.mxConstants.ALIGN_TOP},
    {name: "Middle", code: mx.mxConstants.ALIGN_MIDDLE},
    {name: "Bottom", code: mx.mxConstants.ALIGN_BOTTOM},
  ];
}

export function getTextAlignmentOptions() {
  return [
    {name: "Left", style: {keys: [mx.mxConstants.STYLE_ALIGN], values: [mx.mxConstants.ALIGN_LEFT]}},
    {name: "Center", style: {keys: [mx.mxConstants.STYLE_ALIGN], values: [mx.mxConstants.ALIGN_CENTER]}},
    {name: "Right", style: {keys: [mx.mxConstants.STYLE_ALIGN], values: [mx.mxConstants.ALIGN_RIGHT]}},
  ];
}

// start and end arrow options are identical, even tho the key differs.
export function getArrowTypeOptions() {
  return [
    {name: "Classic", code: mx.mxConstants.ARROW_CLASSIC},
    {name: "Classic Thin", code: mx.mxConstants.ARROW_CLASSIC_THIN},
    {name: "Block", code: mx.mxConstants.ARROW_BLOCK},
    {name: "Block Thin", code: mx.mxConstants.ARROW_BLOCK_THIN},
    {name: "Diamond", code: mx.mxConstants.ARROW_DIAMOND},
    {name: "Diamond Thin", code: mx.mxConstants.ARROW_DIAMOND_THIN},
    {name: "Open", code: mx.mxConstants.ARROW_OPEN},
    {name: "Open Thin", code: mx.mxConstants.ARROW_OPEN_THIN},
    {name: "None", code: mx.mxConstants.NONE},
  ];
}

// adapted from src: this.editorUi.menus.edgeStyleChange & Toolbar.js
export function getWaypointStyleOptions() {
  return [
    {name: "Straight", style: {keys: [mx.mxConstants.STYLE_EDGE, mx.mxConstants.STYLE_CURVED, mx.mxConstants.STYLE_NOEDGESTYLE], values: [null, null, null]}, sprite: "geIcon geSprite geSprite-straight"},
    {name: "Orthogonal", style: {keys: [mx.mxConstants.STYLE_EDGE, mx.mxConstants.STYLE_CURVED, mx.mxConstants.STYLE_NOEDGESTYLE], values: ["orthogonalEdgeStyle", null, null]}, sprite: "geIcon geSprite geSprite-orthogonal"},
    {name: "Simple Horizontal", style: {keys: [mx.mxConstants.STYLE_EDGE, mx.mxConstants.STYLE_ELBOW, mx.mxConstants.STYLE_CURVED, mx.mxConstants.STYLE_NOEDGESTYLE], values: ["elbowEdgeStyle", null, null, null]}, sprite: "geIcon geSprite geSprite-horizontalelbow"},
    {name: "Simple vertical", style: {keys: [mx.mxConstants.STYLE_EDGE, mx.mxConstants.STYLE_ELBOW, mx.mxConstants.STYLE_CURVED, mx.mxConstants.STYLE_NOEDGESTYLE], values: ["elbowEdgeStyle", "vertical", null, null]}, sprite: "geIcon geSprite geSprite-verticalelbow"},
    {name: "Isometric Horizontal", style: {keys: [mx.mxConstants.STYLE_EDGE, mx.mxConstants.STYLE_ELBOW, mx.mxConstants.STYLE_CURVED, mx.mxConstants.STYLE_NOEDGESTYLE], values: ["isometricEdgeStyle", null, null, null]}, sprite: "geIcon geSprite geSprite-horizontalisometric"},
    {name: "Isometric Vertical", style: {keys: [mx.mxConstants.STYLE_EDGE, mx.mxConstants.STYLE_ELBOW, mx.mxConstants.STYLE_CURVED, mx.mxConstants.STYLE_NOEDGESTYLE], values: ["isometricEdgeStyle", "vertical", null, null]}, sprite: "geIcon geSprite geSprite-verticalisometric"},
    {name: "Curved", style: {keys: [mx.mxConstants.STYLE_EDGE, mx.mxConstants.STYLE_CURVED, mx.mxConstants.STYLE_NOEDGESTYLE], values: ["orthogonalEdgeStyle", "1", null]}, sprite: "geIcon geSprite geSprite-curved"},
    {name: "Entity-relation", style: {keys: [mx.mxConstants.STYLE_EDGE, mx.mxConstants.STYLE_CURVED, mx.mxConstants.STYLE_NOEDGESTYLE], values: ["entityRelationEdgeStyle", null, null]}, sprite: "geIcon geSprite geSprite-entity"},
  ];
}

// adapted from src: this.editorUi.menus.edgeStyleChange & Toolbar.js
// FIXME: only simple Arrow recognized
export function getConnectionStyleOptions() {
  return [
    {name: "Line", style: {keys: [mx.mxConstants.STYLE_SHAPE, "width"], values: [null, null]}, sprite: "geIcon geSprite geSprite-connection"},
    {name: "Link", style: {keys: [mx.mxConstants.STYLE_SHAPE, "width"], values: ["link", null]}, sprite: "geIcon geSprite geSprite-linkedge"},
    {name: "Arrow", style: {keys: [mx.mxConstants.STYLE_SHAPE, "width"], values: ["flexArrow", null]}, sprite: "geIcon geSprite geSprite-arrow"},
    {name: "Simple Arrow", style: {keys: [mx.mxConstants.STYLE_SHAPE, "width"], values: ["arrow", null]}, sprite: "geIcon geSprite geSprite-simplearrow"},
  ];
}

export function getSpacingOptions() {
  return [
    {name: "Global", style: {keys: [mx.mxConstants.STYLE_SPACING], values: [0]}},
    {name: "Top", style: {keys: [mx.mxConstants.STYLE_SPACING_TOP], values: [0]}},
    {name: "Left", style: {keys: [mx.mxConstants.STYLE_SPACING_LEFT], values: [0]}},
    {name: "Bottom", style: {keys: [mx.mxConstants.STYLE_SPACING_BOTTOM], values: [0]}},
    {name: "Right", style: {keys: [mx.mxConstants.STYLE_SPACING_RIGHT], values: [0]}},
  ];
}


export function getPerimeterSpacingOptions() {
  return [
    {name: "Perimeter", style: {keys: [mx.mxConstants.STYLE_PERIMETER_SPACING], values: [0]}},
    {name: "Source", style: {keys: [mx.mxConstants.STYLE_SOURCE_PERIMETER_SPACING], values: [0]}},
    {name: "Target", style: {keys: [mx.mxConstants.STYLE_TARGET_PERIMETER_SPACING], values: [0]}},
  ];
}

export function getDirectionOptions() {
  return [
    {name: "north", style: {keys: [mx.mxConstants.STYLE_DIRECTION], values: [mx.mxConstants.DIRECTION_NORTH]}},
    {name: "east", style: {keys: [mx.mxConstants.STYLE_DIRECTION], values: [mx.mxConstants.DIRECTION_EAST]}},
    {name: "south", style: {keys: [mx.mxConstants.STYLE_DIRECTION], values: [mx.mxConstants.DIRECTION_SOUTH]}},
    {name: "west", style: {keys: [mx.mxConstants.STYLE_DIRECTION], values: [mx.mxConstants.DIRECTION_WEST]}},
  ];
}

export function getPageFormats() {
  return [{key: "letter", title: "US-Letter (8,5\" x 11\")", format: mx.mxConstants.PAGE_FORMAT_LETTER_PORTRAIT},
    {key: "legal", title: "US-Legal (8,5\" x 14\")", format: new mx.mxRectangle(0, 0, 850, 1400)},
    {key: "tabloid", title: "US-Tabloid (11\" x 17\")", format: new mx.mxRectangle(0, 0, 1100, 1700)},
    {key: "executive", title: "US-Executive (7\" x 10\")", format: new mx.mxRectangle(0, 0, 700, 1000)},
    {key: "a0", title: "A0 (841 mm x 1189 mm)", format: new mx.mxRectangle(0, 0, 3300, 4681)},
    {key: "a1", title: "A1 (594 mm x 841 mm)", format: new mx.mxRectangle(0, 0, 2339, 3300)},
    {key: "a2", title: "A2 (420 mm x 594 mm)", format: new mx.mxRectangle(0, 0, 1654, 2336)},
    {key: "a3", title: "A3 (297 mm x 420 mm)", format: new mx.mxRectangle(0, 0, 1169, 1654)},
    {key: "a4", title: "A4 (210 mm x 297 mm)", format: mx.mxConstants.PAGE_FORMAT_A4_PORTRAIT},
    {key: "a5", title: "A5 (148 mm x 210 mm)", format: new mx.mxRectangle(0, 0, 583, 827)},
    {key: "a6", title: "A6 (105 mm x 148 mm)", format: new mx.mxRectangle(0, 0, 413, 583)},
    {key: "a7", title: "A7 (74 mm x 105 mm)", format: new mx.mxRectangle(0, 0, 291, 413)},
    {key: "b4", title: "B4 (250 mm x 353 mm)", format: new mx.mxRectangle(0, 0, 980, 1390)},
    {key: "b5", title: "B5 (176 mm x 250 mm)", format: new mx.mxRectangle(0, 0, 690, 980)},
    {key: "16-9", title: "16:9 (1600 x 900)", format: new mx.mxRectangle(0, 0, 1600, 900)},
    {key: "16-10", title: "16:10 (1920 x 1200)", format: new mx.mxRectangle(0, 0, 1920, 1200)},
    {key: "4-3", title: "4:3 (1600 x 1200)", format: new mx.mxRectangle(0, 0, 1600, 1200)},
    {key: "custom", title: mx.mxResources.get("custom"), format: null}];
}

export function getMetadataOptions() {
  return [
    // dashed
    {name: "data_source", style: {keys: [mx.mxConstants.STYLE_STROKECOLOR, mx.mxConstants.STYLE_STROKEWIDTH, mx.mxConstants.STYLE_DASHED], values: ["rgba(255, 0, 0, 1)", "5", "1"]}},
    // dotted
    {name: "data_provider", style: {keys: [mx.mxConstants.STYLE_STROKECOLOR, mx.mxConstants.STYLE_DASHED, mx.mxConstants.STYLE_DASH_PATTERN], values: ["rgba(0, 0, 255, 1)", "1", "1 3"]}},
    // dashed
    {name: "data_store", style: {keys: [mx.mxConstants.STYLE_STROKECOLOR, mx.mxConstants.STYLE_STROKEWIDTH, mx.mxConstants.STYLE_DASHED], values: ["strokeColor=rgba(0, 255, 0, 1)", "5", "1"]}},
  ];
}

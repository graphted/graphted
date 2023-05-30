// import mxgraph and typscript libraries
import * as MxTypes from "mxgraph"; // <- import types only
import mx from "../mx";
import {styleConstants} from "./StyleEditorOptions";
import {RGBColor} from "react-color";
import {rgbaColorString, isInputValid, isNumberInRange, rgbaToHexString} from "./UtilityFunctions";


//* *********************************************** */
//    Style Helper functions
//* *********************************************** */

/**
 * General function for all mxConstants.STYLE_* options. Sets multiple style options at once.
 * @param graph
 * @param styleConstant
 * @param value
 */
export function setStyles(graph:MxTypes.mxGraph, styleConstants:string[], values:(string | null)[] | (number | null)[]| (boolean | null)[] | null[]) {
  graph.getModel().beginUpdate();

  if (styleConstants && styleConstants.length >0 && styleConstants.length !== values?.length) {
    console.log("Potential Style error at " +styleConstants[0] + ", since size of keys:='" + styleConstants.length + "' and size of values='" + values?.length + "' differ.");
  }
  try {
    for (let i = 0; i < styleConstants.length; i++) {
      //If no value is specified, then the respective key is removed from the styles.
      graph.setCellStyles(styleConstants[i], values[i]);
    }
    graph.fireEvent( new mx.mxEventObject("styleChanged", "keys", styleConstants, "values", values, "cells", graph.getSelectionCells()));
  } finally {
    graph.getModel().endUpdate();
  }
}

/**
 * Remove multiple styles
 * @param graph
 * @param styleConstants
 */
export function removeStyles(graph:MxTypes.mxGraph, styleConstants:string[]) {
  const emptyValues = new Array(styleConstants.length).fill(null);
  setStyles(graph, styleConstants, emptyValues);
}

/**
 * General function for all mxConstants.STYLE_* options. Sets multiple style options at once.
 * @param graph
 * @param styleConstant
 * @param value
 */
export function setStylesOfCells(graph:MxTypes.mxGraph, cells:MxTypes.mxCell[], styleConstants:string[], values:(string | null)[] | (number | null)[]| (boolean | null)[] | null[]) {
  graph.getModel().beginUpdate();

  if (styleConstants && styleConstants.length >0 && styleConstants.length !== values?.length) {
    console.log("Potential Style error at " +styleConstants[0] + ", since size of keys:='" + styleConstants.length + "' and size of values='" + values?.length + "' differ.");
  }
  try {
    for (let i = 0; i < styleConstants.length; i++) {
      graph.setCellStyles(styleConstants[i], values[i], cells);
    }
    graph.fireEvent( new mx.mxEventObject("styleChanged", "keys", styleConstants, "values", values, "cells", cells));
  } finally {
    graph.getModel().endUpdate();
  }
}

export function onSelectionChange(sender:any, evt:any) {
  const cells:MxTypes.mxCell = evt.getProperty("removed");
  console.log("selection elements onSelectionChange {");
  console.log(cells);
  for (let i = 0; i < cells.length; i++) {
    console.log("Cell[" + i + "] {");
    console.log(cells[i].style);
    console.log(cells[i].geometry);
    console.log(" } ");
  }
  console.log("selection changed onSelectionChange }");
}

//* *********************************************** */
//  Font options
//* *********************************************** */

/**
 *
 * @param graph
 * @param styleConstants  Defines the key for the fontStyle style.
 * @param values Values may be any logical AND (sum) of , and . The type of the value is int. Value is "fontStyle".
 */
export function toggleFontStyle(graph:MxTypes.mxGraph, styleConstant:string, value:number) {
  if (graph.cellEditor.getEditingCell() !==null) {
    console.log("Currently Editing Cell: ");
    console.log(graph.cellEditor.getEditingCell());
    console.log("Cancel editing Cell");
    graph.stopEditing(true);
  }
  graph.getModel().beginUpdate();
  try {
    graph.toggleCellStyleFlags(styleConstant, value);
  } finally {
    graph.getModel().endUpdate();
  }
}

export function setFontColor(graph:MxTypes.mxGraph, color:RGBColor|null = null ) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_FONTCOLOR], [value]);
}

/**
 * Aligns the text/label position
 * @param graph
 * @param direction 'left', 'right' or 'center'
 */
export function setLabelPosition(graph:MxTypes.mxGraph, direction:string) {
  if ( !isInputValid(direction, [mx.mxConstants.ALIGN_LEFT, mx.mxConstants.ALIGN_CENTER, mx.mxConstants.ALIGN_RIGHT])) {
    console.log("Not a valid Label position set!");
    return;
  }
  setStyles(graph, [mx.mxConstants.STYLE_ALIGN], [direction]);
}

/**
 * Rotates Label horizontal
 * @param graph
 */
export function toogleLabelRotation(graph:MxTypes.mxGraph, setHorizontal:boolean) {
  setStyles(graph, [mx.mxConstants.STYLE_HORIZONTAL], [setHorizontal ? "1" : "0"]);
}

/**
 *
 * @param graph
 * @param toggle
 */
export function toogleWordWrap(graph:MxTypes.mxGraph, toggle:boolean) {
  if (toggle) {
    setStyles(graph, [mx.mxConstants.STYLE_WHITE_SPACE], ["wrap"]);
  } else {
    setStyles(graph, [mx.mxConstants.STYLE_WHITE_SPACE], [null]);
  }
}

export function hideLabel(graph:MxTypes.mxGraph, toogle:boolean) {
  if (toogle) {
    setStyles(graph, [mx.mxConstants.STYLE_NOLABEL], [1]);
  } else {
    setStyles(graph, [mx.mxConstants.STYLE_WHITE_SPACE], [0]);
  }
}

/**
 *
 * @param graph
 * @param fontStyle Defines the key for the fontStyle style. Values may be any logical AND (sum) of , and .
 */
export function setFontStyle(graph:MxTypes.mxGraph, fontStyle:number) {
  setStyles(graph, [mx.mxConstants.STYLE_FONTSTYLE], [fontStyle]);
}
/**
 *
 * @param graph
 * @param fontFamily Defines the key for the fontFamily style. Possible values are names such as Arial; Dialog; Verdana; Times New Roman.
 */
export function setFontFamiliy(graph:MxTypes.mxGraph, fontFamily:string) {
  if (fontFamily) {
    setStyles(graph, [mx.mxConstants.STYLE_FONTFAMILY], [fontFamily]);
  }
}
/**
 * Set the Font size of the given selection
 * @param graph
 * @param size fontSize style (in px).
 */
export function setFontsize(graph:MxTypes.mxGraph, size:number) {
  setStyles(graph, [mx.mxConstants.STYLE_FONTSIZE], [size]);
}

/**
 *
 * @param graph
 * @param percentage The type of the value is numeric and the possible range is 0-100.  Value is “opacity”.
 */
export function setOpacity(graph:MxTypes.mxGraph, percentage:number) {
  setStyles(graph, [mx.mxConstants.STYLE_OPACITY], [percentage]);
}


//* *********************************************** */
//  Color options
//* *********************************************** */

export function setIndicatorGradientColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_INDICATOR_GRADIENTCOLOR], [value]);
}

export function setLabelBackgroundColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_LABEL_BACKGROUNDCOLOR], [value]);
}

export function setIndicatorStrokeColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_INDICATOR_STROKECOLOR], [value]);
}

export function setSwimLaneFillColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_SWIMLANE_FILLCOLOR], [value]);
}

export function setLabelBorderColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_LABEL_BORDERCOLOR], [value]);
}

export function setImageBorder(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_IMAGE_BORDER], [value]);
}

export function setSeparatorColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_SEPARATORCOLOR], [value]);
}
// FIXME: results in black cells
export function setGradientColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaToHexString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_GRADIENTCOLOR], [value]);
}

export function setIndicatorColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_INDICATOR_COLOR], [value]);
}

export function setStrokeColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_STROKECOLOR], [value]);
}

export function setLaneColor(graph:MxTypes.mxGraph, color:RGBColor|null = null) {
  const value = color ? rgbaColorString(color) : color;
  setStyles(graph, [mx.mxConstants.STYLE_SWIMLANE_FILLCOLOR], [value]);
}

export function fill(graph:MxTypes.mxGraph, color:RGBColor|null = null, useHex = false) {
  let value;
  if (color) {
    value = useHex ? rgbaToHexString(color) : rgbaColorString(color);
  } else {
    value = null;
  }
  setStyles(graph, [mx.mxConstants.STYLE_FILLCOLOR], [value]);

}

//* *********************************************** */
//  Line and border options
//* *********************************************** */

/**
 *
 * @param graph
 * @param width Defines the key for the strokeWidth style. The type of the value is numeric and the possible range is any non-negative value larger or equal to 1. The value defines the stroke width in pixels. Note: To hide a stroke use strokeColor none.
 */
export function setStrokeWidth(graph:MxTypes.mxGraph, width:number) {
  setStyles(graph, [mx.mxConstants.STYLE_STROKEWIDTH], [width]);
}

export function setStyleShadow(graph:MxTypes.mxGraph, toggle:boolean) {
  setStyles(graph, [mx.mxConstants.STYLE_SHADOW], [toggle? "1" : "0"]);
}

export function setStyleRounded(graph:MxTypes.mxGraph, toggle:boolean) {
  setStyles(graph, [mx.mxConstants.STYLE_ROUNDED], [toggle? "1" : "0"]);
}

/**
 *
 * @param graph
 * @param arrowType use getLineTypeOptions() to get all supported settings
 */
export function setLineStart(graph:MxTypes.mxGraph, arrowType:string) {
  setStyles(graph, [mx.mxConstants.STYLE_STARTARROW], [arrowType]);
}

/**
 *
 * @param graph
 * @param arrowType use getLineTypeOptions() to get all supported settings
 */
export function setLineEnd(graph:MxTypes.mxGraph, arrowType:string) {
  setStyles(graph, [mx.mxConstants.STYLE_ENDARROW], [arrowType]);
}

export function reverseLineArrows(graph:MxTypes.mxGraph, arrowTypeStart:string, arrowTypeEnd:string) {
  setLineStart(graph, arrowTypeEnd);
  setLineEnd(graph, arrowTypeStart);
}
/**
 * rotates the given source
 * @param graph
 * @param degree Defines the key for the rotation style. The type of the value is numeric and the possible range is 0-360.
 */
export function setRotation(graph:MxTypes.mxGraph, degree:number) {
  if (!isNumberInRange(degree, 0, 360)) {
    console.error("rotation must be set between 0 and 360°!");
    return;
  }
  setStyles(graph, [mx.mxConstants.STYLE_ROTATION], [degree]);
}
/**
 * Sets the style based on a style from {@link styleEditorOptions}
 * @param graph
 * @param style
 */
export function setStyle(graph:MxTypes.mxGraph, style:styleConstants) {
  setStyles(graph, style.keys, style.values);
}

export function setPerimeter(graph:MxTypes.mxGraph, value:number) {
  setStyles(graph, [mx.mxConstants.STYLE_PERIMETER_SPACING], [value]);
}
/**
 *
 * @param graph
 * @param align Specifies the alignment. Possible values are all constants in mxConstants with an ALIGN prefix.
 */
export function setCellAlignment(graph:MxTypes.mxGraph, align:string) {
  graph.alignCells(align, graph.getSelectionCells());
}


export function flipImageHorizontal(graph:MxTypes.mxGraph, isFlipped:boolean) {
  graph.toggleCellStyles(mx.mxConstants.STYLE_FLIPH, isFlipped);
}

export function flipImageVertical(graph:MxTypes.mxGraph, isFlipped:boolean) {
  graph.toggleCellStyles(mx.mxConstants.STYLE_FLIPV, isFlipped);
}


export function toggleConstrainPorportions(graph:MxTypes.mxGraph, toggle:boolean) {
  // Variable: STYLE_ASPECT

  //  Defines the key for the aspect style. Possible values are empty or fixed.
  //  If fixed is used then the aspect ratio of the cell will be maintained
  //  when resizing. Default is empty. Value is "aspect".
  if (toggle) {
    setStyles(graph, [mx.mxConstants.STYLE_ASPECT], ["fixed"]);
  } else {
    setStyles(graph, [mx.mxConstants.STYLE_ASPECT], ["empty"]);
  }
}


/**
 * Function: distributeCells
 *
 * Distribuets the centers of the given cells equally along the available
 * horizontal or vertical space.
 *
 * Parameters:
 *
 * horizontal - Boolean that specifies the direction of the distribution.
 * cells - Optional array of <mxCells> to be distributed. Edges are ignored.
 *
 * src copied from: Graph.js from grapheditor example. Added graph instead of this content
 */
export function distributeCells(graph:MxTypes.mxGraph, horizontal:boolean, cells:MxTypes.mxCell[]) {
  if (cells == null) {
    cells = graph.getSelectionCells();
  }

  if (cells != null && cells.length > 1) {
    const vertices = [];
    let max = null;
    let min = null;

    for (let i = 0; i < cells.length; i++) {
      if (graph.getModel().isVertex(cells[i])) {
        const state = graph.view.getState(cells[i]);

        if (state != null) {
          const tmp = (horizontal) ? state.getCenterX() : state.getCenterY();
          max = (max != null) ? Math.max(max, tmp) : tmp;
          min = (min != null) ? Math.min(min, tmp) : tmp;

          vertices.push(state);
        }
      }
    }

    if (vertices.length > 2) {
      vertices.sort(function(a, b) {
        return (horizontal) ? a.x - b.x : a.y - b.y;
      });

      const t = graph.view.translate;
      const s = graph.view.scale;
      // @ts-ignore
      min = min / s - ((horizontal) ? t.x : t.y);
      // @ts-ignore
      max = max / s - ((horizontal) ? t.x : t.y);

      graph.getModel().beginUpdate();
      try {
        const dt = (max - min) / (vertices.length - 1);
        let t0 = min;

        for (let i = 1; i < vertices.length - 1; i++) {
          const pstate = graph.view.getState(graph.model.getParent(vertices[i].cell));
          let geo = graph.getCellGeometry(vertices[i].cell);
          t0 += dt;

          if (geo != null && pstate != null) {
            geo = geo.clone();

            if (horizontal) {
              geo.x = Math.round(t0 - geo.width / 2) - pstate.origin.x;
            } else {
              geo.y = Math.round(t0 - geo.height / 2) - pstate.origin.y;
            }

            graph.getModel().setGeometry(vertices[i].cell, geo);
          }
        }
      } finally {
        graph.getModel().endUpdate();
      }
    }
  }

  return cells;
}

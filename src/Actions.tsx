// import mxgraph and typscript libraries
import * as MxTypes from "mxgraph"; // <- import types only
import {Property, evaluateProperty, getMaxSumOfProperty} from "./iot/data-structure-utils/IotPropertyTypes";
import mx from "./mx";
import mxCodec from "./Utils/MxCodecFrameworkFix";
import * as utilityFunctions from "./Utils/UtilityFunctions";
import * as fileUtils from "./FileUtils";
import * as styleEditorActions from "./Utils/StyleEditorActions";

export function editCell(graph:MxTypes.mxGraph) {
  if (graph.isEnabled()) {
    graph.startEditingAtCell();
  }
}

export function cut(graph:MxTypes.mxGraph) {
  mx.mxClipboard.cut(graph);
}

export function copy(graph:MxTypes.mxGraph) {
  mx.mxClipboard.copy(graph);
}

export function paste(graph:MxTypes.mxGraph) {
  mx.mxClipboard.paste(graph);
}

export function pasteHere(graph:MxTypes.mxGraph, evt:MouseEvent) {
  const cells = mx.mxClipboard.paste(graph);
  moveToMouse(graph, cells, evt);
}

export function getVertexDropLocation(graph:MxTypes.mxGraph, evt: MouseEvent | TouchEvent | DragEvent) {
  const pt = mx.mxUtils.convertPoint(graph.container, mx.mxEvent.getClientX(evt), mx.mxEvent.getClientY(evt));
  return getPointDropLocation(graph, pt);
}

function getPointDropLocation(graph: MxTypes.mxGraph, pt: MxTypes.mxPoint) {
  const tr = graph.view.translate;
  const scale = graph.view.scale;
  const x:number = pt.x / scale - tr.x;
  const y:number = pt.y / scale - tr.y;
  return {x, y};
}

function moveToMouse(graph:MxTypes.mxGraph, cells:MxTypes.mxCell[], evt:MouseEvent) {
  const {x, y} = getVertexDropLocation(graph, evt);
  const boundingBox = graph.getBoundingBoxFromGeometry(cells, true);
  const dx = x - boundingBox.x;
  const dy = y - boundingBox.y;
  graph.cellsMoved(cells, dx, dy);
}

export function duplicate(graph:MxTypes.mxGraph) {
  mx.mxClipboard.copy(graph);
  graph.setSelectionCells(mx.mxClipboard.paste(graph));
}

export function group(graph:MxTypes.mxGraph, border = 0, cells = graph.getSelectionCells()) {
  // group if mulitple items are selected (ignore if they contain groups)
  if (graph.getSelectionCount() > 1) {
    //TODO: specify target group cell, based on property of the cell
    graph.setSelectionCell(graph.groupCells(null, border, cells));
    // group consists of 1 parent cell containing its children
  }
}


export function selectGroup(graph:MxTypes.mxGraph) {
  const firstSelectedCell = graph.getSelectionCells()[0];
  const parent = firstSelectedCell.getParent();
  if (parent !== graph.getDefaultParent()) {
    graph.selectCells(true, true, firstSelectedCell.getParent(), true);
  }
}

export function ungroup(graph:MxTypes.mxGraph) {
  const firstSelectedCell = graph.getSelectionCells()[0];
  const isSelectionGrouped:boolean = graph.getModel().getChildCount(firstSelectedCell) > 0;
  // ungroup selected
  if (graph.getSelectionCount() === 1 && isSelectionGrouped) {
    graph.ungroupCells(graph.getSelectionCells());
    //FIXME: wrong amount of children
    mx.mxUtils.alert("Ungrouping: " + graph.getSelectionCount() + " elements");
  }
}

export function undo(undoMgr:MxTypes.mxUndoManager) {
  undoMgr.undo();
}

export function redo(undoMgr:MxTypes.mxUndoManager) {
  undoMgr.redo();
}

export function selectAll(graph:MxTypes.mxGraph) {
  const parent = graph.getDefaultParent();
  graph.selectAll(parent, true);
}

export function selectAllOrClearSelection(graph:MxTypes.mxGraph) {
  const previousSelectionCount:number = graph.getSelectionCount();
  selectAll(graph);
  const currentSelectionCount:number = graph.getSelectionCount();
  if (currentSelectionCount === previousSelectionCount) {
    clearSelection(graph);
  }
}

export function selectCurrentSelectionOrRoot(graph: MxTypes.mxGraph) {
  const selectionCell = graph.getSelectionCell();
  let selectedParent;
  if (!selectionCell) {
    selectedParent = graph.getCurrentRoot();
  } else {
    selectedParent = selectionCell.getParent();
  }
  return selectedParent;
}

export function selectAllVertices(graph:MxTypes.mxGraph) {
  graph.selectVertices(selectCurrentSelectionOrRoot(graph), true);
}

export function selectAllEdges(graph:MxTypes.mxGraph) {
  graph.selectEdges(selectCurrentSelectionOrRoot(graph));
}
/**
 *
 * @param graph
 * @param sourceType could be data_provider, data_store, data_source
 */
export function selectAllDataSources(graph:MxTypes.mxGraph, sourceType:string, propertyNameOfDataSources="metadata", propertyNameOfDataType="metadataType") {
  let cells = graph.getSelectionCells();
  if (cells.length == 0 ) {
    // if no selection is presen, select everything
    cells = graph.getDefaultParent().children;
  }
  //TODO: check which combinationis in group -> if distinct ones => colorize group as data_source, otherwise as corresponding source
  // flatten grouped cells
  const flattendCells = cells.flatMap( (cell) => getChildren(graph, cell));
  const dataSourceCells = flattendCells.filter((cell)=> cell.getAttribute(propertyNameOfDataSources) != null);
  const usedDatasource = dataSourceCells.filter((cell) => cell.getAttribute(propertyNameOfDataType) === sourceType );
  graph.setSelectionCells(usedDatasource);
}

export function getCellsWithTrustScores(graph:MxTypes.mxGraph, cells: MxTypes.mxCell[]) {
  let flattendCells = cells.flatMap((cell) => getChildren(graph, cell));
  flattendCells = flattendCells.filter((cell) => {
    const trustScore = cell.getAttribute("trustScore");
    return (trustScore != null && !Number.isNaN(parseFloat(trustScore)) && parseFloat(trustScore) != -1);
  });
  return flattendCells;
}

export function getCellsWithAttribute(graph:MxTypes.mxGraph, cells: MxTypes.mxCell[], attributeName:string) {
  let flattendCells = cells.flatMap((cell) => getChildren(graph, cell));
  flattendCells = flattendCells.filter((cell) => {
    const attribute = cell.getAttribute(attributeName, null);
    return (attribute !== null );
  });
  return flattendCells;
}

export function clearSelection(graph:MxTypes.mxGraph) {
  graph.clearSelection();
}

export function selectionToFront(graph:MxTypes.mxGraph) {
  graph.orderCells(false);
}

export function selectionToBack(graph:MxTypes.mxGraph) {
  graph.orderCells(true);
}

/**
 * FIXME: if vertex with a connected edge is generate, edge is deleted as well when vertex got deleted -> should only delete vertex
 */
export function deleteSelection(graph:MxTypes.mxGraph) {
  if (graph.isEnabled()) {
    // graph.escape();
    const cells = graph.getSelectionCells();
    if (cells != null) {
      graph.removeCells(cells);
    }
  }
}

export function deleteAll(graph:MxTypes.mxGraph) {
  graph.model.clear();
}


/**
 * Returns the XML node that represents the current diagram.
 * source from: editor.js
 */
function getGraphXml(graph:MxTypes.mxGraph, ignoreSelection:boolean) {
  ignoreSelection = (ignoreSelection != null) ? ignoreSelection : true;
  let node:any = null;
  const enc = new mxCodec(mx.mxUtils.createXmlDocument());
  node = enc.encode(graph.getModel());

  if (graph.view.translate.x != 0 || graph.view.translate.y != 0) {
    node.setAttribute("dx", Math.round(graph.view.translate.x * 100) / 100);
    node.setAttribute("dy", Math.round(graph.view.translate.y * 100) / 100);
  }

  node.setAttribute("grid", (graph.isGridEnabled()) ? "1" : "0");
  node.setAttribute("gridSize", graph.gridSize);
  node.setAttribute("guides", (graph.graphHandler.guidesEnabled) ? "1" : "0");
  node.setAttribute("tooltips", (graph.tooltipHandler.isEnabled()) ? "1" : "0");
  node.setAttribute("connect", (graph.connectionHandler.isEnabled()) ? "1" : "0");
  // node.setAttribute("arrows", (graph.connectionArrowsEnabled) ? "1" : "0");
  node.setAttribute("fold", (graph.foldingEnabled) ? "1" : "0");
  node.setAttribute("page", (graph.pageVisible) ? "1" : "0");
  node.setAttribute("pageScale", graph.pageScale);
  node.setAttribute("pageWidth", graph.pageFormat.width);
  node.setAttribute("pageHeight", graph.pageFormat.height);

  return node;
}

/**
 * Sets the XML node for the current diagram.
 * source from: editor.js
 */
export function setGraphXml(graph:MxTypes.mxGraph, node:any) {
  if (node != null) {
    const dec = new mxCodec(node.ownerDocument);

    if (node.nodeName == "mxGraphModel") {
      //this code is run
      graph.model.beginUpdate();

      try {
        graph.model.clear();
        graph.view.scale = 1;
        dec.decode(node, graph.getModel());
      } finally {
        graph.model.endUpdate();
      }

      graph.fireEvent(new mx.mxEventObject("resetGraphView"));
    } else if (node.nodeName == "root") {
      resetGraph(graph);

      // Workaround for invalid XML output in Firefox 20 due to bug in mxUtils.getXml
      const wrapper = dec.document.createElement("mxGraphModel");
      wrapper.appendChild(node);

      dec.decode(wrapper, graph.getModel());
      graph.fireEvent(new mx.mxEventObject("resetGraphView"));
    } else {
      // eslint-disable-next-line no-throw-literal
      throw {
        message: mx.mxResources.get("cannotOpenFile"),
        node: node,
        toString: function() {
          return this.message;
        },
      };
    }
  } else {
    resetGraph(graph);
    graph.model.clear();
    graph.fireEvent(new mx.mxEventObject("resetGraphView"));
  }
}

/**
 * Sets the XML node for the current diagram.
 * source from: editor.js
 */
function resetGraph(graph:MxTypes.mxGraph) {
  // graph.gridEnabled = !this.isChromelessView() || urlParams["grid"] == "1";
  graph.graphHandler.guidesEnabled = true;
  graph.setTooltips(true);
  graph.setConnectable(true);
  graph.foldingEnabled = true;
  graph.pageBreaksVisible = graph.pageVisible;
  graph.preferPageSize = graph.pageBreaksVisible;
  graph.pageScale = mx.mxGraph.prototype.pageScale;
  graph.pageFormat = mx.mxGraph.prototype.pageFormat;
  updateGraphComponents(graph);
  graph.view.setScale(1);
}

/**
 * Keeps the graph container in sync with the persistent graph state
 * source from: editor.js
 */
function updateGraphComponents(graph:MxTypes.mxGraph) {

  if (graph.container != null) {
    graph.view.validateBackground();
    graph.container.style.overflow = "auto";

    graph.fireEvent(new mx.mxEventObject("updateGraphComponents"));
  }
}


export function saveXml(graph:MxTypes.mxGraph) {

  //TODO: original saves some kind of hash

  // console.log("function ", arguments.callee.name, " not yet implemented");

  const filename = "demo.xml";

  if (filename == null) {
    alert("type in file name");
  }
  if (graph.isEditing()) {
    graph.stopEditing(false);
  }

  const xml = mx.mxUtils.getXml(getGraphXml(graph, true));

  return xml;

}


export function openFile(graph:MxTypes.mxGraph, handleFilenameChange:(filename: string) => void) {
  //source from: https://codepen.io/rkotze/pen/zjRXYr
  //html input element https://www.w3schools.com/tags/att_input_type_file.asp
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
  const fileSelector = document.createElement("input");

  fileSelector.setAttribute("type", "file");
  fileSelector.onchange = (e:any)=> {
    // console.debug("no file selected");
    const files = (e.target as HTMLInputElement)!.files;
    if (files) {
      fileUtils.readFileAsGraph(files[0], graph);
      // save filename
      handleFilenameChange(files[0].name);
    }
    console.debug(files);
  };
  return fileSelector;
}

export function openStencilFile() {
  //source from: https://codepen.io/rkotze/pen/zjRXYr
  //html input element https://www.w3schools.com/tags/att_input_type_file.asp
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
  const fileSelector = document.createElement("input");

  fileSelector.setAttribute("type", "file");
  fileSelector.onchange = (e:any)=> {
    // console.debug("no file selected");
    const files = (e.target as HTMLInputElement)!.files;
    if (files) {
      fileUtils.readStencilXmlFile(files[0]);
    }
    console.debug(files);
  };
  return fileSelector;
}

export async function saveFile(content:any, filename:string) {
// (A) CREATE BLOB OBJECT
  const myBlob = new Blob([content], {type: "text/plain"});

  // (B) CREATE DOWNLOAD LINK
  const url = window.URL.createObjectURL(myBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  // (C) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  // document.removeChild(anchor);
}

export function zoomIn(graph:MxTypes.mxGraph) {
  graph.zoomIn();
}

export function zoomOut(graph:MxTypes.mxGraph) {
  graph.zoomOut();
}

export function zoomReset(graph:MxTypes.mxGraph) {
  graph.zoomTo(1);
}

export function printStyle(graph:MxTypes.mxGraph) {
  if (graph.isEnabled()) {
    const cells = graph.getSelectionCells();
    cells.forEach((cell) => {
      if (cell != null) {
        console.log("current cell: [" + cell.id + "]=" + cell.getStyle());
      }
    });
  }
}

export function addWaypoint(graph:MxTypes.mxGraph) {
  // source from grapheditor examples actions.js
  const cell = graph.getSelectionCell();

  if (cell != null && graph.getModel().isEdge(cell)) {
    const handler = graph.selectionCellsHandler.getHandler(cell);
    if (handler instanceof mx.mxEdgeHandler) {
      const t = graph.view.translate;
      const s = graph.view.scale;
      let dx = t.x;
      let dy = t.y;

      let parent = graph.getModel().getParent(cell);
      let parentGeometry = graph.getCellGeometry(parent);

      while (graph.getModel().isVertex(parent) && parentGeometry != null) {
        dx += parentGeometry.x;
        dy += parentGeometry.y;

        parent = graph.getModel().getParent(parent);
        parentGeometry = graph.getCellGeometry(parent);
      }

      const x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
      const y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));

      handler.addPointAt(handler.state, x, y);
    }
  }
}

/**
 * Removes the Waypoint closest to the event. If no event is given removes the first element
 * @param graph
 * @param evt
 */
export function removeWaypoint(graph:MxTypes.mxGraph, evt: MouseEvent | TouchEvent | null) {
  const cells = graph.getSelectionCells();
  graph.getModel().beginUpdate();
  try {
    if (cells != null) {
      cells.forEach((cell) => {
        if (graph.getModel().isEdge(cell)) {
          let geometry = graph.getCellGeometry(cell);
          if (geometry != null) {
            geometry = geometry.clone();
            const points = geometry.points ? geometry.points : [];
            console.log(geometry.points);
            let indexToRemove:number = 0;
            // calculate distance to mouse and remove closest to selection
            if (evt !== null) {
              indexToRemove = getClosestPointToSelection(graph, points, evt);
            }
            points.splice(indexToRemove, 1);
            graph.getModel().setGeometry(cell, geometry);
          }
        }
      });
    }
  } finally {
    graph.getModel().endUpdate();
  }
}

/**
 * Calculate distance to mouse and return the curresponding indes
 * @param graph
 * @param points all possible points
 * @param evt for interaction
 * @returns index of the closest point in the points array
 */
function getClosestPointToSelection(graph:MxTypes.mxGraph, points: MxTypes.mxPoint[], evt: MouseEvent | TouchEvent) {
  let min:number = Infinity;
  let index:number = 0;
  const {x, y} = getVertexDropLocation(graph, evt);
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const distance = getVectorLength(point.x - x, point.y - y);
    if (distance < min) {
      min=distance;
      index = i;
    }
  }
  return index;
}

function getVectorLength(x:number, y:number) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

/**
 * Removes all waypoints for the given Selection
 * @param graph
 */
export function clearAllWaypoints(graph:MxTypes.mxGraph) {
  // source from grapheditor examples actions.js
  let cells = graph.getSelectionCells();
  if (cells != null) {
    cells = graph.addAllEdges(cells);
    graph.getModel().beginUpdate();
    try {
      cells.forEach((cell) => {
        if (graph.getModel().isEdge(cell)) {
          let geometry = graph.getCellGeometry(cell);
          if (geometry != null) {
            geometry = geometry.clone();
            geometry.points = null;
            graph.getModel().setGeometry(cell, geometry);
          }
        }
      });
    } finally {
      graph.getModel().endUpdate();
    }
  }
}

export function getCellGeometry(graph:MxTypes.mxGraph, cell:MxTypes.mxCell) {
  if (graph.isEnabled() && cell != null && graph.getModel().isVertex(cell)) {
    const geo = graph.getCellGeometry(cell);
    if (geo != null) {
      return new mx.mxRectangle(geo.x, geo.y, geo.width, geo.height);
    }
  }
  return null;
}

/**
 * FIXME: not returning the sourcePoint consistantly
 * Source adapted from Format.js of graph example Line 2621 and following
 * @param graph
 * @returns
 */
export function getCellSourcePoint(graph:MxTypes.mxGraph) {
  const cell = graph.getSelectionCell();
  if (graph.getSelectionCount() == 1 && graph.getModel().isEdge(cell)) {
    const geo = graph.getModel().getGeometry(cell);
    if (geo.sourcePoint != null && graph.getModel().getTerminal(cell, true) == null) {
      return new mx.mxPoint(geo.sourcePoint.x, geo.sourcePoint.y);
    }
  }
  return null;
}

/**
 * FIXME: not returning the targetPoint consistantly
 * Source adapted from Format.js of graph example Line 2621 and following
 * @param graph
 * @returns
 */
export function getCellTargetPoint(graph:MxTypes.mxGraph) {
  const cell = graph.getSelectionCell();
  if (graph.getSelectionCount() == 1 && graph.getModel().isEdge(cell)) {
    const geo = graph.getModel().getGeometry(cell);
    if (geo.targetPoint != null && graph.getModel().getTerminal(cell, false) == null) {
      return new mx.mxPoint(geo.targetPoint.x, geo.targetPoint.y);
    }
  }
  return null;
}


export function setCellGeometry(graph:MxTypes.mxGraph, cells:MxTypes.mxCell[], cellGeometry:MxTypes.mxRectangle) {
  setVertexGeometry(graph, cellGeometry, cells, true, true);
}

export function getCellPosition(graph:MxTypes.mxGraph, cell:MxTypes.mxCell) {
  const copiedVertexGeometry = getCellGeometry(graph, cell);
  if (copiedVertexGeometry) {
    return new mx.mxPoint(copiedVertexGeometry.x, copiedVertexGeometry.y);
  }
  return null;
}

export function setCellPosition(graph:MxTypes.mxGraph, cells:MxTypes.mxCell[], position:MxTypes.mxPoint) {
  setVertexGeometry(graph, position, cells, false, true);
}

export function getCellScale(graph:MxTypes.mxGraph, cell:MxTypes.mxCell) {
  const copiedVertexGeometry = getCellGeometry(graph, cell);
  if (copiedVertexGeometry) {
    return new mx.mxPoint(copiedVertexGeometry.width, copiedVertexGeometry.height);
  }
  return null;
}

export function setCellScale(graph:MxTypes.mxGraph, cells:MxTypes.mxCell[], scaling:MxTypes.mxPoint) {
  setVertexGeometry(graph, scaling, cells, true, false);
}

/**
 *
 * @param graph
 * @param copiedCellGeometryInformation could be extracted from cell gemoetry
 */
export function setVertexGeometry(graph:MxTypes.mxGraph, copiedCellGeometryInformation:MxTypes.mxPoint | MxTypes.mxRectangle | undefined, cells:MxTypes.mxCell[], isScaling:boolean=false, isPosition:boolean=false) {
  if (graph.isEnabled() && !graph.isSelectionEmpty() && copiedCellGeometryInformation != null && copiedCellGeometryInformation !== undefined) {
    graph.getModel().beginUpdate();
    try {

      for (let i = 0; i < cells.length; i++) {
        if (graph.getModel().isVertex(cells[i])) {
          let geo = graph.getCellGeometry(cells[i]);
          if (geo != null) {
            geo = geo.clone();
            if (isScaling && isPosition && copiedCellGeometryInformation instanceof mx.mxRectangle) {
              geo.x = copiedCellGeometryInformation.x;
              geo.y = copiedCellGeometryInformation.y;
              geo.width = copiedCellGeometryInformation.width;
              geo.height = copiedCellGeometryInformation.height;
            } else if (isScaling) {
              geo.width = copiedCellGeometryInformation.x;
              geo.height = copiedCellGeometryInformation.y;
            } else if (isPosition) {
              geo.x = copiedCellGeometryInformation.x;
              geo.y = copiedCellGeometryInformation.y;
            }
            graph.getModel().setGeometry(cells[i], geo);
          }
        }
      }
    } finally {
      graph.getModel().endUpdate();
    }
  }
}


/**
 *
 * @param graph
 * @param copiedPoint could be extracted from edge gemoetry
 */
export function setEdgePointOfSelection(graph:MxTypes.mxGraph, copiedPoint:MxTypes.mxPoint, isSource:boolean) {
  if (graph.isEnabled() && !graph.isSelectionEmpty() && copiedPoint != null && copiedPoint !== undefined) {
    graph.getModel().beginUpdate();
    try {
      const cells = graph.getSelectionCells();
      for (let i = 0; i < cells.length; i++) {
        if (graph.getModel().isEdge(cells[i])) {
          let geo = graph.getCellGeometry(cells[i]);
          if (geo != null) {
            geo = geo.clone();

            if (isSource) {
              geo.sourcePoint.x = copiedPoint.x;
              geo.sourcePoint.y = copiedPoint.y;
            } else {
              geo.targetPoint.x = copiedPoint.x;
              geo.targetPoint.y = copiedPoint.y;
            }
            graph.getModel().setGeometry(cells[i], geo);
          }
        }
      }
    } finally {
      graph.getModel().endUpdate();
    }
  }
}

/**
 * --------------------------------------------------------------------------------
 * Helper functions for editing meta-data
 * --------------------------------------------------------------------------------
 */

/**
 * Get all children of the given root cell. Doesn't return the root node itself.
 * Usage example:
 * ```js
 * cells.flatMap( (cell) => editorActions.getChildren(this.props.graph, cell));
 * ```
 * @param graph
 * @param cell
 * @param flattendCells
 * @returns
 */
export function getChildren(graph:MxTypes.mxGraph, cell:MxTypes.mxCell, flattendCells:MxTypes.mxCell[] = []) {
  const amountChildren = graph.getModel().getChildCount(cell);
  if (amountChildren > 0) {
    for (let i = 0; i < amountChildren; i++) {
      getChildren(graph, cell.getChildAt(i), flattendCells);
    }
  } else {
    flattendCells.push(cell);
  }
  return flattendCells;
}

export function getCellDataAsJson(value:any):Object| null {
  let json = null;
  // check if note is an XML node
  // @ts-ignore
  if (mx.mxUtils.isNode(value)) {
    json = utilityFunctions.convertXmlToJson(mx.mxUtils.getXml(value));
  //already an object
  } else if (value.constructor == Object ) {
    //TODO: check if json object is valid
  }
  return json;
}

export function getCellDataAsXmlNode(value:any, tagName?:string) {
  // check if note is an XML node
  // @ts-ignore
  if (mx.mxUtils.isNode(value)) {
    return value;
  //already an object --> assume json
  } else if (value.constructor == Object ) {
    const xml = utilityFunctions.convertJsonToXml(value, tagName);
    return mx.mxUtils.parseXml(xml);
  }
}

export function getEditData(graph:MxTypes.mxGraph, cell:MxTypes.mxCell, tagName="docElement"): HTMLElement {
  // Tutorial https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html
  //TODO: keep in synch with valueForCellChanged function => extract editing function
  let value:any = graph.getModel().getValue(cell);
  // Converts the value to an XML node
  // @ts-ignore
  if (!mx.mxUtils.isNode(value)) {
    // eslint-disable-next-line prefer-const
    let doc = mx.mxUtils.createXmlDocument();
    // eslint-disable-next-line prefer-const
    let obj = doc.createElement(tagName);
    // eslint-disable-next-line quotes
    setBasicEditData(obj, value);
    value = obj;
  }
  return value;
}

export function setBasicEditData(obj: HTMLElement, label: any) {
  obj.setAttribute("label", label);
  //currently edits text in cell: -> save object as json
  obj.setAttribute("metadata", "");
  obj.setAttribute("trustScore", "");
  obj.setAttribute("metadataType", "");
  obj.setAttribute("metadataIoTTypes", "");
}

export function getJsonFromAttribute(editData:HTMLElement, defaultJson:any, tagName="docElement", attributeName="metadata") {
  // label & metadata saved inside editData --> metadata can be used for further datas
  const jsonEditData = getCellDataAsJson(editData);
  // @ts-ignore
  const jsonAttribute = jsonEditData[tagName]["$"][attributeName];
  if (jsonAttribute === "" || !jsonAttribute) {
    const stringifiedJson = JSON.stringify(defaultJson, utilityFunctions.jsonMapReplacer, 4);
    return stringifiedJson ? JSON.parse(stringifiedJson, utilityFunctions.jsonMapReviver) : undefined;
  }
  return jsonAttribute ? JSON.parse(jsonAttribute, utilityFunctions.jsonMapReviver) : undefined;
}

/**
 * save json as string in the given attribute at the given cell into the given HTMLElement
 * @param graph
 * @param cell
 * @param editData
 * @param json
 * @param jsonMapReplacer
 * @param attribute
 */
export function setEditDataJson(graph:MxTypes.mxGraph, cell:MxTypes.mxCell, editData:HTMLElement, json: Property, jsonMapReplacer:any, attribute="metadata") {
  // @ts-ignore
  const valueIsXMLNode = mx.mxUtils.isNode(cell.value);
  const oldLabel = (!valueIsXMLNode) ? cell.getValue() : cell.getAttribute("label", "");

  // const oldLabel = editData.getAttribute("label") || cell.getValue()
  setEditData(graph, cell, editData, attribute, JSON.stringify(json, jsonMapReplacer));
  const type = json.type;
  setEditData(graph, cell, editData, "metadataType", "" + type);
  // data_source, data_store, data provider
  const iotTypes = json.iotTypes.concat();
  setEditData(graph, cell, editData, "metadataIoTTypes", "" + iotTypes);
  // negative maxScore = template not yet filled out
  const isValidQuestionnaire = getMaxSumOfProperty(json) >= 0;
  // apply trust score only on valid questionnaire
  if (isValidQuestionnaire ) {
  // calculate trust score \tau
    const score = evaluateQuestionary(json);
    //overwrite label with old label and new trust score from cell
    const newLabel = updateScoreTextLabel(score, oldLabel);

    setEditData(graph, cell, editData, "label", newLabel);
    setEditData(graph, cell, editData, "trustScore", "" + score);
  } else if (!isValidQuestionnaire && valueIsXMLNode) {
    // from valid questionnaire to invalid with everywhere no selection
    const newLabel = updateScoreInLabel(oldLabel, "").trim();
    setEditData(graph, cell, editData, "label", newLabel);
    setEditData(graph, cell, editData, "trustScore", "");
  }
}

/**
 * save/add score in label
 * @param score
 * @param editData
 * @returns
 */
function updateScoreTextLabel(score: number, currentLabel: string) {
  const scoreText = "&#964 = " + score.toFixed(3);
  /* eslint-disable no-useless-escape */
  const match = currentLabel.match(new RegExp("(&#964 = [0-9]*[.]*[0-9]*)", "g"));
  const newLabel = match ? currentLabel.replace(match[0], scoreText) : currentLabel + ("\n(" + scoreText + ")");
  return newLabel;
}

/**
 * save json as string in the given attribute at the given cell into the given HTMLElement
 * @param graph
 * @param cell
 * @param editData
 * @param json
 * @param jsonMapReplacer
 * @param attribute
 */
export function removeEditDataJson(graph:MxTypes.mxGraph, cell:MxTypes.mxCell, editData:HTMLElement, json:any, jsonMapReplacer:any, attribute="metadata") {
  setEditData(graph, cell, editData, attribute, JSON.stringify(json, jsonMapReplacer));
  // calculate trust score \tau
  // const score = evaluateQuestionary(json);
  // save/add score in label
  // editData.getAttribute("label") + "( &#964 = "+ score + ")")
  //FIXME: do not add each time!
  // update placeholder -> create new property and include in label if possible
  // => setEditData to create a property and getEditData to get a prop -> could build menu if prefered

  //FIXME: execution timing is wrong. text gets updated only after multiple editData
  const scoreText = "";
  const currentLabel = editData.getAttribute("label") || "";
  /* eslint-disable no-useless-escape */
  const newLabel = updateScoreInLabel(currentLabel, scoreText);

  setEditData(graph, cell, editData, "trustScore", "" + -1);
  setEditData(graph, cell, editData, "label", newLabel);
  // remove metadata
  setEditData(graph, cell, editData, "metadata", "");
}

export function updateScoreInLabel(currentLabel: string, scoreText: string) {
  const match = currentLabel.match(new RegExp("(&#964 = [0-9]*[.]*[0-9]*)", "g"));
  const newLabel = match ? currentLabel.replace("(" + match[0] + ")", scoreText) : currentLabel;
  return newLabel;
}

/**
 * save json as string in the given attribute at the given cell into the given HTMLElement
 * @param graph
 * @param cell
 * @param editData
 * @param json
 * @param jsonMapReplacer
 * @param attribute
 */
export function setEditData(graph:MxTypes.mxGraph, cell:MxTypes.mxCell, editData:HTMLElement, qualifiedName: string, value: string) {
  // Tutorial: https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html
  editData.setAttribute(qualifiedName, value);
  graph.getModel().setValue( cell, editData);
}

export function evaluateEditData(graph:MxTypes.mxGraph, cells:MxTypes.mxCell[], defaultJson:any, tagName="docElement", attributeName="metadata") {

  return cells.map((cell) => {
    const json:Property = getJsonFromCell(graph, cell, defaultJson, tagName, attributeName);
    if (!json) {
      console.log("no property for cell " + cell.getId() + " available");
      return -1;
    }
    //TODO: refactor to pass evaluation function as argument
    return evaluateQuestionary(json);
    //TODO: if multiple cells are selected: average trust score (see data source)
  }).reduce((previousValue, currentValue) => previousValue + currentValue) / cells.length;
}

export function evaluateQuestionary(json: Property) {
  const scoreProperty = evaluateProperty(json);
  //selected points / max possible points
  const trustScore = 1.0 - (scoreProperty / getMaxSumOfProperty(json));
  return trustScore;
}

/**
 *
 * @param graph
 * @param cells
 * @param isSelectionDependend false if all possible answers should be included.
 * @param defaultJson
 * @param tagName
 * @param attributeName
 * @returns the maximum amount of points possible from the current properties
 */
export function editDataGetMaxSumOfPropertyPoints(graph:MxTypes.mxGraph, cells:MxTypes.mxCell[], isSelectionDependend:boolean, defaultJson:any, tagName="docElement", attributeName="metadata") {

  return cells.map((cell) => {
    const json:Property = getJsonFromCell(graph, cell, defaultJson, tagName, attributeName);
    if (!json) {
      console.log("no property for cell " + cell.getId() + " available");
      return -1;
    }
    //TODO: refactor to pass evaluation function as argument
    return getMaxSumOfProperty(json, isSelectionDependend);


  }).reduce((previousValue, currentValue) => previousValue + currentValue);
  //TODO: trust score: should be sum of trust scores from nodes / amount of nodes
}

export function colorizeDataSources(graph:MxTypes.mxGraph, cells:MxTypes.mxCell[], propertyNameOfDataType="metadataType") {
  const colors = new Map();
  //{metaobject, style}
  colors.set("data_source", {keys: [mx.mxConstants.STYLE_IMAGE_BORDER, mx.mxConstants.STYLE_STROKECOLOR, mx.mxConstants.STYLE_STROKEWIDTH, mx.mxConstants.STYLE_DASHED], values: ["rgba(255, 0, 0, 1)", "rgba(255, 0, 0, 1)", "5", "1"]});
  colors.set("data_provider", {keys: [mx.mxConstants.STYLE_IMAGE_BORDER, mx.mxConstants.STYLE_STROKECOLOR, mx.mxConstants.STYLE_DASHED, mx.mxConstants.STYLE_DASH_PATTERN], values: ["rgba(0, 0, 255, 1)", "rgba(0, 0, 255, 1)", "1", "1 3"]});
  colors.set("data_store", {keys: [mx.mxConstants.STYLE_IMAGE_BORDER, mx.mxConstants.STYLE_STROKECOLOR, mx.mxConstants.STYLE_STROKEWIDTH, mx.mxConstants.STYLE_DASHED], values: ["rgba(0, 255, 0, 1)", "rgba(0, 255, 0, 1)", "5", "1"]});


  //TODO: group of >=2 elements-> data source -> avarage trust score per type
  // group selected cells
  //TODO: implement for


  //TODO: get propery types of each selected group, single cell
  //TODO: check if property type inside group changes => data_source
  //if not => group with the same property type
  cells.forEach((cell) => {
    // const json:Property = getJsonFromCell(graph, cell, defaultJson, tagName, attributeName);
    const dataSourceCellsType = cell.getAttribute(propertyNameOfDataType);
    let isCellInGroup:boolean = false;
    const parents = graph.getModel().getParents(new Array(cell));
    let children:MxTypes.mxCell[] = [];
    let childrenWithMetadata:MxTypes.mxCell[] = [];
    let currentParent;
    for (let i=0; i< parents.length; i++) {
      // get root cell of graph got multiple functions -> getDefaultParent to get the root. (isRoot doesn't work as expected)
      const isRoot:boolean = parents[i] === graph.getDefaultParent();
      if (!isRoot && graph.getModel().getChildCount(parents[i])>0) {
        currentParent = parents[i];
        isCellInGroup = true;
        children = graph.getModel().getChildCells(parents[i]);
        childrenWithMetadata = children?.filter( (child) => {
          // const metadata = getJsonFromCell(graph, child, defaultJson, tagName, propertyNameOfDataSources);
          child.getAttribute(propertyNameOfDataType);
          return child.getAttribute(propertyNameOfDataType) && child.getAttribute(propertyNameOfDataType) !== undefined && child.getAttribute(propertyNameOfDataType) != null;
        });
        break;
      }
    }
    // metadata should be available
    if (dataSourceCellsType && dataSourceCellsType != null) {
      let setting = colors.get(dataSourceCellsType);
      if (currentParent && isCellInGroup && childrenWithMetadata.length > 1) {
        setting = colors.get("data_source");
        styleEditorActions.setStylesOfCells(graph, new Array(currentParent), setting["keys"], setting["values"]);
        // style children with metadata
        childrenWithMetadata.forEach((child) => colorizeDataSource(graph, child, colors));//TODO: style childrenWithMetadata of data_source corresponding to their metadata
      } else if ((!isCellInGroup || childrenWithMetadata.length === 1) && setting ) {
        styleEditorActions.setStylesOfCells(graph, new Array(cell), setting["keys"], setting["values"]);
      }
    }
  });
  //TODO: trust score: should be sum of trust scores from nodes / amount of nodes
}

export function colorizeDataSource(graph:MxTypes.mxGraph, cell:MxTypes.mxCell, colors: Map<string, any>, propertyNameOfDataType="metadataType") {
  //make sure to check groups first
  // const json:Property = getJsonFromCell(graph, cell, defaultJson, tagName, attributeName);
  const dataSourceCellsType = cell.getAttribute(propertyNameOfDataType);
  if (dataSourceCellsType && dataSourceCellsType != null) {
    const setting = colors.get(dataSourceCellsType);
    if (setting) {
      styleEditorActions.setStylesOfCells(graph, new Array(cell), setting["keys"], setting["values"]);
    }
  }
}


export function getJsonFromCell(graph: MxTypes.mxGraph, cell: MxTypes.mxCell, defaultJson: any, tagName="docElement", attributeName="metadata") {
  const editData = getEditData(graph, cell, tagName);
  const json = getJsonFromAttribute(editData, defaultJson, tagName, attributeName);
  return json;
}

export function selectPropertyType(graph:MxTypes.mxGraph, targetType: string, defaultJson: any, defaultToWholeGraphSelection = true) {
  let selectionCells = graph.getSelectionCells();
  //default to whole graph
  if (defaultToWholeGraphSelection && selectionCells&& selectionCells.length == 0 ) {
    selectAll(graph);
    selectionCells = graph.getSelectionCells();
  }
  // if two cells are grouped, a third as a root cell is introduced. Meta data can be set onto each node
  // --> flatten grouped cells
  const flattendCells = graph.getSelectionCells().flatMap((cell) => getChildren(graph, cell));
  const selectedCells = flattendCells.filter((cell) => {
    const json = getJsonFromCell(graph, cell, defaultJson);
    const isValidQuestionnaire = getMaxSumOfProperty(json) >= 0;
    // either directly property or has a property attribute
    if (!json || !isValidQuestionnaire) return false;
    const cellType = json.type ? json.type : (json.Property ? json["Property"].type : undefined);
    return cellType && (cellType === targetType);
  });
  graph.setSelectionCells(selectedCells);
}


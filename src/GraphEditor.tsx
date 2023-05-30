// Source adapted from: https://codesandbox.io/s/zwqr6zpmpx?fontsize=14&hidenavigation=1&theme=dark

import React, {Component} from "react";
// Adds all required stylesheets and namespaces from mxClient.js
import "./mxgraph/src/css/common.css";
import "./mxgraph/src/css/explorer.css";
// addition custom css
import "./mxgraphcustom.css";
// other css
import "./sidebar.css";

// dragable image sources

// import mxgraph and typscript libraries
import * as MxTypes from "mxgraph"; // <- import types only (overwritten by custom typescript)
import "./custom-types/mx-custom-types.d.ts"; // <- import types only (overwritten by custom typescript)
import mx from "./mx";

// node wrapper
import VertexNode from "./draggable-nodes/VertexNode";
import SingleNode from "./draggable-nodes/SingleNode";

// editor actions
import * as editorActions from "./Actions";
import * as sgUtilities from "./SgUtilities";
import {decode} from "./Utils/GraphFileUtils";
import {getAboutInformation, getHelpInformation, getKeyboardShortcutsInformation} from "./Utils/ContentUtility";
import MenubarToolbar from "./Menubar/MenubarToolbar";
import PrimeAccordion from "./PrimeAccordion";
import {ScrollPanel} from "primereact/scrollpanel";
import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import PrimeTabView from "./TabView/PrimeTabView";

// @ts-ignore
import defaultXml from "./grapheditor-example/www/styles/default.xml";

//tmp debug imports
import {InputTextarea} from "primereact/inputtextarea";

interface SimpleGraphEditorProps {

}

// should be kept in sync with SimpleGraphEditorStateSet and isInitialized()
interface SimpleGraphEditorState {
  graph?: MxTypes.mxGraph;
  filename: string;
  undoMgr?: MxTypes.mxUndoManager;
  displayResponsive: boolean;
  displaySaveAs: boolean;
  modalTitle?: string;
  modalContent?: JSX.Element;
  displayEditStyle:boolean,
  currentStyle?: string,
}
// only for type system. So type script can check required states
type SimpleGraphEditorStateSet = Required<SimpleGraphEditorState>;
const DEBUG = false;
const DEFAULT_FILENAME = "untitled.graphted";

export default class SimpleGraphEditor extends Component<SimpleGraphEditorProps, SimpleGraphEditorState> {
  private divGraph = React.createRef<HTMLDivElement>();

  constructor(props:{}) {
    super(props);
    this.state = {
      graph: undefined,
      filename: DEFAULT_FILENAME,
      undoMgr: undefined,
      displayResponsive: false,
      displaySaveAs: false,
      displayEditStyle: false,
    };
    this.addOverlays = this.addOverlays.bind(this);
    this.addKeysbindings = this.addKeysbindings.bind(this);
    this.addGlobalKeysbindings = this.addGlobalKeysbindings.bind(this);
  }

  isInitialized() : this is {state: SimpleGraphEditorStateSet} {
    return this.state.graph !== undefined && this.state.undoMgr !== undefined;
  }

  componentDidMount() {
    document.title = "Graphted";
    this.LoadGraph();
    // focus on graph to enable shortcuts and menu items directly
    document.getElementById("divGraph")?.focus();
  }

  componentWillUnmount() {

  }

  handleFilenameChange = (filename:string) =>{
    this.setState({filename});
  }

  showHelpModal = () =>{
    this.setState({displayResponsive: true,
      modalTitle: "Help",
      modalContent: getHelpInformation(),
    });
  }

  showAboutModal = () =>{
    this.setState({displayResponsive: true,
      modalTitle: "About",
      modalContent: getAboutInformation(),
    });
  }

  showKeyboardModal = () =>{
    this.setState({displayResponsive: true,
      modalTitle: "Shortcuts",
      modalContent: getKeyboardShortcutsInformation(),
    });
  }

  showSaveAsModal = () =>{
    this.setState({displaySaveAs: true});
  }

  showEditStyleModal = () => {
    this.setState({currentStyle: this.state.graph!.getSelectionCell().getStyle()});
    this.setState({displayEditStyle: true});
  }

  updateGraph = () => {
    this.setState({graph: this.state.graph});
  }

  /**
   */
  addOverlays = (graph:MxTypes.mxGraph, cell:MxTypes.mxCell) => {
    // import image
    const deleteImage:MxTypes.mxImage = new mx.mxImage("resources/images/overlays/forbidden.png", 16, 16);
    const overlay:MxTypes.mxCellOverlay = new mx.mxCellOverlay(deleteImage, "delete");

    console.log("overlay");
    overlay.cursor = "hand";
    overlay.align = mx.mxConstants.ALIGN_CENTER;
    overlay.offset = new mx.mxPoint(0, 10);
    overlay.addListener(
        mx.mxEvent.CLICK,
        mx.mxUtils.bind(this, function(sender, evt) {
          console.log("clicked");
        }),
    );
    graph.addCellOverlay(cell, overlay);
  };

  deleteCells = (graph:MxTypes.mxGraph) => {
    // Cancels interactive operations
    if (graph.isEnabled()) {
      graph.escape();
      const cells = graph.getSelectionCells();
      if (cells != null) {
        graph.removeCells(cells);
      }
    }
  }


 /**
 *  Changes the zoom on mouseWheel events
 */
 addMouseWheelZoom = (evt:any) => {
   if ( !this.isInitialized() ) throw new Error("Graph is not fully initialized"); // safeguard
   if (evt.deltaY < 0) {
     this.state.graph.zoomIn();
     console.log("Zoom in");
   } else if (evt.deltaY > 0) {
     this.state.graph.zoomOut();
     console.log("Zoom Out");
   }
 };

 /**
   * @param {mxGraph} graph
   */
 addKeysbindings(event:React.KeyboardEvent<HTMLInputElement>) {
   if ( !this.isInitialized() ) throw new Error("Graph is not fully initialized"); // safeguard
   const graph = this.state.graph;
   // stop keyboard events when cells are edited
   if (graph.cellEditor.getEditingCell() !== null) return true;
   // let charCode = String.fromCharCode(event.which).toLowerCase();
   console.log("Last pressed key: ", event.key);

   const isCtrlPressed = (event.ctrlKey || event.metaKey);
   // CTRL Key combos (CTRL + Shift = upper case letters)
   if (isCtrlPressed) {
     // https://reactjs.org/docs/events.html#keyboard-events
     // https://www.w3.org/TR/uievents-key/#named-key-attribute-values
     switch (event.key) {
       case "x":
         editorActions.cut(graph);
         break;
       case "c":
         editorActions.copy(graph);
         break;
       case "v":
         editorActions.paste(graph);
         break;
       case "d":
         event.preventDefault();
         editorActions.duplicate(graph);
         break;
       case "g":
         event.preventDefault();
         editorActions.group(graph);
         break;
       case "U":
         editorActions.ungroup(graph);
         break;
       case "a":
         event.preventDefault();
         editorActions.selectAllOrClearSelection(graph);
         break;
       case "V":
         event.preventDefault();
         editorActions.selectAllVertices(graph);
         break;
       case "E":
         editorActions.selectAllEdges(graph);
         break;
       case "F":
         event.preventDefault();
         editorActions.selectionToFront(graph);
         break;
       case "B":
         event.preventDefault();
         editorActions.selectionToBack(graph);
         break;
       case "Control":
         break;
       default:
         console.log("Shortcut not registered CTRL and ", event.key, " pressed.");
     }
   } else if (!((event.ctrlKey || event.metaKey) ||event.altKey || event.shiftKey)) {
     // simple key events
     switch (event.key) {
       case "Delete":
       case "Backspace":
         editorActions.deleteSelection(graph);
         break;
         //TODO: arrow keys -> when cells selected, move cells
         //TODO: arrow keys -> when no cells selected, move graph canvas
       case "Escape":
         graph.popupMenuHandler.hideMenu();
         break;
       case "F2":
         // rename current node
         editorActions.editCell(graph);
         break;
       default:
         console.info("Shortcut not registered ", event.key, " pressed.");
     }
   }
 }

 /**
   * @param {mxGraph} graph
   */
 addGlobalKeysbindings(event:React.KeyboardEvent<HTMLInputElement>) {
   if ( !this.isInitialized() ) throw new Error("Graph is not fully initialized"); // safeguard
   const graph = this.state.graph;
   // stop keyboard events when cells are edited
   if (graph.cellEditor.getEditingCell() !== null) return true;
   // let charCode = String.fromCharCode(event.which).toLowerCase();
   console.log("Last pressed key: ", event.key);

   const isCtrlPressed = (event.ctrlKey || event.metaKey);
   // CTRL Key combos (CTRL + Shift = upper case letters)
   if (isCtrlPressed) {
     // https://reactjs.org/docs/events.html#keyboard-events
     // https://www.w3.org/TR/uievents-key/#named-key-attribute-values
     switch (event.key) {
       case "s":
         // save
         event.preventDefault();
         editorActions.saveFile(editorActions.saveXml(graph), this.state.filename );
         break;
       case "S":
         // save
         event.preventDefault();
         this.showSaveAsModal();
         break;
       case "o":
         // open
         event.preventDefault();
         editorActions.openFile(graph, this.handleFilenameChange).click();
         break;
       case "N":
         // new document
         event.preventDefault();
         editorActions.deleteAll(graph);
         this.setState({filename: DEFAULT_FILENAME});
         break;
       case "z":
         editorActions.undo(this.state.undoMgr);
         break;
       case "y":
         editorActions.redo(this.state.undoMgr);
         break;
       case "Control":
         break;
       default:
         console.log("Shortcut not registered CTRL and ", event.key, " pressed.");
     }
   } else if (event.altKey) {
     switch (event.key) {
       case "n":
         // new document
         event.preventDefault();
         editorActions.deleteAll(graph);
         this.setState({filename: DEFAULT_FILENAME});
         break;
       case "Alt":
         break;
       default:
         console.log("Shortcut not registered ALT and ", event.key, " pressed.");
     }
   } else if (!((event.ctrlKey || event.metaKey) ||event.altKey || event.shiftKey)) {
     // simple key events
     switch (event.key) {
       case "F1":
         // help
         event.preventDefault();
         this.showHelpModal();
         break;
       default:
         console.info("Shortcut not registered ", event.key, " pressed.");
     }
   }
 }


initializeUndomanager = () => {
  if ( !this.isInitialized() ) throw new Error("Graph is not fully initialized"); // safeguard
  const graph = this.state.graph;
  const undoManager = this.state.undoMgr;
  const listener = function(sender:any, evt:MxTypes.mxEventObject) {
    undoManager.undoableEditHappened(evt.getProperty("edit"));
  };
  graph.getModel().addListener(mx.mxEvent.UNDO, listener);
  graph.getView().addListener(mx.mxEvent.UNDO, listener);
}

/**
 * @param {mxGraph} graph
 */
setGraphSetting = async () => {
  if ( !this.isInitialized() ) throw new Error("Graph is not fully initialized"); // safeguard
  const graph = this.state.graph;
  const that = this;
  // Graph settings
  graph.setPanning(true);
  graph.setTooltips(true);
  graph.setConnectable(true);
  graph.setCellsEditable(true);
  graph.setEnabled(true);
  graph.setHtmlLabels(true);

  // Enables rubberband (marquee) selection and a handler
  // for basic keystrokes (eg. return, escape during editing).
  new mx.mxRubberband(graph);
  new mx.mxKeyHandler(graph);

  graph.centerZoom = false;
  //Specifies if the container should be resized to the graph size when the graph size has changed.
  graph.resizeContainer = false;

  graph.popupMenuHandler.factoryMethod = function(menu, cell, evt:any) {
    // console.dir(evt);
    return that.createPopupMenu(graph, menu, cell, evt);
  };


  // Installs a custom tooltip for cells
  graph.getTooltipForCell = function(cell) {
    //FIXME: use tooltip from image of cell
    // only base64 representation if shape is image
    // shape is available
    //TODO: save image title somehow or add tooltip
    // return "Example tooltip";
    return "";
  };

  // update GUI on selection change
  graph.getSelectionModel().addListener(mx.mxEvent.CHANGE, function(sender:any, evt:MxTypes.mxEventObject) {
    that.updateGraph();
  });

  // update GUI on resizing/angle listener etc.
  graph.getModel().addListener(mx.mxEvent.CHANGE, function(sender:any, evt:MxTypes.mxEventObject) {
    //update only if something is selected
    //TODO: optimze updated only if a property changed currently on every model change
    that.updateGraph();
  });

  // drop listener for adding images
  mx.mxEvent.addListener(graph.container, "dragover", function(evt:Event) {
    if (graph.isEnabled()) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  });
  mx.mxEvent.addListener(graph.container, "drop", (evt:DragEvent) => that.dropImage(graph, evt));

  //load default.xml
  this.loadStylesheet(graph);

  /**
   * Source from diagrameditor.html example
   */

  // Adds rotation handle and live preview: Graph.js 10981
  mx.mxVertexHandler.prototype.rotationEnabled = true;


  /**
   * Enables recursive resize for groups.
  */
  mx.mxVertexHandler.prototype.isRecursiveResize = (state: MxTypes.mxCellState, me: MxTypes.mxMouseEvent) => {
    //source: Graph.js of grapheditor example
    return this.isRecursiveVertexResize(state) &&
    !mx.mxEvent.isControlDown(me.getEvent());
  };


  // Invokes turn on single click on rotation handle: graph.js:11462
  mx.mxVertexHandler.prototype.rotateClick = function() {
    const angle = mx.mxUtils.mod(mx.mxUtils.getValue(this.state.style, mx.mxConstants.STYLE_ROTATION, 0) + 90, 360);
    this.state.view.graph.setCellStyles(mx.mxConstants.STYLE_ROTATION, angle, [this.state.cell]);
  };

  //enable custom attributes by overwriting convertValueToString  and cellLabelChanged see https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html
  /**
 * Returns the label for the given cell.
 * src from Graph.js
 */
  graph.convertValueToString = function(cell) {
    const value = this.model.getValue(cell);

    if (value != null && typeof(value) == "object") {
      if (that.isReplacePlaceholders(cell) && cell.getAttribute("placeholder") != null) {
        const name = cell.getAttribute("placeholder");
        let current = cell;
        let result = null;

        while (result == null && current != null) {
          if (current.value != null && typeof(current.value) == "object") {
            result = (current.hasAttribute(name)) ? ((current.getAttribute(name) != null) ?
               current.getAttribute(name) : "") : null;
          }

          current = this.model.getParent(current);
        }

        return result || "";
      } else {
        return value.getAttribute("label") || "";
      }
    }
    //@ts-ignore
    return mx.mxGraph.prototype.convertValueToString.apply(this, arguments);
  };


  /**
   * Handles label changes for XML user objects.
   * src from Graph.js
   */
  graph.cellLabelChanged = function(cell, value, autoSize) {
    // Removes all illegal control characters in user input
    value = that.zapGremlins(value);

    this.model.beginUpdate();
    try {
      if (cell.value != null && typeof cell.value == "object") {
        if (that.isReplacePlaceholders(cell) && cell.getAttribute("placeholder") != null) {
          // LATER: Handle delete, name change
          const name = cell.getAttribute("placeholder");
          let current = cell;

          while (current != null) {
            if (current == this.model.getRoot() || (current.value != null &&
               typeof(current.value) == "object" && current.hasAttribute(name))) {
              that.setAttributeForCell(current, name, value);

              break;
            }

            current = this.model.getParent(current);
          }
        }

        const tmp = cell.value.cloneNode(true);
        tmp.setAttribute("label", value);
        value = tmp;
      }

      //@ts-ignore
      mx.mxGraph.prototype.cellLabelChanged.apply(this, arguments);
    } finally {
      this.model.endUpdate();
    }
  };

  /**
   * Inner callback to update the user object of the given mxCell using mxCell.valueChanged and return the previous value, that is, the return value of mxCell.valueChanged.
   * To change a specific attribute in an XML node, the following code can be used:
   *     graph.getModel().valueForCellChanged = function(cell, value)
    {
      var previous = cell.value.getAttribute('label');
      cell.value.setAttribute('label', value);

      return previous;
    };
   */
  graph.getModel().valueForCellChanged = function(cell, value) {
    // get meta data if the given value is an XML node or cell value directly(label)
    const previousValue = cell.value;
    // @ts-ignore
    const previousValueIsXMLNode = mx.mxUtils.isNode(cell.value);
    // @ts-ignore
    const valueIsXMLNode = mx.mxUtils.isNode(value);
    // when using meta data
    // @ts-ignore
    if (previousValueIsXMLNode && !valueIsXMLNode) {
      //TODO: keep in synch with editData function => extract editing function
      cell.value.setAttribute("label", value);
    } else {
      // update the user object of the given mxCell using mxCell.valueChanged and return the previous value
      // when no meta data is used the label is saved directly into the node
      cell.value = value;
    }
    return previousValue;
  };

};

/**
 * Handles label changes for XML user objects.
 *  src from Graph.js
 * TODO: use on Action when cell is edited
 * FIXME: when included in editing should fix label change on custom object
 */
updateLabelElements = (cells:MxTypes.mxCell[], fn:any, tagName:string) => {
  const graph = this.state.graph!;

  cells = (cells != null) ? cells : graph.getSelectionCells();
  const div = document.createElement("div");

  for (let i = 0; i < cells.length; i++) {
    // Changes font tags inside HTML labels
    if (graph.isHtmlLabel(cells[i])) {
      const label = graph.convertValueToString(cells[i]);

      if (label != null && label.length > 0) {
        div.innerHTML = label;
        const elts = div.getElementsByTagName((tagName != null) ? tagName : "*");

        for (let j = 0; j < elts.length; j++) {
          fn(elts[j]);
        }

        if (div.innerHTML != label) {
          graph.cellLabelChanged(cells[i], div.innerHTML);
        }
      }
    }
  }
};

/**
 * Adds support for placeholders in labels.
 * src from Graph.js
 */
 isReplacePlaceholders = (cell:MxTypes.mxCell) => {
   return cell.value != null && typeof(cell.value) == "object" &&
     cell.value.getAttribute("placeholders") == "1";
 };

 /**
 * Removes all illegal control characters with ASCII code <32 except TAB, LF
 * and CR.
 * src from Graph.js
 */
 zapGremlins = (text:string) => {
   const checked = [];

   for (let i = 0; i < text.length; i++) {
     const code = text.charCodeAt(i);

     // Removes all control chars except TAB, LF and CR
     if ((code >= 32 || code == 9 || code == 10 || code == 13) &&
       code != 0xFFFF && code != 0xFFFE) {
       checked.push(text.charAt(i));
     }
   }

   return checked.join("");
 };

 /**
 * Sets the link for the given cell.
 * src from Graph.js
 */
  setAttributeForCell = (cell:MxTypes.mxCell, attributeName:string, attributeValue:any) => {
    let value = null;

    if (cell.value != null && typeof(cell.value) == "object") {
      value = cell.value.cloneNode(true);
    } else {
      const doc = mx.mxUtils.createXmlDocument();

      value = doc.createElement("UserObject");
      value.setAttribute("label", cell.value || "");
    }

    if (attributeValue != null) {
      value.setAttribute(attributeName, attributeValue);
    } else {
      value.removeAttribute(attributeName);
    }
    this.state.graph!.model.setValue(cell, value);
  };

  /**
   * Returns if the child cells of the given vertex cell state should be resized.
   * source: Graph.js of grapheditor example
   */
  isRecursiveVertexResize = (state: MxTypes.mxCellState) => {
    const graph = this.state.graph!;
    const model = graph.getModel()!;
    return !graph.isSwimlane(state.cell) && model.getChildCount(state.cell) > 0 &&
        !graph.isCellCollapsed(state.cell) && mx.mxUtils.getValue(state.style, "recursiveResize", "1") == "1" &&
        mx.mxUtils.getValue(state.style, "childLayout", null) == null;
  }


  dropImage = (graph:MxTypes.mxGraph, evt:DragEvent) => {
    if (graph.isEnabled()) {
      evt.stopPropagation();
      evt.preventDefault();

      // Gets drop location point for vertex
      const {x, y} = editorActions.getVertexDropLocation(graph, evt);

      // Converts local images to data urls
      const filesArray = evt.dataTransfer?.files as FileList;

      for (let i = 0; i < filesArray.length; i++) {
        this.handleDrop(graph, filesArray[i], x + i * 10, y + i * 10);
      }
    }
  };


  // see drop.html for reference
  handleDrop = (graph:MxTypes.mxGraph, file:File, x:number, y:number) => {
    // Checks filesupport for dropping images
    const fileSupport = window.File != null && window.FileReader != null && window.FileList != null;

    if (!fileSupport) {
      // Displays an error message if the browser is not supported.
      mx.mxUtils.error("Drop data in Browser is not supported!", 200, false);
    }

    this.insertImage(file, graph, x, y);
  };

  // Inserts a cell at the given location
  insertCell = (graph:MxTypes.mxGraph, evt:Event, target:MxTypes.mxCell, x:number, y:number, width:number, height:number, value:string, id:string | null, data?:string) => {
    const parent = graph.getDefaultParent();
    if (data) {
      // graph.insertVertex(null, null, value, x, y, width, height, data);
      graph.insertVertex(parent, id, value, x, y, width, height, "shape=image;image=" + data + ";");
      // graph.insertVertex(null, null, value, x, y, width, height, 'shape=image;image=resources/images/example-images/plus.png');
    } else {
      graph.insertVertex(parent, id, value, x, y, width, height);
    }
  };

  /**
   *  Function to create the entries in the popupmenu
   */
  createPopupMenu = (graph:MxTypes.mxGraph, menu:MxTypes.mxPopupMenu, cell:MxTypes.mxCell, evt:MouseEvent) => {
    const isSelectionGrouped = graph.getModel().getChildCount(graph.getSelectionCell()) > 0;
    if ( !this.isInitialized() ) throw new Error("Graph is not fully initialized"); // safeguard
    if (cell != null) {
      if (cell.edge === true) {
        menu.addItem("Delete connection", "resources/images/close.gif", function() {
          graph.removeCells([cell]);
          mx.mxEvent.consume(evt);
        });
      } else {
        menu.addItem("Delete nodes", "resources/images/example-images/delete2.png", function() {
          graph.removeCells(graph.getSelectionCells());
          mx.mxEvent.consume(evt);
        });
      }
      if (graph.getSelectionCount() > 1) {
        menu.addItem("Group", undefined, () => editorActions.group(graph));
      }
      if (graph.getSelectionCount() >= 1) {
        menu.addItem("Select Group", undefined, () => editorActions.selectGroup(graph));
      }
      // ungroup selected
      if (graph.getSelectionCount() === 1 && isSelectionGrouped) {
        menu.addItem("Ungroup", undefined, () => editorActions.ungroup(graph));
      }
    }
    menu.addItem("Add node", "resources/images/example-images/plus.png", () => {
      const parent = graph.getDefaultParent();
      const {x, y} = editorActions.getVertexDropLocation(graph, evt);
      const width = 120;
      const height = 60;
      graph.insertVertex(parent, null, "Enter Text here", x, y, width, height);
    });
    //TODO: add stencil used as shape and load basic.xml for basic shapes like in grapheditor example, smaller examples projects are also present

    if (DEBUG) {
      menu.addItem("Add shape", "resources/images/example-images/plus.png", () => {
        /**
         * Steps:
         * 1 create function for shape
         * 2 extend ("inherit") from another shape
         * 3 alternate / extend the basic shape
         * 4 register the new shape
         * 5 use as shape=myShape; as VertexStyleAttribute
         */


        //src: https://jgraph.github.io/mxgraph/docs/js-api/files/shape/mxShape-js.html
        function CustomShape() { }
        // @ts-ignore
        CustomShape.prototype = new mx.mxShape();
        CustomShape.prototype.constructor = CustomShape;

        // Changes the default style for vertices "in-place"
        // to use the custom shape.
        // const style = graph.getStylesheet().getDefaultVertexStyle();
        // style[mx.mxConstants.STYLE_SHAPE] = "customShape";

        /*
        * src: javascript examples: shape.html
        * The next lines use an mxCylinder instance to augment the
        * prototype of the shape ("inheritance") and reset the constructor
        * to the topmost function of the c'tor chain.
        * */
        mx.mxUtils.extend(CustomShape, mx.mxCylinder);

        // override the basic functions from inherited forms e.g. from mx.mxCylinder redrawPath
        // Defines the extrusion of the box as a "static class variable"
        // @ts-ignore
        (CustomShape.prototype as MxTypes.mxCylinder).extrude = 10;

        /*
       Next, the mxCylinder's redrawPath method is "overridden".
       This method has a isForeground argument to separate two
       paths, one for the background (which must be closed and
       might be filled) and one for the foreground, which is
       just a stroke.

       Foreground:       /
                   _____/
                        |
                        |
                     ____
       Background:  /    |
                   /     |
                   |     /
                   |____/
  */
        (CustomShape.prototype as MxTypes.mxCylinder).redrawPath = function(path, x, y, w, h, isForeground) {
          // @ts-ignore
          const dy = this.extrude * this.scale;
          // @ts-ignore
          const dx = this.extrude * this.scale;

          if (isForeground) {
            path.moveTo(0, dy);
            path.lineTo(w - dx, dy);
            path.lineTo(w, 0);
            path.moveTo(w - dx, dy);
            path.lineTo(w - dx, h);
          } else {
            path.moveTo(0, dy);
            path.lineTo(dx, 0);
            path.lineTo(w, 0);
            path.lineTo(w, h - dy);
            path.lineTo(w - dx, h);
            path.lineTo(0, h);
            path.lineTo(0, dy);
            path.lineTo(dx, 0);
            path.close();
          }
        };

        // @ts-ignore
        mx.mxCellRenderer.registerShape("customShape", CustomShape);


        // add the shape to the current graph
        const parent = graph.getDefaultParent();
        const {x, y} = editorActions.getVertexDropLocation(graph, evt);
        const width = 120;
        const height = 60;
        // select new registered shape as vertex style
        const cutomVertexStyle = "shape=customShape;";
        graph.insertVertex(parent, null, "Enter Text here", x, y, width, height, cutomVertexStyle);
      });

      menu.addItem("Add 'and' stencil shape ", "resources/images/example-images/plus.png", () => {
        const shapeName = "and";
        //TODO: check if shape was already loaded!
        //Only loads default shapes, even when shape was registered and could be loaded!
        const andShape = graph.cellRenderer.getShape(shapeName);


        // load newly added stencils
        const andStencil = mx.mxStencilRegistry.getStencil(shapeName);

        if (!andShape && !andStencil) {
          alert("Shape " + shapeName +" is not available! Load stencil file before continuing");
          return;
        }

        // add the shape to the current graph
        const parent = graph.getDefaultParent();
        const {x, y} = editorActions.getVertexDropLocation(graph, evt);
        const width = 120;
        const height = 60;
        // select new registered shape as vertex style
        const cutomVertexStyle = "shape="+ shapeName + ";";
        graph.insertVertex(parent, null, "Enter Text here", x, y, width, height, cutomVertexStyle);
      });
    }


    menu.addSeparator();
    // Edit actions
    menu.addItem("Undo", undefined, ()=> editorActions.undo(this.state.undoMgr as MxTypes.mxUndoManager));
    menu.addItem("Redo", undefined, () => editorActions.redo(this.state.undoMgr as MxTypes.mxUndoManager));
    menu.addItem("Cut", undefined, () => editorActions.cut(graph));
    menu.addItem("Copy", undefined, () => editorActions.copy(graph));
    menu.addItem("Paste", undefined, () => editorActions.paste(graph));
    menu.addItem("Paste Here", undefined, () => editorActions.pasteHere(graph, evt as MouseEvent));
    menu.addItem("Duplicate", undefined, () => editorActions.duplicate(graph));
    menu.addSeparator();
    // Waypoint
    menu.addItem("Add Waypoint", undefined, () => editorActions.addWaypoint(graph));
    menu.addItem("Remove Waypoint", undefined, () => editorActions.removeWaypoint(graph, evt as MouseEvent));
    menu.addItem("Clear all Waypoints", undefined, () => editorActions.clearAllWaypoints(graph));
    menu.addSeparator();
    // Selections
    menu.addItem("Select all", undefined, () => editorActions.selectAll(graph));
    menu.addItem("Select all Vertices", undefined, () => editorActions.selectAllVertices(graph));
    menu.addItem("Select all Edges", undefined, () => editorActions.selectAllEdges(graph));
    menu.addItem("Clear Selection", undefined, () => editorActions.clearSelection(graph));
  };

  insertImage(file:File, graph:MxTypes.mxGraph, x:number, y:number) {
    //from Actions.js of grapheditor (line 1378)
    const labelOnButtomConfig = "imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;";
    const minimumWidth = 50;
    const minimumHeight = 50;
    if (file.type.substring(0, 5) === "image") {
      const reader = new FileReader();

      reader.onload = function(e) {
        // Gets size of image for vertex
        let data = e.target?.result as string;

        const img = new Image();

        img.onload = function() {
          const width = Math.max(minimumWidth, img.width);
          const height = Math.max(minimumHeight, img.height);

          // Converts format of data url to cell style value for use in vertex
          data = sgUtilities.dataUrlToCellStyle(data);

          // Gets the default parent for inserting new cells. This
          // is normally the first child of the root (ie. layer 0).
          const parent = graph.getDefaultParent();

          graph.insertVertex(parent, null, "", x, y, width, height, "shape=image;image=" + data + ";" + labelOnButtomConfig);
          // console.log('dragged item\n' + 'shape=image;image=' + data + ';');
        };
        img.src = data;
      };
      reader.readAsDataURL(file);
    }
  }

  LoadGraph() {
    // const container = ReactDOM.findDOMNode(this.refs.divGraph) as HTMLDivElement;
    const container = this.divGraph.current!;
    // prevent scrollbar scrolling
    container.onwheel = function() {
      return false;
    };
    console.log(container);

    // Checks if the browser is supported
    if (!mx.mxClient.isBrowserSupported()) {
      // Displays an error message if the browser is not supported.
      mx.mxUtils.error("Browser is not supported!", 200, false);
    } else {
      // Disable built-in context menu
      mx.mxEvent.disableContextMenu(container);
      // TODO: use actual mxEditor for graph editing: see https://jgraph.github.io/mxgraph/javascript/examples/editors/diagrameditor.html
      // let editor = new mxEditor(container); // https://stackoverflow.com/questions/62321750/problem-with-mxeditor-and-xml-configuration-file
      // Creates the graph inside the given container
      const graph = new mx.mxGraph(container);
      const undoMgr = new mx.mxUndoManager();
      this.setState(
          {
            graph: graph,
            undoMgr: undoMgr,
          },
          () => {
            console.log(this);
            this.initializeUndomanager();
            this.setGraphSetting();
            // Gets the default parent for inserting new cells. This
            // is normally the first child of the root (ie. layer 0).
            //const parent = graph.getDefaultParent();


            // Adds cells to the model in a single step
            graph.getModel().beginUpdate();
            try {
              // const cutomVertexStyle = "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#8205FF;gradientColor=#ffffff;";
              // // var style = graph.getStylesheet().getDefaultVertexStyle();
              // const v4 = graph.insertVertex(parent, null, "Style node", 300, 150, 80, 30, cutomVertexStyle);
              // const e1 = graph.insertEdge(parent, null, "", v1, v2);
            } finally {
            // Updates the display
              graph.getModel().endUpdate();
            }
          },
      );
    }
  }


  /**
   * Loads the stylesheet for this graph.
   */
  loadStylesheet = async (graph:MxTypes.mxGraph) => {
    const xmlText = await fetch(defaultXml).then((r) => r.text());
    console.log("parsed Element");
    if (xmlText && xmlText.length > 0) {
      graph.getModel().beginUpdate();
      try {
        console.log("before decoding", graph.getStylesheet());
        //TODO: continue here to load default styles and stencils
        //FIXME: decoded doesn't result as a Stylesheet-object => could not be loaded correctly afterwards
        const decoded = decode(xmlText);
        graph.setStylesheet(decoded);
        console.log("after decoding", graph.getStylesheet());
      } finally {
        graph.getModel().endUpdate();
      }
    }
  };

  render() {
    const defaultText = "fillColor=none;strokeColor=none;stroke=none;fill=none";
    //check chrome specific problems
    const chromeUserAgent = navigator.userAgent.match("^.*Chrome");
    // const chromeCustomClasses= chromeUserAgent ? "offset-to-navbar": "";
    return (
      //FIXME: is not applied on the whole homepage (click outside symbols or mark text beforehand)
      <div onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>) => this.addGlobalKeysbindings(e)}>
        { this.isInitialized() &&
        <MenubarToolbar DEBUG={DEBUG} graph={this.state.graph} undoMgr={this.state.undoMgr} filename={this.state.filename}
          handleFilenameChange={this.handleFilenameChange}
          showHelpModal={this.showHelpModal}
          showAboutModal={this.showAboutModal}
          showKeyboardModal={this.showKeyboardModal}
          showSaveAsModal={this.showSaveAsModal}
          showEditStyleModal={this.showEditStyleModal}
        />
        }
        {/* FIXME: not dynamic, when resizing window disappears */}
        <div className="graphted-flex-container">
          <div className="offset-to-navbar" style={{width: "20%", zIndex: "2"}} onMouseEnter={() => this.state.graph?.popupMenuHandler.hideMenu()}>
            { this.isInitialized() && <>
              {/* FIXME: set scrollbar to the right size */}
              <ScrollPanel style={{width: "(100%)", height: "90vh"}} className="custom-scrollbar">
                <PrimeAccordion DEBUG={DEBUG} graph={this.state.graph} filename={this.state.filename} handleFilenameChange={this.handleFilenameChange}/>
                {/*TODO: load actual svg representation of vertexStyle and prerender like the image nodes*/}
                {/*TODO: use "data" attribute to load a specific vertexStyle e.g. a certain stencil or shape*/}
                {/* <SingleNode graph={this.state.graph} /> */}
                {/*Broken image in chrome under unix / VertexNode not draggable under firefox, even tho the svg is valid Issue #80 */}
                {chromeUserAgent ? <VertexNode graph={this.state.graph} width={60} height={30} title="Drag me to add Text" value="Enter text here" data={defaultText}/>:
                   <SingleNode graph={this.state.graph} stencilRegistry={mx.mxStencilRegistry} width={60} height={30} title={"Drag me to add Text"} value="Enter text here" data={defaultText}/>
                }
              </ScrollPanel>
              {/* Generic modal for display without large functionality */}
              <Dialog modal={true} header={this.state.modalTitle} footer={() => {
                return (
                  <div>
                    <Button label="Cancel" icon="pi pi-times" onClick={() => this.setState({displayResponsive: false})} className="p-button-text" />
                    <Button label="OK" icon="pi pi-check" onClick={() => {
                      this.setState({displayResponsive: false});
                    } } autoFocus />
                  </div>);
              } } visible={this.state.displayResponsive} onHide={() => {
                this.setState({displayResponsive: false});
              } } breakpoints={{"960px": "75vw", "640px": "100vw"}} style={{width: "25vw"}}>
                {this.state.modalContent}
              </Dialog>
              {this.isInitialized() && <Dialog header='SaveAs' visible={this.state.displaySaveAs} onHide={() => this.setState({displaySaveAs: false})} breakpoints={{"960px": "75vw"}} style={{width: "50vw"}} footer={<Button label="OK" onClick={() => {
                this.setState({displaySaveAs: false});
                editorActions.saveFile(editorActions.saveXml(this.state.graph!), this.state.filename);
              }
              } autoFocus />}>
              Save As: <InputText value={this.state.filename} type="text" onChange={(e) => {
                  this.handleFilenameChange(e.target.value);
                }}/>
              </Dialog>
              }
              {this.isInitialized() && <Dialog modal={false} header="Edit Style" footer={() => {
                return (
                  <div>
                    <Button label="Cancel" icon="pi pi-times" onClick={() => this.setState({displayEditStyle: false})} className="p-button-text" />
                    <Button label="OK" icon="pi pi-check" onClick={() => {
                      this.setState({displayEditStyle: false});
                      if (this.state.graph && (this.state.currentStyle != undefined)) {
                        this.state.graph.setCellStyle(this.state.currentStyle);
                      }
                    } } autoFocus />
                  </div>);
              } } visible={this.state.displayEditStyle} onHide={() => {
                this.setState({displayEditStyle: false});
              } } breakpoints={{"960px": "75vw", "640px": "100vw"}} style={{width: "25vw"}}>
        Style:<br />
                <InputTextarea value={this.state.currentStyle} onChange={(e) => {
                  this.setState({currentStyle: e.target.value});
                } } rows={5} cols={50} />
              </Dialog>
              }
            </>
            }
          </div>

          <div className="graph-container offset-to-navbar" style={{width: "60%", zIndex: "0", outline: "none"}} ref={this.divGraph} id="divGraph" onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>) => this.addKeysbindings(e)} onWheel = {(e) => this.addMouseWheelZoom(e) } tabIndex={0} />

          {/* FIXME: cannot scale right panel */}
          <div className={"primeTabViewArea"} onMouseEnter={() => {
            this.state.graph?.popupMenuHandler.hideMenu();
            // document.getElementById("right-side-tabview")?.focus();
          }}>
            { // TODO:GUI options
            // FIXME: Panel gets pushed away when graph is too big (e.g.strongly zoomed in)
            // TODO: show either Diagram options/hide (default) or TabView (something selected)
              this.isInitialized() && <>
                {/* <button onClick={ (e) => this.updateGraph()}>Refresh</button> */}
                <PrimeTabView className="offset-to-navbar" graph={this.state.graph} DEBUG={DEBUG}
                  showEditStyleModal={this.showEditStyleModal}
                />
              </>
            }
          </div>
        </div>
      </div>
    );
  }
}


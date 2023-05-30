import DraggableNode from "./DraggableNode";

// import mxgraph and typscript libraries
import factory from "mxgraph";
import * as MxTypes from "mxgraph"; // <- import types only
import React from "react";
import ReactDOM from "react-dom";
// create empty graph


const mx = factory({
  mxBasePath: "mxgraph/javascript/src",
  mxImageBasePath: "mxgraph/javascript/src/images",
});
console.log("mxgraph version: ", mx.mxClient.VERSION);


interface SingleNodeProps {
  graph:MxTypes.mxGraph;
  stencilRegistry: MxTypes.mxStencilRegistry;
  width:number;
  height:number;
  value:string;
  data:string
  title?: string;
}

interface SingleNodeState {
  cellId?:string;
  isExported?:string;
  src:string;
  svg:string;
}

// only for type system. So type script can check required states
type SingleNodeStateSet = Required<SingleNodeState>;

//FIXME: workaround to remove connector types, that could not be represented like other shapes
const connectorTypes = ["connector", "arrow", "arrowConnector"];
export default class SingleNode extends DraggableNode<SingleNodeProps, SingleNodeState> {
  private imageRef = React.createRef<HTMLImageElement>();

  constructor(props:SingleNodeProps) {
    super(props);
    this.loadShape = this.loadShape.bind(this);
  }

  isInitialized() : this is {state: SingleNodeStateSet} {
    return this.state.cellId !== undefined;
  }

  isImageLoaded() : this is {state: SingleNodeState} {
    return this.state && this.state.src !== undefined;
  }

  componentDidMount() {
    this.initializeDragElement(this.imageRef.current!);
  }

  static defaultProps = {
    width: 50,
    height: 50,
    value: "",
    data: null,
    title: "",
  };

  // Inserts a cell at the given location
  insertCell = (x:number, y:number) => {
    const parent = this.props.graph.getDefaultParent();
    const {value, title, data, width, height} = this.props;
    let cell = null;
    if (title && connectorTypes.includes(title)) {
      // create edge by manually: https://stackoverflow.com/questions/49839882/mxgraph-adding-edges
      cell = new mx.mxCell(null, new mx.mxGeometry(0, 0, width, height), (data + ";html=1;"));
      cell.geometry.setTerminalPoint(new mx.mxPoint(x, y), true);
      cell.geometry.setTerminalPoint(new mx.mxPoint((x+50), y), false);
      cell.geometry.relative = true;
      cell.edge = true;

      cell = this.props.graph.addCell(cell);
      this.props.graph.fireEvent(new mx.mxEventObject("cellsInserted", "cells", [cell]));
    } else {
      cell = this.props.graph.insertVertex(parent, null, value, x, y, width, height, data);
    }
    this.setState({cellId: cell.id});
  };


  // src: adapted from diagrameditor.html (Client-side code for SVG export)
  exportSvgCode = (graph:MxTypes.mxGraph) => {
    const isBackgroundTransparent = true;

    //TESTED WITH graph from canvas. (shapes were not correctly displayed only text at the corresponding position)
    //FIXME: other graphs don't seem to work
    //FIXME: svg images should be represented as base64 encoding
    const scale = graph.view.scale;
    const bounds = graph.getGraphBounds();

    // Prepares SVG document that holds the output
    const svgDoc = mx.mxUtils.createXmlDocument();


    const root = (svgDoc.createElementNS != null) ?
    svgDoc.createElementNS(mx.mxConstants.NS_SVG, "svg") : svgDoc.createElement("svg");

    if (!isBackgroundTransparent) {
      if (root.style != null) {
        root.style.backgroundColor = "#FFFFFF";
      } else {
        root.setAttribute("style", "background-color:#FFFFFF");
      }
    }

    if (svgDoc.createElementNS == null) {
      root.setAttribute("xmlns", mx.mxConstants.NS_SVG);
    }

    root.setAttribute("width", Math.ceil(bounds.width * scale + 2) + "px");
    root.setAttribute("height", Math.ceil(bounds.height * scale + 2) + "px");
    root.setAttribute("xmlns:xlink", mx.mxConstants.NS_XLINK);
    root.setAttribute("version", "1.1");

    // Adds group for anti-aliasing via transform
    const group = (svgDoc.createElementNS != null) ?
    svgDoc.createElementNS(mx.mxConstants.NS_SVG, "g") : svgDoc.createElement("g");
    group.setAttribute("transform", "translate(0.5,0.5)");
    root.appendChild(group);
    svgDoc.appendChild(root);

    // Renders graph. Offset will be multiplied with state's scale when painting state.
    const svgCanvas = new mx.mxSvgCanvas2D(group);
    svgCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
    svgCanvas.scale(scale);

    const imgExport = new mx.mxImageExport();
    // up until this part the canvas should only contain empty groups
    imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas);

    //svg code is now hold here
    console.debug(root.outerHTML);
    return (root.outerHTML);
  }

  /**
   * Loads the stylesheet for this graph.
   * TODO: refactor Duplicate code
   */
     copyStylesheet = (targetGraph:MxTypes.mxGraph, sourceGraph:MxTypes.mxGraph) => {
       /*TEST encode/decode
      // let xmlText = encode(graph.getStylesheet());
      // xmlText = xmlText.replaceAll('446299', '000000');
      */
       console.log("before decoding", targetGraph.getStylesheet());
       targetGraph.getModel().beginUpdate();
       try {
         targetGraph.setStylesheet(sourceGraph.getStylesheet());
       } finally {
         targetGraph.getModel().endUpdate();
       }
       console.log("after decoding", targetGraph.getStylesheet());
     };

  /**
  * Generates an empty graph
  * Adds the vertex
  * Export the graph as SVG -> svg representation of the vertex
  * @returns the svg representation of the given vertex
  */
  cellToSVG = () => {

    // create container
    //create an invisible graph container.
    const container = ReactDOM.findDOMNode(this.refs.invisibleDivGraph) as HTMLDivElement;
    // create a new gaph
    //@ts-ignore
    const graph = new mx.mxGraph(container);

    //Add cell to new empty graph
    // Gets the default parent for inserting new cells.
    const parent = graph.getDefaultParent();
    this.copyStylesheet(graph, this.props.graph);
    //FIXME: costum shape do not load immediatly
    //copy mx.mxStencilRegistry for custom shapes
    //@ts-ignore
    mx.mxStencilRegistry.stencils = this.props.stencilRegistry.stencils;

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      const {width, height, value, title, data} = this.props;
      // TODO: distinguish for connector types
      if (title && connectorTypes.includes(title)) {
        //insert vertices with edge between them
        const v1 = graph.insertVertex(parent, null, value, 0, 0, 1, 1, data);
        const v2 = graph.insertVertex(parent, null, value, 50, 0, 1, 1, data);
        graph.insertEdge(parent, null, "", v1, v2, data);
        // const edge = graph.createEdge(parent, null, value, null, null, data);
      } else {
        graph.insertVertex(parent, null, value, 0, 0, width, height, data);
      }
    } finally {
    // Updates the display
      graph.getModel().endUpdate();
    }

    // Renders graph to SVG
    const svgCode = this.exportSvgCode(graph);

    //delete temporary dom node (additional graph)
    if (container) {
      container.remove();
    }
    // react-dom version
    // ReactDOM.unmountComponentAtNode(container);
    // document.body.removeChild(document.getElementById("invisibleDivGraph")!);
    return svgCode;
  }

  loadShape() {
    const svgCellSource = this.cellToSVG();
    // src for svg encoding: https://stackoverflow.com/questions/44900569/turning-an-svg-string-into-an-image-in-a-react-component
    const srcString = `data:image/svg+xml;utf8,${svgCellSource}`;
    this.setState({src: srcString, svg: svgCellSource});
  }

  /**
   *
   * @param name draws shape or imported stencil
   * @returns
   */
  drawShape = () => {
    const svgCellSource = this.cellToSVG();
    // src for svg encoding: https://stackoverflow.com/questions/44900569/turning-an-svg-string-into-an-image-in-a-react-component
    const srcString = `data:image/svg+xml;utf8,${svgCellSource}`;
    return <img src={srcString} onLoad={this.loadShape} ref={this.imageRef} width={50} title={this.props.title} alt={this.props.title}/>;
  };

  //TODO: Render Shape / Svg or stencil: currently only path to xml is rendered inside image
  render() {
    return (
      <>{this.drawShape()}
        {/* workaround to export shapes as svg*/}
        {/* TODO: remove graph if not needed anymore: currently for every node a new invisible graph is produced*/}
        <div hidden className="graph-container" ref="invisibleDivGraph" id="invisibleDivGraph" data-display="none" data-visibility="hidden"/>
      </>

    );
  }
}

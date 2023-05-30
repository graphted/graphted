import {Component} from "react";
// import mxgraph and typscript libraries
import factory from "mxgraph";
import * as MxTypes from "mxgraph"; // <- import types only

const mx = factory({
  mxBasePath: "mxgraph/javascript/src",
  mxImageBasePath: "mxgraph/javascript/src/images",
});
console.log("mxgraph version: ", mx.mxClient.VERSION);


interface DraggableNodeProps {
    graph:MxTypes.mxGraph;
}

export default abstract class DraggableNode <Props extends DraggableNodeProps, State> extends Component<Props, State> {
  // Inserts a cell at the given location
  abstract insertCell (x:number, y:number): void;
  abstract render () : JSX.Element;

    // Returns the graph under the mouse (in example code multiple graphs are possible)
    graphF = (evt:MouseEvent) => {
      const graph = this.props.graph;
      const x = mx.mxEvent.getClientX(evt);
      const y = mx.mxEvent.getClientY(evt);
      const elt = document.elementFromPoint(x, y);
      if (elt && mx.mxUtils.isAncestorNode(graph.container, elt)) {
        return graph;
      }
      return graph;
    };


  initializeDragElement = (ele:HTMLElement) => {
    const graph = this.props.graph;
    // Drag source is configured to use dragElt for preview and as drag icon
    // if scalePreview (last) argument is true. Dx and dy are null to force
    // the use of the defaults. Note that dx and dy are only used for the
    // drag icon but not for the preview.
    const ds = mx.mxUtils.makeDraggable(
        ele,
        this.graphF,
        (graph:MxTypes.mxGraph, evt:Event, target:MxTypes.mxCell, x:number, y:number) =>
          this.insertCell(x, y),
        undefined,
        undefined,
        undefined,
        graph.autoScroll,
        true,
    );
    // Redirects feature to global switch. Note that this feature should only be used
    // if the the x and y arguments are used in funct to insert the cell.
    ds.isGuidesEnabled = function() {
      return graph.graphHandler.guidesEnabled;
    };
    // Restores original drag icon while outside of graph
    ds.createDragElement = mx.mxDragSource.prototype.createDragElement;
  }
}

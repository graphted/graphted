// import mxgraph and typscript libraries
import factory from "mxgraph";
import * as MxTypes from "mxgraph"; // <- import types only

const mx = factory({
  mxBasePath: "mxgraph/javascript/src",
  mxImageBasePath: "mxgraph/javascript/src/images",
});
console.log("mxgraph version: ", mx.mxClient.VERSION);


export interface UndoManagerInterface{
    graph:MxTypes.mxGraph;
    undoMgr:MxTypes.mxUndoManager;
    undoListener: (sender:any, evt:any) => void
}

// extracted from editor.js
export class UndoManager implements UndoManagerInterface {
  constructor(graph:MxTypes.mxGraph) {
    this.graph = graph;
    this.undoMgr = new mx.mxUndoManager();

    this.undoListener = function(_sender, evt) {
      this.undoMgr.undoableEditHappened(evt.getProperty("edit"));
    };
    // Installs the command history
    const listener = mx.mxUtils.bind(this, function(this:UndoManager, _sender:any, evt:any) {
      // this.undoListener.apply(this, arguments);
      this.undoListener.apply(this, evt);
    });

    graph.getModel().addListener(mx.mxEvent.UNDO, listener);
    graph.getView().addListener(mx.mxEvent.UNDO, listener);

    // Keeps the selection in sync with the history
    const undoHandler = function(_sender:any, evt:any) {
      const cand = graph.getSelectionCellsForChanges(evt.getProperty("edit").changes, function(change) {
        // Only selects changes to the cell hierarchy
        return !(change instanceof MxTypes.mxChildChange);
      });

      if (cand.length > 0) {
        const cells = [];

        for (let i = 0; i < cand.length; i++) {
          if (graph.view.getState(cand[i]) != null) {
            cells.push(cand[i]);
          }
        }

        graph.setSelectionCells(cells);
      }
    };

    this.undoMgr.addListener(mx.mxEvent.UNDO, undoHandler);
    this.undoMgr.addListener(mx.mxEvent.REDO, undoHandler);
  }
  graph: MxTypes.mxGraph;
  undoMgr: MxTypes.mxUndoManager;
  undoListener: (sender: any, evt: any) => void;
}

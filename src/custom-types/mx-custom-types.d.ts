import {mxUtils} from "mxgraph"; // <- import types only

// Create an augmentation for "./observable"
declare module "mxgraph" {

      // Augment the 'Observable' class definition with interface merging
      class mxUtils {

        /**
         * Configures the given DOM element to act as a drag source for the
         * specified graph. Returns a a new {@link mxDragSource}. If
         * {@link mxDragSource.guideEnabled} is enabled then the x and y arguments must
         * be used in funct to match the preview location.
         *
         * @param {HTMLElement} element DOM element to make draggable.
         * @param {mxGraph} graphF {@link mxGraph} that acts as the drop target or a function that takes a mouse event and returns the current {@link mxGraph}.
         * @param {Function} funct Function to execute on a successful drop.
         * @param {Node} [dragElement] Optional DOM node to be used for the drag preview.
         * @param {number} [dx] Optional horizontal offset between the cursor and the drag preview.
         * @param {number} [dy] Optional vertical offset between the cursor and the drag preview.
         * @param {boolean} [autoscroll] Optional boolean that specifies if autoscroll should be used. Default is {@link mxGraph.autoscroll}.
         * @param {boolean} [scalePreview=false] Optional boolean that specifies if the preview element
         * should be scaled according to the graph scale. If this is true, then
         * the offsets will also be scaled. Default is false.
         * @param {boolean} [highlightDropTargets=true] Optional boolean that specifies if dropTargets
         * should be highlighted. Default is true.
         * @param {Function} [getDropTarget] Optional function to return the drop target for a given
         * location (x, y). Default is {@link mxGraph.getCellAt}.
         */
        static makeDraggable(
          element: HTMLElement,
          graphF: mxGraph |( (evt: MouseEvent) => mxGraph | null),
          funct: Function,
          dragElement?: Node,
          dx?: number,
          dy?: number,
          autoscroll?: boolean,
          scalePreview?: boolean,
          highlightDropTargets?: boolean,
          getDropTarget?: (graph: mxGraph, x: number, y: number, evt: PointerEvent) => mxCell
        ): mxDragSource;
      }
}

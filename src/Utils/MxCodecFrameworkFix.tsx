// import mxgraph and typscript libraries
import mx from "../mx";

// source mostly from: https://stackoverflow.com/questions/50800383/how-to-import-xml-encoded-mxgraph-in-a-webpack-project

// Overridden in our application
const mxCodec = mx.mxCodec;

// normally those objects are gathered from window[] for decoding. Copied from tsfactory definition.
const KNOWN_OBJECTS = {
  mxClient: mx.mxClient,
  mxLog: mx.mxLog,
  mxObjectIdentity: mx.mxObjectIdentity,
  mxDictionary: mx.mxDictionary,
  mxResources: mx.mxResources,
  mxPoint: mx.mxPoint,
  mxRectangle: mx.mxRectangle,
  mxEffects: mx.mxEffects,
  mxUtils: mx.mxUtils,
  mxConstants: mx.mxConstants,
  mxEventObject: mx.mxEventObject,
  mxMouseEvent: mx.mxMouseEvent,
  mxEventSource: mx.mxEventSource,
  mxEvent: mx.mxEvent,
  mxXmlRequest: mx.mxXmlRequest,
  mxClipboard: mx.mxClipboard,
  mxWindow: mx.mxWindow,
  mxForm: mx.mxForm,
  mxImage: mx.mxImage,
  mxDivResizer: mx.mxDivResizer,
  mxDragSource: mx.mxDragSource,
  mxToolbar: mx.mxToolbar,
  mxUndoableEdit: mx.mxUndoableEdit,
  mxUndoManager: mx.mxUndoManager,
  mxUrlConverter: mx.mxUrlConverter,
  mxPanningManager: mx.mxPanningManager,
  mxPopupMenu: mx.mxPopupMenu,
  mxAutoSaveManager: mx.mxAutoSaveManager,
  mxAnimation: mx.mxAnimation,
  mxMorphing: mx.mxMorphing,
  mxImageBundle: mx.mxImageBundle,
  mxImageExport: mx.mxImageExport,
  mxAbstractCanvas2D: mx.mxAbstractCanvas2D,
  mxXmlCanvas2D: mx.mxXmlCanvas2D,
  mxSvgCanvas2D: mx.mxSvgCanvas2D,
  mxVmlCanvas2D: mx.mxVmlCanvas2D,
  mxGuide: mx.mxGuide,
  mxShape: mx.mxShape,
  mxStencil: mx.mxStencil,
  mxStencilRegistry: mx.mxStencilRegistry,
  mxMarker: mx.mxMarker,
  mxActor: mx.mxActor,
  mxCloud: mx.mxCloud,
  mxRectangleShape: mx.mxRectangleShape,
  mxEllipse: mx.mxEllipse,
  mxDoubleEllipse: mx.mxDoubleEllipse,
  mxRhombus: mx.mxRhombus,
  mxPolyline: mx.mxPolyline,
  mxArrow: mx.mxArrow,
  mxArrowConnector: mx.mxArrowConnector,
  mxText: mx.mxText,
  mxTriangle: mx.mxTriangle,
  mxHexagon: mx.mxHexagon,
  mxLine: mx.mxLine,
  mxImageShape: mx.mxImageShape,
  mxLabel: mx.mxLabel,
  mxCylinder: mx.mxCylinder,
  mxConnector: mx.mxConnector,
  mxSwimlane: mx.mxSwimlane,
  mxGraphLayout: mx.mxGraphLayout,
  mxStackLayout: mx.mxStackLayout,
  mxPartitionLayout: mx.mxPartitionLayout,
  mxCompactTreeLayout: mx.mxCompactTreeLayout,
  mxRadialTreeLayout: mx.mxRadialTreeLayout,
  mxFastOrganicLayout: mx.mxFastOrganicLayout,
  mxCircleLayout: mx.mxCircleLayout,
  mxParallelEdgeLayout: mx.mxParallelEdgeLayout,
  mxCompositeLayout: mx.mxCompositeLayout,
  mxEdgeLabelLayout: mx.mxEdgeLabelLayout,
  mxGraphAbstractHierarchyCell: mx.mxGraphAbstractHierarchyCell,
  mxGraphHierarchyNode: mx.mxGraphHierarchyNode,
  mxGraphHierarchyEdge: mx.mxGraphHierarchyEdge,
  mxGraphHierarchyModel: mx.mxGraphHierarchyModel,
  mxSwimlaneModel: mx.mxSwimlaneModel,
  mxHierarchicalLayoutStage: mx.mxHierarchicalLayoutStage,
  mxMedianHybridCrossingReduction: mx.mxMedianHybridCrossingReduction,
  mxMinimumCycleRemover: mx.mxMinimumCycleRemover,
  mxCoordinateAssignment: mx.mxCoordinateAssignment,
  mxSwimlaneOrdering: mx.mxSwimlaneOrdering,
  mxHierarchicalLayout: mx.mxHierarchicalLayout,
  mxSwimlaneLayout: mx.mxSwimlaneLayout,
  mxGraphModel: mx.mxGraphModel,
  mxCell: mx.mxCell,
  mxGeometry: mx.mxGeometry,
  mxCellPath: mx.mxCellPath,
  mxPerimeter: mx.mxPerimeter,
  mxPrintPreview: mx.mxPrintPreview,
  mxStylesheet: mx.mxStylesheet,
  mxCellState: mx.mxCellState,
  mxGraphSelectionModel: mx.mxGraphSelectionModel,
  mxCellEditor: mx.mxCellEditor,
  mxCellRenderer: mx.mxCellRenderer,
  mxEdgeStyle: mx.mxEdgeStyle,
  mxStyleRegistry: mx.mxStyleRegistry,
  mxGraphView: mx.mxGraphView,
  mxGraph: mx.mxGraph,
  mxCellOverlay: mx.mxCellOverlay,
  mxOutline: mx.mxOutline,
  mxMultiplicity: mx.mxMultiplicity,
  mxLayoutManager: mx.mxLayoutManager,
  mxSwimlaneManager: mx.mxSwimlaneManager,
  mxTemporaryCellStates: mx.mxTemporaryCellStates,
  mxCellStatePreview: mx.mxCellStatePreview,
  mxConnectionConstraint: mx.mxConnectionConstraint,
  mxGraphHandler: mx.mxGraphHandler,
  mxPanningHandler: mx.mxPanningHandler,
  mxPopupMenuHandler: mx.mxPopupMenuHandler,
  mxCellMarker: mx.mxCellMarker,
  mxSelectionCellsHandler: mx.mxSelectionCellsHandler,
  mxConnectionHandler: mx.mxConnectionHandler,
  mxConstraintHandler: mx.mxConstraintHandler,
  mxRubberband: mx.mxRubberband,
  mxHandle: mx.mxHandle,
  mxVertexHandler: mx.mxVertexHandler,
  mxEdgeHandler: mx.mxEdgeHandler,
  mxElbowEdgeHandler: mx.mxElbowEdgeHandler,
  mxEdgeSegmentHandler: mx.mxEdgeSegmentHandler,
  mxKeyHandler: mx.mxKeyHandler,
  mxTooltipHandler: mx.mxTooltipHandler,
  mxCellTracker: mx.mxCellTracker,
  mxCellHighlight: mx.mxCellHighlight,
  mxDefaultKeyHandler: mx.mxDefaultKeyHandler,
  mxDefaultPopupMenu: mx.mxDefaultPopupMenu,
  mxDefaultToolbar: mx.mxDefaultToolbar,
  mxEditor: mx.mxEditor,
  mxCodecRegistry: mx.mxCodecRegistry,
  mxCodec: mx.mxCodec,
  mxObjectCodec: mx.mxObjectCodec,
  mxCellCodec: mx.mxCellCodec,
  mxModelCodec: mx.mxModelCodec,
  mxRootChangeCodec: mx.mxRootChangeCodec,
  mxChildChangeCodec: mx.mxChildChangeCodec,
  mxTerminalChangeCodec: mx.mxTerminalChangeCodec,
  mxGenericChangeCodec: mx.mxGenericChangeCodec,
  mxGraphCodec: mx.mxGraphCodec,
  mxGraphViewCodec: mx.mxGraphViewCodec,
  mxStylesheetCodec: mx.mxStylesheetCodec,
  mxDefaultKeyHandlerCodec: mx.mxDefaultKeyHandlerCodec,
  mxDefaultToolbarCodec: mx.mxDefaultToolbarCodec,
  mxDefaultPopupMenuCodec: mx.mxDefaultPopupMenuCodec,
  mxEditorCodec: mx.mxEditorCodec,
  Array: Array,
  array: Array,
};

/**
   * Function: decode
   *
   * Decodes the given XML node. The optional "into"
   * argument specifies an existing object to be
   * used. If no object is given, then a new instance
   * is created using the constructor from the codec.
   *
   * The function returns the passed in object or
   * the new instance if no object was given.
   *
   * Parameters:
   *
   * node - XML node to be decoded.
   * into - Optional object to be decodec into.
   */
mxCodec.prototype.decode = function(node, into) {
  let obj = null;

  if (node != null && node.nodeType == mx.mxConstants.NODETYPE_ELEMENT) {
    let ctor = null;

    try {
      // in original implementation window[], which requires all mxgraph component to be global:https://stackoverflow.com/questions/46872779/mxgraph-codec-decode-not-adding-cells-to-the-actual-graph
      //@ts-ignore
      ctor = KNOWN_OBJECTS[node.nodeName];
    } catch (err) {
      // ignore
      console.error("could not decode ,", node.nodeName);
    }

    const dec = mx.mxCodecRegistry.getCodec(ctor);

    if (dec != null) {
      obj = dec.decode(this, node, into);
    } else {
      obj = node.cloneNode(true);
      //@ts-ignore
      obj.removeAttribute("as");
    }
  }

  return obj;
};

export default mxCodec;

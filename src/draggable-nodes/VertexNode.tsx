import DraggableNode from "./DraggableNode";

// import mxgraph and typscript libraries
import factory from "mxgraph";
import * as MxTypes from "mxgraph"; // <- import types only
import React from "react";

const mx = factory({
  mxBasePath: "mxgraph/javascript/src",
  mxImageBasePath: "mxgraph/javascript/src/images",
});
console.log("mxgraph version: ", mx.mxClient.VERSION);


interface VertexNodeProps {
  graph:MxTypes.mxGraph;
  width:number;
  height:number;
  title?:string;
  value:string;
  data:string
}

interface VertexNodeState {
  cellId?:string;
}

// only for type system. So type script can check required states
type VertexNodeStateSet = Required<VertexNodeState>;

export default class VertexNode extends DraggableNode<VertexNodeProps, VertexNodeState> {
  private divRef = React.createRef<HTMLDivElement>();

  constructor(props:VertexNodeProps) {
    super(props);
    this.insertCell = this.insertCell.bind(this);
  }

  isInitialized() : this is {state: VertexNodeStateSet} {
    return this.state.cellId !== undefined;
  }

  componentDidMount() {
    this.initializeDragElement(this.divRef.current!);
  }

  static defaultProps = {
    width: 120,
    height: 60,
    value: "",
    data: null,
  };

  // Inserts a cell at the given location
  insertCell(x:number, y:number) {
    const parent = this.props.graph.getDefaultParent();
    const {value, data, width, height} = this.props;
    const cell = this.props.graph.insertVertex(parent, null, value, x, y, width, height, data);
    this.setState({cellId: cell.id});
  }

  render() {
    const title = this.props.title ?this.props.title : this.props.value;
    return (
      <div ref={this.divRef}> {title} </div>
    );
  }
}

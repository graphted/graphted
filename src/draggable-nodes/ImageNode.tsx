import DraggableNode from "./DraggableNode";
import * as sgUtilities from "../SgUtilities";

import React, {SyntheticEvent} from "react";
// import mxgraph and typscript libraries
import factory from "mxgraph";
import * as MxTypes from "mxgraph"; // <- import types only

const mx = factory({
  mxBasePath: "mxgraph/javascript/src",
  mxImageBasePath: "mxgraph/javascript/src/images",
});
console.log("mxgraph version: ", mx.mxClient.VERSION);


interface ImageNodeProps {
  graph:MxTypes.mxGraph;
  src:string;
  id:string;
  value:string;
  title?: string;
}

interface ImageNodeState {
  imageData?: {width:number,
              height:number,
              data:string
  }
  cellId?:string;
}

interface ImageState {
  imageData: {width:number,
              height:number,
              data:string
  }
}

// only for type system. So type script can check required states
type ImageNodeStateSet = Required<ImageNodeState>;


export default class ImageNode extends DraggableNode<ImageNodeProps, ImageNodeState> {
  private imageRef = React.createRef<HTMLImageElement>();

  constructor(props:ImageNodeProps) {
    super(props);
    this.onImgLoad = this.onImgLoad.bind(this);
  }

  isImageLoaded() : this is {state: ImageState} {
    return this.state.imageData !== undefined;
  }

  isFullyLoaded() : this is {state: ImageNodeStateSet} {
    return this.state.imageData !== undefined && this.state.cellId !== undefined;
  }

  componentDidMount() {
    this.initializeDragElement(this.imageRef.current!);
  }

  // Inserts a cell at the given location
  insertCell = (x:number, y:number) => {
    if ( !this.isImageLoaded() ) throw new Error("ImageNode is not fully initialized"); // safeguard
    const parent = this.props.graph.getDefaultParent();
    const {width, height, data} = this.state.imageData;
    const cell = this.props.graph.insertVertex(parent, null, this.props.value, x, y, width, height, data);
    this.setState({cellId: cell.id});
  };

  onImgLoad(e:SyntheticEvent<HTMLImageElement>) {
    //from Actions.js of grapheditor (line 1378)
    const labelOnButtomConfig = "imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;";

    // fully qualified url
    // @ts-ignore
    const src = e.target?.src as string;
    const height = e.currentTarget.height;
    const width = e.currentTarget.width;
    sgUtilities.toDataURL(src, async (base64endoding:string) => {
      this.setState({imageData: {height: height * 1.7,
        width: width * 1.7,
        // save as base64 encoded image
        data: "shape=image;" + labelOnButtomConfig +"image=" + sgUtilities.dataUrlToCellStyle(base64endoding) + ";",
      }});
    });
  }

  render() {
    const imageTitle = this.props.title ?this.props.title : "default title";
    return (
      <img src={this.props.src} onLoad={this.onImgLoad} ref={this.imageRef} width={50} title={imageTitle} alt={"image: \"" + imageTitle + "\" not available"}/>
    );
  }
}

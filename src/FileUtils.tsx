import * as MxTypes from "mxgraph"; // <- import types only (overwritten by custom typescript)

import React from "react";
import {AccordionTab} from "primereact/accordion";
// node wrapper
import ImageNode from "./draggable-nodes/ImageNode";
import SingleNode from "./draggable-nodes/SingleNode";

import path from "path";

import * as actions from "./Actions";
import mx from "./mx";

type ImportedImages = Map<string, imageEntry[]>;
type imageEntry = { item: any, src: string, parentFolder:string, filename:string, filepath:string }

function importAllImages(r:__WebpackModuleApi.RequireContext) {
  const images:ImportedImages = new Map();
  r.keys().forEach((item) => {
    const parentFolder = path.dirname(item).replace("./", "");
    const currentFileInfo = {item: r(item), src: r(item).default, parentFolder: parentFolder, filename: path.basename(item), filepath: item};
    if (images.has(parentFolder)) {
      const fileInfoArr = images.get(parentFolder)!;
      fileInfoArr.push(currentFileInfo);
      images.set(parentFolder, fileInfoArr);
    } else {
      images.set(parentFolder, [currentFileInfo]);
    }
  });
  return images;
}

export function loadImageFolder() {
  // require whole image folder: https://webpack.js.org/guides/dependency-management/#require-context
  const images = importAllImages(require.context(
      "./data/NodeImages/", // must be hardcoded since it cannot be determined by compile time
      true,
  ));
  return images;
}

export function loadStencilFolder() {
  //TODO: implement this function, currently only copied from ImageFolder
  // require whole image folder: https://webpack.js.org/guides/dependency-management/#require-context
  const stencilFiles = importAllImages(require.context(
      "./data/Stencils/", // must be hardcoded since it cannot be determined by compile time
      true,
  ));
  return stencilFiles;
}

export function loadImageArray(graph:MxTypes.mxGraph, value:imageEntry[]) {
  // render image folder
  return value.map( ({src, filename}) => <ImageNode key={"SidebarImgNode: " + filename} graph={graph} src={src} id={filename} title={filename.split(".")[0]} value='' />);
}

function getDefaultShapes() : any[] {
  //@ts-ignore
  const shapes = [];
  let i = 0;
  //@ts-ignore
  for (const shape in mx.mxCellRenderer.defaultShapes) {
    if (shape !== "label" && shape !== "image") {
      shapes[i] = shape;
    }
    i++;
  }
  return shapes;
}


function isShapeAvailable(graph:MxTypes.mxGraph, name: string) {
  //Only loads default shapes, even when shape was registered and could be loaded!
  const shape = graph.cellRenderer.getShape(name);
  // load newly added stencils
  const stencil = mx.mxStencilRegistry.getStencil(name);
  if (!shape && !stencil) {
    return false;
  }
  return true;
}

export function loadShapeArray(graph:MxTypes.mxGraph, value:string[]) {
  //TODO: render available shapes
  // render image folder
  const defaultColors = "fillColor=white;strokeColor=black";
  //FIXME: rendered only after node was dragged into the graph, not rendered at the same sizes, like the svg images
  return value.map( (value, i) => isShapeAvailable(graph, value) ? <SingleNode key={"SidebarStencilNode: " + value + "-" + i} graph={graph} stencilRegistry={mx.mxStencilRegistry} width={50} height={50} value="" title={value} data={"shape=" + value + "" + ";" + defaultColors} /> : <></>);
}

export function loadImageFolderToNode(graph:MxTypes.mxGraph, includeAccordionTabs:boolean) {
  // render image folder
  return Array.from(loadImageFolder().entries(), loadImages(graph, includeAccordionTabs),
  );
}

export function loadStencilFolderToNode(graph:MxTypes.mxGraph, includeAccordionTabs:boolean) {
  // render image folder
  return Array.from(loadStencilFolder().entries(), loadStencil(graph, includeAccordionTabs),
  );
}


function loadImages(graph: MxTypes.mxGraph, includeAccordionTabs:boolean) {
  // eslint-disable-next-line react/display-name
  return ( [header, imageNodesData] : ([string, imageEntry[]]) ) => {
    const imageNodes = loadImageArray(graph, imageNodesData);
    // Avoid additional divs created by react: https://reactjs.org/docs/fragments.html
    if (includeAccordionTabs) {
      return <AccordionTab header={<><i className="pi pi-calendar"></i><span>{header}</span></>}>
        <React.Fragment key ={"Sidebar elements: " + header}>{imageNodes}</React.Fragment >
      </AccordionTab>;
    }
    return imageNodes;
  };
}

async function loadFile(url:string) {
  // read file from generated url:
  return await fetch(url).then((r) => r.text());
}

function loadStencil(graph: MxTypes.mxGraph, includeAccordionTabs:boolean) {
  // eslint-disable-next-line react/display-name
  return ( [header, shapeNodesData] : ([string, imageEntry[]])) => {
    //TODO: return available shapes to render them
    //TODO: load xml data into an array of shapes
    //TODO: src: should not only include the path but an image in base64 encoding of the shape, or the shape itself to be represented
    //TODO: on drag must be exchanged with insert vertex and the corresponding shape information (shapeNode)
    shapeNodesData.map(async ({src, filename}) => {
      console.debug(filename);
      console.debug(src);

      // load xml files
      const xml = await loadFile(src);
      // register stencils from xml
      loadStencilXmlString(xml);

      // TODO: use to get image data from shape: https://jgraph.github.io/mxgraph/docs/js-api/files/shape/mxShape-js.html#mxShape.createSvg
      mx.mxShape.prototype.createSvg();

    } );
    //TODO: load shapes
    //FIXME: symbols are only loaded afterwards (after drag and drop)
    const shapeNames = getDefaultShapes();
    const customStencilsNames = Object.keys(mx.mxStencilRegistry.stencils);
    shapeNames.push.apply(shapeNames, customStencilsNames);
    //FIXME: custom shapes are not loaded currectly (everythin is loaded as default rectangle currently)
    const shapeNodes = loadShapeArray(graph, shapeNames);

    // Avoid additional divs created by react: https://reactjs.org/docs/fragments.html
    if (includeAccordionTabs) {
      return <AccordionTab header={<><i className="pi pi-calendar"></i><span>{header}</span></>}>
        <React.Fragment key ={"Sidebar elements: " + header}>{shapeNodes}</React.Fragment >
      </AccordionTab>;
    }
    return shapeNodes;
  };
}

export function loadImageFolderToJson() {
  const images = loadImageFolder();
  return Object.fromEntries(images);
}


export function readFileAsGraph(file:File, graph:MxTypes.mxGraph) {
  // src: https://javascript.info/file
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function() {
    // console.log(reader.error);
    //TODO: Load graph
    //TODO: set graph to fileContent
    const filecontent= reader.result as string;
    const doc = mx.mxUtils.parseXml(filecontent);
    //TODO: reimplement from editor.js
    actions.setGraphXml(graph, doc.documentElement);
  };
  reader.onerror = function() {
    console.log(reader.error);
  };
}

export function readStencilXmlFile(file:File) {
  // src: https://javascript.info/file
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function() {
    const filecontent= reader.result as string;
    loadStencilXmlString(filecontent);
  };
  reader.onerror = function() {
    console.log(reader.error);
  };
}

function loadStencilXmlString(filecontent: string) {
  const doc = mx.mxUtils.parseXml(filecontent);
  let shape = doc.firstChild?.firstChild;
  while (shape != null) {
    if (shape.nodeType == mx.mxConstants.NODETYPE_ELEMENT) {
      //@ts-ignore
      mx.mxStencilRegistry.addStencil(shape.getAttribute("name"), new mx.mxStencil(shape));
    }
    shape = shape.nextSibling;
  }
}


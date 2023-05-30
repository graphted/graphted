import factory from "mxgraph";

//import UndoManager from "./UndoManager";
const mx = factory({
  mxBasePath: "mxgraph/javascript/src",
  mxImageBasePath: "mxgraph/javascript/src/images",
});
console.log("mxgraph version: ", mx.mxClient.VERSION);

export default mx;

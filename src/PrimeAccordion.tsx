import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";

import {Component} from "react";
import {Accordion} from "primereact/accordion";
import {InputText} from "primereact/inputtext";

import * as fileUtils from "./FileUtils";
import {mxGraph} from "mxgraph";

interface PrimeAccordionProps {
    DEBUG: boolean;
    graph: mxGraph;
    filename: string;
    handleFilenameChange: (filename: string) => void;
  }

  interface PrimeAccordionState {
    activeIndex: number[]|null;

  }

export default class PrimeAccordion extends Component<PrimeAccordionProps, PrimeAccordionState> {
  constructor(props:PrimeAccordionProps) {
    super(props);
    this.state = {
      activeIndex: [0],
    };
  }


  render() {
    console.log("render nodes sidepanel", this.props.graph);
    return (
      <>
          Save As: <InputText value={this.props.filename} type="text" onChange={(e) => {
          this.props.handleFilenameChange(e.target.value);
        }}/>
        <Accordion className="accordion-custom" multiple activeIndex={this.state.activeIndex}>
          {// Create tabs and images based on folders
            fileUtils.loadImageFolderToNode(this.props.graph, true)
          }
          {//TODO: Create tabs and images based on stencil files
            fileUtils.loadStencilFolderToNode(this.props.graph, true)
          }
        </Accordion>
      </>
    );
  }
}

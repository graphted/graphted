import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";

import React, {Component} from "react";
import {TabView, TabPanel} from "primereact/tabview";
import {Divider} from "primereact/divider";

// additional GUI content
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";

import {mxCell, mxGraph, StyleMap, mxPoint} from "mxgraph";
import mx from "../mx";
import * as editorActions from "../Actions";
import * as styleEditorActions from "../Utils/StyleEditorActions";
import * as styleEditorOptions from "../Utils/StyleEditorOptions";
import {encode} from "../Utils/GraphFileUtils";
import {getHelpInformation} from "../Utils/ContentUtility";
import {getStyleMap, getStyleSet, getStyleMapFromCellStyleString, unionOfSet, toCamelCase, rgbaColorString, getRgba, getFromCorrespondingMap, getStyleSetFromStyleMap, getCellStyleMapForCellShape
  , getVertexCells, getEdgeCells, getConnectedCells, getCollapsedCells, getStyleAttributes, jsonMapReplacer} from "../Utils/UtilityFunctions";
import {RGBColor} from "react-color";

// TabViewElements
import ElementCheckbox from "./PrimeTabViewElementCheckbox";
import ElementColorPicker from "./ExtendedColorPicker";
import ElementInputNumber from "./ExtendedInputNumber";

import Questionary from "../iot/renderer/Questionary";
import * as iotGuiUtils from "../iot/IotGuiUtils";
import {Property} from "../iot/data-structure-utils/IotPropertyTypes";
// responsive line wrap
import "./PrimeTabView.css";

// make content scrollable
import {ScrollPanel} from "primereact/scrollpanel";
import "../Scrollbar/scrollbar.css";

interface PrimeTabViewProps {
    graph: mxGraph;
    DEBUG: boolean;
    // css properties
    id?: string;
    style?: object;
    className?: string;
    showEditStyleModal: ()=> void;
  }

  interface PrimeTabViewState {
    activeIndex: number | undefined;
    // Style
    lineColor: RGBColor;
    swimlaneFillColor: RGBColor;
    imageBorder: RGBColor;
    strokeWidth: number;
    linePattern: styleEditorOptions.styleConstants;
    labelPosition: styleEditorOptions.styleConstants;
    lineConnection: styleEditorOptions.styleConstants;
    endArrow: string;
    startArrow: string;
    edgeStyle: styleEditorOptions.styleConstants;
    fillColor: RGBColor;
    gradientColor: RGBColor;
    gradientDirection: styleEditorOptions.styleConstants;
    perimeterSpacing: number;
    shadow: boolean;
    rounded: boolean;
    // TEXT
    fontColor: RGBColor;
    labelBackgroundColor: RGBColor;
    labelBorderColor: RGBColor;
    fontSize:number;
    fontFamily:string;
    align: styleEditorOptions.styleConstants;
    textDirection: styleEditorOptions.styleConstants;
    textLayoutDirection: styleEditorOptions.styleConstants;
    spacingOptions: styleEditorOptions.styleEditorOption[];
    currentEditingOption: number | undefined;
    whiteSpace: boolean;
    horizontal: boolean;
    // arrange
    // TODO: left/top is used instead of x and y multiple times in gui: cell position and line start and line end => should be extracted
    leftPosition:number;
    topPosition:number;
    leftLineStartPosition:number;
    topLineStartPosition:number;
    leftLineEndPosition:number;
    topLineEndPosition:number;
    copiedSize:mxPoint | null;
    copiedPosition:mxPoint | null;
    rotationAngle:number;
    aspect: boolean;
    isImageFlippedHorizontal: boolean;
    isImageFlippedVertical: boolean;
    // CHECKBOXES
    isFilled: boolean;
    // debug
    displayEditDataPanel: boolean,
    copiedStyle: string| null,
    currentStyle: string,
    editedStyle: string,
    // metadata in json format
    cellMetadata: undefined | Property,
    defaultMetadataJson: Object,
    editData: any,

  }


export default class PrimeTabView extends Component<PrimeTabViewProps, PrimeTabViewState> {
  constructor(props:PrimeTabViewProps) {
    super(props);
    this.state = {
      activeIndex: 0,
      // Style
      lineColor: {r: 255, g: 255, b: 255, a: 1},
      swimlaneFillColor: {r: 255, g: 255, b: 255, a: 1},
      imageBorder: {r: 255, g: 255, b: 255, a: 1},
      strokeWidth: 1,
      linePattern: styleEditorOptions.getLineTypeOptions()[0].style,
      labelPosition: styleEditorOptions.getLabelPositionOptions()[0].style,
      lineConnection: styleEditorOptions.getConnectionStyleOptions()[0].style,
      edgeStyle: styleEditorOptions.getWaypointStyleOptions()[0].style,
      fillColor: {r: 0, g: 0, b: 0, a: 1},
      gradientColor: {r: 0, g: 0, b: 0, a: 1},
      gradientDirection: styleEditorOptions.getDirectionOptions()[0].style,
      perimeterSpacing: 0,
      shadow: false,
      rounded: false,
      // TEXT
      fontColor: {r: 255, g: 255, b: 255, a: 1},
      labelBackgroundColor: {r: 0, g: 0, b: 0, a: 1},
      labelBorderColor: {r: 255, g: 255, b: 255, a: 1},
      isFilled: true,
      fontSize: 11,
      fontFamily: styleEditorOptions.getFontFamiliyOptions()[0].code,
      endArrow: styleEditorOptions.getArrowTypeOptions()[0].code,
      startArrow: styleEditorOptions.getArrowTypeOptions()[0].code,
      align: styleEditorOptions.getAdvancedLabelPositionOptions()[0].style,
      textDirection: styleEditorOptions.getLabelWritingDirectionOptions()[0].style,
      textLayoutDirection: styleEditorOptions.getTextAlignmentOptions()[0].style,
      spacingOptions: styleEditorOptions.getSpacingOptions(),
      currentEditingOption: undefined,
      whiteSpace: false,
      horizontal: true,
      // arrange
      leftPosition: 0,
      topPosition: 0,
      leftLineStartPosition: 0,
      topLineStartPosition: 0,
      leftLineEndPosition: 0,
      topLineEndPosition: 0,
      copiedSize: null,
      copiedPosition: null,
      rotationAngle: 0,
      aspect: false,
      isImageFlippedHorizontal: false,
      isImageFlippedVertical: false,
      // debug
      displayEditDataPanel: false,
      copiedStyle: null,
      currentStyle: "",
      editedStyle: "",
      cellMetadata: undefined,
      defaultMetadataJson: iotGuiUtils.getMetadataTemplates()[0].value,
      editData: undefined,
    };
  }

    handleLineColorChange = (lineColor:RGBColor) => {
      this.setState({lineColor});
    }
    handleswimlaneFillColorChange = (swimlaneFillColor:RGBColor) => {
      this.setState({swimlaneFillColor});
    }
    handleFillColorChange = (fillColor:RGBColor) => {
      this.setState({fillColor});
    }
    handleGradientColorChange = (gradientColor:RGBColor) => {
      this.setState({gradientColor});
    }
    handleFontColorChange = (fontColor:RGBColor) => {
      this.setState({fontColor});
    }
    handlelabelBackgroundColorChange= (labelBackgroundColor:RGBColor) => {
      this.setState({labelBackgroundColor});
    }
    handlelabelBorderColorChange = (labelBorderColor:RGBColor) =>{
      this.setState({labelBorderColor});
    }
    handleimageBorderChange = (imageBorder:RGBColor) =>{
      this.setState({imageBorder});
    }
    handleDisplayEditDataPanelChange = (displayEditDataPanel:boolean) =>{
      this.setState({displayEditDataPanel});
    }

    handleCellMetadataChange = (cellMetadata:Property| undefined) =>{
      this.setState({cellMetadata});
    }
    handleDefaultMetadataJsonChange = (defaultMetadataJson:Object) =>{
      this.setState({defaultMetadataJson});
    }
    handleEditDataChange = (editData:any) =>{
      this.setState({editData});
    }

    updateSpacingOptionElement = (index:number, value:number) => {
      const arrayCopy = this.state.spacingOptions.slice();
      arrayCopy[index].style.values[0] = value;
      this.setState({spacingOptions: arrayCopy});
    };

    getTooltipForCell = (cell:mxCell) => {
      // src from processeditor.xml
      return "<b>"+ cell.getAttribute("label")+
                "</b> ("+cell.getId()+")"+
                "<br>Style: "+cell.getStyle()+
                "<br>Edges: "+cell.getEdgeCount()+
                "<br>Children: "+cell.getChildCount();
    }


    /**
     * For all GUI options default + selection
     * @param cells
     * @param defaultStyle
     * @return a set of each combination of key, value pairs.
     */
    getStyleKeys = (cells:mxCell[], defaultStyle:StyleMap) => {
      // filtering only keys from key value pairs in order to identify unique keys
      const cellStyle = new Set(Object.keys(defaultStyle));
      let uniqueStylesFromSelection:Set<string[]> = new Set();
      for (let i=0; i<cells.length; i++) {
        uniqueStylesFromSelection = unionOfSet(uniqueStylesFromSelection, getStyleSet(cells[i]));
      }
      // save attributes without values
      for (const item of uniqueStylesFromSelection) {
        cellStyle.add(item[0]);
      }
      return cellStyle;
    }

    /**
     *  //FIXME: include loaded default.xml correctly
     * //TODO: use named stylenames
     * Styles for the given cell(s)
     * @param cells
     * @return a map containing each key with one of the given values if some keys are duplicated in the set.
     */
    getStyles= (cells:mxCell[]) => {

      let uniqueStylesFromSelection:Set<[string, any]> = new Set();
      let hasVertexCells = false;
      let hasEdgeCells = false;
      for (let i=0; i<cells.length; i++) {

        //TODO: use styles based on selection this.props.graph.getStylesheet().style["text"] etc.
        const cellStyle = getCellStyleMapForCellShape(cells[i], this.props.graph.getStylesheet());
        // beware of defaults with null as their default value like "Word wrap", they basically get replaced by default.xml every time the are set to null
        uniqueStylesFromSelection = unionOfSet(uniqueStylesFromSelection, getStyleSetFromStyleMap(cellStyle));
        if (cells[i].isVertex()) hasVertexCells= true;
        if (cells[i].isEdge()) hasEdgeCells= true;
      }
      // when multiple cells are selected. Removes duplicate keys and gives random key, value pairs but each property is given
      // on single select conversion without side effects
      const styleMap = new Map(uniqueStylesFromSelection);
      const defaultStyleConnector:Map<string, any> = new Map();
      // used on edges, images and vertices
      defaultStyleConnector.set("linePattern", this.state.linePattern);
      // for all types of cells
      styleEditorOptions.addOptionToMap( styleEditorOptions.getLineTypeOptions()[0], defaultStyleConnector);
      if (hasEdgeCells) {

        // // available only for edges
        styleEditorOptions.addOptionToMap( styleEditorOptions.getLineTypeOptions()[3], defaultStyleConnector);
        //TODO: map name to value pairs of style constants in order to intialize drop down menu based on style saved in graph (e.g. dotted = STYLE_DASHED, & STYLE_DASH_PATTERN from StyleEditorOptions => values are the same as in StyleEditorOption)
        defaultStyleConnector.set("lineConnection", this.state.lineConnection);
        defaultStyleConnector.set("edgeStyle", this.state.edgeStyle);
        defaultStyleConnector.set("lineSwitchArrows", "false");
        defaultStyleConnector.set("targetPoint", 0);
        defaultStyleConnector.set("sourcePoint", 0);
      }
      if (hasVertexCells) {
        styleMap.set("editData", "true");
        styleMap.set("copySize", "true");
        if (this.state.copiedSize !== null) {
          styleMap.set("pasteSize", "true");
        }
        styleMap.set("cellWidth", 0 );
        styleMap.set("cellHeight", 0 );
        styleMap.set("copyPosition", "true");
        if (this.state.copiedPosition !== null) {
          styleMap.set("pastePosition", "true");
        }
        // default positions to be pasted with selected positions later
        styleMap.set("leftPosition", 0);
        styleMap.set("topPosition", 0);
      }
      for (const key of defaultStyleConnector.keys()) {
        if (!styleMap.has(key)) {
          styleMap.set(key, defaultStyleConnector.get(key));
        }
      }

      //FIXME: always add functional components in rendering function and not by setting styles. Beware of type specific properties
      styleMap.set("toFront", "true");
      styleMap.set("toBack", "true");
      styleMap.set("clearWaypoints", "true");

      // styleMap.set("lineSwitchArrows", "false");
      styleMap.set("editStyle", "true");
      styleMap.set("copyStyle", "true");
      if (this.state.copiedStyle !== null) {
        styleMap.set("pasteStyle", "true");
      }
      styleMap.set("distributeHorizontal", "false");
      styleMap.set("distributeVertical", "false");
      styleMap.set("cellAlignment", "left");
      styleMap.set("group", "false");
      styleMap.set("ungroup", "false");

      return styleMap;
    }

    isComponentIncluded = (tabViewComponents:string[], vertexStyles:Map<string, any>, edgeStyles:Map<string, any> ) => {
      // render devider only if component is present
      return tabViewComponents.some((component) => (vertexStyles.has(component) || edgeStyles.has(component)));
    }


    getStyleOptionStyle = (optionCanditates:styleEditorOptions.styleEditorOption[], styleMap:Map<string, any>, defaultValue:styleEditorOptions.styleConstants) => {
      const styleEditorOption = styleEditorOptions.getOptionKeyFromStyle(optionCanditates, styleMap);
      return styleEditorOption.length ===1 ? styleEditorOption[0].style : defaultValue;
    }

    getStyleOptionStyleFromCorrespondingStyles = (optionCanditates:styleEditorOptions.styleEditorOption[], vertexStyles:Map<string, any>, edgeStyles:Map<string, any>, defaultValue:styleEditorOptions.styleConstants) => {
      let styleEditorOption = styleEditorOptions.getOptionKeyFromStyle(optionCanditates, vertexStyles);
      if (styleEditorOption.length ===1) {
        return styleEditorOption[0].style;
      } else {
        styleEditorOption= styleEditorOptions.getOptionKeyFromStyle(optionCanditates, edgeStyles);
      }
      return styleEditorOption.length ===1 ? styleEditorOption[0].style : defaultValue;
    }


    renderNotIncludedList(availableComponents:Array<string>, vertexStyles:Map<any, any>, edgeStyles:Map<any, any>) {
      return <TabPanel header={"Not incl. GUI"}>
        Not included components:
        {
          availableComponents.filter((component) =>!(vertexStyles.has(component) || edgeStyles.has(component))).map((component) => {
            return <div>+ &apos;{component}&apos;</div>;
          })
        }
      </TabPanel>;
    }

    /**
     * Show general render options when nothing is selected
     * TODO: implement functionality
     */
     renderDiagramTab = () => {

       return <TabPanel header='Diagram'>
         <ScrollPanel style={{width: "100%", height: "75vh"}} className="custom-scrollbar">
           {/* <Button label="What should be rendered here?" onClick={()=>{
           console.log(diagramTabSections);
         }} style={{margin: "0.2rem"}}/> */}
           {getHelpInformation()}
         </ScrollPanel>
       </TabPanel>;
     }

     /**
     * Render additional debugging options in a seperate TabPanel
     */
     renderDebugTab = () => {
       //doesnt seem to update correctly => read directly from graph
       const vertexCells = getVertexCells(this.props.graph.getSelectionCells());
       const edgeCells = getEdgeCells(this.props.graph.getSelectionCells());
       const connectableCells = getConnectedCells(this.props.graph.getSelectionCells());
       const collapsedCells = getCollapsedCells(this.props.graph.getSelectionCells());

       const vertexStyles = (vertexCells && vertexCells.length > 0) ? this.getStyles(vertexCells) : new Map();
       const edgeStyles = (edgeCells && edgeCells.length > 0) ? this.getStyles(edgeCells) : new Map();

       return <TabPanel header='DEBUG'>
         <Button label="Log selected cells" onClick={()=>{
           console.log(vertexCells);
           console.log(edgeCells);
           console.log(connectableCells);
           console.log(collapsedCells);
         }} style={{margin: "0.2rem"}}/>
         <Button label="Log Style" onClick={()=>{
           this.setState({currentStyle: this.props.graph.getSelectionCell().getStyle()});
           console.log(this.props.graph.getSelectionCell().getStyle());
           this.props.showEditStyleModal();
         }} style={{margin: "0.2rem"}}/>
         <Button label="Analyze selected Cells" onClick={()=>{
           console.log("VERTEX:");
           console.log(vertexStyles);
           console.log("EDGE:");
           console.log(edgeStyles);
         }} style={{margin: "0.2rem"}}/>
         <Button label="Test debug line" onClick={()=>{
           const map = getStyleMap(vertexCells[0]);
           const value = map.get("fillColor");
           console.log(value);
           console.log("RGBA: " + rgbaColorString(getRgba(value)!));
         }} style={{margin: "0.2rem"}}/>
         <Button label="Get default stylesheet" onClick={()=>{
           const currentStyleSheet = this.props.graph.getStylesheet();
           console.log("Current default stylesheets loading xml\n", currentStyleSheet);
         }} style={{margin: "0.2rem"}}/>
         <Button label="Get default stylesheet Vertex" onClick={()=>{
           const currentStyleSheet = this.props.graph.getStylesheet().getDefaultVertexStyle();
           console.log("Current default stylesheets Vertex loading xml\n", currentStyleSheet);
         }} style={{margin: "0.2rem"}}/>
         <Button label="Get default stylesheet Edges" onClick={()=>{
           const currentStyleSheet = this.props.graph.getStylesheet().getDefaultEdgeStyle();
           console.log("Current default stylesheets Edges loading xml\n", currentStyleSheet);
         }} style={{margin: "0.2rem"}}/>
         <Button label="Get current stylesheet XML" onClick={()=>{
           const currentStyleSheet = encode(this.props.graph.getStylesheet());
           console.log("Get current stylesheet XML\n", currentStyleSheet);
         }} style={{margin: "0.2rem"}}/>
         <Button label="Get current selection XML" onClick={()=>{
           const currentSelection = encode(this.props.graph.getSelectionCells());
           console.log("Get current selection XML\n", currentSelection);
         }} style={{margin: "0.2rem"}}/>
         <Button label="Compute mxConstants" onClick={()=>{
           styleEditorOptions.getConstantsPerOption();
         }} style={{margin: "0.2rem"}}/>
       </TabPanel>;
     }


    renderMetadataTab = () => {
      //TODO: create GUI depending on elements
      const allCells = this.props.graph.getSelectionCells();
      const isSomethingSelected = allCells.length && allCells.length > 0;
      const vertexCells = getVertexCells(this.props.graph.getSelectionCells());

      const selectedGroups = this.props.graph.getCellsForUngroup();
      const isGroupSelected = selectedGroups && selectedGroups.length>0;

      function scoreAlert(score:number, metric:string) {
        (score > 0) ? alert("current "+ metric + ": " + score.toFixed(4)) : alert("no metadata detected");
      }

      const generalButtons = <><Divider align="left" type="solid"> <b>General</b> </Divider>
        <Button label="Select data provider" onClick={()=>{
        // no selection -> from whole graph
        // no selection -> from whole graph
          editorActions.selectPropertyType(this.props.graph, "data_provider", this.state.defaultMetadataJson);
        }} style={{margin: "0.2rem"}}/>
        <Button label="Select data store" onClick={()=>{
          editorActions.selectPropertyType(this.props.graph, "data_store", this.state.defaultMetadataJson);
        }} style={{margin: "0.2rem"}}/>
        <Button label="Compute graph score" onClick={()=>{
          const cells = this.props.graph.getModel().getChildCells(this.props.graph.getDefaultParent(), true, false);
          // flatten grouped cells
          const flattendCells = editorActions.getCellsWithTrustScores(this.props.graph, cells);
          if (flattendCells.length > 0) {
            scoreAlert(editorActions.evaluateEditData(this.props.graph, flattendCells, this.state.defaultMetadataJson), "score");
          } else {
            scoreAlert(0, "score");
          }
        }} style={{margin: "0.2rem"}}/>
        <Button label="Colorize questionnaires in graph" onClick={()=>{
        // if two cells are grouped, a third as a root cell is introduced. Meta data can be set onto each node
          const cells = this.props.graph.getModel().getChildCells(this.props.graph.getDefaultParent(), true, false);
          //TODO: check which combinationis in group -> if distinct ones => colorize group as data_source, otherwise as corresponding source
          // flatten grouped cells
          const flattendCells = editorActions.getCellsWithAttribute(this.props.graph, cells, "metadataType");
          editorActions.colorizeDataSources(this.props.graph, flattendCells);

        }} style={{margin: "0.2rem"}}/></>;
      const scoreButtons = <><Divider align="left" type="solid"> <b>Score</b> </Divider>
        <Button label="Compute score of selection" onClick={()=>{
          // if two cells are grouped, a third as a root cell is introduced. Meta data can be set onto each node
          const cells = this.props.graph.getSelectionCells();
          // flatten grouped cells
          const flattendCells = editorActions.getCellsWithTrustScores(this.props.graph, cells);
          if (flattendCells.length > 0 ) {
            scoreAlert(editorActions.evaluateEditData(this.props.graph, flattendCells, this.state.defaultMetadataJson), "score");
          } else {
            scoreAlert(0, "score");
          }
        }} style={{margin: "0.2rem"}}/>
        <Button label="Get max points of selection" onClick={()=>{
          // if two cells are grouped, a third as a root cell is introduced. Meta data can be set onto each node
          const cells = this.props.graph.getSelectionCells();
          // flatten grouped cells
          //If default is just applied without any selections or applying templates: current score = -1
          const flattendCells = editorActions.getCellsWithTrustScores(this.props.graph, cells);
          if (flattendCells.length > 0 ) {
            scoreAlert(editorActions.editDataGetMaxSumOfPropertyPoints(this.props.graph, flattendCells, false, this.state.defaultMetadataJson), "points");
          } else {
            scoreAlert(0, "points");
          }
        }} style={{margin: "0.2rem"}}/>
        <Button label="Get max points of of selected answers" onClick={()=>{
          // if two cells are grouped, a third as a root cell is introduced. Meta data can be set onto each node
          const cells = this.props.graph.getSelectionCells();
          // flatten grouped cells
          //If default is just applied without any selections or applying templates: current score = -1
          const flattendCells = editorActions.getCellsWithTrustScores(this.props.graph, cells);
          if (flattendCells.length > 0 ) {
            scoreAlert(editorActions.editDataGetMaxSumOfPropertyPoints(this.props.graph, flattendCells, true, this.state.defaultMetadataJson), "points");
          } else {
            scoreAlert(0, "points");
          }
        }} style={{margin: "0.2rem"}}/>
      </>;
      const questionnaireButtons = <><Divider align="left" type="solid"> <b>Questionnaire/Catalogue</b> </Divider>
        <Button label="Colorize selected questionnaire sources " onClick={()=>{
          // if two cells are grouped, a third as a root cell is introduced. Meta data can be set onto each node
          const cells = this.props.graph.getSelectionCells();
          //TODO: check which combinationis in group -> if distinct ones => colorize group as data_source, otherwise as corresponding source
          // flatten grouped cells
          const flattendCells = editorActions.getCellsWithAttribute(this.props.graph, cells, "metadataType");
          editorActions.colorizeDataSources(this.props.graph, flattendCells);
        }} style={{margin: "0.2rem"}}/>
        {/* Group cell schould not include a questionary since every group containing 1+ elements is a Data source*/}
        {/* Questionary is applied to whole selection */}
        {vertexCells.length > 0 && !isGroupSelected ?<Button label={"Add/Update questionnaire/catalogue"} onClick={()=>{
          // fully filled out default template
          const json = iotGuiUtils.getMetadataTemplates()[1].value;
          this.editDataAndSave(this.props.graph.getSelectionCells(), json);
          //TODO: add property editor here: load json/formular etc.
          // <IoTProperty></IoTProperty>
        }} style={{margin: "0.2rem"}}/> : <></>}
        {<Button label="Remove questionnaire/catalogue data" onClick={()=>{
          const cells = this.props.graph.getSelectionCells();
          const flattendCells = cells.flatMap( (cell) => editorActions.getChildren(this.props.graph, cell));
          // fully filled out default template
          const json = iotGuiUtils.getMetadataTemplates()[1].value;
          // flattened cells for group support
          this.removeDataAndSave(getVertexCells(flattendCells), json);
          // this.editDataAndSave(this.props.graph.getSelectionCells(), undefined, false);
          //TODO: add property editor here: load json/formular etc.
          // <IoTProperty></IoTProperty>
        }} style={{margin: "0.2rem"}}/>}
        {<Button label="Remove complete metadata" onClick={()=>{
          const cells = this.props.graph.getSelectionCells();
          const flattendCells = cells.flatMap( (cell) => editorActions.getChildren(this.props.graph, cell));
          // save label and remove the rest
          flattendCells.forEach((cell) => {
            // filter for cells with xml values
            // @ts-ignore
            if (mx.mxUtils.isNode(cell.value)) {
              let label = cell.getAttribute("label", "");
              label = editorActions.updateScoreInLabel(label, "").trim();
              //overwrite xml with value
              cell.setValue(label);
              // save change and update graph model + view
              this.props.graph.getModel().setValue( cell, label);
            }
          });
        }} style={{margin: "0.2rem"}}/>}
      </>;
      const onSelectionElements = <>
        {questionnaireButtons}
        {scoreButtons}
      </>;
      return <TabPanel header='Metadata'>
        <ScrollPanel style={{width: "100%", height: "75vh"}} className="custom-scrollbar">
          {generalButtons}
          {isSomethingSelected ? onSelectionElements : <></>}
        </ScrollPanel>
      </TabPanel>;
    }

    renderElements = () => {
      //doesnt seem to update correctly => read directly from graph
      const selectedCells = this.props.graph.getSelectionCells();
      const vertexCells = getVertexCells(this.props.graph.getSelectionCells());
      const edgeCells = getEdgeCells(this.props.graph.getSelectionCells());
      const connectableCells = getConnectedCells(this.props.graph.getSelectionCells());
      const collapsedCells = getCollapsedCells(this.props.graph.getSelectionCells());


      // TODO: use parsed XML file e.g. with mxUtils or in order to get cell properties like in grapheditor -> could be done with decoder, but default.xml seems to be buggy
      const vertexStyles = (vertexCells && vertexCells.length > 0) ? this.getStyles(vertexCells) : new Map();
      const edgeStyles = (edgeCells && edgeCells.length > 0) ? this.getStyles(edgeCells) : new Map();
      const allStyleAttributes = getStyleAttributes(this.props.graph.getSelectionCells());
      const allShapes = allStyleAttributes.get("shape");

      const isSelectionGrouped = this.props.graph.getModel().getChildCount(this.props.graph.getSelectionCell()) > 0;


      console.log(selectedCells);
      console.log(vertexCells);
      console.log(edgeCells);
      console.log(connectableCells);
      console.log(collapsedCells);

      //TODO: always add functional components in rendering function and not by setting styles.
      // Beware of type specific properties: currently they are inside of the components like "edgeCells.length>0" e.g.
      const functionalComponents = new Map();
      functionalComponents.set("Always", [
        "toFront",
        "toBack",
        "clearWaypoints",
        "editStyle",
        "distributeHorizontal",
        "distributeVertical",
        // requires selection of mulitple elements
        "cellAlignment",
        "group",
        "ungroup",
      ]);
      functionalComponents.set("Vertex", [
        "editData",
        "copySize",
        "pasteSize",
        "copyPosition",
        "pastePosition",
      ]);
      functionalComponents.set("Edge", ["lineSwitchArrows"]);

      //FIXME: type tabpanel object
      // contains the hierarchical order of each element beginning with penal name -> containing deviders and their individial GUI elements
      const tabview = [];

      //TODO: REFACTOR check if some devider are shape based and exclude them from sections if specific shapes are selected. Or add shape specific tabViewComponents instead of only names
      tabview.push(this.renderTabpanelStyle(allShapes, vertexCells, edgeCells));
      tabview.push(this.renderTabpanelText(allShapes));
      tabview.push(this.renderTabpanelArrange(allShapes, this.props.graph.getSelectionCells(), isSelectionGrouped));

      // TODO: use Stylenames as keys (mxConstants)
      // TODO: review buttons style vs vertex (or vertex image)
      const tabViewComponents:Map<string, any> = new Map();
      // Style
      //TODO: In including/excluding there should not exist a shape xy in the whole selection, not the grouped one.
      this.setTabViewComponents(tabViewComponents, allShapes, vertexStyles, edgeStyles, vertexCells, edgeCells, isSelectionGrouped);
      // FIXME: Update each color picker, when cell is selected in graph according to cell color
      // FIXME: Line functions intersect each other resulting in unpredictable behaviour (could be a side effect of not synching functions to graph)
      return this.renderTabview(selectedCells, tabview, vertexStyles, edgeStyles, tabViewComponents);
    }

    private renderTabpanelStyle(allShapes: Set<any> | undefined, vertexCells: mxCell[], edgeCells:mxCell[], tabpanelName:string = "Style") {
      let sections:any[] = [];
      if ((allShapes?.has("swimlane")) || (allShapes?.has("image"))) {
        //FIXME: type section
        sections = [
          {deviderLabel: "Other", tabviewComponents: ["imageBorder", "swimlaneFillColor"]},
        ];
        if (vertexCells && vertexCells.length >0 ) {
          sections.push({deviderLabel: "Cells", tabviewComponents: ["fillColor", "gradientColor", "gradientDirection"]});
        }
        sections.push({deviderLabel: "Line", tabviewComponents: ["strokeColor", "linePattern", "strokeWidth", "lineConnection", "edgeStyle", "startArrow", "endArrow", "lineSwitchArrows", "perimeterSpacing"]});

        if (!(allShapes?.has("image"))) {
          sections.push({deviderLabel: "Cell Specific", tabviewComponents: ["rounded"]});
        }
        sections.push({deviderLabel: "General", tabviewComponents: ["shadow"]});
      } else {
        if (vertexCells && vertexCells.length >0 ) {
          sections.push({deviderLabel: "Cells", tabviewComponents: ["fillColor", "gradientColor", "gradientDirection"]});
        }
        sections.push({deviderLabel: "Line", tabviewComponents: ["strokeColor", "linePattern", "strokeWidth", "lineConnection", "edgeStyle", "startArrow", "endArrow", "lineSwitchArrows", "perimeterSpacing"]});
        //TODO: refactor rendering: do not  if only edge or image is selected
        sections.push({deviderLabel: "Cell Specific", tabviewComponents: ["rounded"]});
        //TODO: refactor rendering: do not if only an image is selected
        sections.push({deviderLabel: "General", tabviewComponents: ["shadow"]});

      }
      sections.push({deviderLabel: "Misc", tabviewComponents: ["editStyle", "copyStyle", "pasteStyle"]});
      return {tabpanel: tabpanelName, sections: sections};
    }

    private renderTabpanelText(allShapes: Set<any> | undefined, tabpanelName:string = "Text") {
      const sections = [{deviderLabel: "Font", tabviewComponents: ["fontFamily", "fontSize", "fontStyle", "horizontal"]},
        {deviderLabel: "Color", tabviewComponents: ["fontColor", "labelBackgroundColor", "labelBorderColor"]},
        {deviderLabel: "Alignment", tabviewComponents: ["textDirection", "whiteSpace", "labelPosition", "verticalLabelPosition", "align"]},
        {deviderLabel: "Spacing", tabviewComponents: ["spacing", "spacingTop", "spacingLeft", "spacingRight", "spacingBottom"]},
      ];
      //TODO: Adding Text to images -> default case Text on the buttom of the image as footer
      return {tabpanel: tabpanelName, sections: sections};
    }

    private renderTabpanelArrange(allShapes: Set<any> | undefined, selectedCells:mxCell[], isSelectionGrouped:boolean, tabpanelName:string = "Arrange") {
      const vertexCells = getVertexCells(selectedCells);

      const sections = [
        {deviderLabel: "Other", tabviewComponents: ["toFront", "toBack", "clearWaypoints", "editData"]},
        {deviderLabel: "Size", tabviewComponents: ["copySize", "pasteSize", "cellWidth", "cellHeight", "aspect"]},
        {deviderLabel: "Position", tabviewComponents: ["position", "copyPosition", "pastePosition", "leftPosition", "topPosition"]},
        {deviderLabel: "Start", tabviewComponents: ["startPosition"]},
        {deviderLabel: "End", tabviewComponents: ["endPosition"]},
        {deviderLabel: "Angle", tabviewComponents: ["rotation", "rotationAngleButton"]},
      ];
      if ((vertexCells && vertexCells.length > 1)) {
        sections.push({deviderLabel: "Align", tabviewComponents: ["cellAlignment"]});
        sections.push({deviderLabel: "Distribute", tabviewComponents: ["distributeHorizontal", "distributeVertical"]});
      }
      if ( isSelectionGrouped || selectedCells.length > 1) {
        sections.push({deviderLabel: "Groups", tabviewComponents: ["group", "ungroup"]});
      }
      sections.push({deviderLabel: "Flip", tabviewComponents: ["flipH", "flipV"]});
      //TODO: End (target point) slider is missing if one edge is selected. If edge is onto vertex also missing Start (source point) slider
      sections.push({deviderLabel: "Edge Position", tabviewComponents: ["sourcePoint", "targetPoint"]});
      return {tabpanel: tabpanelName, sections: sections};
    }

    /**
     * Create GUI elements for each style attribute
     * @param tabViewComponents map containing all GUI elements
     * @param allShapes selected shapes of cells
     * @param vertexStyles collection of all possible vertex style attributes
     * @param edgeStyles  collection of all possible edge style attributes
     * @param vertexCells  collection of all possible vertex cells
     * @param edgeCells   collection of all possible edge cells
     * @param isSelectionGrouped defines if the currently selected element is grouped
     */
    private setTabViewComponents(tabViewComponents: Map<string, any>, allShapes: Set<any> | undefined, vertexStyles: Map<any, any>, edgeStyles: Map<any, any>, vertexCells: mxCell[], edgeCells: mxCell[], isSelectionGrouped: boolean) {
      const currentCellStyleMap = getStyleMapFromCellStyleString(this.props.graph.getSelectionCell()?.getStyle());
      const isGradientUsed = vertexStyles.get("gradientColor") && vertexStyles.get("gradientColor") !== "none"? true : false;
      const isFillColorUsed = vertexStyles.get("fillColor") && vertexStyles.get("fillColor") !== "none"? true : false;

      tabViewComponents.set("strokeColor", !(allShapes?.has("image")) ? <ElementColorPicker
        defaultColor={getRgba(getFromCorrespondingMap(vertexStyles, edgeStyles, "strokeColor"))!}
        color={getRgba(currentCellStyleMap.get("strokeColor"), false)}
        handleColorChange={(e: RGBColor) => {
          this.handleLineColorChange(e);
          styleEditorActions.setStrokeColor(this.props.graph, e);
        } }
        handleCheckboxChange={(isChecked) => {

          if (!isChecked) {
            styleEditorActions.setStrokeColor(this.props.graph);
          } else if (isChecked) {
            styleEditorActions.setStrokeColor(this.props.graph, getRgba(getFromCorrespondingMap(vertexStyles, edgeStyles, "strokeColor"))!);
          }

        }} label={"Line"} labelWidth={"50px"} /> : <></>);

      tabViewComponents.set("swimlaneFillColor", (allShapes?.has("swimlane")) ? <ElementColorPicker defaultColor={getRgba(edgeStyles.get("swimlaneFillColor"))}
        color={getRgba(currentCellStyleMap.get("swimlaneFillColor"), false)}
        handleColorChange={(e) => {
          this.handleswimlaneFillColorChange(e); styleEditorActions.setLaneColor(this.props.graph, e);
        } } handleCheckboxChange={(isChecked) => {
          if (!isChecked) {
            styleEditorActions.setLaneColor(this.props.graph);
          } else if (isChecked) {
            styleEditorActions.setLaneColor(this.props.graph, getRgba(edgeStyles.get("swimlaneFillColor")));
          }
        }}label={"Lane"} labelWidth={"50px"} /> : <> </>);

      tabViewComponents.set("imageBorder", (allShapes?.has("image")) ? <ElementColorPicker defaultColor={getRgba(vertexStyles.get("imageBorder"))}
        color={getRgba(currentCellStyleMap.get("imageBorder"), false)}
        handleColorChange={(e) => {
          this.handleimageBorderChange(e); styleEditorActions.setImageBorder(this.props.graph, e);
        } } handleCheckboxChange={(isChecked) => {

          if (!isChecked) {
            styleEditorActions.setImageBorder(this.props.graph);
          } else if (isChecked) {
            styleEditorActions.setImageBorder(this.props.graph, getRgba(vertexStyles.get("imageBorder")));
          }
        }}label={"Image Border"} labelWidth={"50px"} /> : <> </>);

      tabViewComponents.set("strokeWidth", <ElementInputNumber label="Line width" sharedId="strokeWidth" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "strokeWidth")} onChange={(e) => {
        this.setState({strokeWidth: e.value}); styleEditorActions.setStrokeWidth(this.props.graph, e.value);
      } } min={0}></ElementInputNumber>);
      // tabViewComponents.set('strokeWidth', <ElementInputNumber label="Line width" sharedId="strokeWidth" value={this.state.strokeWidth} onChange={(e) =>{
      //   this.setState({strokeWidth: e.value}); styleEditorActions.setStrokeWidth(this.props.graph, e.value);
      // }} min={0}></ElementInputNumber>);

      tabViewComponents.set("linePattern", <><div>Line pattern</div><Dropdown value={this.getStyleOptionStyle(styleEditorOptions.getGeneralLineTypeOptions(), edgeStyles.size > 0 ? edgeStyles : vertexStyles, this.state.linePattern)} options={styleEditorOptions.getGeneralLineTypeOptions()} onChange={(e) => {
        this.setState({linePattern: e.value}); styleEditorActions.setStyle(this.props.graph, e.value);
      } } optionLabel="name" optionValue="style" placeholder="Line Pattern" /></>);

      tabViewComponents.set("lineConnection", <><div>Connection Type</div><Dropdown value={this.getStyleOptionStyle(styleEditorOptions.getConnectionStyleOptions(), edgeStyles, this.state.lineConnection)} options={styleEditorOptions.getConnectionStyleOptions()} onChange={(e) => {
        this.setState({lineConnection: e.value}); styleEditorActions.setStyle(this.props.graph, e.value);
      } } optionLabel="name" optionValue="style" placeholder="Connection Type" /></>);

      tabViewComponents.set("edgeStyle", <><div>Waypoints</div> <Dropdown value={this.getStyleOptionStyle(styleEditorOptions.getWaypointStyleOptions(), edgeStyles, this.state.edgeStyle)} options={styleEditorOptions.getWaypointStyleOptions()} onChange={(e) => {
        this.setState({edgeStyle: e.value}); styleEditorActions.setStyle(this.props.graph, e.value);
      } } optionLabel="name" optionValue="style" placeholder="Waypoint styles" /></>);

      tabViewComponents.set("fillColor", (vertexCells && vertexCells.length > 0) ? <ElementColorPicker defaultColor={getRgba(vertexStyles.get("fillColor"))!}
        color={getRgba(currentCellStyleMap.get("fillColor"), false)} handleColorChange={(e: RGBColor) => {
          this.handleFillColorChange(e);
          styleEditorActions.fill(this.props.graph, e, isGradientUsed);
        } } handleCheckboxChange={(isChecked) => {
          if (!isChecked) {
            styleEditorActions.fill(this.props.graph);
          } else if (isChecked) {
            styleEditorActions.fill(this.props.graph, getRgba(vertexStyles.get("fillColor"))!);
          }
        }} label={"Fill"} labelWidth={"50px"} />: <></>);

      tabViewComponents.set("gradientColor", (vertexCells && vertexCells.length > 0) ? <ElementColorPicker defaultColor={getRgba(vertexStyles.get("gradientColor"))!}
        color={getRgba(currentCellStyleMap.get("gradientColor"), false)}
        handleColorChange={(e) => {
        // if fillcolor already set, convert it to hex values (gradient only works with hex)
          if (isFillColorUsed) {
            const fillColor = getRgba(vertexStyles.get("fillColor"))!;
            this.handleFillColorChange(fillColor);
            styleEditorActions.fill(this.props.graph, fillColor, isGradientUsed);
          }
          this.handleGradientColorChange(e);
          styleEditorActions.setGradientColor(this.props.graph, e);
        } } handleCheckboxChange={(isChecked) => {

          if (!isChecked) {
            styleEditorActions.setGradientColor(this.props.graph);
          } else if (isChecked) {
            const gradientDefaultColor = getRgba(vertexStyles.get("gradientColor"))!;
            if (isFillColorUsed) {
              const fillColor = getRgba(vertexStyles.get("fillColor"))!;
              this.handleFillColorChange(fillColor);
              // use hex values since gradient will be used after the cehckbox
              styleEditorActions.fill(this.props.graph, fillColor, true);
            }
            this.handleGradientColorChange(gradientDefaultColor);
            styleEditorActions.setGradientColor(this.props.graph, gradientDefaultColor);
          }
        }} label={"Gradient"} labelWidth={"50px"} />: <></>);

      tabViewComponents.set("gradientDirection", <><div>Gradient Direction</div> <Dropdown value={ {keys: [mx.mxConstants.STYLE_DIRECTION], values: [getFromCorrespondingMap(vertexStyles, edgeStyles, "direction")]}} options={styleEditorOptions.getDirectionOptions()} onChange={(e) => {
        this.setState({gradientDirection: e.value}); styleEditorActions.setStyle(this.props.graph, e.value);
      } } optionLabel="name" optionValue="style" placeholder="Gradient Direction" /></>);

      tabViewComponents.set("perimeterSpacing", <ElementInputNumber label="Perimeter" sharedId="perimeterSpacing" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "perimeterSpacing")} onChange={(e) => {
        this.setState({perimeterSpacing: e.value}); styleEditorActions.setPerimeter(this.props.graph, e.value);
      } } ></ElementInputNumber>);

      tabViewComponents.set("shadow", <ElementCheckbox label=" Shadow" sharedId="shadow" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "shadow") === "1" ? true : false} onChange={(e) => {
        styleEditorActions.setStyleShadow(this.props.graph, e.checked);
      } } />);

      tabViewComponents.set("rounded", (vertexCells && vertexCells.length > 0 && !(allShapes?.has("image"))) ? <ElementCheckbox label=" Rounded" sharedId="rounded" value={vertexStyles.get("rounded") === "1" ? true : false} onChange={(e) => {
        styleEditorActions.setStyleRounded(this.props.graph, e.checked);
      } } /> : <></>);

      tabViewComponents.set("editStyle", <><Button label="Edit Style" onClick={() => {
        this.props.showEditStyleModal();
      } } style={{margin: "0.2rem"}} />
      </>,
      );
      tabViewComponents.set("copyStyle", <Button label="Copy Style" onClick={() => {
        this.setState({copiedStyle: this.props.graph.getSelectionCell().getStyle()});
      } } style={{margin: "0.2rem"}} />);
      tabViewComponents.set("pasteStyle", <Button label="Paste Style" onClick={() => {
        this.state.copiedStyle !== null ? this.props.graph.setCellStyle(this.state.copiedStyle) : console.error("no Style set to use pasteStyle onto.");

      } } style={{margin: "0.2rem"}} />);
      tabViewComponents.set("startArrow", <><div>Start Arrow</div> <Dropdown value={edgeStyles.get("startArrow")} options={styleEditorOptions.getArrowTypeOptions()} onChange={(e) => {
        this.setState({startArrow: e.value.code}); styleEditorActions.setLineStart(this.props.graph, e.value.code);
      } } optionLabel="name" placeholder="Start Arrow" editable /></>);
      tabViewComponents.set("endArrow", <><div>End Arrow</div> <Dropdown value={edgeStyles.get("endArrow")} options={styleEditorOptions.getArrowTypeOptions()} onChange={(e) => {
        this.setState({endArrow: e.value.code}); styleEditorActions.setLineEnd(this.props.graph, e.value.code);
      } } optionLabel="name" placeholder="End Arrow" editable /></>);
      //FIXME: onclick on preadded lines applies default waypoint style onto them even if style doesn't get set.
      //Since defaults are added automatically if not present and if they do not match. (is default xml loaded before adding vertex? style doesnt seem to be default)
      // Seems to be an asynch error. When graph is loaded slowly it doesn't appear. Properties are set directly
      // newly loaded arrows dont receive this error only preloaded ones
      tabViewComponents.set("lineSwitchArrows", edgeCells.length > 0 ? <Button label="Switch Arrows" style={{margin: "0.2rem"}} onClick={() => {
        const startArrow = edgeStyles.get("startArrow");
        const endArrow = edgeStyles.get("endArrow");
        styleEditorActions.reverseLineArrows(this.props.graph, startArrow, endArrow);
        this.setState({startArrow: endArrow});
        this.setState({endArrow: startArrow});
      } } /> : <></>);
      //     // TEXT
      tabViewComponents.set("fontColor", <ElementColorPicker defaultColor={getRgba(getFromCorrespondingMap(vertexStyles, edgeStyles, "fontColor"))}
        color={getRgba(currentCellStyleMap.get("fontColor"), false)}
        handleColorChange={(e) => {
          this.handleFontColorChange(e); styleEditorActions.setFontColor(this.props.graph, e);
        } } handleCheckboxChange={(isChecked) => {
          if (!isChecked) {
            styleEditorActions.setFontColor(this.props.graph);
          } else if (isChecked) {
            styleEditorActions.setFontColor(this.props.graph, getRgba(getFromCorrespondingMap(vertexStyles, edgeStyles, "fontColor")));
          }
        }} label={"Font"} labelWidth={"50px"} />);

      tabViewComponents.set("labelBackgroundColor", <ElementColorPicker defaultColor={getRgba(getFromCorrespondingMap(vertexStyles, edgeStyles, "labelBackgroundColor"))}
        color={getRgba(currentCellStyleMap.get("labelBackgroundColor"), false)}
        handleColorChange={(e) => {
          this.handlelabelBackgroundColorChange(e); styleEditorActions.setLabelBackgroundColor(this.props.graph, e);
        } } handleCheckboxChange={(isChecked) => {

          if (!isChecked) {
            styleEditorActions.setLabelBackgroundColor(this.props.graph);
          } else if (isChecked) {
            styleEditorActions.setLabelBackgroundColor(this.props.graph, getRgba(getFromCorrespondingMap(vertexStyles, edgeStyles, "labelBackgroundColor")));
          }

        }} label={"Background"} labelWidth={"50px"} />);
      tabViewComponents.set("labelBorderColor", <ElementColorPicker defaultColor={getRgba(getFromCorrespondingMap(vertexStyles, edgeStyles, "labelBorderColor"))}
        color={getRgba(currentCellStyleMap.get("labelBorderColor"), false)}
        handleColorChange={(e) => {
          this.handlelabelBorderColorChange(e); styleEditorActions.setLabelBorderColor(this.props.graph, e);
        } } handleCheckboxChange={(isChecked) => {

          if (!isChecked) {
            styleEditorActions.setLabelBorderColor(this.props.graph);
          } else if (isChecked) {
            styleEditorActions.setLabelBorderColor(this.props.graph, getRgba(getFromCorrespondingMap(vertexStyles, edgeStyles, "labelBorderColor")));
          }
        }} label={"Border"} labelWidth={"50px"} />);
      //     tabViewComponents.set('isFilled',
      tabViewComponents.set("fontSize", <ElementInputNumber label="Size" sharedId="Fontsize" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "fontSize")} onChange={(e) => {
        this.setState({fontSize: e.value}); styleEditorActions.setFontsize(this.props.graph, e.value);
      } } min={0}></ElementInputNumber>);
      tabViewComponents.set("fontFamily", <><div>Font</div> <Dropdown value={getFromCorrespondingMap(vertexStyles, edgeStyles, "fontFamily")} options={styleEditorOptions.getFontFamiliyOptions()} onChange={(e) => {
        this.setState({fontFamily: e.value.code}); styleEditorActions.setFontFamiliy(this.props.graph, e.value.code);
      } } optionLabel="name" placeholder="Select a Font" editable /></>);
      tabViewComponents.set("textDirection", <><div>Writing Direction</div><Dropdown value={{keys: [mx.mxConstants.STYLE_TEXT_DIRECTION], values: [getFromCorrespondingMap(vertexStyles, edgeStyles, "textDirection")]}} options={styleEditorOptions.getLabelWritingDirectionOptions()} onChange={(e) => {
        this.setState({textDirection: e.value}); styleEditorActions.setStyle(this.props.graph, e.value);
      } } optionLabel="name" optionValue="style" placeholder="Writing Direction" /></>);
      // requires word wrap to remain text inside cell
      tabViewComponents.set("align", <><div>Text alignment</div><Dropdown value={{keys: [mx.mxConstants.STYLE_ALIGN], values: [getFromCorrespondingMap(vertexStyles, edgeStyles, "align")]}} options={styleEditorOptions.getTextAlignmentOptions()} onChange={(e) => {
        this.setState({textLayoutDirection: e.value}); styleEditorActions.setStyle(this.props.graph, e.value);
      } } optionLabel="name" optionValue="style" placeholder="Text alignment" /></>);
      tabViewComponents.set("spacing", this.state.spacingOptions.map((option, index) => <ElementInputNumber label={option.name} sharedId={toCamelCase("spacing " + option.name)} value={option.style.values[0]!} onChange={(e) => this.updateSpacingOptionElement(index, e.value)}></ElementInputNumber>));
      tabViewComponents.set("fontStyle", styleEditorOptions.getFontEditingOptions().map((option, index) => <Button label={option.name} onClick={() => {
        styleEditorActions.toggleFontStyle(this.props.graph, option.style.key, option.style.value); this.setState({currentEditingOption: this.state.currentEditingOption ? (this.state.currentEditingOption & option.style.value) : this.state.currentEditingOption});
      } } style={{margin: "0.2rem"}} />));
      tabViewComponents.set("whiteSpace", <ElementCheckbox label=" Word Wrap" sharedId="whiteSpaceToggle" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "whiteSpace") === "wrap" ? true : false} onChange={(e) => {
        this.setState({whiteSpace: e.checked}); styleEditorActions.toogleWordWrap(this.props.graph, e.checked);
      } } />);
      // TODO: add "formatted Text" button -> enable edited text inside box
      tabViewComponents.set("horizontal", <ElementCheckbox label=" Align Text Horizontal" sharedId="checktextRotationVertical" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "horizontal")} onChange={(e) => {
        this.setState({horizontal: e.checked}); styleEditorActions.toogleLabelRotation(this.props.graph, e.checked);
      } } />);
      //TODO: add Text Editor UI: "Font style actions" in original code. Here and only open it when this.props.graph.isEditing
      //TODO: switch options in tabview when in editing modus
      // ARRANGE
      tabViewComponents.set("toFront", <Button label="To Front" onClick={() => {
        editorActions.selectionToFront(this.props.graph);
      } } style={{margin: "0.2rem"}} />);
      tabViewComponents.set("toBack", <Button label="To Back" onClick={() => {
        editorActions.selectionToBack(this.props.graph);
      } } style={{margin: "0.2rem"}} />);
      tabViewComponents.set("clearWaypoints", <Button label="Clear Waypoints" onClick={() => {
        editorActions.clearAllWaypoints(this.props.graph);
      } } style={{margin: "0.2rem"}} />);
      // original code in Dialogs.js. var EditDataDialog = function(ui, cell)
      // called from EditorUi: EditorUi.prototype.showDataDialog = function(cell)
      // open question: this is designed for a single cell. So the group seems to save its data in the bounding cell around the individual cells.
      tabViewComponents.set("editData", <>
        <Button label="Edit Data" onClick={() => {
          //TODO: add selection for metadata from previous defined properties: dropdown e.g. to load an available json -> save new Property through metadata tab (import etc.)
          // default for test. TODO: open importer for json here. (finished json from server e.g. iiot_data_store_quality_characteristics.json)
          this.editDataAndSave(this.props.graph.getSelectionCells());
        } } style={{margin: "0.2rem"}} /></>);
      tabViewComponents.set("copySize", <Button label="copy size" onClick={() => {

        this.setState({copiedSize: editorActions.getCellScale(this.props.graph, this.props.graph.getSelectionCell())});
      } } style={{margin: "0.2rem"}} />);
      tabViewComponents.set("pasteSize", <Button label="paste size" onClick={() => {
      this.state.copiedSize !== null ? editorActions.setCellScale(this.props.graph, this.props.graph.getSelectionCells(), this.state.copiedSize) : console.error("no size set to use pasteSize onto.");

      } } style={{margin: "0.2rem"}} />);
      //FIXME: scaling seems to relate to group in diagrams.net, but here and in grapheditor example it doesn't, contain positions of children
      tabViewComponents.set("cellWidth",
          <ElementInputNumber label="Size width" sharedId="cellWidth" value={editorActions.getCellScale(this.props.graph, this.props.graph.getSelectionCell())?.x} onChange={(e) => {
            const cells = this.props.graph.getSelectionCells();
            cells.forEach((cell) => {
              if (vertexStyles.get("aspect") === "fixed") {

                const geo = this.props.graph.getModel().getGeometry(cell);

                // New scale calculation: yNew = xNew * (y / x).
                const x = geo.width;
                const y = geo.height;
                const xNew = e.value;
                const yNew = xNew * (y / x);

                // calculate scaling ratio (horizontal and vertical)
                let sx = (x != 0) ? xNew / x : 1;
                let sy = (y != 0) ? yNew / y : 1;
                // fixed aspect ratio
                sy = sx = Math.min(sx, sy);

                editorActions.setCellScale(this.props.graph, [cell], new mx.mxPoint(x * sx, y * sy));
              } else {
                const pos = new mx.mxPoint(e.value, editorActions.getCellScale(this.props.graph, cell)!.y);
                editorActions.setCellScale(this.props.graph, [cell], pos);
              }

            });


          } } min={0} minFractionDigits={2}></ElementInputNumber>);

      tabViewComponents.set("cellHeight",
          <ElementInputNumber label="Size height" sharedId="cellHeight" value={editorActions.getCellScale(this.props.graph, this.props.graph.getSelectionCell())?.y} onChange={(e) => {
            const cells = this.props.graph.getSelectionCells();
            cells.forEach((cell) => {
              // New scale calculation: xNew = yNew * (x / y)
              if (vertexStyles.get("aspect") === "fixed") {
                const geo = this.props.graph.getModel().getGeometry(cell);

                // yNew = xNew * (y / x).
                const x = geo.width;
                const y = geo.height;
                const yNew = e.value;
                const xNew = yNew * (x / y);

                // calculate scaling ratio (horizontal and vertical)
                let sx = (x != 0) ? xNew / x : 1;
                let sy = (y != 0) ? yNew / y : 1;
                // fixed aspect ratio
                sy = sx = Math.min(sx, sy);

                editorActions.setCellScale(this.props.graph, [cell], new mx.mxPoint(x * sx, y * sy));
              } else {
                const pos = new mx.mxPoint(editorActions.getCellScale(this.props.graph, cell)!.x, e.value);
                editorActions.setCellScale(this.props.graph, [cell], pos);
              }
            });
          } } min={0} minFractionDigits={2}></ElementInputNumber>);
      tabViewComponents.set("copyPosition", <Button label="copy position" onClick={() => {
        this.setState({copiedPosition: editorActions.getCellPosition(this.props.graph, this.props.graph.getSelectionCell())});
      } } style={{margin: "0.2rem"}} />);
      tabViewComponents.set("pastePosition", <Button label="paste position" onClick={() => {
      this.state.copiedPosition !== null ? editorActions.setCellPosition(this.props.graph, this.props.graph.getSelectionCells(), this.state.copiedPosition) : console.error("no position set to use pastePosition onto.");

      } } style={{margin: "0.2rem"}} />);

      tabViewComponents.set("leftPosition",
          <ElementInputNumber label="Left Cell position" sharedId="leftPositionCell" value={editorActions.getCellPosition(this.props.graph, this.props.graph.getSelectionCell())?.x} onChange={(e) => {
            const cells = this.props.graph.getSelectionCells();
            cells.forEach((cell) => {
              const pos = new mx.mxPoint(e.value, editorActions.getCellPosition(this.props.graph, cell)!.y);
              editorActions.setCellPosition(this.props.graph, [cell], pos);
            });
          } } ></ElementInputNumber>);
      tabViewComponents.set("topPosition",
          <ElementInputNumber label="Top Cell position" sharedId="topPositionCell" value={editorActions.getCellPosition(this.props.graph, this.props.graph.getSelectionCell())?.y} onChange={(e) => {
            const cells = this.props.graph.getSelectionCells();
            cells.forEach((cell) => {
              const pos = new mx.mxPoint(editorActions.getCellPosition(this.props.graph, cell)!.x, e.value);
              editorActions.setCellPosition(this.props.graph, [cell], pos);
            });

          } } ></ElementInputNumber>);
      // FIXME: crashes on select or not visible
      tabViewComponents.set("sourcePoint",
      (edgeCells && edgeCells.length > 0 && editorActions.getCellSourcePoint(this.props.graph) !== null) ?
        <>
          <ElementInputNumber label="Start x" sharedId="edgeSourcePointX" value={editorActions.getCellSourcePoint(this.props.graph)?.x} onChange={(e) => {
            const point = new mx.mxPoint(e.value, editorActions.getCellSourcePoint(this.props.graph)!.y);
            editorActions.setEdgePointOfSelection(this.props.graph, point, true);
          } } ></ElementInputNumber>
          <ElementInputNumber label="Start y" sharedId="edgeSourcePointY" value={editorActions.getCellSourcePoint(this.props.graph)?.y} onChange={(e) => {
            const point = new mx.mxPoint(editorActions.getCellSourcePoint(this.props.graph)!.x, e.value);
            editorActions.setEdgePointOfSelection(this.props.graph, point, true);
          } } ></ElementInputNumber></> : <></>);
      // FIXME: crashes on select or not visible
      tabViewComponents.set("targetPoint",
      (edgeCells && edgeCells.length > 0 && editorActions.getCellTargetPoint(this.props.graph) !== null) ?
        <><ElementInputNumber label="End x" sharedId="edgeTargetPointX" value={editorActions.getCellTargetPoint(this.props.graph)?.x} onChange={(e) => {
          const point = new mx.mxPoint(e.value, editorActions.getCellTargetPoint(this.props.graph)!.y);
          editorActions.setEdgePointOfSelection(this.props.graph, point, false);
        } } ></ElementInputNumber>
        <ElementInputNumber label="End y" sharedId="edgeTargetPointY" value={editorActions.getCellTargetPoint(this.props.graph)?.y} onChange={(e) => {
          const point = new mx.mxPoint(editorActions.getCellTargetPoint(this.props.graph)!.x, e.value);
          editorActions.setEdgePointOfSelection(this.props.graph, point, false);
        } }></ElementInputNumber>
        </> : <></>);
      tabViewComponents.set("aspect", <ElementCheckbox label=" Constrain Proportions" sharedId="constrainPorportions" value={(vertexStyles.get("aspect") && vertexStyles.get("aspect") === "fixed") ? true : false} onChange={(e) => {
        this.setState({aspect: e.checked}); styleEditorActions.toggleConstrainPorportions(this.props.graph, e.checked);
      } } />);
      tabViewComponents.set("position", <> <ElementInputNumber label="Left" sharedId="leftPosition" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "leftPosition")} onChange={(e) => { } } suffix={""}></ElementInputNumber> <ElementInputNumber label="Top" sharedId="topPosition" value={this.state.topPosition} onChange={(e) => { } } suffix={""}></ElementInputNumber></>);
      tabViewComponents.set("startPosition", <><ElementInputNumber label="Left" sharedId="leftLineStartPosition" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "leftLineStartPosition")} onChange={(e) => { } } suffix={""}></ElementInputNumber><ElementInputNumber label="Top" sharedId="topLineStartPosition" value={this.state.topLineStartPosition} onChange={(e) => { } } suffix={""}></ElementInputNumber></>);
      tabViewComponents.set("endPosition", <> <ElementInputNumber label="Left" sharedId="leftLineEndPosition" value={getFromCorrespondingMap(vertexStyles, edgeStyles, "leftLineEndPosition")} onChange={(e) => { } } suffix={""}></ElementInputNumber><ElementInputNumber label="Top" sharedId="topLineEndPosition" value={this.state.topLineEndPosition} onChange={(e) => { } } suffix={""}></ElementInputNumber> </>);
      // FIXME: rotation of group not supported similar to grapheditor. But with handle in grapheditor groups can be rotated
      // calculate positive value out of negative => 360 + ... to generate positive values
      tabViewComponents.set("rotation", <><ElementInputNumber label="Angle" sharedId="rotationAngle" value={(360+ parseFloat(vertexStyles.get("rotation"))) % 360} onChange={(e) => {
        this.setState({rotationAngle: e.value});
        styleEditorActions.setRotation(this.props.graph, e.value);
      } } suffix="°" min={0} max={360}></ElementInputNumber>
      <Button label="Rotate by 90°" onClick={() => {
        this.setState({rotationAngle: this.rotate90Degree(this.props.graph)});
      } } style={{margin: "0.2rem"}} /> </>,
      );
      // FIXME: Edge cannot be set to a position correctly. Label should be read from default.xml
      tabViewComponents.set("labelPosition",
          <><div>Label Position</div> <Dropdown value={this.getStyleOptionStyleFromCorrespondingStyles(styleEditorOptions.getStyleLabelPositionOptions(), vertexStyles, edgeStyles, this.state.labelPosition)} options={styleEditorOptions.getStyleLabelPositionOptions()} onChange={(e) => {
            this.setState({edgeStyle: e.value}); styleEditorActions.setStyle(this.props.graph, e.value);
          } } optionLabel="name" optionValue="style" placeholder="Label Position" /></>);

      // only render alignment if at least 2 vertex cells are selected
      tabViewComponents.set("cellAlignment", (vertexCells && vertexCells.length > 1) ? styleEditorOptions.getCellAlignmentOptions().map((option, index) => <Button label={option.name} onClick={() => {
        styleEditorActions.setCellAlignment(this.props.graph, option.code);
      } } style={{margin: "0.2rem"}} />) : <></>);
      tabViewComponents.set("distributeHorizontal", vertexCells.length > 1 ? <Button label="Horizontal" onClick={() => {
        styleEditorActions.distributeCells(this.props.graph, true, this.props.graph.getSelectionCells());
      } } style={{margin: "0.2rem"}} /> : <></>);
      tabViewComponents.set("distributeVertical", vertexCells.length > 1 ? <Button label="Vertical" onClick={() => {
        styleEditorActions.distributeCells(this.props.graph, false, this.props.graph.getSelectionCells());
      } } style={{margin: "0.2rem"}} /> : <></>);
      tabViewComponents.set("flipH", <Button label="Horizontal" onClick={() => {
        styleEditorActions.flipImageHorizontal(this.props.graph, !vertexStyles.get("flipH")); this.setState({isImageFlippedHorizontal: (!vertexStyles.get("flipH"))});
      } } style={{margin: "0.2rem"}} />);
      tabViewComponents.set("flipV", <Button label="Vertical" onClick={() => {
        styleEditorActions.flipImageVertical(this.props.graph, !vertexStyles.get("flipV")); this.setState({isImageFlippedVertical: (!vertexStyles.get("flipV"))});
      } } style={{margin: "0.2rem"}} />);
      tabViewComponents.set("group", this.props.graph.getSelectionCells().length > 1 ? <Button label="Group" onClick={() => {
        editorActions.group(this.props.graph);
      } } style={{margin: "0.2rem"}} /> : <></>);
      tabViewComponents.set("ungroup", isSelectionGrouped ? <Button label="Ungroup" onClick={() => {
        editorActions.ungroup(this.props.graph);
      } } style={{margin: "0.2rem"}} /> : <></>);
    }

    private rotate90Degree(graph:mxGraph) {
      const vertexCells = getVertexCells(graph.getSelectionCells());
      const vertexStyles = (vertexCells && vertexCells.length > 0) ? this.getStyles(vertexCells) : new Map();
      const rot: number = parseFloat(vertexStyles.get("rotation"));
      // 360+ to convert negative angles to positive
      const val = (360 + rot + 90) % 360;
      styleEditorActions.setRotation(graph, val);
      return val;
    }

    /**
     * Edit and saves metadata of a single cell. Data update is handled by Questionary class
     * @param cells
     * @param defaultJson
     * @param displayEditDataPanel
     */
    private editDataAndSave(cells: mxCell[], defaultJson = this.state.defaultMetadataJson, displayEditDataPanel = true) {
      // update all selected cells
      getVertexCells(cells).forEach((cell) => {
        const editData = editorActions.getEditData(this.props.graph, cell, "docElement");
        const metadata = editorActions.getJsonFromAttribute(editData, defaultJson, "docElement", "metadata");
        if (metadata) {
          this.setState({cellMetadata: metadata, displayEditDataPanel: displayEditDataPanel});
          /* if multiple cells are editited, use the settings from first edited cell for all cells
          actual save data with data happens inside the save function of questionary */
          editorActions.setEditDataJson(this.props.graph, cell, editData, metadata, jsonMapReplacer, "metadata");
        } else {
          alert("no data found");
        }
      });
    }

    private removeDataAndSave(cells: mxCell[], defaultJson = this.state.defaultMetadataJson, displayEditDataPanel = false) {
      if (cells.length != 1) {
        console.error("Editing of multiple cells not implemented yet");
      }
      cells.forEach((cell) => {
        const editData = editorActions.getEditData(this.props.graph, cell, "docElement");
        const metadata = editorActions.getJsonFromAttribute(editData, defaultJson, "docElement", "metadata");
        // only save if any data/questionary is available
        if (metadata) {
          this.setState({cellMetadata: undefined, displayEditDataPanel: displayEditDataPanel});
          // save json as string in metadata attribute: in order to add default json in metadata
          editorActions.removeEditDataJson(this.props.graph, cell, editData, undefined, jsonMapReplacer, "metadata");
        } else {
          alert("no data found");
        }
      });
    }

    /**
     *
     * @param selectedCells current selection in graph
     * @param tabview containing GUI layout
     * @param vertexStyles
     * @param edgeStyles
     * @param tabViewComponents containing corresponding GUI elements
     * @returns rendered tab view based on current selection in graph
     */
    private renderTabview(selectedCells: mxCell[], tabview: { tabpanel: string; sections: any[]; }[], vertexStyles: Map<any, any>, edgeStyles: Map<any, any>, tabViewComponents: Map<string, any>) {
      // Each space is loaded dynamically and closed with a divider in each tab Panel
      console.log("render gui tabview", this.props.graph);
      if (this.props.DEBUG) {
        return <TabView className={this.props.className} id={this.props.id} style={this.props.style} activeIndex={this.state.activeIndex} onTabChange={(e) => this.setState({activeIndex: e.index})}>
          {selectedCells.length > 0 ?
        this.dynamicallyRenderTabs(tabview, vertexStyles, edgeStyles, tabViewComponents) : this.renderDiagramTab()}
          {/* debugging options for development */}
          {this.renderMetadataTab()}
          {this.renderNotIncludedList([...tabViewComponents.keys()], vertexStyles, edgeStyles)}
          {this.renderDebugTab()}
        </TabView>;
      } else {
        return <TabView className={this.props.className} id={this.props.id} style={this.props.style} activeIndex={this.state.activeIndex} onTabChange={(e) => this.setState({activeIndex: e.index})}>
          {selectedCells.length > 0 ?
        this.dynamicallyRenderTabs(tabview, vertexStyles, edgeStyles, tabViewComponents) : this.renderDiagramTab()}
          {/* debugging options for development */}
          {this.renderMetadataTab()}
          {/* {this.renderNotIncludedList([...tabViewComponents.keys()], vertexStyles, edgeStyles)}
        {this.renderDebugTab()} */}
        </TabView>;
      }
    }

    private dynamicallyRenderTabs(tabview: { tabpanel: string; sections: any[]; }[], vertexStyles: Map<any, any>, edgeStyles: Map<any, any>, tabViewComponents: Map<string, any>): React.ReactNode {
      return tabview.map((tab) => {
        console.log(tab.tabpanel);
        console.log("sections {");
        return (<TabPanel header={tab.tabpanel}>
          {/* FIXME: set height relative to parent size height: "100%" results in overflow*/}
          <ScrollPanel style={{width: "100%", height: "75vh"}} className="custom-scrollbar">
            {tab.sections.filter((section) => this.isComponentIncluded(section.tabviewComponents, vertexStyles, edgeStyles)).map((section) => {
            //TODO: filter image only vertexStyles like flipH/flipV seperatly, since they are useless on other vertexes
              return (
              // skip deviders with empty result set => apply filter twice
                <>{section.tabviewComponents.filter((component: any) => vertexStyles.has(component) || edgeStyles.has(component)).length > 0 ? <Divider align="left" type="solid"> <b>{section.deviderLabel}</b> </Divider> : <> </>}
                  {section.tabviewComponents.filter((component: any) => vertexStyles.has(component) || edgeStyles.has(component)).map((component: any) => {
                  // render components
                    let value;
                    if (vertexStyles.has(component)) {
                      value = vertexStyles.get(component);
                    } else if (edgeStyles.has(component)) {
                      value = edgeStyles.get(component);
                    }

                    if (component.toLocaleLowerCase().includes("color")) {
                      value = getRgba(String(value));
                    } else if (component.toLocaleLowerCase() === "perimeterSpacing") {
                    // TODO: Perimeter is an object. => extract the rendering information from it.
                    }

                    if (value === 0 || value) {
                      const toBeRenderedComponent = tabViewComponents.get(component);
                      // TODO: apply value
                      return toBeRenderedComponent;
                    } else {
                      console.error("value could not be rendered in tab");
                    }
                  })}
                </>);
            })}
          </ScrollPanel>
        </TabPanel>
        );
      });
    }

    render() {
      console.debug("re-render");
      // return this.renderHardcodedPanels();
      return ( <>
        {this.renderElements()}
        { // render questionary only when valid metadata is available
        this.state.cellMetadata ?
        <Questionary DEBUG={this.props.DEBUG} displayResponsive={this.state.displayEditDataPanel} handleDisplayResponsiveChange={this.handleDisplayEditDataPanelChange} property={this.state.cellMetadata}
          handleSave={() => {

            const cells = this.props.graph.getSelectionCells();
            const flattendVertexCells = getVertexCells(cells.flatMap( (cell) => editorActions.getChildren(this.props.graph, cell)));

            //save whole selection of vertexCells
            flattendVertexCells.forEach((cell) => {
              //save whole selection
              editorActions.setEditDataJson(this.props.graph, cell, editorActions.getEditData(this.props.graph, cell), this.state.cellMetadata!, jsonMapReplacer, "metadata");
            });


          }}
          handleExit={()=>{}}
          handleCellMetadataChange={this.handleCellMetadataChange}
        ></Questionary> :
        <> </>
        }
      </>
      );
    }
}

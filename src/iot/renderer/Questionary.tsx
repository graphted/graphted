import {Component} from "react";
import {Property, Category, Subproperty, PointRating, UppermostCategoryData, convertNumberToPointRange, evaluateProperty, getMaxSumOfProperty} from "../data-structure-utils/IotPropertyTypes";
import {Dialog} from "primereact/dialog";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import PointSelection from "./PointSelection";

import * as iotGuiUtils from "../IotGuiUtils";
import {Divider} from "primereact/divider";

import {evaluateQuestionary} from "../../Actions";

interface QuestionaryProps {
  DEBUG:boolean;
  // json containing questionary data
  // json: string
  displayResponsive:boolean,
  property: Property,
  handleDisplayResponsiveChange(displayEditDataPanel:boolean): void,
  handleCellMetadataChange: (cellMetadata: Property| undefined) => void,
  handleSave(): void,
  handleExit(): void,
}

interface QuestionaryState {
  defaultMetadataJson: Property | undefined,
  templates: { name: string; value: any;}[],
  trustScore: number,
}


/**
 * represents the iot properties with their curresponding points for the questionary
 */
export default class Questionary extends Component<QuestionaryProps, QuestionaryState> {
  constructor(props:QuestionaryProps) {
    super(props);
    this.state = {
      defaultMetadataJson: undefined,
      templates: iotGuiUtils.getMetadataTemplates(),
      trustScore: evaluateQuestionary(this.props.property),
    };
  }

  renderSubproperty = (subproperty:Subproperty, renderPoints = true) => {
    let subpropertyPoints = subproperty.points as PointRating[];
    if (!Array.isArray(subpropertyPoints) && !isNaN(subpropertyPoints)) {
      subpropertyPoints = [convertNumberToPointRange(subpropertyPoints)];
    }
    let startIndex = 0;
    if (subpropertyPoints) {
      (subpropertyPoints! as PointRating[]).map((point, index)=>{
        if (point.isSelected) {
          startIndex = index;
        }
      });
    }
    return (
      <div>
        {this.props.DEBUG ? <div>{"subproperty.id: " + subproperty.id}</div> : <></>}
        <h5>{ this.props.DEBUG && "subproperty.name: "}{subproperty.name}</h5>
        <div>{ this.props.DEBUG && "subproperty.details: "}{subproperty.details}</div><br/>
        {/* <div>{this.renderPoints(subproperty.points as PointRange[], subproperty)}</div> */}
        {renderPoints ?
        <>
          {this.props.DEBUG ? <h5> Points</h5> : <></>}
          {/* //TODO: if points only hase size 1 => subproperties are used for radiobox */}
          <PointSelection points={subpropertyPoints} STARTINDEX={startIndex} upperCategoryID={""+subproperty.id}> </PointSelection>
        </> :
        <> </>
        }
      </div>
    );
  }

  renderCategory = (category:Category, index:number) => {
    const subproperties:Subproperty[] | undefined = category.subproperties;
    const points:number | PointRating[] | undefined = category.points;
    let startIndex = 0;
    if (points) {
      (points! as PointRating[]).map((point, index)=>{
        if (point.isSelected) {
          startIndex = index;
        }
      });
    }
    // assume all points got the same schema
    return (
      <div>
        <h2>{ this.props.DEBUG && "category.name: "}{category.name}</h2>
        <h3>{ this.props.DEBUG && "category.details: "}{category.description}</h3>
        {/* Render selection either in subproperties or in points directly */}
        {subproperties ?
          // render points under subproperties as RadioButton
          <>
            {this.props.DEBUG ? <h4> Subproperties </h4> : <></>}
            {subproperties.map((subproperty) =>this.renderSubproperty(subproperty))}
          </> :
          points ?<> {this.props.DEBUG ? <h4> Points</h4> : <></>}<PointSelection points={points! as PointRating[]} STARTINDEX={startIndex} upperCategoryID={category.name}> </PointSelection></> : <></>
        }
      </div>
    );
  }


  renderCategoryMap = (categoriesObject:Map<string, UppermostCategoryData>) => {
    const jsxElements:JSX.Element[] = [];
    const categories:Map<string, UppermostCategoryData> = categoriesObject;

    categories.forEach((categories, upperCategory) => {
      jsxElements.push( <h1>{upperCategory}</h1>);
      if (categories.description) {
        jsxElements.push(<div> {categories.description}</div>);
      }
      //  render category[]
      categories.value.forEach((item, index) =>{
        jsxElements.push(this.renderCategory(item, index));
      });
    });

    return <> {jsxElements} </>;
  }

  renderProperty = () => {
    return (
      <div>
        {this.renderCategoryMap(this.props.property.categories)}
      </div>
    );
  }

  getPropertyHeader = () => {
    return "Property: " + iotGuiUtils.getTemplateName(this.props.property);
  }

  onTemplateChange = (e:any) =>{
    this.setState({defaultMetadataJson: e.value});
  }

  render() {
    // TODO: parse questionary json data: https://www.pluralsight.com/guides/how-to-use-reactjs-and-complex-json-objects
    return (
      <>

        <Dialog modal={false} header={
          <>
            {this.getPropertyHeader()}
            <br />
            {this.renderUpperMenuQuestionary()}
          </>
        } footer={() => {
          return (
            <div>
              <Button label="Cancel" icon="pi pi-times" onClick={() => {
                //hide modal
                this.props.handleDisplayResponsiveChange(false);
                //onExit
                this.props.handleExit();
                // reset to inital value for new nodes in graph
                this.props.handleCellMetadataChange(undefined);
              }} className="p-button-text" />
              <Button label="OK" icon="pi pi-check" onClick={this.saveAndCloseQuestionary} autoFocus />
            </div>);
        } }
        visible={this.props.displayResponsive} onHide={this.saveAndCloseQuestionary}
        onShow={()=>{
          //on first cell without metadata defaultMetadataJson is undefined,
          // console.debug(this.state.defaultMetadataJson);
          // console.debug(this.props.property);
        }}
        // update score on each change inside catalog
        onClick={()=>{
          this.setState({trustScore: evaluateQuestionary(this.props.property)});
        }}breakpoints={{"960px": "75vw", "640px": "100vw"}} style={{width: "50vw"}}>
          {this.renderProperty()}
        </Dialog>
      </>
    );
  }

  saveAndCloseQuestionary = () => {
    this.props.handleDisplayResponsiveChange(false);
    this.props.handleSave();
    // reset to inital value of new nodes
    this.props.handleCellMetadataChange(undefined);
  }

  private renderUpperMenuQuestionary() {
    return <div style={{fontWeight: "400", fontSize: "16px"}}>
      Load Template:&nbsp;
      <Dropdown value={this.getTemplateName()} options={this.state.templates} onChange={this.onTemplateChange} optionLabel="name" optionValue="value" placeholder={this.getTemplateName()} />
      <Button label="Apply Template" onClick={() => {
        if (this.state.defaultMetadataJson) {
          this.props.handleCellMetadataChange(this.state.defaultMetadataJson);
          this.setState({trustScore: 0});
          // apply same template
        } else if (this.getTemplateName(this.props.property) == this.getTemplateName()) {
          alert("This template is already applied");
        } else {
          // TODO: use empty selection to delete the current template or remove Questionary otherwise
          alert("Select Template first");
        }

      } } style={{margin: "0.2rem"}} />
      <div><br />
        {/* show only rounded value */}
        {getMaxSumOfProperty(this.props.property) > 0 ?
            `Trust score τ = ${this.state.trustScore.toFixed(3)}\t[1 - (currentScore: ${evaluateProperty(this.props.property)} / maxPossibleScore: ${getMaxSumOfProperty(this.props.property)} )]` : "Trust score τ = not yet calculated"
        }
      </div>
      <Divider/>
    </div>;
  }

  private getTemplateName(metadataJson = this.state.defaultMetadataJson): string {
    //either load defaultMetadataJson (when cell was already edited) or (this.props.property)
    const property = this.state.defaultMetadataJson ? this.state.defaultMetadataJson: this.props.property;
    return property ? iotGuiUtils.getTemplateName(property) : "click to choose template";
  }
}

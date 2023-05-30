import {Component} from "react";

import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/inputtext";
import {InputTextarea} from "primereact/inputtextarea";
import {Button} from "primereact/button";
import {Divider} from "primereact/divider";


import {InputNumber} from "primereact/inputnumber";
import {Property, Category, Subproperty, UppermostCategoryData, PointRating} from "../../data-structure-utils/IotPropertyTypes";
import IoTCategoryLoader from "../IoTCategoryLoader";

interface IoTPropertyLoaderFormularProps {
    // Property interface
    property:Property,
    handleIdChange(id: number): void,
    handleTypeChange(type: string | undefined): void,
    handleIotTypesChange(iotTypes: string[]): void,
    handleCategoryChange(generalCategoryKey: string, categoryId:number, category: Category): void,
    handleSubpropertiesChange(generalCategoryKey: string, categoryId:number, subpropertyId:number, subproperty:Subproperty): void,
    addNewSubproperty(generalCategoryKey: string, categoryId:number):void
    addNewCategory(generalCategoryKey: string, name?: string, description?: string, subproperty?: Subproperty[]): void,
    addNewGeneralCategory(key: string, value: Category[], description?: string): void,
    removeGeneralCategory(key: string): void,
    removeIotType(iotTypes: string[], id: number): void
    removeCategory(generalCategoryKey: string, categoryId: number): void,
    removeSubproperty(generalCategoryKey: string, categoryId: number, subpropertyId: number): void,
    addNewPointRange(generalCategoryKey: string, categoryId:number, subpropertyId?:number): void,
    handlePointsChange(generalCategoryKey: string, categoryId:number, pointRange:PointRating, pointId:number, subpropertyId?:number): void,
    removePoints(generalCategoryKey: string, categoryId: number, pointRange:PointRating, pointId:number, subpropertyId?: number): void,
}

interface IoTPropertyLoaderFormularState {
  displayResponsive:boolean,
  newUppermostCategoryName: string,
  newUppermostCategoryDescription?: string,
}
/**
 * represents the iot properties with their curresponding points for it's questionary
 */
export default class IoTPropertyLoaderFormular extends Component<IoTPropertyLoaderFormularProps, IoTPropertyLoaderFormularState> {
  constructor(props:IoTPropertyLoaderFormularProps) {
    super(props);
    this.state = {
      displayResponsive: true,
      newUppermostCategoryName: "",
    };
    this.renderCategory = this.renderCategory.bind(this);
    this.renderUpperCategory = this.renderUpperCategory.bind(this);
    this.renderCategoryStructure = this.renderCategoryStructure.bind(this);
  }

  createUppermostCategoryIfNotExists = (name: string, description?:string) => {
    //TODO: create new layer and fill this variables, currently they are just dummies
    const categories = this.props.property.categories.get(name);
    // create category if it doesn't exist
    if (!categories) {
      this.props.addNewGeneralCategory(name, [], description);
      this.props.addNewCategory(name);
    }
  }

  renderCategory(generalCategoryKey:string, category:Category) {
    //TODO: create new layer and fill this variables, currently they are just dummies
    this.createUppermostCategoryIfNotExists(generalCategoryKey);


    return <IoTCategoryLoader
      category={category}
      generalCategoryKey= {generalCategoryKey}
      handleCategoryChange={this.props.handleCategoryChange}
      handleSubpropertiesChange={this.props.handleSubpropertiesChange}
      addNewSubproperty={this.props.addNewSubproperty}
      removeCategory = {this.props.removeCategory}
      removeSubproperty = {this.props.removeSubproperty}
      addNewPointRange={this.props.addNewPointRange}
      handlePointsChange={this.props.handlePointsChange}
      removePoints={this.props.removePoints}
    />;
  }

  renderUpperCategory(upperCategory:string) {
    return (<><h4><br/>{upperCategory}<br/></h4>
      <Button label="Add Category" onClick={()=>{
        this.props.addNewCategory(upperCategory);
      }} style={{margin: "0.2rem"}}/>
      <Button label="Delete this Upper Category" onClick={()=>{
        this.props.removeGeneralCategory(upperCategory);
      }} style={{margin: "0.2rem"}}/>
    </>);
  }

  addUpperCategory() {
    return (<><div>Add upper category:</div>
      <InputText value={this.state.newUppermostCategoryName} onChange={(e) => {
        this.setState({newUppermostCategoryName: e.target.value});
      } } />
      <div>Add upper category description:</div>
      <InputTextarea value={this.state.newUppermostCategoryDescription} onChange={(e) => {
        this.setState({newUppermostCategoryDescription: e.target.value});
      } } rows={5} cols={50} />
      <Button label={"Add " + this.state.newUppermostCategoryName} onClick={()=>{
        this.createUppermostCategoryIfNotExists(this.state.newUppermostCategoryName, this.state.newUppermostCategoryDescription);
      }} style={{margin: "0.2rem"}}/>
    </>);
  }

  renderCategoryStructure(categoryCatalogue:Map<string, UppermostCategoryData>) {
    const jsxElements:JSX.Element[] = [];
    categoryCatalogue.forEach((categories, upperCategory) => {
      //TODO: render upper category
      jsxElements.push( this.renderUpperCategory(upperCategory));
      // render category[]
      categories.value.forEach((category, id) =>{
        jsxElements.push(this.renderCategory(upperCategory, category));
      });
    });

    return <> {jsxElements} </>;
  }

  render() {
    return (<Dialog modal={false} header="Add Property" footer={() => {
      return (<>
        {/* only for debugging */}
        <Button label="Log" onClick={() => console.debug(this.props.property)} className="p-button-text" />
        {/* save json in different file formats: https://www.npmjs.com/package/export-from-json */}
        <div>
          <Button label="Cancel" icon="pi pi-times" onClick={() => this.setState({displayResponsive: false})} className="p-button-text" />
          <Button label="Save" icon="pi pi-check" onClick={() => {
            //TODO: save properties in cell
            this.setState({displayResponsive: false});
          } } autoFocus />
        </div>
      </>);
    } } visible={this.state.displayResponsive} onHide={() => {
      this.setState({displayResponsive: false});
    } } breakpoints={{"960px": "75vw", "640px": "100vw"}} style={{width: "50vw"}}>
      <div>
        <label htmlFor={"propertyId".concat(this.props.property.id.toString())}>{"Id of property:"}</label>
        <InputNumber inputId={"propertyId".concat(this.props.property.id.toString())} value={this.props.property.id} onValueChange={(e:any) =>{
          this.props.handleIdChange(e.value);
        }} showButtons mode="decimal" />
      </div>
      <div><br />Type of property (e.g. data_store, data_provider)<br /></div>
      <InputText value={this.props.property.type} onChange={(e) => {
        this.props.handleTypeChange(e.target.value);
      } } />
      <div><br />IoT types: comma-separated (e.g. iiot, ciot)<br /></div>
      <InputText value={this.props.property.iotTypes.toString()} onChange={(e) => {
        this.props.handleIotTypesChange(e.target.value.split(","));
      } } />
      <Divider></Divider>
      <div>Amount upper categories: {this.props.property.categories.size}</div>
      {this.addUpperCategory()}
      {
        this.renderCategoryStructure(this.props.property.categories)
      }
      <Divider />
    </Dialog>
    );
  }
}

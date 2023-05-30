import {Component} from "react";
import {Dropdown} from "primereact/dropdown";
import {FileUpload} from "primereact/fileupload";
import IoTPropertyLoaderFormular from "./types/IoTPropertyLoaderFormular";
import {Property, Category, Subproperty, PointRating} from "../data-structure-utils/IotPropertyTypes";

interface IoTPropertyLoaderProps {
    // Property interface
    property: Property

    handleIdChange(id: number): void,
    handleTypeChange(type: string | undefined): void,
    handleIotTypesChange(iotTypes: string[]): void,
    handleCategoryChange(generalCategoryKey: string, categoryId:number, category: Category): void,
    handleSubpropertiesChange(generalCategoryKey: string, categoryId:number, subpropertyId:number, subproperty:Subproperty): void,
    addNewSubproperty(generalCategoryKey: string, categoryId:number):void
    addNewCategory(generalCategoryKey: string, name?: string, description?: string, subproperty?: Subproperty[]): void,
    addNewGeneralCategory(key: string, value: Category[]): void,
    removeGeneralCategory(key: string): void,
    removeCategory(generalCategoryKey: string, categoryId: number): void,
    removeSubproperty(generalCategoryKey: string, categoryId: number, subpropertyId: number): void,
    removeIotType(iotTypes: string[], id: number): void
    addNewPointRange(generalCategoryKey: string, categoryId:number, subpropertyId?:number): void,
    handlePointsChange(generalCategoryKey: string, categoryId:number, pointRange:PointRating, pointId:number, subpropertyId?:number): void,
    removePoints(generalCategoryKey: string, categoryId: number, pointRange:PointRating, pointId:number, subpropertyId?: number): void,
}

interface IoTPropertyLoaderState {
  selectedLoadOption: number | null,
}
/**
 * represents the iot properties with their curresponding points for it's questionary
 */
export default class IoTPropertyLoader extends Component<IoTPropertyLoaderProps, IoTPropertyLoaderState> {
  constructor(props:IoTPropertyLoaderProps) {
    super(props);
    this.state = {
      // logical control variables
      selectedLoadOption: null,
    };
  }

  render() {
    // TODO: save loaded files in local storage: https://www.positronx.io/store-react-form-data-or-state-in-local-storage/
    const loaderOptions= [
      {label: "Load json", correspondingGuiId: 0},
      {label: "Load csv", correspondingGuiId: 1},
      {label: "Insert entry through fromular", correspondingGuiId: 2},
    ];
    // important keep gui elements outside any functions to keep references to properties
    // last refactoring to extract elements resulted in not updating the GUI elements after setting them in loaderOptions
    const loaderGui = [
      // --> json
      <div><FileUpload name="demo[]" url="./upload" onUpload={(e) => {
        console.debug("uploaded ", e);
      }/*this.onUpload*/} multiple accept=".json" maxFileSize={1000000}
      emptyTemplate={<p className="p-m-0">Drag and drop files to here to upload.</p>} /></div>,

      // --> csv
      // documentation in: https://primefaces.org/primereact/showcase/#/fileupload
      // TODO: link to backend! name/url/upload etc.
      <div><FileUpload name="demo[]" url="./upload" onUpload={(e) => {
        console.debug("uploaded ", e);
      }/*this.onUpload*/} multiple accept=".csv" maxFileSize={1000000}
      emptyTemplate={<p className="p-m-0">Drag and drop files to here to upload.</p>} /></div>,

      // --> Input formular
      <IoTPropertyLoaderFormular
      //TODO: add additional layer for general categories, currently dummy values are used for: id, type, iotTypes
        property={this.props.property}
        handleIdChange = {this.props.handleIdChange}
        handleTypeChange = {this.props.handleTypeChange}
        handleIotTypesChange = {this.props.handleIotTypesChange}
        addNewSubproperty={this.props.addNewSubproperty} handleSubpropertiesChange={this.props.handleSubpropertiesChange}
        handleCategoryChange={this.props.handleCategoryChange} addNewCategory = {this.props.addNewCategory}
        addNewGeneralCategory = {this.props.addNewGeneralCategory}
        removeGeneralCategory = {this.props.removeGeneralCategory}
        removeCategory = {this.props. removeCategory}
        removeSubproperty = {this.props.removeSubproperty}
        removeIotType = {this.props.removeIotType}
        addNewPointRange={this.props.addNewPointRange}
        handlePointsChange={this.props.handlePointsChange}
        removePoints={this.props.removePoints}
      />,
    ];

    return (<div>
      {/* IoT-Property  Loader not implemented yet */}
      <Dropdown value={this.state.selectedLoadOption} options={loaderOptions} onChange={(e) => {
        this.setState({selectedLoadOption: e.value});
      } } optionLabel="label" optionValue="correspondingGuiId" placeholder="Select an option to load properties" />
      {this.state.selectedLoadOption ?loaderGui[this.state.selectedLoadOption] : <></>}
    </div>
    );
  }
}

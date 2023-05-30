import {Component} from "react";

import {InputTextarea} from "primereact/inputtextarea";
import {InputText} from "primereact/inputtext";


import CustomInputNumber from "../../TabView/ExtendedInputNumber";
import {toCamelCase} from "../../Utils/UtilityFunctions";
import {Divider} from "primereact/divider";
import {Button} from "primereact/button";

import {PointRating, createPointRange} from "../data-structure-utils/IotPropertyTypes";

interface IoTPointRangeLoaderProps {
    id: number,
    point:PointRating,

    // props from upper classes
    generalCategoryKey: string,
    categoryId: number,
    subpropertyId?: number,
    handlePointsChange(generalCategoryKey: string, categoryId:number, pointRange:PointRating, pointId:number, subpropertyId?:number): void,
    removePoints(generalCategoryKey: string, categoryId: number, pointRange:PointRating, pointId:number, subpropertyId?: number): void,
}

interface IoTPointRangeLoaderState {

}
/**
 * represents the iot properties with their curresponding points for it's questionary
 */
export default class IoTPointRangeLoader extends Component<IoTPointRangeLoaderProps, IoTPointRangeLoaderState> {
  constructor(props:IoTPointRangeLoaderProps) {
    super(props);
    this.state = {
      points: createPointRange(),
    };
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * @param points
   * @param name
   * @param details
   */
  handleChange( points: Partial<PointRating>) {
    //overwrite keys with same name
    const tmp = {...this.props.point, ...points} as PointRating;
    this.props.handlePointsChange(this.props.generalCategoryKey, this.props.categoryId, tmp, this.props.id, this.props.subpropertyId);
  }

  render() {
    //TODO: Validate User Input
    return (
      <>
        <h3>Point Range {this.props.id +1}</h3>
        <div><br />Point Range Name:<br /></div>
        <InputText value={this.props.point.groupName} onChange={(e) => {
          this.handleChange({groupName: e.target.value});
        } } />
        <div><br />Point Range Details/Description:<br /></div>
        <InputTextarea value={this.props.point.details} onChange={(e) => {
          this.handleChange({details: e.target.value});
        } } rows={5} cols={50} />
        <br /><br />
        <CustomInputNumber label={"value Points:"} sharedId={toCamelCase("subproperty" + "GeneralCategory" + "points" )} value={this.props.point.value}
          onChange={(e:any) => this.handleChange({value: e.target.value})} min={0}></CustomInputNumber>
        <Button label="Delete Point Range" onClick={()=>{
          this.props.removePoints(this.props.generalCategoryKey, this.props.categoryId, this.props.point, this.props.id, this.props.subpropertyId);
        }} style={{margin: "0.2rem"}}/>
        <Divider></Divider>
      </>
    );
  }
}

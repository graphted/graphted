import {Component, Fragment} from "react";

import {InputTextarea} from "primereact/inputtextarea";
import {InputText} from "primereact/inputtext";


import {Divider} from "primereact/divider";
import {Button} from "primereact/button";

import {Subproperty, PointRating} from "../data-structure-utils/IotPropertyTypes";
import IoTPointRangeLoader from "./IoTPointRangeLoader";

interface IoTSubPropertyLoaderProps {
  subproperty: Subproperty,

  // props from upper classes
  generalCategoryKey: string,
  categoryId: number,
  handleSubpropertiesChange(generalCategoryKey: string, categoryId:number, subpropertyId:number, subproperty:Subproperty): void,
  removeSubproperty(generalCategoryKey: string, categoryId: number, subpropertyId: number): void,
  addNewPointRange(generalCategoryKey: string, categoryId:number, subpropertyId?:number): void,
  handlePointsChange(generalCategoryKey: string, categoryId:number, pointRange:PointRating, pointId:number, subpropertyId?:number): void,
  removePoints(generalCategoryKey: string, categoryId: number, pointRange:PointRating, pointId:number, subpropertyId?: number): void,
}

interface IoTSubPropertyLoaderState {

}
/**
 * represents the iot properties with their curresponding points for it's questionary
 */
export default class IoTSubPropertyLoader extends Component<IoTSubPropertyLoaderProps, IoTSubPropertyLoaderState> {
  constructor(props:IoTSubPropertyLoaderProps) {
    super(props);
    this.state = {
      points: 0,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * @param points
   * @param name
   * @param details
   */
  handleChange( subprop: Partial<Subproperty>) {
    //overwrite keys with same name
    const tmp = {...this.props.subproperty, ...subprop};
    this.props.handleSubpropertiesChange(this.props.generalCategoryKey, this.props.categoryId, this.props.subproperty.id, tmp);
  }

  render() {
    return (
      <>
        <h2>Subproperty {this.props.subproperty.id +1}</h2>
        <div><br />Subproperty Name:<br /></div>
        <InputText value={this.props.subproperty.name} onChange={(e) => {
          // this.setState({name: e.target.value});
          this.handleChange({name: e.target.value});
        } } />
        <div><br />Subproperty Details/Description:<br /></div>
        <InputTextarea value={this.props.subproperty.details} onChange={(e) => {
          // this.setState({details: e.target.value});
          this.handleChange({details: e.target.value});
        } } rows={5} cols={50} />
        <br /><br />
        <div><br />Subproperty Points:<br /></div>
        {this.props.subproperty.points as PointRating[] ? (this.props.subproperty.points as PointRating[]).map((point, index) => (
          <Fragment key={index}>
            <IoTPointRangeLoader point={point} id={index} generalCategoryKey={this.props.generalCategoryKey} categoryId={this.props.categoryId} subpropertyId={this.props.subproperty.id}
              //TODO: create functions
              handlePointsChange={this.props.handlePointsChange}
              removePoints={this.props.removePoints}
            />
          </Fragment>
        )) :
        <> </>}
        <Button label="Add Points" onClick={()=>{
          this.props.addNewPointRange(this.props.generalCategoryKey, this.props.categoryId, this.props.subproperty.id);
        }} style={{margin: "0.2rem"}}/>
        <Button label="Delete Subproperty" onClick={()=>{
          this.props.removeSubproperty(this.props.generalCategoryKey, this.props.categoryId, this.props.subproperty.id);
        }} style={{margin: "0.2rem"}}/>
        <Divider></Divider>
      </>
    );
  }
}

import {Component, Fragment} from "react";

import {InputTextarea} from "primereact/inputtextarea";
import {InputText} from "primereact/inputtext";

import {Button} from "primereact/button";
import {Divider} from "primereact/divider";

import {Category, Subproperty, PointRating} from "../data-structure-utils/IotPropertyTypes";
import IoTSubPropertyLoader from "./IoTSubPropertyLoader";

interface IoTCategoryLoaderProps {
  category:Category,
  // from upper classes
  // props from upper classes
  generalCategoryKey: string,
  handleCategoryChange(generalCategoryKey: string, categoryId:number|string, category: Category): void,
  handleSubpropertiesChange(generalCategoryKey: string, categoryId:number, subpropertyId:number, subproperty:Subproperty): void,
  addNewSubproperty(generalCategoryKey: string, categoryId:number):void,
  removeCategory(generalCategoryKey: string, categoryId: number): void,
  removeSubproperty(generalCategoryKey: string, categoryId: number, subpropertyId: number): void,
  addNewPointRange(generalCategoryKey: string, categoryId:number, subpropertyId?:number): void,
  handlePointsChange(generalCategoryKey: string, categoryId:number, pointRange:PointRating, pointId:number, subpropertyId?:number): void,
  removePoints(generalCategoryKey: string, categoryId: number, pointRange:PointRating, pointId:number, subpropertyId?: number): void,
}

interface IoTCategoryLoaderState {

}
/**
 * represents the iot properties with their curresponding points for it's questionary
 */
export default class IoTCategoryLoader extends Component<IoTCategoryLoaderProps, IoTCategoryLoaderState> {
  constructor(props:IoTCategoryLoaderProps) {
    super(props);
    this.state = {
      points: 0,
    };
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
  }


  handleCategoryChange(category:Partial<Category>) {
    // handle change
    // overwrite keys with same name
    const tmp = {...this.props.category, ...category};
    this.props.handleCategoryChange(this.props.generalCategoryKey, this.props.category.id, tmp);
  }

  render() {
    //TODO: Validate User Input
    return (
      <>
        <div><br />Category Name:<br /></div>
        <InputText value={this.props.category.name} onChange={(e) => {
          // this.props.category.name = e.target.value;
          this.handleCategoryChange({name: e.target.value});
        } } />
        <div><br />Category Description:<br /></div>
        <InputTextarea value={this.props.category.description} onChange={(e) => {
          // this.props.category.description = e.target.value;
          this.handleCategoryChange({description: e.target.value});
        } } rows={5} cols={50} />
        <Divider></Divider>
        {this.props.category.subproperties ? this.props.category.subproperties.map((subproperty, index) => (
          <Fragment key={index}>
            {/* { subproperty } */}
            {/* Potential error when using multiple upper categories. currently id does not include keys of category map */}
            <IoTSubPropertyLoader
            // id={parseInt(this.props.category.id.toString().concat(index.toString()))}
              subproperty={subproperty}
              generalCategoryKey={this.props.generalCategoryKey}
              categoryId={this.props.category.id} handleSubpropertiesChange={this.props.handleSubpropertiesChange}
              removeSubproperty={this.props.removeSubproperty}
              addNewPointRange={this.props.addNewPointRange}
              handlePointsChange={this.props.handlePointsChange}
              removePoints={this.props.removePoints}
            />
          </Fragment>
        )) :
        <> </>}
        <Button label="Add Subproperty" onClick={()=>{
          this.props.addNewSubproperty(this.props.generalCategoryKey, this.props.category.id);
        }} style={{margin: "0.2rem"}}/>
        <Button label="Delete this Category" onClick={()=>{
          this.props.removeCategory(this.props.generalCategoryKey, this.props.category.id);
        }} style={{margin: "0.2rem"}}/>
      </>
    );
  }
}

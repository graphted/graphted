import {Component} from "react";
import IoTPropertyLoader from "./loader/IoTPropertyLoader";
import * as IotTypes from "./data-structure-utils/IotPropertyTypes";
import {jsonMapReplacer} from "../Utils/UtilityFunctions";

interface IoTPropertyProps {

}

interface IoTPropertyState {
  // chosen by option.
  displayResponsive: boolean,
  loaderModule:JSX.Element,
  // Property interface
  property:IotTypes.Property
}


/**
 * represents the iot properties with their curresponding points for the questionary
 */
export default class IoTProperty extends Component<IoTPropertyProps, IoTPropertyState> {
  constructor(props:IoTPropertyProps) {
    super(props);
    this.state = {
      displayResponsive: true,
      loaderModule: <></>,
      property: {
        id: -1,
        type: "",
        iotTypes: [],
        categories: new Map(),
      },
    };
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleIotTypesChange = this.handleIotTypesChange.bind(this);
    this.handleSubpropertiesChange = this.handleSubpropertiesChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handlePointRangeChange = this.handlePointRangeChange.bind(this);
    this.addNewPointRange = this.addNewPointRange.bind(this);
    this.addNewSubproperty = this.addNewSubproperty.bind(this);
    this.addNewCategory = this.addNewCategory.bind(this);
    this.addNewGeneralCategory = this.addNewGeneralCategory.bind(this);
    this.removeGeneralCategory = this.removeGeneralCategory.bind(this);
    this.removeCategory = this.removeCategory.bind(this);
    this.removeSubproperty = this.removeSubproperty.bind(this);
    this.removeIotType = this.removeIotType.bind(this);
    this.removePointRange = this.removePointRange.bind(this);
  }

  handlePointRangeChange(generalCategoryKey: string, categoryId:number, pointRange:IotTypes.PointRating, pointId:number, subpropertyId?:number) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    const category = generalCategory? generalCategory.value[categoryId] : undefined;
    if (category) {
      const generalCategorySave = generalCategory!.value.slice();
      if (subpropertyId === 0 || subpropertyId) {
      // update points
        (generalCategorySave[categoryId].subproperties![subpropertyId].points as IotTypes.PointRating[])[pointId] = pointRange;
      } else {
        (generalCategorySave[categoryId].points as IotTypes.PointRating[])[pointId] = pointRange;
      }
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }

  // TODO: test function. Got refactored to new structure
  handleSubpropertiesChange(generalCategoryKey: string, categoryId:number, subpropertyId:number, subproperty:IotTypes.Subproperty) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    const category = generalCategory? generalCategory.value[categoryId] : undefined;
    if (category) {
      const generalCategorySave = generalCategory!.value.slice();
      // update subproperty
      generalCategorySave[categoryId].subproperties![subpropertyId] = subproperty;
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }


  handleCategoryChange(generalCategoryKey: string, categoryId:number, category: IotTypes.Category) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    const stateCategory = generalCategory? generalCategory.value[categoryId] : undefined;
    if (stateCategory) {
      const generalCategorySave = generalCategory!.value.slice();
      // append subproperty
      generalCategorySave[categoryId] = category;
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }


  handleGeneralCategoryChange(key: string, value:IotTypes.Category[], description?:string) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    generalCategorie.set(key, {description: description, value: value});
    property.categories = generalCategorie;
    this.setState({property: property});
  }

  handleIdChange(id: number) {
    const property = this.state.property;
    property.id = id;
    this.setState({property: property});
  }

  handleTypeChange(type: string) {
    const property = this.state.property;
    property.type = type;
    this.setState({property: property});
  }

  handleIotTypesChange(iotTypes: string[]) {
    const property = this.state.property;
    property.iotTypes = iotTypes;
    this.setState({property: property});
  }

  addNewIotType(iotTypes: string[]) {
    const property = this.state.property;
    let iotTypesSave = this.state.property.iotTypes.slice();
    iotTypesSave = iotTypesSave.concat(iotTypes);
    property.iotTypes = iotTypesSave;
    this.setState({property: property});
  }

  addNewPointRange(generalCategoryKey: string, categoryId:number, subpropertyId?:number) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    const category = generalCategory? generalCategory.value[categoryId] : undefined;
    if (category) {
      const generalCategorySave = generalCategory!.value.slice();
      if (subpropertyId === 0 || subpropertyId) {
      // update points
        if (!(generalCategorySave[categoryId].subproperties![subpropertyId].points as IotTypes.PointRating[])) {
          (generalCategorySave[categoryId].subproperties![subpropertyId].points as IotTypes.PointRating[]) = [];
        }
        (generalCategorySave[categoryId].subproperties![subpropertyId].points as IotTypes.PointRating[]) = (generalCategorySave[categoryId].subproperties![subpropertyId].points as IotTypes.PointRating[]).concat(IotTypes.createPointRange());
      } else {
        if (!(generalCategorySave[categoryId].points as IotTypes.PointRating[])) {
          (generalCategorySave[categoryId].points as IotTypes.PointRating[]) = [];
        }
        (generalCategorySave[categoryId].points as IotTypes.PointRating[]) = (generalCategorySave[categoryId].points as IotTypes.PointRating[]).concat(IotTypes.createPointRange());
      }
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }

  addNewSubproperty(generalCategoryKey: string, categoryId:number) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    const category = generalCategory? generalCategory.value[categoryId] : undefined;
    if (category) {
      const generalCategorySave = generalCategory!.value.slice();
      if (!generalCategorySave[categoryId].subproperties) {
        generalCategorySave[categoryId].subproperties = [];
      }
      // append subproperty
      generalCategorySave[categoryId].subproperties = generalCategorySave[categoryId].subproperties!.concat(IotTypes.createSubproperty(generalCategorySave[categoryId].subproperties!.length, 0, ""));
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }


  addNewCategory(generalCategoryKey: string, name:string = "", description:string = "", subproperties:IotTypes.Subproperty[] = []) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    if (generalCategory) {
      let generalCategorySave = generalCategory!.value.slice();
      // append category
      const newCategory = IotTypes.createCategory(generalCategory.value.length, name, description, subproperties);
      generalCategorySave = generalCategorySave.concat(newCategory);
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }

  addNewGeneralCategory(key: string, value:IotTypes.Category[], description?:string) {
    if (this.state.property.categories.get(key)) {
      throw Error("Could not add property category already exists");
    }
    this.handleGeneralCategoryChange(key, value, description);
  }

  removeGeneralCategory(key: string) {
    if (!this.state.property.categories.get(key)) {
      alert("Could not remove " + key);
      return;
    }
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    generalCategorie.delete(key);
    property.categories = generalCategorie;
    this.setState({property: property});
  }

  // FIXME: strange behaviour when adding 2 subproperties deleting one and adding another one again. results in subprop 2 that could not be deleted
  removeCategory(generalCategoryKey: string, categoryId:number) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    const stateCategory = generalCategory? generalCategory.value[categoryId] : undefined;
    if (stateCategory) {
      // TODO: refactor duplicate code and apply array options
      const generalCategorySave = generalCategory!.value.slice();
      generalCategorySave.splice(categoryId, 1);
      // remove category
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }
  // FIXME: strange behaviour when adding 2 subproperties deleting one and adding another one again. results in subprop 2 that could not be deleted
  // Use Array.prototype.findIndex() instead of Ids?
  removeSubproperty(generalCategoryKey: string, categoryId:number, subpropertyId:number) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    const category = generalCategory? generalCategory.value[categoryId] : undefined;
    if (category) {
      const generalCategorySave = generalCategory!.value.slice();
      // remove subproperty --> could use filter here instead
      generalCategorySave[categoryId].subproperties!.splice(subpropertyId, 1);
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }
  removePointRange(generalCategoryKey: string, categoryId: number, pointRange: IotTypes.PointRating, pointId: number, subpropertyId?: number) {
    const property = this.state.property;
    const generalCategorie = this.state.property.categories;
    const generalCategory = generalCategorie.get(generalCategoryKey);
    const category = generalCategory? generalCategory.value[categoryId] : undefined;
    if (category) {
      const generalCategorySave = generalCategory!.value.slice();
      if (subpropertyId === 0 || subpropertyId) {
      // update points
        (generalCategorySave[categoryId].subproperties![subpropertyId].points as IotTypes.PointRating[]).splice(pointId, 1);
      } else {
        (generalCategorySave[categoryId].points as IotTypes.PointRating[]).splice(pointId, 1);
      }
      generalCategorie.set(generalCategoryKey, {description: generalCategory?.description, value: generalCategorySave});
      property.categories = generalCategorie;
      this.setState({property: property});
    }
  }

  removeIotType(iotTypes: string[], id:number) {
    const property = this.state.property;
    let iotTypesSave = this.state.property.iotTypes.slice();
    iotTypesSave = iotTypesSave.splice(id, 1);
    property.iotTypes = iotTypesSave;
    this.setState({property: property});
  }


  /**
   * calculate points based on filled out questionary
   */
  calculatePoints() {

  }

  render() {
    return (
      <>
        <IoTPropertyLoader
          property={this.state.property}
          handleIdChange = {this.handleIdChange}
          handleTypeChange = {this.handleTypeChange}
          handleIotTypesChange = {this.handleIotTypesChange}
          addNewSubproperty={this.addNewSubproperty}
          handleSubpropertiesChange={this.handleSubpropertiesChange}
          handleCategoryChange={this.handleCategoryChange}
          addNewCategory={this.addNewCategory}
          addNewGeneralCategory={this.addNewGeneralCategory}
          removeGeneralCategory = {this.removeGeneralCategory}
          removeCategory = {this.removeCategory}
          removeSubproperty = {this.removeSubproperty}
          removeIotType = {this.removeIotType}
          addNewPointRange={this.addNewPointRange}
          handlePointsChange={this.handlePointRangeChange}
          removePoints={this.removePointRange}
        />
        <pre>{JSON.stringify(this.state.property, jsonMapReplacer, 4)}</pre>
      </>
    );
  }
}

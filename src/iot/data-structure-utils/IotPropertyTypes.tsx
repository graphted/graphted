

export interface Subproperty {
  id: number
  name?:string,
  //TODO: points: number exist only from formular and not from examples.
  //TODO: refactor points: number, should be instead PointRating[1]
  points:number | PointRating[],
  //details or description
  details?:string,
}

export interface Category {
  id: number
  name:string,
  description:string,
  subproperties?: Subproperty[],
  points?: PointRating[],
  // points?: number | PointRange[],
}

export interface UppermostCategoryData {
  value:Category[]
  description?:string,
}

/**
 * Represents a catalogue for "Data Store Quality Characteristics" and "Data Provider Property"
 */
export interface Property {
  id: number
  // data_provider/store/source
  type: string,
  // ciot, iiot etc.
  iotTypes: string[],
  // uppermost category in questionary: generalCategories ( category name -> questionary details)
  //TODO: use array of key/val object instead of map: so that it can be representated in json or map when loading/saving json
  // string not sufficient upperMost categories can have a description
  categories: Map<string, UppermostCategoryData>;
}

export interface PointRating {
  groupName?: string,
  details?:string,
  value: number,
  setValue: number,
  isSelected: boolean,
}


export function createPointRange(groupName?: string, details?:string, value = 0, setValue= 0, isSelected = false) {
  return {
    groupName: groupName,
    details: details,
    value: value,
    setValue: setValue,
    isSelected: isSelected,
  };
}

export function convertNumberToPointRange(value:number, groupName?: string, details?:string) {
  return createPointRange(groupName, details, value, value);
}


export function createSubproperty(id: number, points:number, name?:string, details?:string ) {
  return {
    id: id,
    name: name,
    points: points,
    details: details,
  };
}

export function createCategory(id: number, name:string = "", description:string = "", subproperties:Subproperty[] = []) {
  return {
    id: id,
    name: name,
    description: description,
    subproperties: subproperties,
  };
}

export function evaluatePoints(points: PointRating[], defaultValue = 0):number {
  // filter out non selected values (negative numbers)
  return points.map((point) => point.isSelected ? point.setValue : defaultValue).filter((point) => point >=0).reduce((previousValue, currentValue) => (previousValue + currentValue));
}

export function evaluateProperty(property:Property):number {
  let result = 0;
  property.categories.forEach((categoryArray, upperCategory) => {
    //  render category[]
    categoryArray.value.forEach((item) =>{
      if (item.points) {
        // points saved in category
        result +=evaluatePoints(item.points);
      } else {
        // points saved subcategory
        item.subproperties?.map((subproperty) => {
          //@ts-ignore
          if (isNaN(subproperty.points)) {
            result +=evaluatePoints(subproperty.points as PointRating[]);
          } else {
            result += (subproperty.points as number);
          }
        });
      }
    });
  });
  return result;
}

function isPointIncluded(points: PointRating[] |number) {
  let invalidValues:number[]= [];
  //@ts-ignore
  if (isNaN(points)) {
    invalidValues = (points as PointRating[]).filter((point) => point.isSelected && point.setValue < 0).map((elem) => elem.setValue);
  } else if ((points as number) >= 0) {
    invalidValues.push((points as number));
  }
  return invalidValues.length <= 0;
}

export function getMaxSumOfProperty(property:Property, isSelectionDependend=true):number {
  //TODO: make it possible to leave out some checkboxes -> max Score ignores those checkboxes
  const questionaryPoints: number[] = [];
  property.categories.forEach((categoryArray, upperCategory) => {
    //  render category[]
    categoryArray.value.forEach((item) =>{
      if (item.points) {
        const pointsCategory:number[] = [];
        // maximum points saved in category
        if (!isSelectionDependend || isPointIncluded(item.points)) {
          item.points.forEach((point) => pointsCategory.push(point.value));
          questionaryPoints.push(Math.max(...pointsCategory));
        }
      } else {
        // points saved subcategory
        item.subproperties?.map((subproperty) => {
          const pointsSubproperty:number[] = [];
          if (!isSelectionDependend || isPointIncluded(subproperty.points)) {
          //@ts-ignore
            if (isNaN(subproperty.points)) {
              (subproperty.points as PointRating[]).forEach((point) => pointsSubproperty.push(point.value));
            } else {
              pointsSubproperty.push((subproperty.points as number));
            }
            questionaryPoints.push(Math.max(...pointsSubproperty));
          }
        });
      }
    });
  });

  //return maximum points, or -1 if no selection was done
  return questionaryPoints.length > 0 ? questionaryPoints.reduce((previousValue, currentValue) => previousValue + currentValue) : -1;
}

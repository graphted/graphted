import {Component} from "react";
import {PointRating} from "../data-structure-utils/IotPropertyTypes";
import {RadioButton} from "primereact/radiobutton";

interface PointSelectionProps {
    points:PointRating[],
    fallBackName?:string,
    STARTINDEX:number,
    upperCategoryID:string,
}

interface PointRangeSelection {
    id: string,
    selection: PointRating,
}

interface PointSelectionState {
    selection: PointRangeSelection,
}

/**
 * represents the iot properties with their curresponding points for the PointSelection
 */
export default class PointSelection extends Component<PointSelectionProps, PointSelectionState> {
  constructor(props:PointSelectionProps) {
    super(props);
    this.state = {
      // https://primefaces.org/primereact/showcase/#/radiobutton using: Dynamic Values, Preselection, Value Binding and Disabled Option
      selection: {id: this.props.STARTINDEX.toString(), selection: this.props.points[this.props.STARTINDEX]},
    };
    this.props.points[this.props.STARTINDEX].isSelected = true;
    this.props.points[this.props.STARTINDEX].setValue = this.props.points[this.props.STARTINDEX].value;
  }

  saveMetadata(point:PointRating, index:number) {

  }

  render() {
    return (
      <>
        {
          this.props.points.map((point, index) => {
            //keys for json properties
            const elementIndex = index.toString();
            //keys for html ids
            const elementKey = this.props.upperCategoryID + "-" + index.toString();
            //previous keys
            const savedSelectionKey = this.state.selection.id;
            const savedSelectioElementKey = this.props.upperCategoryID + "-" + savedSelectionKey;
            // display only
            const elementName = point.groupName;
            return (
              <div key={elementKey} className="p-field-radiobutton">
                <RadioButton inputId={elementKey} name="point" value={point}
                  onChange={(e) => {
                    this.setState({selection: {id: elementIndex, selection: e.value}});
                    // selection changed
                    if (!(savedSelectioElementKey === elementKey)) {
                      // set current selection
                      this.props.points[index].isSelected = true;
                      //if a slider is used in the future, use value from slider
                      this.props.points[index].setValue = point.value;
                      // reset old value
                      const oldIndex = parseInt(savedSelectionKey);
                      this.props.points[oldIndex].isSelected = false;
                      this.props.points[oldIndex].setValue = ((this.props.points[index].value < 0) ? this.props.points[index].value : 0);
                    }
                  }} checked={savedSelectioElementKey === elementKey} tooltip={point.details}/>
                <label style={{cursor: "pointer"}}htmlFor={elementKey}>{elementName}</label>
              </div>
            );
          })
        }
      </>
    );

  }
}

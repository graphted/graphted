import {Component} from "react";

import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";

import {Button} from "primereact/button";
import {Checkbox} from "primereact/checkbox";
import {ChromePicker, RGBColor} from "react-color";

import {rgbaColorString} from "../Utils/UtilityFunctions";

interface CustomColorPickerProps {
  label: string;
  labelWidth: string;
  color: RGBColor | undefined;
  defaultColor: RGBColor;
  handleColorChange: (e:RGBColor) => void
  handleCheckboxChange: (checked:boolean) => void
}

interface CustomColorPickerState {

  displayColorPicker: boolean;
}

export default class CustomColorPicker extends Component<CustomColorPickerProps, CustomColorPickerState> {
  constructor(props:CustomColorPickerProps) {
    super(props);
    this.state = {
      displayColorPicker: false,
    };
    this.showColorPicker = this.showColorPicker.bind(this);
  }

  static defaultProps = {
    defaultColor: {r: 255, g: 255, b: 255, a: 1},
  };


  showColorPicker = (event:any) => {
    this.setState({displayColorPicker: !this.state.displayColorPicker});
  }

  render() {
    return (
      <div style={{marginLeft: 0}} className="p-field-checkbox  p-grid">
        <Checkbox inputId="binary" checked={ ((this.props.color != undefined))} onChange={(e:any) => {
          this.props.handleCheckboxChange(e.checked);
        }
        } />
        <label htmlFor="ExtendedColorPicker" className="p-col-fixed">{this.props.label} Color</label>
        {/* preview with picker menu */}
        {((this.props.color != undefined)) ?
                   <div className="p-col" style={{position: "relative"}}>
                     {/* color preview */}
                     <Button onClick={this.showColorPicker} style={{backgroundColor: this.props.color ? rgbaColorString(this.props.color) : rgbaColorString(this.props.defaultColor)}}></Button>
                     {this.state.displayColorPicker ?
                           <div style={ {position: "absolute", zIndex: 1} }>
                             <div style={ {position: "fixed", top: "0px", right: "0px", bottom: "0px", left: "0px"}} onClick={ () => this.setState({displayColorPicker: false}) }/>
                             <ChromePicker color={this.props.color} onChange={(e) => this.props.handleColorChange(e.rgb)} />
                           </div>:
                        null}
                   </div> :
              ""}
      </div>
    );
  }
}

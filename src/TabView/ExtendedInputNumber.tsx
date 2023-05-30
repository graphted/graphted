import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";

import {InputNumber} from "primereact/inputnumber";
import PrimeTabViewElement, {PrimeTabViewElementProps as ParentProps} from "./PrimeTabViewElement";

interface CustomInputNumberProps {
  label: string;
  sharedId: string;
  value: number;
  mode?:string;
  suffix?:string;
  min?:number | undefined;
  max?:number | undefined;
  minFractionDigits?:number | undefined;
  showButtons?:boolean;
  onChange: (e:any) => void
}

interface CustomInputNumberState {
}

type Props = ParentProps & CustomInputNumberProps;
type State = CustomInputNumberState;

export default class CustomInputNumber extends PrimeTabViewElement<Props, State> {
  constructor(props:Props) {
    super(props);
    this.state = {
    };
  }

  static defaultProps = {
    mode: "decimal",
    suffix: " pt",
    showButtons: true,
    minFractionDigits: 0,
  };


  render() {
    return (
      <div>
        <label htmlFor={this.props.sharedId}>{this.props.label}</label>
        <InputNumber inputId={this.props.sharedId} value={this.props.value} onValueChange={(e) =>{
          this.props.onChange(e);
        }} showButtons={this.props.showButtons} mode={this.props.mode} suffix={this.props.suffix} min={this.props.min} max={this.props.max} minFractionDigits={this.props.minFractionDigits}/>
      </div>
    );
  }
}

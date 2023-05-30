import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";

import {Checkbox} from "primereact/checkbox";
import React from "react";

import PrimeTabViewElement, {PrimeTabViewElementProps as ParentProps} from "./PrimeTabViewElement";

interface PrimeTabViewElementCheckboxProps {
  label: string;
  value: boolean;
  style?:React.CSSProperties | undefined;
  sharedId: string;
}

interface PrimeTabViewElementCheckboxState {
}

type Props = ParentProps & PrimeTabViewElementCheckboxProps;
type State = PrimeTabViewElementCheckboxState;

export default class PrimeTabViewElementCheckbox extends PrimeTabViewElement<Props, State> {
  constructor(props:Props) {
    super(props);
    this.state = {
      checked: true,
    };
  }

    static defaultProps = {
      optionLabel: "name",
    };

    render() {
      return (
        <div>
          <Checkbox inputId={this.props.sharedId} checked={this.props.value} onChange={(e) => {
            this.setState({checked: e.checked}); this.props.onChange(e);
          }} />
          <label htmlFor={this.props.sharedId}>{this.props.label}</label>
        </div>
      );
    }
}

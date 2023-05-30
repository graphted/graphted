import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import "../../index.css";

import {Component} from "react";
import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import "./PrimeDialog.css";

interface PrimeDialogProps {
    dialogName: string,
    header: string,
    body: JSX.Element
    display: boolean
    onDisplayChange: any
}

interface PrimeDialogState {

}

export default class PrimeDialog extends Component<PrimeDialogProps, PrimeDialogState> {
  constructor(props:PrimeDialogProps) {
    super(props);
    this.state = {display: false};
  }

    onShow = () => {
      this.setState({display: true});
    }

    onHide = () => {
      this.setState({display: true});
    }

    handleChange(e:any) {
      this.props.onDisplayChange(e.target!.value);
    }

    renderFooter = () => {
      return (
        <div>
          <Button label="OK" onClick={() => this.onHide()} autoFocus />
        </div>
      );
    }

    render() {
      console.log("Render dialog: ", this);
      return (
        <Dialog header={this.props.header} visible={this.props.display} onHide={() => this.onHide()} breakpoints={{"960px": "75vw"}} style={{width: "50vw"}} footer={this.renderFooter()}>
          {this.props.body}
        </Dialog>
      );
    }
}

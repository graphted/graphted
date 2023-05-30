import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";

import {Component} from "react";


export interface PrimeTabViewElementProps {
    // tabpanel: 'Style' | 'Text' | 'Arrange';
    // name: string;
    value:any;
    onChange: (e:any) => void;
}

export default abstract class PrimeTabViewElement <Props extends PrimeTabViewElementProps, State> extends Component<Props, State> {
    abstract render () : JSX.Element;
}

import {Component} from "react";
import IoTProperty from "./IoTProperty";

interface IoTProps {
  category: "ciot" | "iot",
  // General Modeling Elements
  name?: string, // could be the same as label of the node
  typ: string,
  example: string,
  imgPath: string,
  properties: {
    name:string,
    properties:IoTProperty[],
  }
}


/**
 * Abstract class for all iot components for trust worthiness calculation
 */
export default abstract class IoT <Props extends IoTProps, State> extends Component<Props, State> {
  abstract calculateTrustScore (): void;

  render() {
    return (<div>
               IoT-Class is not implemented yet
    </div>
    );
  }
}

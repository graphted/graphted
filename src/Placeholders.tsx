// import mxgraph and typscript libraries
import * as MxTypes from "mxgraph"; // <- import types only


// placeholers only defines if placeholders are used in the original code
// placeholders are basically just attributes:
// placeholders="1" score="10"
// always replace placeholder in this version

/**
 * src adapted from Graph.js
 *
 * https://www.diagrams.net/doc/faq/predefined-placeholders
 *
 * @param graph
 * @param name
 * @returns
 */
export function getPredefinedPlaceholder(graph:MxTypes.mxGraph, name:string) {
  let val = null;

  if (name == "date") {
    val = new Date().toLocaleDateString();
  } else if (name == "time") {
    val = new Date().toLocaleTimeString();
  } else if (name == "timestamp") {
    val = new Date().toLocaleString();
  }
  // format date not supported due to large code amount
  //  else if (name.substring(0, 5) == "date{") {
  //    const fmt = name.substring(5, name.length - 1);
  //    val = this.formatDate(new Date(), fmt);
  //  }

  return val;
}

/**
  * Private helper method.
  * src adapted from Graph.js
  */
export function replacePlaceholder(graph:MxTypes.mxGraph, cell:MxTypes.mxCell, str?:string, additionalPlaceholder?:any[]) {

  /**
     * Specifies the regular expression for matching placeholders.
     * src from Graph.js
     */
  /* eslint-disable no-useless-escape */
  const placeholderPattern = new RegExp("%(date\{.*\}|[^%^\{^\}]+)%", "g");

  const result = [];
  let match:RegExpExecArray|null;

  if (str != null) {
    let last = 0;

    match = placeholderPattern.exec(str);
    while (match) {
      const val = match[0];

      if (val.length > 2 && val !== "%label%" && val !== "%tooltip%") {
        let tmp = null;

        if (match.index > last && str.charAt(match.index - 1) == "%") {
          tmp = val.substring(1);
        } else {
          const name = val.substring(1, val.length - 1);

          // Workaround for invalid char for getting attribute in older versions of IE
          if (name == "id") {
            tmp = cell.id;
          } else if (name.indexOf("{") < 0) {
            let current = cell;

            while (tmp == null && current != null) {
              if (current.value != null && typeof(current.value) == "object") {
                //  if (Graph.translateDiagram && Graph.diagramLanguage != null) {
                //    tmp = current.getAttribute(name + "_" + Graph.diagramLanguage);
                //  }

                if (tmp == null) {
                  tmp = (current.hasAttribute(name)) ? ((current.getAttribute(name) != null) ?
                      current.getAttribute(name) : "") : null;
                }
              }

              current = graph.model.getParent(current);
            }
          }

          // if (tmp == null) {
          //   tmp = this.getGlobalVariable(name);
          // }

          if (tmp == null && additionalPlaceholder != null) {
            //@ts-ignore
            tmp = additionalPlaceholder[name];
          }
        }

        result.push(str.substring(last, match.index) + ((tmp != null) ? tmp : val));
        last = match.index + val.length;
      }
      match = placeholderPattern.exec(str);
    }

    result.push(str.substring(last));
  }

  return result.join("");
}


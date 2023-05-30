import iiotDataProviderJson from "../iot/data_source_files/iiot_data_provider_property_catalogue.json";
import ciotDataProviderJson from "../iot/data_source_files/ciot_data_provider_property_catalogue.json";
import iiotDataStoreJson from "../iot/data_source_files/data_store_quality_characteristics.json";

import {jsonMapReplacer, jsonMapReviver} from "../Utils/UtilityFunctions";

import {Property} from "./data-structure-utils/IotPropertyTypes";
//*************************************************/
// Metadata  options presets
//*************************************************/
export function getMetadataTemplates() {
  const jsons = [iiotDataProviderJson, ciotDataProviderJson, iiotDataStoreJson];
  const templates: { name: string;value: any;}[] = [];
  jsons.forEach((json) => {
    const template = getJsonObject(json, "Property");
    templates.push({name: getTemplateName(template), value: template});
  });
  return templates;
}

export function getTemplateName(defaultMetadataJson: Property) {
  // ciot, iiot etc.
  const iotTypes:string = defaultMetadataJson.iotTypes.join(" ")
      .replaceAll("iot", "IoT")
      .replaceAll("cIoT", "CIoT")
      .replaceAll("iIoT", "IIoT")
      .trim();
  // data_provider/store/source
  const type: string = defaultMetadataJson.type.replaceAll("_", " ");
  const templateName = iotTypes ? iotTypes + " " + type : type;
  return templateName.charAt(0).toUpperCase() + templateName.slice(1);
}

function getJsonObject(json:any, key:string) {
  return JSON.parse(JSON.stringify(json, jsonMapReplacer, 4), jsonMapReviver)[key];
}


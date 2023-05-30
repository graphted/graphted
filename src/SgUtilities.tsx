/** utility function for data import. (import image)
* @param {*} data
* @returns
*/
export function dataUrlToCellStyle(data:string) {
  const semi = data.indexOf(";");

  if (semi > 0) {
    data = data.substring(0, semi) + data.substring(data.indexOf(",", semi + 1));
  }
  return data;
}

/**
 * converts an element into its base64 representation
 * src from https://stackoverflow.com/questions/6150289/how-can-i-convert-an-image-into-base64-string-using-javascript
 * @param url
 * @param callback
 */
export async function toDataURL(url:string, callback:Function) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
    const reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}

export function getHelpInformation() {
  return <div style={{textAlign: "left"}}>
    <h3>Introduction</h3>
    This Software can be used to assess the quality of data sources and model basic diagrams.
    <br/>
    <ul>
      <li>Drag resources from the left panel with your left mouse button to add them to your diagram.</li>
      <li>Edit the node texts by double clicking.</li>
      <li>Move the view inside the diagram window by holding the right mouse button.</li>
      <li>Edges can be drawn by holding your left mouse button in the center of a node.</li>
      <li>Edit the diagram with the corresponding options in the tabs on the right side.</li>
      <li>Add metadata such as questionnaires to nodes by clicking the Metadata tab.</li>
    </ul>

    <h3>Mobile Usage</h3>
    {// FIXME: mxgraph mobile support broke => fix graph view touch events
      // TODO: splitters are not responsive => use sidebars left and right for mobile view, or small screens
    }
    Not yet targeted for mobile devices.
    <ul>
      <li>Drag nodes: begin dragging and click into graph view</li>
      <li>Mark multiple nodes: drag rectangle window over graph view</li>
    </ul>
  </div>;
}

export function getKeyboardShortcutsInformation() {
  return <div style={{textAlign: "left"}}>
    {/* {TODO: Setup keys by json config file} */}
    {/* {TODO: Setup update and link information from configuration file} */}
    <h3>Keyboard Shortcuts</h3>
    <ul>

      <li>Select all: CTRL + a</li>
      <li>Select all vertices: CTRL + SHIFT + v</li>
      <li>Select all edges: CTRL + SHIFT + e</li>
      <li>Extract: CTRL + x</li>
      <li>Copy: CTRL + c</li>
      <li>Paste: CTRL + v</li>
      <li>Duplicate: CTRL + d</li>
      <li>Group: CTRL + g</li>
      <li>Ungroup: CTRL + SHIFT + u</li>
      <li>Delete: Delete or Backspace</li>
      <li>Selection to front: CTRL + SHIFT + f</li>
      <li>Selection to back: CTRL + SHIFT + b</li>

      <li>Save: CTRL + s</li>
      <li>Save as: CTRL + SHIFT + s</li>
      <li>Open: CTRL + o</li>
      <li>New file: ALT + n</li>

      <li>Undo: CTRL + z</li>
      <li>Redo: CTRL + y</li>
      <li>Help: F1</li>
      <li>Rename label of selection: F2</li>
    </ul>
  </div>;
}

export function getAboutInformation() {
  return <div style={{textAlign: "left"}}>
    Created with:
    <ul>
      <li><a href="https://github.com/jgraph/mxgraph">Mxgraph</a></li>
      <li><a href="https://www.primefaces.org/primereact/">PRIMEREACT</a></li>
      <li><a href="https://icons.getbootstrap.com/">Bootstrap icons</a></li>
    </ul>
  </div>;
}

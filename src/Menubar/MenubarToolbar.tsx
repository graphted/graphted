import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";

import "./MenubarToolbar.css";

import {Component} from "react";
import {Menubar, MenubarStartTemplate} from "primereact/menubar";

// https://www.primefaces.org/primereact/showcase/#/icons
import {PrimeIcons} from "primereact/api";

import * as editorActions from "../Actions";
import * as graphFileUtils from "../Utils/GraphFileUtils";
import {mxGraph, mxUndoManager} from "mxgraph";

import logo from "../images/logo.png";

// a tutorial https://www.primefaces.org/primereact/showcase/#/menumodel

interface MenubarToolbarProps {
  DEBUG:boolean;
  graph: mxGraph;
  undoMgr: mxUndoManager;
  filename:string;
  handleFilenameChange: (filename: string) => void;
  showHelpModal: ()=> void;
  showAboutModal: ()=> void;
  showKeyboardModal: ()=> void;
  showSaveAsModal: ()=> void;
  showEditStyleModal: ()=> void;
}

interface MenubarToolbarState {
  items:any[];
  start:MenubarStartTemplate;
  // end:MenubarEndTemplate;
  displayModal: boolean;
  displayHelp: boolean;
  displaySaveAs: boolean;
}

export default class MenubarToolbar extends Component<MenubarToolbarProps, MenubarToolbarState> {
  private readonly menuItems = [
    {
      label: "File",
      // icon: "pi pi-fw pi-file",
      items: [
        {
          label: "New", icon: PrimeIcons.PLUS, command: () => {
            //TODO: create popup warning that everything will be deleted
            editorActions.deleteAll(this.props.graph);
          },
        },
        {
          label: "New Window", icon: PrimeIcons.PLUS, command: () => {
            window.open(window.location.href, "_blank");
          },
        },
        {
          label: "Open", icon: PrimeIcons.FILE, command: (e: any) => {
            //TODO: use react version: https://www.cluemediator.com/open-an-input-file-on-a-button-click-in-react
            editorActions.openFile(this.props.graph, this.props.handleFilenameChange).click();
          },
        },
        {separator: true},
        {
          label: "Save", icon: PrimeIcons.SAVE, command: () => {
            const filename = this.props.filename ? this.props.filename : "untitled.graphted";
            editorActions.saveFile(editorActions.saveXml(this.props.graph), filename);
          },
        },
        {
          label: "Save as", icon: PrimeIcons.SAVE, command: () => {
            // save as location is handled by browser saving settings
            this.props.showSaveAsModal();
          },
        },
        {separator: true},
        {
          label: "Import Stencil", icon: PrimeIcons.DOWNLOAD, command: () => {
            editorActions.openStencilFile().click();
          },
        },
        {separator: true},
        // {label: "Page Setup", icon: PrimeIcons.FILE},
        {
          label: "Print", icon: PrimeIcons.PRINT, command: () => {
            const filename = this.props.filename ? this.props.filename : "untitled.graphted";
            graphFileUtils.printDivGraph("divGraph", this.props.graph, filename);
          },
        },
      ],
    },
    {
      label: "Edit",
      // icon: "pi pi-fw pi-pencil",
      items: [
        {
          label: "Undo", icon: PrimeIcons.REPLAY, command: () => {
            editorActions.undo(this.props.undoMgr);
          },
        },
        {
          label: "Redo", icon: PrimeIcons.REFRESH, command: () => {
            editorActions.redo(this.props.undoMgr);
          },
        },
        {separator: true},
        {
          label: "Cut", icon: "bi bi-scissors", command: () => {
            editorActions.cut(this.props.graph);
          },
        },
        {
          label: "Copy", icon: PrimeIcons.COPY, command: () => {
            editorActions.copy(this.props.graph);
          },
        },
        {
          label: "Paste", icon: PrimeIcons.COPY, command: () => {
            editorActions.paste(this.props.graph);
          },
        },
        {
          label: "Delete", icon: PrimeIcons.TIMES, command: () => {
            editorActions.deleteSelection(this.props.graph);
          },
        },
        {separator: true},
        {
          label: "Duplicate", icon: PrimeIcons.CLONE, command: () => {
            editorActions.duplicate(this.props.graph);
          },
        },
        {
          label: "Edit Style", icon: "bi bi-easel", command: () => {
            this.props.showEditStyleModal();
            //code in tabView
            //TODO: move up displayResponsive variable and use props for menu and primetab
          },
        },
      ],
    },
    {
      label: "Selection",
      items: [
        {
          label: "Select Vertices", icon: "bi bi-bounding-box-circles", command: () => {
            editorActions.selectAllVertices(this.props.graph);
          },
        },
        {
          label: "Select Edges", icon: "bi bi-bezier2", command: () => {
            editorActions.selectAllEdges(this.props.graph);
          },
        },
        {
          label: "Select All", icon: "bi bi-hand-index-fill", command: () => {
            editorActions.selectAll(this.props.graph);
          },
        },
        {
          label: "Select None", icon: "bi bi-hand-index", command: () => {
            editorActions.clearSelection(this.props.graph);
          },
        },
        {separator: true},
        {
          label: "Select data source", icon: "bi bi-file-earmark-bar-graph",
          items: [
            {
              label: "Data Store", icon: "bi bi-server", command: () => {
                editorActions.selectAllDataSources(this.props.graph, "data_store");
              },
            },
            {
              label: "Data Provider", icon: "bi bi-person-badge", command: () => {
                editorActions.selectAllDataSources(this.props.graph, "data_provider");
              },
            },
            {
              label: "Data Sources", icon: "bi bi-file-earmark-bar-graph", command: () => {
                editorActions.selectAllDataSources(this.props.graph, "data_sources");
              },
            },
          ],
        },
      ],
    },
    {
      label: "View",
      items: [
        {
          label: "Reset View", icon: PrimeIcons.SEARCH, command: () => {
            editorActions.zoomReset(this.props.graph);
          },
        },
        {
          label: "Zoom In", icon: PrimeIcons.SEARCH_PLUS, command: () => {
            editorActions.zoomIn(this.props.graph);
          },
        },
        {
          label: "Zoom Out", icon: PrimeIcons.SEARCH_MINUS, command: () => {
            editorActions.zoomOut(this.props.graph);
          },
        },
      ],
    },
    {
      label: "Arrange",
      items: [
        {
          label: "To Front", icon: "bi bi-front", command: () => {
            editorActions.selectionToFront(this.props.graph);
          },
        },
        {
          label: "To Back", icon: "bi bi-back", command: () => {
            editorActions.selectionToBack(this.props.graph);
          },
        },
        {separator: true},
        {
          label: "Group", icon: "bi bi-union", command: () => {
            editorActions.group(this.props.graph);
          },
        },
        {
          label: "Ungroup", icon: "bi bi-subtract", command: () => {
            editorActions.ungroup(this.props.graph);
          },
        },
        {
          label: "Remove from Group", icon: "bi bi-exclude", command: () => {
            editorActions.ungroup(this.props.graph);
          },
        },
        {separator: true},
        {
          label: "Add Waypoint", icon: "bi bi-plus-circle", command: () => {
            editorActions.addWaypoint(this.props.graph);
          },
        },
        {
          label: "Clear Waypoints", icon: "bi bi-x-circle", command: () => {
            editorActions.clearAllWaypoints(this.props.graph);
          },
        },
      ],
    },
    {
      label: "Help",
      items: [
        {
          label: "Help", icon: PrimeIcons.QUESTION_CIRCLE, command: () => {
            // this.setState({displayHelp: true});
            this.props.showHelpModal();
          },
        },
        {
          label: "Shortcuts", icon: PrimeIcons.INFO_CIRCLE, command: () => {
            this.props.showKeyboardModal();
          },
        },
        {
          label: "About", icon: PrimeIcons.INFO_CIRCLE, command: () => {
            this.props.showAboutModal();
          },
        },
      ],
    },
  ];

  constructor(props:MenubarToolbarProps) {
    super(props);
    this.state = {
      items: this.menuItems,
      start: <img alt="logo" src={logo} onError={(e) => {
        const target = e.target as any; if (target) target.src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png";
      }} height="40" className="p-mr-2"></img>,
      // end: <InputText placeholder="Search" type="text" />,
      displayModal: false,
      displayHelp: false,
      displaySaveAs: false,
    };
  }

  render() {
    console.log("render menubar", this.props.graph);
    return (
      <div>
        <div className="card navbar">
          <Menubar style={{zIndex: "10"}} model={this.state.items} start={this.state.start}/>
        </div>
      </div>
    );
  }
}

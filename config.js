/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/* Config File */

//example of valid string input
var EXAMPLE_MAP = `29 26
**#*********--************
*----*-----*--*-----*----*
*----*-----*--*-----*----*
*----*-----*--*-----*----*
**************************
-----*--*--------*--*----*
-----*--*--------*--*----*
******--****--****--******
-----*-----*--*-----*-----
-----*-----*--*-----*-----
-----*--**********--*-----
-----*--*--------*--*-----
-----*--*--------*--*-----
*********--------*********
-----*--*--------*--*-----
-----*--*--------*--*-----
-----*--**********--*-----
-----*--*--------*--*-----
-----*--*--------*--*-----
************--************
*----*-----*--*-----*----*
*----*-----*--*-----*----*
***--****************--***
--*--*--*--------*--*--*--
--*--*--*--------*--*--*--
******--****--****--******
*----------*--*----------*
*----------*--*----------*
**********************$***`;

//input symbols configuration 
var INPUT_CONFIG = {
  "start_cell": "#",
  "end_cell": "$",
  "passable_cell": "*",
  "impassable_cell": "-",
  "right_path_cell": "@"
};

//map color configuration
var COLOR_CONFIG = {
  "colors": [
    {
      "symbol": INPUT_CONFIG.passable_cell,
      "hex": "#ffffff",
      "alias": "white"
    },
    {
      "symbol": INPUT_CONFIG.start_cell,
      "hex": "#0000ff",
      "alias": "blue"
    },
    {
      "symbol": INPUT_CONFIG.end_cell,
      "hex": "#ff0000",
      "alias": "red"
    },
    {
      "symbol": INPUT_CONFIG.impassable_cell,
      "hex": "#4e4e4e",
      "alias": "dark_gray"
    },
    {
      "symbol": INPUT_CONFIG.right_path_cell,
      "hex": "#ffff00",
      "alias": "yellow"
    }
  ]
};

//map configuration
var MAP_CONFIG = {
  "first_row": 8,
  "first_column": 1,
  "row_size": 15,
  "column_size": 15
};

//Ui variable
var UI = SpreadsheetApp.getUi();

//Sheet variable
var SHEET = SpreadsheetApp.getActive().getSheetByName("Mapa");

//Drive folder ID
var FOLDER_ID = "1WHEB9iyIcEZIzvanNgl28fN-Gx9lKM7O"; 

//Heuristic number. 2 for Manhattan Distance, 5 for Euclidean Distance
var HEURISTIC = 2;

//Weight of the edge (change to adjacent cell)
var CHANGE_CELL_WEIGHT = 1;

//map size
var MAP_SIZE = {
  "min_height": 20,
  "min_width": 25,
  "avg_height": 40,
  "avg_width": 50
}

/**
 * Creates the configuration of the cells.
 * @class
 * @classdesc Creates the configuration of the cells.
 */
class DescriptionNode {
  constructor(is_visited, is_passable, is_start_cell, is_end_cell){
    this.is_visited = is_visited;
    this.is_passable = is_passable;
    this.is_start_cell = is_start_cell;
    this.is_end_cell = is_end_cell;
  }
  
  setPassable(value){
    this.is_passable = value;
  }
  
  isVisited(){
    return this.is_visited;
  }
  
  isPassable(){
    return this.is_passable;
  }
  
  isStartCell(){
    return this.is_start_cell;
  }
  
  isEndCell(){
    return this.is_end_cell;
  }
  
  visit(){
    this.is_visited = true;
  }
}

/**
 * Creates a Search Node with index, parent_index, address, parent_address and weights.
 * @class
 * @classdesc Creates a Search Node that stores node configuration.
 */
class SearchNode {
  constructor(index, parent_index, address, parent_address, heur_weight, weight){
    this.index = index;
    this.parent_index = parent_index;
    this.address = address;
    this.parent_address = parent_address;
    this.heur_weight = heur_weight;
    this.weight = weight;
  }
  
  //getters
  get index(){
    return this._index;
  }
  get parent_index(){
    return this._parent_index;
  }
  get address(){
    return this._address;
  }
  get parent_address(){
    return this._parent_address;
  }
  get weight(){
    return this._weight;
  }
  get heur_weight(){
    return this._heur_weight;
  }
  
  //setters
  set index(value){
    this._index = value;
  }
  set parent_index(value){
    this._parent_index = value;
  }
  set address(value){
    this._address = value;
  }
  set parent_address(value){
    this._parent_address = value;
  }
  set weight(value){
    this._weight = value;
  }
  set heur_weight(value){
    this._heur_weight = value;
  }
}
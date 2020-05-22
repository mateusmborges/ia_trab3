/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/**
 * Decodes an example map.
 */
function testDecode(){
  decodeMap(EXAMPLE_MAP);
}

/**
 * Decodes an input string, then prints it on the sheet.
 * @param {string} string
 */
function decodeMap(string){
  //checks if input is not empty. If it is empty, displays an alert and quit
  if(string === ""){
    var err_msg = "Entrada inválida.";
    console.log(err_msg);
    displayAlert(err_msg);
    return;
  }
  
  //splits the input using space or newline as delimiters
  var list = string.split(/ |\n/);
  
  //translate the input. First substring should be the height of the map, second substring should be the width and the rest should be the map
  var [height,width, ...map] = list;
  
  if(typeof height === typeof ""){
    height = parseInt(height);
  }
  
  if(typeof width === typeof ""){
    width = parseInt(width);
  }
  
  //checks if height or width is greater than 4. If they are equal or less, displays an alert and quit
  if(height <= 4 || width <= 4){
    var err_msg = "Entrada inválida. Tamanho do mapa deve ser maior do que 4.";
    console.log(err_msg);
    displayAlert(err_msg);
    return;
  }
  
  //checks if height, width and map are not empty or null
  if(height === [] || height === "" || width === [] || width === "" || map === [] || map === ""){
    var err_msg = "Erro na leitura da entrada.";
    console.log(err_msg);
    displayAlert(err_msg);
    return;
  }
  
  //converts the map substring in an array of arrays of single symbols
  var symbols_map = splitMap(map);
  
  //prints the symbols map on the sheet
  printMap(symbols_map, height, width);
}

/**
 * Prints the symbols map on the sheet.
 * @param {String[][]} symbols_map - Array of arrays of single symbols
 * @param {number} height - Height of the map
 * @param {number} width - Width of the map
 */
function printMap(symbols_map, height, width){
  var sheet = SHEET;
  
  //clear sheet
  sheet.clear();
  
  //displays the header without information
  updateHeader("","","","","");
  
  //clear all colors
  sheet.getRange(MAP_CONFIG.first_row, MAP_CONFIG.first_column, height, width).setBackground("#ffffff");
  
  //adjusts the number of rows and columns of the sheet
  adjustSheet(sheet,height,width);
  
  //adjusts the size of the rows and columns (MAP_CONFIG in config file)
  sheet.setRowHeights(MAP_CONFIG.first_row, sheet.getMaxRows()-MAP_CONFIG.first_row+1, MAP_CONFIG.row_size);
  sheet.setColumnWidths(MAP_CONFIG.first_column, sheet.getMaxColumns()-MAP_CONFIG.first_column+1, MAP_CONFIG.column_size);
  
  //encodes the symbols to colors
  var colors = encodeColors(symbols_map);
  
  //updates cells with background color
  sheet.getRange(MAP_CONFIG.first_row, MAP_CONFIG.first_column, height, width).setBackgrounds(colors);
  
  //adds a border on the map range
  sheet.getRange(MAP_CONFIG.first_row, MAP_CONFIG.first_column, sheet.getMaxRows(), sheet.getMaxColumns()).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THICK);
}

/**
 * Checks if sheet has the correct number of rows and columns, and ajusts it if needed.
 * @param {Sheet} sheet
 * @param {number} height - Height of the map
 * @param {number} width - Width of the map
 */
function adjustSheet(sheet,height,width){
  var max_rows = sheet.getMaxRows();
  var max_columns = sheet.getMaxColumns(); 
  
  
  if(max_rows < MAP_CONFIG.first_row + (height-MAP_CONFIG.first_row)){
    sheet.insertRows(max_rows, MAP_CONFIG.first_row + height - max_rows);
  }
  
  if(max_columns < MAP_CONFIG.first_column + (width-MAP_CONFIG.first_column)){
    sheet.insertColumns(max_columns, MAP_CONFIG.first_column + width - max_columns);
  }

  if(max_rows > MAP_CONFIG.first_row + (height-1)){
    sheet.deleteRows(MAP_CONFIG.first_row + (height-1), max_rows-(MAP_CONFIG.first_row + (height-1)));
  }
  
  if(max_columns > MAP_CONFIG.first_column + (width-1)){
    sheet.deleteColumns(MAP_CONFIG.first_column + (width-1), max_columns-(MAP_CONFIG.first_column + (width-1)));
  }
}

/**
 * Translates symbols to colors, using COLOR_CONFIG in config file.
 * @param {String[][]} symbols_map - Array of arrays of single symbols
 * @returns {String[][]} 
 */
function encodeColors(symbols_map){
  var colors = symbols_map.map(function(row){
    return row.map(function(symbol_cell){
      return COLOR_CONFIG.colors.find(function(color){
        return color.symbol === symbol_cell;
      }).hex;
    });
  });
  
  return colors;
}

/**
 * Decodes a single string to an array of arrays of symbols
 * @param {string} map - Single string map
 * @returns {String[][]} 
 */
function splitMap(map){
  var out = [];
  map.forEach(function(string){
    var splitted = string.split("");
    out.push(splitted);
  });
  
  return out;
}

/**
 * Reads the sheet and returns an array of arrays of symbols
 * @returns {String[][]} 
 */
function readSheet(){
  var sheet = SHEET;
  
  //read the background colors
  var colors = sheet.getRange(MAP_CONFIG.first_row, MAP_CONFIG.first_column, sheet.getMaxRows()-(MAP_CONFIG.first_row-1), sheet.getMaxColumns()-(MAP_CONFIG.first_column-1)).getBackgrounds();
  console.log(colors);
  //decode the colors to symbols
  var symbols_map = decodeColors(colors);
  
  return symbols_map;
}

/**
 * Translates colors to symbols, using COLOR_CONFIG in config file.
 * @param {String[][]} color_list - Array of arrays of colors
 * @returns {String[][]} 
 */
function decodeColors(color_list){  
  var symbols_map = color_list.map(function(row){
    return row.map(function(hex_cell){
      try{
        return COLOR_CONFIG.colors.find(function(color){
          return color.hex === hex_cell;
        }).symbol;
      }
      catch(e){
        return INPUT_CONFIG.passable_cell;
      }
    });
  });

  return symbols_map;
}

/**
 * Clears map from sheet.
 */
function resetMap(){
  var sheet = SHEET;
  
  updateHeader("","","","","");
  
  sheet.getRange(MAP_CONFIG.first_row, MAP_CONFIG.first_column, sheet.getMaxRows()-(MAP_CONFIG.first_row-1), sheet.getMaxColumns()-(MAP_CONFIG.first_column-1))
    .clear()
    .setBackground("#ffffff")
    .setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THICK);
}

/**
 * Removes yellow cells of the map.
 */
function cleanYellowCells(){
  var symbols_map = readSheet();
 
  var height = symbols_map.length;
  var width = symbols_map[0].length;
  
  //updates path cells to passable cells
  var new_symbols_map = symbols_map.map(function(row){
    return row.map(function(cell){
      if(cell === INPUT_CONFIG.right_path_cell){
        return INPUT_CONFIG.passable_cell;
      }
      return cell;
    });
  });
  
  printMap(new_symbols_map,height,width);
}

/**
 * Updates header of sheet (Rows above the map).
 * @param {string} method - Name of the Method being used
 * @param {number|string} time - Time (ms) spent calculating the path
 * @param {string} size - Size of the map
 * @param {string} results - Stringified array with the path cells addresses (row, column)
 * @param {string} length - Length of the path 
 */
function updateHeader(method,time,size,results,length){
  var sheet = SHEET;
  
  if(results.length > 50000){
    var long_str = results;
    saveResults(long_str);
    results = "Resultado excede o limite da planilha. Resultados salvos no drive.";
  }
  
  var header = [
	["Trabalho 3 de IA","","","",""],
    ["","","","",""],
	["Method:","","","",method],
	["Time ms:","","","",time],
	["Map Size:","","","",size],
    ["Results:","","","",results],
    ["Length:","","","",length]
  ]; 
  
  try{
    var colors = [];
    var colors_list = [];
    COLOR_CONFIG.colors.forEach(function(color){
      if(color.symbol !== INPUT_CONFIG.right_path_cell){
        colors.push(color.hex.toString());
      }
    });
    colors_list.push(colors);
    sheet.getRange(2,1,1,4).setBackgrounds(colors_list);
  }
  catch(e){
    console.log(e);
  }
  
  sheet.getRange(1,1,header.length,header[0].length).setValues(header);
  
  sheet.getRange(1,1).setFontWeight("bold");
}

/**
 * Generates a random map.
 */
function generateRandomMap(){
  var sheet = SHEET;
  var height = Math.floor((Math.random() * (MAP_SIZE.avg_height + (MAP_SIZE.avg_height - 2 * MAP_SIZE.min_height)))) + MAP_SIZE.min_height;
  var width = Math.floor((Math.random() * (MAP_SIZE.avg_width + (MAP_SIZE.avg_width - 2 * MAP_SIZE.min_width)))) + MAP_SIZE.min_width;
  
  if(width > 2*height){
    width = Math.floor(height + (width/height));
  }
  else if(height > 1.25*width){
    height = Math.floor(width + (height/width));
  }
  
  //percent determines the rate of impassable cells
  //add_pass increases the probability of a passable cell being adjacent to another passable cell (cluster)
  //sub_imp increases the probability of a impassable cell being adjacent to another impassable cell (cluster)
  var [percent,add_pass,sub_imp] = [0.48,0.12,0.07];
  
  var symbols_map = [];
  
  for (var i = 0; i < height; i++){
    var new_row = [];
    for (var j = 0; j < width; j++){
      var rand = Math.random();
      if(new_row[j-1] === INPUT_CONFIG.passable_cell){
        rand = rand + add_pass;
      }
      else{
        rand = rand - sub_imp;
      }
      if(symbols_map[i-1] !== undefined){
        if(symbols_map[i-1][j] === INPUT_CONFIG.passable_cell){
          rand = rand + add_pass;
        }
        else{
          rand = rand - sub_imp;
        }
      }
      if(rand >= percent){      
        new_row.push(INPUT_CONFIG.passable_cell);
      }
      else{
        new_row.push(INPUT_CONFIG.impassable_cell); 
      }
    }
    symbols_map.push(new_row);
  }
  
  var description_map = generateDescription(symbols_map);
  
  var [x1,x2] = searchValidPassableCell(symbols_map,description_map,height,width);
  symbols_map[x1][x2] = INPUT_CONFIG.start_cell;
  
  var [x2,y2] = searchValidPassableCell(symbols_map,description_map,height,width);
  symbols_map[x2][y2] = INPUT_CONFIG.end_cell;
  
  var size = `${height}x${width}`;
  
  printMap(symbols_map, height, width);
  
  updateHeader("","",size,"","");
}
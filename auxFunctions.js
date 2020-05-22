/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/**
 * Creates an array of arrays of description nodes based on the symbols, using INPUT_CONFIG in config file.
 * @param {String[][]} symbols_map - Array of arrays of single symbols
 * @returns {DescriptionNode[][]} 
 */
function generateDescription(symbols_map){
  var description_map = symbols_map.map(function(row){
    return row.map(function(cell){
      switch(cell){
        case INPUT_CONFIG.passable_cell:
          return node = new DescriptionNode(false, true, false, false);
          break;
        case INPUT_CONFIG.start_cell:
          return node = new DescriptionNode(true, true, true, false);
          break;
        case INPUT_CONFIG.end_cell:
          return node = new DescriptionNode(false, true, false, true);
          break;
        case INPUT_CONFIG.impassable_cell:
          return node = new DescriptionNode(false, false, false, false);
          break;
        case INPUT_CONFIG.right_path_cell:
          return node = new DescriptionNode(false, true, false, false);
          break;
        default:
          return node = new DescriptionNode(false, false, false, false);
      }
    });
  });
  
  return description_map;
}

/**
 * Searches the map looking for a start cell symbol, using INPUT_CONFIG in config file.
 * @param {String[][]} symbols_map - Array of arrays of single symbols
 * @returns {Array|null} Address [row,column]  
 */
function getStartCell(symbols_map){
  var start_cell = [-1,-1];
  symbols_map.forEach(function(row,i1){
    row.forEach(function(cell,i2){
      if(cell === INPUT_CONFIG.start_cell){
        start_cell = [i1,i2];
      }
    });
  });
  
  if(start_cell[0] === -1 && start_cell[1] === -1){
    return null;
  }
  
  return start_cell;
}

/**
 * Searches the map looking for an end cell symbol, using INPUT_CONFIG in config file.
 * @param {String[][]} symbols_map - Array of arrays of single symbols
 * @returns {Array|null} Address [row,column]  
 */
function getEndCell(symbols_map){
  var end_cell = [-1,-1]; 
  symbols_map.forEach(function(row,i1){
    row.forEach(function(cell,i2){
      if(cell === INPUT_CONFIG.end_cell){
        end_cell = [i1,i2];
      }
    });
  });
  
  if(end_cell[0] === -1 && end_cell[1] === -1){
    return null;
  }
  
  return end_cell;
}

/**
 * Updates a symbols_map with the path cells, using INPUT_CONFIG in config file.
 * @param {String[][]} symbols_map - Array of arrays of single symbols
 * @param {String[][]} path - An array of addresses [row,column]
 * @returns {String[][]} updated_symbols_map  
 */
function updateSymbolsMap(symbols_map,path){
  //creates a new symbols map without previous path cells
  var new_symbols_map = symbols_map.map(function(row){
    return row.map(function(cell){
      if(cell === INPUT_CONFIG.right_path_cell){
        return INPUT_CONFIG.passable_cell;
      }
      return cell;
    });
  });
  
  //updates with path cells 
  path.forEach(function(path_cell){
    new_symbols_map[path_cell[0]][path_cell[1]] = INPUT_CONFIG.right_path_cell;
  });
  
  return new_symbols_map;
}

/**
 * Checks if a cell is a valid cell to visit.
 * @param {Array} cell - Address [row, column]
 * @param {DescriptionNode[][]} description_map - An array of arrays of description nodes
 * @param {number} height
 * @param {number} width
 * @returns {boolean} 
 */
function isValidCellToVisit(cell,description_map,height,width){
  //if cell is out of borders, return false
  if(cell[0] < 0 || cell[0] >= height || cell[1] < 0 || cell[1] >= width){
    return false;
  }
  //if cell is not passable or already visited, return false
  if(!description_map[cell[0]][cell[1]].isPassable() || description_map[cell[0]][cell[1]].isVisited()){
    return false;
  }
  //else return true
  return true;
}

/**
 * Computes the heuristic weight of all passable cells and prints on sheet.
 */
function evaluateAllCells(){
  var sheet = SHEET;
  
  var symbols_map = readSheet();
  var end_cell = getEndCell(symbols_map);
  
  var weight_map = symbols_map.map(function(row,i1){
    return row.map(function(symbol,i2){
      if(symbol === INPUT_CONFIG.passable_cell || symbol === INPUT_CONFIG.start_cell || symbol === INPUT_CONFIG.right_path_cell || symbol === INPUT_CONFIG.end_cell){  
        var weight = evaluateCell([i1,i2],end_cell)[HEURISTIC];
        return weight;
      }
      return "";
    });
  });
  
  //prints on sheet
  sheet.getRange(MAP_CONFIG.first_row,MAP_CONFIG.first_column,weight_map.length,weight_map[0].length).setValues(weight_map);
}

/**
 * Computes the distances and heuristic weights of current cell based on end cell.
 * @param {Array} current_cell - Address [row,column] of the current cell being evaluated
 * @param {Array} end_cell - Address [row,column] of the end cell
 * @returns {Array} array - Array with abs(distance in axis x), abs(distance in axis y), sum of abs(), distance in axis x, distance in axis y, euclidean distance
 */
function evaluateCell(current_cell,end_cell){
   var x_dist = end_cell[0]-current_cell[0];
   var y_dist = end_cell[1]-current_cell[1];
   var x_abs = Math.abs(x_dist);
   var y_abs = Math.abs(y_dist);
   var dist = Math.sqrt(((end_cell[0]-current_cell[0]) * (end_cell[0]-current_cell[0])) + ((end_cell[1]-current_cell[1]) * (end_cell[1]-current_cell[1])));
   
   return [x_abs,y_abs,x_abs+y_abs,x_dist,y_dist,dist];
}

/**
 * Callback function to sort nodes only by heuristic weight.
 * @param {SearchNode} a
 * @param {SearchNode} b
 * @returns {number}
 */
function sortByHeuristicWeight(a, b){
  if(a.heur_weight > b.heur_weight){
    return 1;
  }
  else if(a.heur_weight < b.heur_weight){
    return -1;
  }
  return 0;
}

/**
 * Callback function to sort nodes by sum of heuristic weight and node weight.
 * @param {SearchNode} a
 * @param {SearchNode} b
 * @returns {number}
 */
function sortByTotalWeight(a, b){
  if((a.weight + a.heur_weight) > (b.weight + b.heur_weight)){
    return 1;
  }
  else if((a.weight + a.heur_weight) < (b.weight + b.heur_weight)){
    return -1;
  }
  return 0;
}

/**
 * Decides which order of operators to use.
 * @param {Array} current_cell - Address [row, column]
 * @param {Array} end_cell - Address [row, column]
 * @returns {Array} order - Array of directions
 */
function operatorOrder(current_cell,end_cell){
  var [xa,ya,sum,x,y,dist] = evaluateCell(current_cell,end_cell);

  if(x >= 0){ //end_cell a direita
    if(y >= 0){ //end_cell abaixo
      if(xa >= ya){ //preferencia para down
        return ["down","right","left","up"];
      }
      else{ //preferencia para right
        return ["right","down","up","left"];
      } 
    }
    else{ //end_cell acima
      if(xa >= ya){ //preferencia para up
        return ["up","right","left","down"];
      }
      else{ //preferencia para right
        return ["right","up","down","left"];
      }
    }
  }
  //end_cell a esquerda
  else{
    if(y >= 0){ //end_cell abaixo
      if(xa >= ya){ //preferencia para down
        return ["down","left","right","up"];
      }
      else{ //preferencia para left
        return ["left","down","up","right"];
      } 
    }
    else{ //end_cell acima
      if(xa >= ya){ //preferencia para up
        return ["up","left","right","down"];
      }
      else{ //preferencia para left
        return ["left","up","down","right"];
      }
    }
  }
}

Array.prototype.shuffle = function(){
  var i = this.length - 1;
  for(i; i > 0; i--){
    const j = Math.floor(Math.random() * i);
    const temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
}

/**
 * Search for a random valid passable cell and returns its address.
 * @param {String[][]} symbols_map - Array of arrays of single symbols
 * @param {DescriptionNode[][]} description_map - An array of arrays of description nodes
 * @param {number} height
 * @param {width} width 
 * @returns {Array} [x, y]
 */
function searchValidPassableCell(symbols_map,description_map,height,width){
  var [x,y] = [Math.floor(Math.random()*height),Math.floor(Math.random()*width)];
  
  while(!description_map[x][y].isPassable() || neighborPassableCells([x,y],description_map,height,width) === 0 || description_map[x][y].isStartCell() || description_map[x][y].isEndCell()){
    [x,y] = [Math.floor(Math.random()*height),Math.floor(Math.random()*width)];
  }
  
  return [x,y];
}

/**
 * Counts all neighbor passable cells of a cell. 
 * @param {Array} cell - Address [row, column]
 * @param {DescriptionNode[][]} map - An array of arrays of description nodes
 * @param {number} height
 * @param {width} width 
 * @returns {number} count - A number between 0 to 4
 */
function neighborPassableCells(cell,map,height,width){
  var count = 0;
  //up
  if((cell[0]-1 >= 0)){
    if(map[cell[0]-1][cell[1]].isPassable() === true){
      count++;
    }
  }
  //down
  if((cell[0]+1 < height)){
    if(map[cell[0]+1][cell[1]].isPassable() === true){
      count++;
    }
  }
  //left
  if((cell[1]-1 >= 0)){
    if(map[cell[0]][cell[1]-1].isPassable() === true){
      count++;
    }
  }
  //right
  if((cell[1]+1 < width)){
    if(map[cell[0]][cell[1]+1].isPassable() === true){
      count++;
    }
  }    
  return count;
}
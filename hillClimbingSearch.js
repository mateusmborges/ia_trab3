/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/**
 * Tries to calculate a path between a start cell and an end cell using Steepest Ascent Hill Climbing Search.
 */
function hillClimbingSearch() {
  //reads the sheet and get the symbols
  var symbols_map = readSheet();
  
  //generate an DescriptionNode map based on the symbols
  var description_map = generateDescription(symbols_map);
  
  var height = symbols_map.length;
  var width = symbols_map[0].length;
  
  var start_cell = getStartCell(symbols_map);
  var end_cell = getEndCell(symbols_map);
  
  //checks if exists a start cell and an end cell
  if(start_cell === null || end_cell === null){
    var err_msg = "Mapa inválido. Deve haver pelo menos uma casa inicial e final.";
    console.log(err_msg);
    displayAlert(err_msg);
    return;
  }
  
  //starts the clock
  var begin_clock = new Date();
  begin_clock = begin_clock.getTime();
  
  //computes weight of the start cell based on a heuristic
  var heur_weight = evaluateCell(start_cell,end_cell)[HEURISTIC];
  
  //creates a new node from start_cell
  var node = new SearchNode(0,0,start_cell,[-1,-1],heur_weight,0);
  
  //stack of Search Nodes
  var stack = [];
  
  //bool to indicate if end was reached
  var reached_end = false;
  
  //defines the order of preference of the operators
  var order = operatorOrder(start_cell,end_cell);
  
  //while there is a best node than the current_one
  while(node !== null && node !== undefined){
    
    //if node address is equal to end cell, stops loop
    if(description_map[node.address[0]][node.address[1]].isEndCell()){
      reached_end = true;
      break;
    }
    
    //update stack with the next node
    stack.push(node.address);
    
    //update the order of operations
    order = operatorOrder(node.address,end_cell);
    
    //pick the best adjacent node, if it exists
    node = evaluateNeighborsHillClimbing(node,order,description_map,height,width,end_cell); //steepest ascent hill climbing
  }
  
  //stringify the path
  var results = stack.map(function(point){
    var str = `(${point[0]},${point[1]})`;
    return str;
  });
  
  //inserts the end cell, if reached
  if(reached_end){
    results.push(`(${end_cell[0]},${end_cell[1]})`);
  }

  var length = results.length;
  results = "[" + results.join(",") + "]";
  
  //remove start cell
  stack.shift();
  
  //stops clock
  var end_clock = new Date();
  end_clock = end_clock.getTime();
  
  //compute information to print on the sheet header
  var total_duration = end_clock - begin_clock;
  var size = `${height}x${width}`;
  var method = "Busca Hill Climbing";
  
  //update symbols map to include path symbols
  var new_symbols_map = updateSymbolsMap(symbols_map,stack);
  
  //prints map on sheet
  printMap(new_symbols_map,height,width);
  
  //check if end cell was reached
  if(!reached_end){
    var err_msg = "Não foi possível chegar ao destino."; 
    console.log(err_msg);
    displayAlert(err_msg);
  }
  
  //prints header on sheet
  updateHeader(method,total_duration,size,results,length);
  
  console.log(results);
}

/**
 * Evaluates cell's neighbors get the best adjacent cell, based on a predefined order
 * @param {SearchNode} node
 * @param {Array} order - Order Array (example: ["right","down","left","up"]) 
 * @param {DescriptionNode[][]} description_map - Array of arrays of description nodes
 * @param {number} height
 * @param {number} width
 * @param {Array} end_cell - Address [row, column]
 * @returns {SearchNode|null}
 */
function evaluateNeighborsHillClimbing(node,order,description_map,height,width,end_cell){ //steepest ascent hill climbing
  var children_array = [];
  description_map[node.address[0]][node.address[1]].visit();
  order.forEach(function(direction){
    switch(direction){
      case "up":
        var neighbor = [node.address[0]-1,node.address[1]];
        if(isValidCellToVisit(neighbor,description_map,height,width)){
          var heur_weight = evaluateCell(neighbor,end_cell)[HEURISTIC];
          var new_node = new SearchNode(0,0,neighbor,node.address,heur_weight,0);
          children_array.push(new_node);
        }
        break;
      case "down":
        var neighbor = [node.address[0]+1,node.address[1]];
        if(isValidCellToVisit(neighbor,description_map,height,width)){
          var heur_weight = evaluateCell(neighbor,end_cell)[HEURISTIC];
          var weight = node.weight + 1;
          var new_node = new SearchNode(0,0,neighbor,node.address,heur_weight,weight);
          children_array.push(new_node);
        }
        break;
      case "left":
        var neighbor = [node.address[0],node.address[1]-1];
        if(isValidCellToVisit(neighbor,description_map,height,width)){
          var heur_weight = evaluateCell(neighbor,end_cell)[HEURISTIC];
          var weight = node.weight + 1;
          var new_node = new SearchNode(0,0,neighbor,node.address,heur_weight,weight);
          children_array.push(new_node);
        }
        break;
      case "right":
        var neighbor = [node.address[0],node.address[1]+1];
        if(isValidCellToVisit(neighbor,description_map,height,width)){
          var heur_weight = evaluateCell(neighbor,end_cell)[HEURISTIC];
          var weight = node.weight + 1;
          var new_node = new SearchNode(0,0,neighbor,node.address,heur_weight,weight);
          children_array.push(new_node);
        }
        break;
    }
  });
  
  if(children_array === []){
    return null;
  }
  
  //sort nodes to get the best node
  children_array.sort(sortByHeuristicWeight);
  
  //if the best children node is better or equal to parent node, returns it, else returns null
  if(children_array[0] !== undefined && children_array[0].heur_weight <= node.heur_weight){
    return children_array[0];
  }
  else{
    return null;
  }
}

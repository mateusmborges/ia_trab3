/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/**
 * Calculates a path between a start cell and an end cell using A* Search.
 */
function aStarSearch() {
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
  
  //infos
  var size = `${height}x${width}`;
  var method = "Busca A*";
  
  //starts the clock
  var begin_clock = new Date();
  begin_clock = begin_clock.getTime();
  
  //defines the order of preference of the operators
  var order = operatorOrder(start_cell,end_cell);
  
  //open queue that stores nodes
  var open = [];
  
  //closed queue that stores nodes
  var closed = [];
  
  //computes weight of the start cell based on a heuristic
  var weight_start_cell = evaluateCell(start_cell,end_cell)[HEURISTIC];
  
  //creates a new node from start_cell
  var start_cell_node = new SearchNode(0,0,start_cell,[-1,-1],weight_start_cell,0);
  
  //adds the start node on the open queue
  open.push(start_cell_node);
  
  //while the open queue still has nodes
  while(open.length > 0){
  
    //get the first node
    var current_cell_node = open.shift();

    //if node address is equal to end cell, stops loop
    if(description_map[current_cell_node.address[0]][current_cell_node.address[1]].isEndCell()){
      closed.push(current_cell_node);
      break;
    }
    
    //calculates the heuristic weight of this node
    var heur_weight = evaluateCell(current_cell_node.address,end_cell)[HEURISTIC];
    current_cell_node.heur_weight = heur_weight;
    
    //update the order of operations
    order = operatorOrder(current_cell_node.address,end_cell);
    
    //adds all neighbors nodes on open queue
    evaluateNeighborsAStar(current_cell_node,order,description_map,height,width,end_cell,open);
    
    //sorts the open queue using only the heuristic weight
    open.sort(sortByTotalWeight);
    
    //adds the current node to the closed queue
    closed.push(current_cell_node);
  }
  
  var path = [];
  
  //try to find the end cell in the closed queue
  var node = closed.find(function(nodes){
    return (description_map[nodes.address[0]][nodes.address[1]].isEndCell())
  });
  
  //if end cell is not on closed queue, alert and quit
  if(node === undefined){
    var err_msg = "Todos as casas foram verificadas e não foi encontrado um caminho entre a origem e o destino.";
    //prints header on sheet
    updateHeader(method,"",size,err_msg,"");
    console.log(err_msg);
    displayAlert(err_msg);
    return;
  }
  
  //backtrack to get the best path
  while(node.parent_address != [-1,-1]){
    var next_address = node.parent_address;
    node = closed.find(function(bt_node){
      return (bt_node.address === next_address)
    });
    if(node === undefined){
      break;
    }
    if(node.address !== end_cell){
      path.push(node.address);
    }
  }
  
  path.reverse();
  
  //stringify the path
  var results = path.map(function(point){
    var str = `(${point[0]},${point[1]})`;
    return str;
  });
  
  //inserts the end cell
  results.push(`(${end_cell[0]},${end_cell[1]})`);
  var length = results.length;
  results = "[" + results.join(",") + "]";
  
  path.reverse();
  
  //remove start cell
  path.pop();
  
  //stops clock
  var end_clock = new Date();
  end_clock = end_clock.getTime();
  
  //compute information to print on the sheet header
  var total_duration = end_clock - begin_clock;  
  
  //update symbols map to include path symbols
  var new_symbols_map = updateSymbolsMap(symbols_map,path);
  
  //prints map on sheet
  printMap(new_symbols_map,height,width);
  
  //prints header on sheet
  updateHeader(method,total_duration,size,results,length);
  
  console.log(results);
  
}

/**
 * Evaluates cell's neighbors to add all available cells to the open queue, based on a predefined order
 * @param {SearchNode} node
 * @param {Array} order - Order Array (example: ["right","down","left","up"]) 
 * @param {DescriptionNode[][]} description_map - Array of arrays of description nodes
 * @param {number} height
 * @param {number} width
 * @param {Array} end_cell - Address [row, column]
 * @param {SearchNode[]} open_array
 */
function evaluateNeighborsAStar(node,order,description_map,height,width,end_cell,open_array){
  description_map[node.address[0]][node.address[1]].visit();
  order.forEach(function(direction){
    switch(direction){
      case "up":
        var neighbor = [node.address[0]-1,node.address[1]];
        if(isValidCellToVisit(neighbor,description_map,height,width)){
          description_map[neighbor[0]][neighbor[1]].visit();
          var heur_weight = evaluateCell(neighbor,end_cell)[HEURISTIC];
          var weight = node.weight + CHANGE_CELL_WEIGHT;
          var new_node = new SearchNode(0,0,neighbor,node.address,heur_weight,weight);
          open_array.push(new_node);
        }
        break;
      case "down":
        var neighbor = [node.address[0]+1,node.address[1]];
        if(isValidCellToVisit(neighbor,description_map,height,width)){
          description_map[neighbor[0]][neighbor[1]].visit();
          var heur_weight = evaluateCell(neighbor,end_cell)[HEURISTIC];
          var weight = node.weight + CHANGE_CELL_WEIGHT;
          var new_node = new SearchNode(0,0,neighbor,node.address,heur_weight,weight);
          open_array.push(new_node);
        }
        break;
      case "left":
        var neighbor = [node.address[0],node.address[1]-1];
        if(isValidCellToVisit(neighbor,description_map,height,width)){
          description_map[neighbor[0]][neighbor[1]].visit();
          var heur_weight = evaluateCell(neighbor,end_cell)[HEURISTIC];
          var weight = node.weight + CHANGE_CELL_WEIGHT;
          var new_node = new SearchNode(0,0,neighbor,node.address,heur_weight,weight);
          open_array.push(new_node);
        }
        break;
      case "right":
        var neighbor = [node.address[0],node.address[1]+1];
        if(isValidCellToVisit(neighbor,description_map,height,width)){
          description_map[neighbor[0]][neighbor[1]].visit();
          var heur_weight = evaluateCell(neighbor,end_cell)[HEURISTIC];
          var weight = node.weight + CHANGE_CELL_WEIGHT;
          var new_node = new SearchNode(0,0,neighbor,node.address,heur_weight,weight);
          open_array.push(new_node);
        }
        break;
    }
  });
}
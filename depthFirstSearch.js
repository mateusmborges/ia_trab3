/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/**
 * Calculates a path between a start cell and an end cell using Depth First Search.
 */
function depthFirstSearch() {
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
  var method = "Busca em Profundidade";
  
  //starts the clock
  var begin_clock = new Date();
  begin_clock = begin_clock.getTime();
  
  //stack of addresses [row, column]
  var stack = [];
  
  //inserts the start cell on the stack 
  stack.push(start_cell);
  
  //defines the order of preference of the operators
  var order = ["down", "right", "up", "left"];
  
  //grabs the last cell on the stack
  let last_visited = stack[stack.length-1];
  var description_last_visited = description_map[last_visited[0]][last_visited[1]];
  
  //checks if cell === end_cell
  if(!description_last_visited.isEndCell()){  
    //repeat while stack is not empty
    while(stack.length > 0){
      //choose a neighbor based on the order defined above
      var visited = evaluateNeighborsDFS(last_visited,order,description_map,height,width,end_cell);
      
      //if there is not an available neighbor, pop the stack
      if(visited === null){
        stack.pop();
        //check if there is any cell on stack. if true, grab the cell
        if(stack.length > 0){
          last_visited = stack[stack.length-1];
        }
      }
      //if there is an available neighbor, push it to stack
      else{
        //if the available neighbor is an end cell, break
        if(description_map[visited[0]][visited[1]].isEndCell()){
          break;
        }
    
        stack.push(visited);
        last_visited = stack[stack.length-1];
      }
    }
  }
  
  //if stack is empty, there is not a path between start cell and end cell
  if(stack.length === 0){
    var err_msg = "Todos as casas foram verificadas e não foi encontrado um caminho entre a origem e o destino."; 
    //prints header on sheet
    updateHeader(method,"",size,err_msg,"");
    console.log(err_msg);
    displayAlert(err_msg);
    return;
  }
  
  //stringify the path
  var results = stack.map(function(point){
    var str = `(${point[0]},${point[1]})`;
    return str;
  });
  
  //inserts the end cell
  results.push(`(${end_cell[0]},${end_cell[1]})`);
  var length = results.length;
  results = "[" + results.join(",") + "]";
  
  //remove start cell
  stack.shift();
  
  //stops clock
  var end_clock = new Date();
  end_clock = end_clock.getTime();
  
  //compute information to print on the sheet header
  var total_duration = end_clock - begin_clock;
  
  //update symbols map to include path symbols
  var new_symbols_map = updateSymbolsMap(symbols_map,stack);
  
  //prints map on sheet
  printMap(new_symbols_map,height,width);
  
  //prints header on sheet
  updateHeader(method,total_duration,size,results,length);
  
  console.log(results);
}

/**
 * Evaluates cell's neighbors to find the next available cell based on a predefined order
 * @param {Array} current_cell - Address [row, column]
 * @param {Array} order - Order Array (example: ["right","down","left","up"]) 
 * @param {DescriptionNode[][]} description_map - Array of arrays of description nodes
 * @param {number} height
 * @param {number} width
 * @param {Array} end_cell - Address [row, column]
 * @returns {Array|null} Address [row,column]  
 */
function evaluateNeighborsDFS(current_cell,order,description_map,height,width,end_cell){
  var chose_neighbor = null;
  
  order.forEach(function(direction){
    if(chose_neighbor === null){
      switch(direction){
        case "up":
          var neighbor = [current_cell[0]-1,current_cell[1]];
          if(isValidCellToVisit(neighbor,description_map,height,width)){      
            description_map[neighbor[0]][neighbor[1]].visit();
            chose_neighbor = neighbor;
          }
          break;
        case "down":
          var neighbor = [current_cell[0]+1,current_cell[1]];
          if(isValidCellToVisit(neighbor,description_map,height,width)){      
            description_map[neighbor[0]][neighbor[1]].visit();
            chose_neighbor = neighbor;
          }
          break;
        case "left":
          var neighbor = [current_cell[0],current_cell[1]-1];
          if(isValidCellToVisit(neighbor,description_map,height,width)){      
            description_map[neighbor[0]][neighbor[1]].visit();
            chose_neighbor = neighbor;
          }
          break;
        case "right":
          var neighbor = [current_cell[0],current_cell[1]+1];
          if(isValidCellToVisit(neighbor,description_map,height,width)){      
            description_map[neighbor[0]][neighbor[1]].visit();
            chose_neighbor = neighbor;
          }
          break;
      }
    }
  });
  
  if(chose_neighbor === null){
    return null;
  }
  
  return chose_neighbor;
}
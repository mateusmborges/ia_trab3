/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/**
 * Calculates a path between a start cell and an end cell using Breadth First Search.
 */
function breadthFirstSearch() {
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
  var method = "Busca em Largura";
  
  //starts the clock
  var begin_clock = new Date();
  begin_clock = begin_clock.getTime();
  
  //queue that stores nodes
  var queue = [];
  
  //queue that stores all nodes, to backtrack and find path
  var all_nodes = [];
  var index = 0;
  var parent_index = 0;
  
  //creates a node for the start cell
  var start_node = new SearchNode(index,parent_index,start_cell,[-1,-1],0,0);
  queue.push(start_node);
  all_nodes.push(start_node);
  
  //grabs the last node on the queue
  var last_node = queue[queue.length-1];
  
  //defines the order of preference of the operators
  var order = ["down", "right", "up", "left"];
  
  //loop while queue is not empty
  while(last_node !== undefined){
    
    //visit all available neighbors
    var [end_node,new_index] = evaluateNeighborsBFS(last_node,order,description_map,height,width,end_cell,all_nodes,queue,index);
    
    //update the index
    index = new_index;
    
    //if end cell is reached
    if(end_node !== null){
      break;
    }
    
    //search next node
    last_node = queue.shift();
  }
  
  //if queue is empty, then there was no path between start cell and end cell
  if(queue.length === 0){
    var err_msg = "Todos as casas foram verificadas e não foi encontrado um caminho entre a origem e o destino.";
    //prints header on sheet
    updateHeader(method,"",size,err_msg,"");
    console.log(err_msg);
    displayAlert(err_msg);
    return;
  }
  
  //backtrack to get the best path
  var path_node = all_nodes[all_nodes.length-1];
  var path = [];
  
  while(path_node.index !== 0){
    path.push(path_node.address);
    path_node = all_nodes[path_node.parent_index];
  }
  
  path.reverse();
  
  //stringify the path
  var results = path.map(function(point){
    var str = `(${point[0]},${point[1]})`;
    return str;
  });
  
  //inserts the start cell
  results.unshift(`(${start_cell[0]},${start_cell[1]})`);
  var length = results.length;
  results = "[" + results.join(",") + "]";  
  
  path.reverse();
  
  //remove end cell
  path.shift();
  
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
 * Evaluates cell's neighbors to add all available cells to the queue, based on a predefined order
 * @param {SearchNode} last_node
 * @param {Array} order - Order Array (example: ["right","down","left","up"]) 
 * @param {DescriptionNode[][]} description_map - Array of arrays of description nodes
 * @param {number} height
 * @param {number} width
 * @param {Array} end_cell - Address [row, column]
 * @param {SearchNode[]} all_nodes
 * @param {SearchNode[]} queue
 * @param {number} index
 * @returns {Array|null} Array [DescriptionNode[],number]  
 */
function evaluateNeighborsBFS(last_node,order,description_map,height,width,end_cell,all_nodes,queue,index){
  var reached_end = null;
  var this_index = index;
  order.forEach(function(direction){
    if(reached_end === null){
      switch(direction){
        case "up":
          var visited = [last_node.address[0]-1,last_node.address[1]];
          if(isValidCellToVisit(visited,description_map,height,width)){
            this_index++;
            let new_node = new SearchNode(this_index,last_node.index,visited,last_node.address,0,0);
            if(description_map[visited[0]][visited[1]].isEndCell()){
              all_nodes.push(new_node);
              queue.push("Destination");
              reached_end = new_node;
              break;
            }
            description_map[visited[0]][visited[1]].visit();
            queue.push(new_node);
            all_nodes.push(new_node);
          }
          break;
        case "down":          
          var visited = [last_node.address[0]+1,last_node.address[1]];
          if(isValidCellToVisit(visited,description_map,height,width)){
            this_index++;
            let new_node = new SearchNode(this_index,last_node.index,visited,last_node.address,0,0);
            if(description_map[visited[0]][visited[1]].isEndCell()){
              all_nodes.push(new_node);
              queue.push("Destination");
              reached_end = new_node;
              break;
            }
            description_map[visited[0]][visited[1]].visit();
            queue.push(new_node);
            all_nodes.push(new_node);
           }
          break;
        case "left":
          var visited = [last_node.address[0],last_node.address[1]-1];
          if(isValidCellToVisit(visited,description_map,height,width)){
            this_index++;
            let new_node = new SearchNode(this_index,last_node.index,visited,last_node.address,0,0);
            if(description_map[visited[0]][visited[1]].isEndCell()){
              all_nodes.push(new_node);
              queue.push("Destination");
              reached_end = new_node;
              break;
            }
            description_map[visited[0]][visited[1]].visit();
            queue.push(new_node);
            all_nodes.push(new_node);
          }
          break;
        case "right":
          var visited = [last_node.address[0],last_node.address[1]+1];
          if(isValidCellToVisit(visited,description_map,height,width)){
            this_index++;
            let new_node = new SearchNode(this_index,last_node.index,visited,last_node.address,0,0);
            if(description_map[visited[0]][visited[1]].isEndCell()){
              all_nodes.push(new_node);
              queue.push("Destination");
              reached_end = new_node;
              break;
            }
            description_map[visited[0]][visited[1]].visit();
            queue.push(new_node);
            all_nodes.push(new_node);
          }
          break;
      }
    }
  });
  
  if(reached_end === null){
    return [null,this_index];
  }
  
  return [reached_end,this_index];
}
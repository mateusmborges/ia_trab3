/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/**
 * Saves the current map on a Google Drive folder.
 */
function saveMap() {
  //folder id from config file
  var folder_id = FOLDER_ID;
  
  //reads the sheet and get the symbols
  var symbols_map = readSheet();
  
  //updates path cells to passable cells
  var new_symbols_map = symbols_map.map(function(row){
    return row.map(function(cell){
      if(cell === INPUT_CONFIG.right_path_cell){
        return INPUT_CONFIG.passable_cell;
      }
      return cell;
    });
  });
  
  var height = new_symbols_map.length;
  var width = new_symbols_map[0].length;
  
  //joins all symbols in one string
  var flat_array = new_symbols_map.map(function(row){
    return row.join("")
  });
  
  //adds the height and width string as the first element on the array
  flat_array.unshift(`${height} ${width}`);
  
  //converts the array into a string
  var string = flat_array.join("\n");
  
  //get Google Drive folder by id
  var folder = DriveApp.getFolderById(folder_id);
  
  var now = new Date();  
  var iso_suffix = now.toISOString();
  
  //unique file name
  var file_name = "saved_map_" + iso_suffix;
  
  //blob to create file
  var blob = Utilities.newBlob(string, "text/plain", file_name);
  
  //create file on Google Drive folder
  folder.createFile(blob);
  
  displayAlert("Mapa salvo no Drive!");
  
  console.log("Map saved on drive folder " + FOLDER_ID);
}

/**
 * Saves the results on a Google Drive folder.
 */
function saveResults(txt) {
  //folder id from config file
  var folder_id = FOLDER_ID;
  
  //get Google Drive folder by id
  var folder = DriveApp.getFolderById(folder_id);
  
  var now = new Date();  
  var iso_suffix = now.toISOString();
  
  //unique file name
  var file_name = "results_" + iso_suffix;
  
  //blob to create file
  var blob = Utilities.newBlob(txt, "text/plain", file_name);
  
  //create file on Google Drive folder
  folder.createFile(blob);
  
  console.log("Map saved on drive folder " + FOLDER_ID);
}

function getFileFromDrive(file_name){
  //folder id from config file
  var folder_id = FOLDER_ID;
  
  //get Google Drive folder by id
  var folder = DriveApp.getFolderById(folder_id);
  
  //search for files
  var files = folder.getFilesByName(file_name);
  
  //if it finds the file(s), gets the first one and returns a string
  if(files.hasNext()){
    var file = files.next();
    return file.getBlob().getDataAsString();
  }
  
  return "";
}
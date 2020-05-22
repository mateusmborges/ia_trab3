/*
*  Authors
*  Mateus M. Borges
*  Humberto G. Y. Tello
*  Vinicius G. Carvalho
*/

/** 
 * Apps Script Trigger. Add menu when spreadsheet is opened.
 */
function onOpen(e) {
  var spsh = SpreadsheetApp.getActive();
  
  var menu = [
    {name: "Inserir Entrada", functionName: "getInput"},
    {name: "Busca em Profundidade", functionName: "depthFirstSearch"},
    {name: "Busca em Largura", functionName: "breadthFirstSearch"},
    {name: "Busca Best-First", functionName: "bestFirstSearch"},
    {name: "Busca A*", functionName: "aStarSearch"},
    {name: "Busca Hill Climbing", functionName: "hillClimbingSearch"},
    {name: "Calcular Heurística", functionName: "evaluateAllCells"},
    {name: "Limpar Mapa", functionName: "cleanYellowCells"},
    {name: "Resetar Mapa", functionName: "resetMap"},
    {name: "Gerar novo mapa aleatório", functionName: "generateRandomMap"},
    {name: "Salvar Mapa no Drive", functionName: "saveMap"}
  ];
  
  spsh.addMenu("Scripts", menu);
}

/**
 * Displays an alert window.
 * @param {string} text - The text to display
 */
function displayAlert(text){
  var ui = UI;
  ui.alert(text);
}

/**
 * Reads an input from prompted window, then decodes it.
 */
function getInput() {
  var ui = UI;
  
  var prompt_text = "Insira aqui a string de entrada.";
  var prompt_dialog = ui.prompt(prompt_text);
  
  if(prompt_dialog.getSelectedButton() == "OK"){
    var answer = prompt_dialog.getResponseText();
    
    //checks if it is a saved file on Google Drive
    if(/saved_map_/.exec(answer) || /example_map/.exec(answer)){
      answer = getFileFromDrive(answer);
    }
    decodeMap(answer);
  }
}
function initGame(){
	currentLines = 0;
	isGameOver = false;
	
	if(gameData == undefined){ 
		gameData = new Array();
		
		// If there are no game data, add 0s 
		for(var r = 0; r < rows; r++){
			gameData[r] = new Array();
			for(var c = 0; c < column; c++){
				gameData[r].push(0);
			}
		}
	}
	else {
		// If there are game data, clear everything by setting all to 0
		for(var r = 0; r < rows; r++){
			for(var c = 0; c < column; c++){
				gameData[r][c] = 0;
			}
		}
	}
	
	currentPiece = getRandomPiece();	// Get a random tetris piece
	
	lineSpan.innerHTML = currentLines.toString();	// Get a string value of lines cleared to display on screen
	
	// Animation 
	var requestAnimation = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimation;
	requestAnimationFrame(update);
}

function update(){
	// Get the current game time
	currentTime = new Date().getTime();
	
	if(currentTime - prevTime > 500){
		// Update the game piece
		if(checkMove(currentPiece.gridX, currentPiece.gridY + 1, currentPiece.currentState)){
			currentPiece.gridY++;
		}
		else{
			copyData(currentPiece);
			currentPiece = getRandomPiece();
		}
		
		// Update time 
		prevTime = currentTime;
	}
	
	// Draw + update the game board
	context.clearRect(0, 0, 320, 640);
	drawBoard();
	drawPiece(currentPiece);
	
	if(!isGameOver){
		requestAnimationFrame(update);
	}
	else{
		context.drawImage(gameOverImage, 0, 0, 320, 640, 0, 0, 320, 640);	// (img, x, y, pxwidth, pxheight, placementx, placementy, width, height)
	}
}

function copyData(p){
	var Xposition = p.gridX, Yposition = p.gridY, state = p.currentState;
	
	// Loop through the state of the piece and store its position
	for(var r = 0, len = p.states[state].length; r < len; r++){
		for(var c = 0, len2 = p.states[state][r].length; c < len2; c++){
			if(p.states[state][r][c] == 1 && Yposition >= 0){		
				gameData[Yposition][Xposition] = p.color + 1;
			}
			Xposition++;	// Increment X by 1
		}
		Xposition = p.gridX;	// Reset X
		Yposition++;			// Increment Y by 1
	}
	checkLines();
	
	// Ends the game if the piece exceeds the top
	if(p.gridY < 0){
		isGameOver = true;
	}
}

// Checks if a row is full
function checkLines(){
	var fullRow = true, lineFound = false;
	var r = rows - 1, c = column - 1;
	
	while (r >= 0){
		while (c >= 0){
			
			// If there's a blank, the row is not full
			if (gameData[r][c] == 0){
				fullRow = false;
				break;
			}
			
			c--; // Otherwise loop through the entire row
		}
		
		// If the row is full, call the shiftDown function 
		if(fullRow == true){
			shiftDown(r);
			lineFound = true;
			
			// Check the row again since the old one got cleared 
			r++;
			currentLines++;
		}
		
		// Reset fullRow + c variable and move onto the next row
		fullRow = true;
		c = column - 1; 
		r--;
	}
	
	// Update the lines cleared if one is cleared
	if (lineFound){
		lineSpan.innerHTML = currentLines.toString();
	}
}

function shiftDown (RowNum){
	var r = RowNum, c = 0;
	
	// Moves everything down when a line is cleared 
	while (r >= 0){
		while (c < column){
			if (r > 0)
				gameData[r][c] = gameData[r-1][c];
			else
				gameData[r][c] = 0;
				
			c++;
		}
		
		c = 0;
		r--;
	}
}

// Checks whether a move is valid 
function checkMove (posX, posY, newState){
	var result = true;
	var newx = posX, newy = posY;
	
	// Loop through the rows and columns of the board 
	for (var r = 0, len = currentPiece.states[newState].length; r < len; r++){
		for (var c = 0, len2 = currentPiece.states[newState][r].length; c < len2;c++){
		
			// Checks if the new position is within the board 
			if (newx < 0 || newx >= column){
				result = false;
				c = len2; 
				r = len;
			}
			
			// Checks if there is already a piece in the new position
			if (gameData[newy] != undefined && gameData[newy][newx] != 0 && currentPiece.states[newState][r] != undefined && currentPiece.states[newState][r][c] != 0){
				result = false;
				c = len2;
				r = len;
			}
			
			newx++;
		}
		
		newx = posX;
		newy++;
		
		// Makes sure that the piece does not fell below the board 
		if(newy > rows){
			r = len;
			result = false;
		}
	}
	
	return result;
}
;(function(){
    const Dices = (function(){
        const dices = document.getElementsByClassName('dice');

        let diceScore = [1,1];
       
        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;
        
        const setDiceScore = () =>{
            dices[0].innerText = diceScore[1];
            dices[1].innerText = diceScore[0];
        }
        const getDiceScore = () => diceScore;

        const zeroizeDiceScore = () =>{
            diceScore = [null,null];
            setDiceScore();
        }
        const throwDices = () =>{
            diceScore = [getRandomInt(1,7),getRandomInt(1,7)];
            setDiceScore();
        }
        return {
            zeroizeDiceScore:zeroizeDiceScore,
            throwDices:throwDices,
            getDiceScore:getDiceScore,
        }
    })();
    const TurnController = (function(){
        const ui_turn = document.getElementById('ui_turn');
        let playerTurn = true;

        const getColorCurrentPlayer = () => (playerTurn)?'player1':'player2';
        
        const handlePlayerTurn = () =>{
            playerTurn = !playerTurn;
            ui_turn.className = getColorCurrentPlayer();
        }

        return{
            handlePlayerTurn:handlePlayerTurn,
            getColorCurrentPlayer:getColorCurrentPlayer
        }
    })();
    const Field = (function() {
        let rows = document.getElementsByClassName('row');
        const grid = document.getElementById('game_grid');
        
        const checkFieldSize = (points,diceScore) =>{
            let minX = Math.abs(points.first.x),
                minY = Math.abs(points.first.y),
                maxX = Math.abs(points.second.x),
                maxY = Math.abs(points.second.y);

            if(minX > maxX){
                minX = points.second.x;
                maxX = points.first.x;
            }
            if(minY > maxY){
                minY = points.second.y;
                maxY = points.first.y;
            }
            if(!((maxY - minY + 1) == diceScore[0])) return false
            if(!((maxX - minX + 1) == diceScore[1])) return false
            return true;
        }



        const createRow = function() {
            const row = document.createElement('div');
            row.classList.add('row');
            grid.appendChild(row);
            rows = document.getElementsByClassName('row');
        }
        const createCell = function(x,y) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            rows[rows.length-1].appendChild(cell);
        }
        const renderField = (width,height) => {
            root.appendChild(grid);
            for(let i = 0;i < height;i++){
            createRow();
                for(let j = 0;j < width;j++){
                    createCell(j,i);
                }
            }
        }
        const deColorCells = (points) =>{
            rows[points.first.y].childNodes[points.first.x].className = 'cell';
            rows[points.second.y].childNodes[points.second.x].className = 'cell';
        }
        const fillCells = (points,cellColorClass,diceScore) => {
            
            let sX = parseInt(points.second.x),
                sY = parseInt(points.second.y),
                fY = parseInt(points.first.y),
                fX = parseInt(points.first.x)

            let MaxX = sX,MinX = fX,
                MaxY = sY,MinY = fY;
            
            if(MaxX < MinX){
                MaxX = fX;
                MinX = sX;
            }
            if(MaxY < MinY){
                MaxY = fY;
                MinY = sY;
            }
            if(!checkFieldSize(points,diceScore)){
                deColorCells(points);
                return false;
            }

            for(let i = MinY;i <= MaxY;i++){
                for(let j = MinX;j <= MaxX;j++){
                    const item = rows[i].childNodes[j];
                    if(item.classList.contains('player1') || item.classList.contains('player2')){
                        deColorCells(points);
                        return false;
                    };
                }
            }

            
            for(let i = MinY;i <= MaxY;i++){
                for(let j = MinX;j <= MaxX;j++){
                    rows[i].childNodes[j].className = 'cell ' + cellColorClass;
                }
            }
            return true;
        }
        return{
            renderField:renderField,
            fillCells:fillCells,
            checkFieldSize:checkFieldSize
        }
    })();
    const Points = (function() {
        let points;

        const zeroizePoints = () => { points = { first:{x:null,y:null},second:{x:null,y:null} }}

        const setPoints = (e,num) => { points[num] = {x:e.target.dataset.x,y:e.target.dataset.y};}

        const getPoints = () =>{ return points; }

        return{
            getPoints:getPoints,
            zeroizePoints:zeroizePoints,
            setPoints:setPoints
        }
    })();
    const Game = (function(){
        const root = document.getElementById('root');
        const throwBtn = document.getElementById('throwBtn');
        const grid = document.getElementById('game_grid');
        const setPoints = Points.setPoints;

        //две единицы на кубиках
        const twoUnitsInCube = (e,playerColor) =>{
                e.target.className = 'cell ' + playerColor;
                Points.zeroizePoints();
                TurnController.handlePlayerTurn();
                Dices.zeroizeDiceScore();
        }
        const selectFieldForFill = (e) => {
            const points = Points.getPoints(),
                  diceScore = Dices.getDiceScore(),
                  playerColor = TurnController.getColorCurrentPlayer();
                  checkEndGame();
            if(diceScore.length > 0){
                if(e.target.className === 'cell'){
                    e.target.classList.add('click');

                    if((diceScore[0] + diceScore[1]) === 2){
                        twoUnitsInCube(e,playerColor);
                        return false;
                    }
                    
                    if(points.first.x === null){
                        setPoints(e,'first');
                    }else{
                        setPoints(e,'second');
                        Field.checkFieldSize(points,diceScore);
                        if(Field.fillCells(points,playerColor,diceScore)){
                            TurnController.handlePlayerTurn();
                            Dices.zeroizeDiceScore();
                        }
                        Points.zeroizePoints();
                    }
                }
            }
        }

        const checkEndGame = () =>{
            let counterFreeCell = 0;
            for(let i = 0;i < grid.children.length;i++){
                for(let j = 0;j < grid.children.length;j++){
                    if(!(grid.children[i].children[j].classList.contains('player1') || grid.children[i].children[j].classList.contains('player1'))){
                        counterFreeCell++
                    }else{
                        counterFreeCell = 0;
                    }
                }
            }
        }
        const eventsInit = () =>{
            throwBtn.addEventListener('click',Dices.throwDices)
            root.addEventListener('click',selectFieldForFill);
        }
        const init = function() {
            eventsInit();
            Field.renderField(20,20);
            Points.zeroizePoints();
        }
        return {
            start:init
        }
    })();
    Game.start();
})();

var c = document.getElementById("myArkanoid");
var ctx = c.getContext("2d");

// Variables de la pelota
var radius = 10;
var puntoX = c.width / 2;
var puntoY = c.height - 30;
var dx = 3;
var dy = -3;

// Variables de la paleta
var paddlex = c.width / 2;
var paddley = c.height - 20;
var paddleW = 80;
var paddleH = 15;

// Controles
var rightMove = false;
var leftMove = false;

// Bloques mejorados con colores
var brickRows = 5;
var brickColumns = 8;
var brickWidth = 60;
var brickHeight = 20;
var brickPadding = 8;
var brickOfSetTop = 50;
var brickOfSetLeft = 35;

// Colores para los bloques (gradientes)
var brickColors = [
    { color1: '#FF6B6B', color2: '#FF5252', points: 50 },  // Rojo
    { color1: '#4ECDC4', color2: '#44A08D', points: 40 },  // Verde azulado
    { color1: '#FFE66D', color2: '#FFBB33', points: 30 },  // Amarillo
    { color1: '#A8E6CF', color2: '#7FD8BE', points: 20 },  // Verde menta
    { color1: '#95E1D3', color2: '#66D9EF', points: 10 }   // Azul claro
];

var bricks = [];
for(let i = 0; i < brickColumns; i++){
    bricks[i] = []; 
    for(let j = 0; j < brickRows; j++){
        bricks[i][j] = {
            x: 0, 
            y: 0, 
            drawBrick: true,
            colorIndex: j % brickColors.length
        };
    }
}

// Sistema de partículas
var particles = [];

function createParticles(x, y, color) {
    for(let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1,
            color: color
        });
    }
}

function updateParticles() {
    for(let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravedad
        p.life -= 0.02;
        
        if(p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

var score = 0;
var lives = 3;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e){
    if(e.keyCode == 37){
        leftMove = true;
    } else if (e.keyCode == 39) {
        rightMove = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 37) {
        leftMove = false;
    } else if (e.keyCode == 39) {
        rightMove = false;
    }
}

function mouseMoveHandler(e) {
    var mouseRelativeX = e.clientX - c.offsetLeft;
    if (mouseRelativeX > 0 && mouseRelativeX < c.width) {
        paddlex = mouseRelativeX - paddleW / 2;
    }
}

// Dibujar pelota con efecto brillante
function drawBall() {
    // Sombra exterior
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d4ff';
    
    // Gradiente radial para la pelota
    var gradient = ctx.createRadialGradient(
        puntoX - 3, puntoY - 3, 0,
        puntoX, puntoY, radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#00d4ff');
    gradient.addColorStop(1, '#0088cc');
    
    ctx.beginPath();
    ctx.arc(puntoX, puntoY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
    
    ctx.shadowBlur = 0;
}

// Dibujar paleta con gradiente
function drawPaddle() {
    // Sombra
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff3300';
    
    // Gradiente
    var gradient = ctx.createLinearGradient(paddlex, paddley, paddlex, paddley + paddleH);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ff3300');
    
    ctx.beginPath();
    ctx.roundRect(paddlex, paddley, paddleW, paddleH, 5);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
    
    ctx.shadowBlur = 0;
}

// Soporte para roundRect si no existe
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        this.beginPath();
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
        return this;
    };
}

// Dibujar bloques con gradientes
function drawBricks() {
    for (let i = 0; i < brickColumns; i++) {
        for (let j = 0; j < brickRows; j++) {
            if (bricks[i][j].drawBrick) {
                var bx = (i * (brickWidth + brickPadding)) + brickOfSetLeft;
                var by = (j * (brickHeight + brickPadding)) + brickOfSetTop;
                bricks[i][j].x = bx;
                bricks[i][j].y = by;

                var colorSet = brickColors[bricks[i][j].colorIndex];
                
                // Gradiente para el bloque
                var gradient = ctx.createLinearGradient(bx, by, bx, by + brickHeight);
                gradient.addColorStop(0, colorSet.color1);
                gradient.addColorStop(1, colorSet.color2);
                
                ctx.shadowBlur = 5;
                ctx.shadowColor = colorSet.color2;
                
                ctx.beginPath();
                ctx.roundRect(bx, by, brickWidth, brickHeight, 5);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Borde brillante
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
                
                ctx.shadowBlur = 0;
            }
        }
    }
}

function detectHits() {
    for (let i = 0; i < brickColumns; i++) {
        for (let j = 0; j < brickRows; j++) {
            if (bricks[i][j].drawBrick) {
                if (
                    puntoX > bricks[i][j].x &&
                    puntoX < bricks[i][j].x + brickWidth &&
                    puntoY > bricks[i][j].y &&
                    puntoY < bricks[i][j].y + brickHeight
                ) {
                    dy = -dy;
                    bricks[i][j].drawBrick = false;
                    
                    // Crear partículas
                    var colorSet = brickColors[bricks[i][j].colorIndex];
                    createParticles(
                        bricks[i][j].x + brickWidth / 2,
                        bricks[i][j].y + brickHeight / 2,
                        colorSet.color1
                    );
                    
                    // Añadir puntos según el color
                    score += colorSet.points;
                    
                    // Verificar victoria
                    if (score >= getTotalPoints()) {
                        victory();
                    }
                }
            }
        }
    }
}

function getTotalPoints() {
    let total = 0;
    for(let i = 0; i < brickColumns; i++) {
        for(let j = 0; j < brickRows; j++) {
            total += brickColors[j % brickColors.length].points;
        }
    }
    return total;
}

// Dibujar score mejorado
function drawScore() {
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#00d4ff";
    ctx.fillText("Score: " + score, 15, 30);
    ctx.shadowBlur = 0;
}

// Dibujar vidas mejorado
function drawLives() {
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#ff3300";
    
    // Dibujar corazones en lugar de texto
    for(let i = 0; i < lives; i++) {
        ctx.fillText("❤️", c.width - 100 + (i * 30), 30);
    }
    ctx.shadowBlur = 0;
}

function gameOver() {
    document.getElementById("myArkanoidGameOver").style.display = "block";
}

function victory() {
    document.getElementById("finalScore").textContent = "Score: " + score;
    document.getElementById("victoryScreen").style.display = "flex";
}

function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    
    drawBall();
    drawPaddle();
    drawBricks();
    drawScore();
    drawLives();
    detectHits();
    updateParticles();
    drawParticles();

    // Rebote en paredes
    if (puntoX + dx > c.width - radius || puntoX + dx < radius) {
        dx = -dx;
    }

    // Rebote en techo
    if (puntoY + dy < radius) {
        dy = -dy;
    } else {
        // Detectar si la pelota toca el fondo
        if (puntoY + dy > c.height - radius) {
            // Verificar si toca la paleta
            if (puntoX > paddlex && puntoX < paddlex + paddleW) {
                dy = -dy;
                
                // Cambiar ángulo según donde golpee en la paleta
                var hitPos = (puntoX - paddlex) / paddleW;
                dx = (hitPos - 0.5) * 8;
            } else {
                lives--;
                if (!lives) {
                    gameOver();
                    return;
                } else {
                    // Reset
                    puntoX = c.width / 2;
                    puntoY = c.height - 30;
                    dx = 3;
                    dy = -3;
                    paddlex = c.width / 2;
                }
            }
        }
    }

    // Movimiento de la paleta
    if (leftMove && paddlex > 0) {
        paddlex -= 7;
    }

    if (rightMove && paddlex < c.width - paddleW) {
        paddlex += 7;
    }

    puntoX += dx;
    puntoY += dy;

    requestAnimationFrame(draw);
}

// Eventos de reinicio
document.getElementById("myArkanoidGameOver").addEventListener("click", function(){
    document.location.reload();
});

document.getElementById("victoryScreen").addEventListener("click", function(){
    document.location.reload();
});

// Iniciar el juego
draw();
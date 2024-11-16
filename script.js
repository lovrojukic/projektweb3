const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//Dimenzija Canvasa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Postavljene potrebne varijable
let paddleWidth = 150;
let paddleHeight = 20;
let paddleX = (canvas.width - paddleWidth) / 2;

let ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 3 * (Math.random() < 0.5 ? -1 : 1); //Nasumčni smjer loptice
let ballSpeedY = -3;

let rightPressed = false;
let leftPressed = false;

const brickRowCount = 5;
const brickColumnCount = 10; //Broj cigli
const brickPadding = 5; //razmak izmedu cigli
const brickWidth = (canvas.width - brickPadding * (brickColumnCount - 1)) / brickColumnCount;
const brickHeight = 30; //Visina cigle
const brickOffsetTop = 30; // Udaljenost od vrha ekrana

let bricks = [];  //Dodavanje cigli po cijelom ekranu do 5 redaka cigli
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}
//Varijable za praćenje rezultata
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let isGameOver = false;

// Funkcija za resetiranje igre kada igra završi
function resetGame() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballSpeedX = 3 * (Math.random() < 0.5 ? -1 : 1);
    ballSpeedY = -3;

    paddleX = (canvas.width - paddleWidth) / 2;

    // Resetiranje cigli
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    score = 0;
    isGameOver = false;
    draw();
}

//Ispis završne poruke
function drawGameOver(message) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "20px Arial";
    ctx.fillText("Pritisnite ENTER za novu igru", canvas.width / 2, canvas.height / 2 + 30);

    isGameOver = true;
}

//Ispis teksta
function drawText(text, x, y, font = "20px Arial", color = "white") {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

//Crtanje palice
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "red";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "black";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0; // Resetirati sjenčanje
}

//Crtanje loptice
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

//Crtanje cigli
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding);
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "orange";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "black";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

//Detekciju sudara
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ballX > brick.x &&
                    ballX < brick.x + brickWidth &&
                    ballY > brick.y &&
                    ballY < brick.y + brickHeight
                ) {
                    ballSpeedY = -ballSpeedY;
                    brick.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        drawGameOver("Congratulations!");
                    }
                }
            }
        }
    }
}

//Iscrtavanje svih elemenata
function draw() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawText(`Score: ${score}`, canvas.width - 150, 20);
    drawText(`HighScore: ${highScore}`, canvas.width - 150, 50);

    collisionDetection();

    //Sudar loptice sa zidovima
    if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY + ballSpeedY < ballRadius) {
        ballSpeedY = -ballSpeedY;
    } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballSpeedY = -ballSpeedY;
        } else {
            if (score > highScore) {
                localStorage.setItem("highScore", score);
                highScore = score;
            }
            drawGameOver("GAME OVER");
        }
    }

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    requestAnimationFrame(draw);
}

//Kretanje palice
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === "Enter" && isGameOver) {
        resetGame(); //Ponovno pokretanje igre pritiskom na Enter
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
});

//Pokretanje igre
draw();

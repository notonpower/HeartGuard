const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameWidth, gameHeight;

function resizeGame() {
    const aspectRatio = 4 / 3;
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.8;

    if (maxWidth / aspectRatio > maxHeight) {
        gameHeight = maxHeight;
        gameWidth = gameHeight * aspectRatio;
    } else {
        gameWidth = maxWidth;
        gameHeight = gameWidth / aspectRatio;
    }

    canvas.width = gameWidth;
    canvas.height = gameHeight;

    // UI要素の位置を更新
    updateUILayout();
}
let uiLayout = 'horizontal';

function updateUILayout() {
    if (window.innerWidth > window.innerHeight) {
        uiLayout = 'horizontal';
    } else {
        uiLayout = 'vertical';
    }
}

function drawUI() {
    ctx.save();
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, gameWidth, 50);

    if (uiLayout === 'horizontal') {
        drawPixelText(`TIME: ${formatTime(elapsedTime)}`, 10, 15, 20, '#ffffff', ctx);
        drawLifeBar(gameWidth / 2 - 100, 15, 200, 20);
        drawPixelText(`SCORE: ${score}`, gameWidth - 150, 15, 20, '#ffffff', ctx);
    } else {
        drawPixelText(`TIME: ${formatTime(elapsedTime)}`, 10, 15, 20, '#ffffff', ctx);
        drawLifeBar(10, 40, gameWidth - 20, 20);
        drawPixelText(`SCORE: ${score}`, 10, 65, 20, '#ffffff', ctx);
    }

    ctx.restore();
}

window.addEventListener('resize', resizeGame);

let score = 0;
let elapsedTime = 0;
let enemies = [];
let particles = [];
let gameActive = false;
let heartLife = 100;
let difficulty = 1;

const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

function drawPixelText(text, x, y, size, color, context) {
    if (text === undefined || text === null) {
        console.warn('Undefined or null text passed to drawPixelText');
        return;
    }
    text = text.toString(); // 数値を文字列に変換

    const characters = {
        '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
        '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
        '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
        '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
        '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
        '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
        '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
        '7': [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]],
        '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
        '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
        ':': [[0],[1],[0],[1],[0]],
        'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
        'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
        'C': [[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
        'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
        'E': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
        'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
        'G': [[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
        'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
        'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
        'J': [[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,0]],
        'K': [[1,0,1],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
        'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
        'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
        'N': [[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
        'O': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
        'P': [[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
        'Q': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,1]],
        'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
        'S': [[0,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0]],
        'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
        'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
        'V': [[1,0,1],[1,0,1],[1,0,1],[0,1,0],[0,1,0]],
        'W': [[1,0,1],[1,0,1],[1,0,1],[1,1,1],[0,1,0]],
        'X': [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
        'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
        'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
        ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
    };

    context.fillStyle = color;
    const pixelSize = size / 5;

    for (let i = 0; i < text.length; i++) {
        const char = characters[text[i].toUpperCase()];
        if (!char) {
            console.warn(`Unknown character: ${text[i]}`);
            continue;
        }
        for (let row = 0; row < char.length; row++) {
            for (let col = 0; col < char[row].length; col++) {
                if (char[row][col]) {
                    context.fillRect(x + (i * 4 + col) * pixelSize, y + row * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }
}

function updateEnemies(deltaTime) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy) {
            console.warn('Undefined enemy found, removing...');
            enemies.splice(i, 1);
            continue;
        }
        const dx = canvas.width / 2 - enemy.x;
        const dy = canvas.height / 2 - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        enemy.x += (dx / distance) * enemy.speedX * deltaTime * 60;
        enemy.y += (dy / distance) * enemy.speedY * deltaTime * 60;
        drawEnemy(enemy);

        if (distance < 32) {
            enemies.splice(i, 1);
            heartLife -= 10;
            lifeBarShake = 1;
            if (heartLife <= 0) {
                gameActive = false;
                showResult();
            }
        }
    }
}

function drawPixelHeart(x, y, size) {
    const heartPixels = [
        [0,0,1,1,1,0,0,0,1,1,1,0,0],
        [0,1,1,1,1,1,0,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,0,0,0,0]
    ];

    const pixelSize = Math.floor(size / heartPixels[0].length);
    ctx.fillStyle = '#ff0000'; 

    for (let i = 0; i < heartPixels.length; i++) {
        for (let j = 0; j < heartPixels[i].length; j++) {
            if (heartPixels[i][j] === 1) {
                ctx.fillRect(x + j * pixelSize, y + i * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}



function createEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.max(canvas.width, canvas.height) / 2;
    return {
        x: canvas.width / 2 + Math.cos(angle) * distance,
        y: canvas.height / 2 + Math.sin(angle) * distance,
        size: 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() * 1 - 0.5) * difficulty, // 速度を遅くした
        speedY: (Math.random() * 1 - 0.5) * difficulty  // 速度を遅くした
    };
}

function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
}

function createParticle(x, y, color) {
    return {
        x: x,
        y: y,
        size: 4,
        color: color,
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 8,
        life: 30
    };
}

function drawParticle(particle) {
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.speedX * deltaTime * 60;
        particle.y += particle.speedY * deltaTime * 60;
        particle.life -= deltaTime * 60;

        if (particle.life <= 0) {
            particles.splice(i, 1);
        } else {
            drawParticle(particle);
        }
    }
}

let lifeBarShake = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

// ライフバーの描画関数を修正
function drawLifeBar() {
    const barWidth = 200;
    const barHeight = 20;
    const x = (canvas.width - barWidth) / 2;
    const y = canvas.height - 30;

    const shakeX = Math.sin(lifeBarShake * Math.PI * 2) * 5;
    lifeBarShake = Math.max(0, lifeBarShake - 0.1);

    ctx.fillStyle = '#333';
    ctx.fillRect(x + shakeX, y, barWidth, barHeight);

    let barColor;
    if (heartLife > 66) {
        barColor = '#00ff00'; // 緑
    } else if (heartLife > 33) {
        barColor = '#ffff00'; // 黄色
    } else {
        barColor = '#ff0000'; // 赤
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(x + shakeX, y, barWidth * (heartLife / 100), barHeight);

    ctx.strokeStyle = lifeBarShake > 0 ? '#ff0000' : '#fff';
    ctx.lineWidth = lifeBarShake > 0 ? 3 : 1;
    ctx.strokeRect(x + shakeX, y, barWidth, barHeight);
}

let lastTime;
let gameLoopId;

function gameLoop(currentTime) {
    try {
        if (!gameActive) return;

        if (lastTime === undefined) {
            lastTime = currentTime;
        }

        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawPixelHeart(canvas.width / 2 - 32, canvas.height / 2 - 32, 64);

        elapsedTime += deltaTime;
        difficulty = 1 + elapsedTime / 60;

        if (Math.random() < 0.02 * difficulty) {
            enemies.push(createEnemy());
        }

        updateEnemies(deltaTime);
        updateParticles(deltaTime);
        updateScoreEffects(deltaTime);

        drawPixelText(formatTime(elapsedTime), canvas.width / 2 - 50, 10, 20, '#ffffff', ctx);
        drawPixelText(`SCORE:${score}`, canvas.width - 150, 10, 20, '#ffffff', ctx);
        drawLifeBar();

        gameLoopId = requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Error in gameLoop:', error);
        gameActive = false;
    }
}


const titleCanvas = document.getElementById('titleCanvas');
const titleCtx = titleCanvas.getContext('2d');
titleCanvas.width = 800;
titleCanvas.height = 600;

function drawTitle() {
    titleCtx.clearRect(0, 0, titleCanvas.width, titleCanvas.height);
    drawPixelText('HEART GUARD', 200, 200, 40, '#ffffff', titleCtx);
    drawPixelText('CLICK TO START', 250, 300, 20, '#ffffff', titleCtx);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function resetGame() {
    score = 0;
    elapsedTime = 0;
    enemies = [];
    particles = [];
    heartLife = 100;
    difficulty = 1;
}

window.addEventListener('load', () => {
    drawTitle();
});

let scoreEffects = [];
function createScoreEffect(x, y, score) {
    scoreEffects.push({
        x: x,
        y: y,
        score: score,
        life: 60,
        opacity: 1
    });
}

function updateScoreEffects(deltaTime) {
    for (let i = scoreEffects.length - 1; i >= 0; i--) {
        const effect = scoreEffects[i];
        effect.y -= 1;
        effect.life -= deltaTime * 60;
        effect.opacity = effect.life / 60;

        if (effect.life <= 0) {
            scoreEffects.splice(i, 1);
        } else {
            ctx.globalAlpha = effect.opacity;
            if (effect.score !== undefined && effect.score !== null) {
                drawPixelText(`+${effect.score}`, effect.x, effect.y, 15, '#ffffff', ctx);
            }
            ctx.globalAlpha = 1;
        }
    }
}

let bullets = [];

function createBullet(x, y) {
    return {
        x: gameWidth / 2,
        y: gameHeight / 2,
        targetX: x,
        targetY: y,
        speed: 10,
        size: 5
    };
}

function updateBullets(deltaTime) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        const dx = bullet.targetX - bullet.x;
        const dy = bullet.targetY - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bullet.speed) {
            bullets.splice(i, 1);
            continue;
        }

        bullet.x += (dx / distance) * bullet.speed;
        bullet.y += (dy / distance) * bullet.speed;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();

        // 敵との衝突判定
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const edx = enemy.x - bullet.x;
            const edy = enemy.y - bullet.y;
            const enemyDistance = Math.sqrt(edx * edx + edy * edy);

            if (enemyDistance < enemy.size + bullet.size) {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                createScoreEffect(enemy.x, enemy.y, 10);
                for (let k = 0; k < 20; k++) {
                    particles.push(createParticle(enemy.x, enemy.y, enemy.color));
                }
                break;
            }
        }
    }
}

canvas.addEventListener('click', (event) => {
    if (!gameActive) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    bullets.push(createBullet(x, y));
});

function showResult() {
    gameActive = false;
    document.getElementById('gameCanvas').style.display = 'none';
    const resultScreen = document.getElementById('result-screen');
    resultScreen.style.display = 'flex';

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = 600;
    resultCanvas.height = 400;
    const resultCtx = resultCanvas.getContext('2d');

    resultCtx.fillStyle = '#000';
    resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

    const centerX = resultCanvas.width / 2;
    drawPixelText('GAME OVER', centerX - 100, 50, 30, '#ffffff', resultCtx);
    drawPixelText(`SCORE: ${score}`, centerX - 70, 150, 20, '#ffffff', resultCtx);
    drawPixelText(`TIME: ${formatTime(elapsedTime)}`, centerX - 70, 200, 20, '#ffffff', resultCtx);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        drawPixelText('NEW HIGH SCORE!', centerX - 100, 250, 20, '#ffff00', resultCtx);
    }
    drawPixelText(`HIGH SCORE: ${highScore}`, centerX - 90, 300, 20, '#ffffff', resultCtx);
    drawPixelText('PLAY AGAIN', centerX - 80, 350, 20, '#ffffff', resultCtx);

    resultScreen.innerHTML = '';
    resultScreen.appendChild(resultCanvas);

    // Add click event listener to the result canvas
    resultCanvas.addEventListener('click', handleResultClick);
}

function handleResultClick(event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // "PLAY AGAIN" テキストの位置とサイズ
    const playAgainX = event.target.width / 2 - 80;
    const playAgainY = 350;
    const playAgainWidth = 160;
    const playAgainHeight = 20;

    if (x >= playAgainX && x <= playAgainX + playAgainWidth &&
        y >= playAgainY && y <= playAgainY + playAgainHeight) {
        startGame();
    }
}


function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    resetGame();
    gameActive = true;
    lastTime = undefined;
    cancelAnimationFrame(gameLoopId);  // 既存のゲームループをキャンセル
    gameLoopId = requestAnimationFrame(gameLoop);
    
    canvas.style.cursor = 'crosshair';
}

titleCanvas.addEventListener('click', startGame);

resetGame();
drawTitle();
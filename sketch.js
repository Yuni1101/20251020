// 定義我們將使用的顏色調色盤

const colors = [

    '#590d22', // 深紅

    '#800f2f', // 深紅

    '#a4133c', // 紅

    '#c9184a', // 亮紅

    '#ff4d6d', // 玫瑰紅

    '#ff758f', // 淺紅

    '#ff8fa3', // 粉紅

    '#ffb3c1'  // 淺粉

];



// 儲存所有圓形物件的陣列

let circles = [];

// 儲存所有爆破物件的陣列

let explosions = [];



// 定義圓形的數量

const NUM_CIRCLES = 50;



// *** 新增：音效變數 ***

let popSound; 

// *** 新增：分數變數 ***
let score = 0;



// P5.js 的 preload 函式：在 setup 之前載入媒體檔案

function preload() {

    // *** 載入音效檔案，假設檔案名為 'pop.mp3' ***

    // 請確保你的專案目錄中有這個檔案，或使用完整的 URL

    // 如果載入失敗，程式會報錯

    popSound = loadSound('assets/pop.mp3'); 

}



// P5.js 的 setup 函式

function setup() {

    createCanvas(windowWidth, windowHeight);

    background('#fff0f3');

    noStroke();



    // 為了符合瀏覽器對音訊播放的限制（需要使用者互動），

    // 建議在 setup 中設定音效的音量等，並確保使用者在點擊畫布後才能播放

    

    // 如果音效載入成功，設定音量

    if (popSound) {

        popSound.setVolume(0.3); // 將音量設定為 30%

    }





    for (let i = 0; i < NUM_CIRCLES; i++) {

        circles.push(new Circle());

    }

}



// P5.js 的 draw 函式，每秒執行 60 次

function draw() {

    background(255, 240, 243);



    for (let i = 0; i < circles.length; i++) {

        circles[i].move();

        circles[i].display();

    }



    for (let i = explosions.length - 1; i >= 0; i--) {

        explosions[i].update();

        explosions[i].display();

        if (explosions[i].isFinished()) {

            explosions.splice(i, 1);

        }

    }



    // 左上角顯示固定文字 414730225，顏色 #62b6cb，文字大小 32px
    push();
    textSize(32);
    textAlign(LEFT, TOP);
    fill('#62b6cb');
    noStroke();
    text('414730225', 10, 10);
    pop();

    // 右上角顯示分數，文字大小 32px，與左上角相同大小
    push();
    textSize(32);
    textAlign(RIGHT, TOP);
    fill('#62b6cb');
    noStroke();
    // 修改：在分數前顯示「得分分數:」
    text('分數:' + String(score), width - 10, 10);
    pop();

}



// 處理滑鼠點擊：點擊特定氣球才觸發爆破與音效、計分

function mousePressed() {

    // 找到最接近滑鼠且滑鼠在圓形半徑內的圓（優先距離最小）

    let nearest = null;

    let dmin = Infinity;

    for (let c of circles) {

        let d = dist(mouseX, mouseY, c.x, c.y);

        if (d < dmin && d < c.d / 2) {

            dmin = d;

            nearest = c;

        }

    }

    if (nearest) {

        // 依顏色決定加分或扣分：若是 '#a4133c' 扣分，其他加分

        let colLower = String(nearest.color).toLowerCase();

        if (colLower === '#a4133c') {

            score = max(0, score - 1); // 扣分，但不低於 0（可依需求修改）

        } else {

            score = score + 1;

        }



        // 產生爆破效果與音效（若載入）

        explosions.push(new Explosion(nearest.x, nearest.y, nearest.d, nearest.color));

        if (popSound && popSound.isLoaded) {

            // 播放音效（也能解除瀏覽器音訊鎖定）

            try { popSound.play(); } catch (e) { /* ignore playback error */ }

        }



        // 重置該氣球（讓它從畫面下方再上升）

        nearest.reset();

        nearest.y = height + nearest.d / 2;

        nearest.x = random(width);

    } else {

        // 若未點到氣球，也可用來解除瀏覽器音訊鎖定（若需要）

        if (popSound && popSound.isLoaded) {

            try { popSound.play(); } catch (e) { /* ignore */ }

            popSound.stop && popSound.stop(); // 播放後立刻停止（如果想只是解除鎖定）

        }

    }

}





function windowResized() {

    resizeCanvas(windowWidth, windowHeight);

    background('#fff0f3');

}





// --- 圓形物件的類別定義 ---

class Circle {

    constructor() {

        this.reset();

    }



    reset() {

        this.x = random(width);

        this.y = random(height, height * 2);

        this.d = random(50, 200);

        this.color = random(colors);

        this.speed = random(2, 8);

        this.alpha = random(50, 255);

    }



    // 更新圓形位置 (由下往上漂浮)

    move() {

        this.y -= this.speed;



        // 只在到達頂部時重置，不再隨機爆破

        if (this.y < -this.d / 2) {

            // 到頂部時直接重置（不產生爆破）

            this.reset();

            this.y = height + this.d / 2;

        }

    }



    // 繪製圓形和其右上方的小方形 (不變)...

    display() {

        // ... (保持不變)

        let c = color(this.color);

        c.setAlpha(this.alpha);

        fill(c);

        ellipse(this.x, this.y, this.d, this.d);



        let squareSize = this.d / 5;

        let r = this.d / 2;



        push();

        rectMode(CENTER);

        noStroke();

        fill(255, 255, 255, 80);



        let squareX = this.x + r * 0.4;

        let squareY = this.y - r * 0.4;

        rect(squareX, squareY, squareSize, squareSize);

        pop();

    }

}





// --- 爆破物件的類別定義 (不變) ---

class Explosion {

    constructor(x, y, parentDiameter, parentColor) {

        this.x = x;

        this.y = y;

        this.parentColor = parentColor;

        this.particles = [];

        this.numParticles = floor(map(parentDiameter, 50, 200, 10, 30)); 



        for (let i = 0; i < this.numParticles; i++) {

            this.particles.push(new Particle(this.x, this.y, this.parentColor));

        }

    }



    update() {

        for (let particle of this.particles) {

            particle.move();

        }

    }



    display() {

        for (let particle of this.particles) {

            particle.display();

        }

    }



    isFinished() {

        return this.particles.every(p => p.isFinished());

    }

}





// --- 爆破碎片物件的類別定義 (不變) ---

class Particle {

    constructor(x, y, baseColor) {

        this.x = x;

        this.y = y;

        this.size = random(5, 10);

        this.color = color(baseColor);

        

        this.velocity = p5.Vector.random2D(); 

        this.velocity.mult(random(2, 6));



        this.alpha = 255;

        this.fadeRate = random(5, 15);

    }



    move() {

        this.x += this.velocity.x;

        this.y += this.velocity.y;

        this.alpha -= this.fadeRate;

    }



    display() {

        if (this.alpha > 0) {

            this.color.setAlpha(this.alpha);

            fill(this.color);

            ellipse(this.x, this.y, this.size, this.size); 

        }

    }



    isFinished() {

        return this.alpha <= 0;

    }

}
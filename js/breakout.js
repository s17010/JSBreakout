/**
 * Created by s17010 on 17/10/30.
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log("breakout initializing...");

    // 初期化
    const canvas = document.getElementById('board');
    new Breakout({
            canvas: canvas,
            interval: 1000 / 60,
            paddle: {
                width: 100,
                height: 10,
                color: '#ffff00'
            },
            ball: {
                radius: 5,
                color: '#ffffff'
            }
        });
});

class Breakout {
    static set width(w) {
        Breakout.gameWidth = w;
    }

    static get width() {
        return Breakout.gameWidth;
    }

    static set height(h) {
        Breakout.gameHight = h;
    }

    static get height() {
        return Breakout.gameHight;
    }

    static get isGameOver() {
        return Breakout._game_over === true;
    }

    static setGameOver(f) {
        if (f instanceof Boolean) {
            Breakout._game_over = f;
            return;
        }
        Breakout._game_over = true;
    }

    constructor(options) {
        // 受け取ったパラメータをプロパティに保存
        this.canvas = options.canvas;
        this.context = this.canvas.getContext('2d');

        // ゲーム画面のサイズを取得
        Breakout.width = this.canvas.width;
        Breakout.height = this.canvas.height;

        // 内部で使用するプロパティの初期化
        this.leftKey = false;
        this.rightKey = false;

        // Paddleの初期化
        this.paddle = new Paddle(
            options.paddle.width,
            options.paddle.height,
            options.paddle.color);

        this.paddle.setPosition(Breakout.width / 2, Breakout.height * 8 / 9);
        this.paddle.setSpeed(Breakout.width / 100);

        // ボールの初期化
        this.ball = new Ball(
            options.ball.radius, options.ball.color);
        this.ball.setPosition(Breakout.width / 2, Breakout.height / 2);

        //ボールに当たり判定してもらうお願い
        this.ball.addTarget(this.paddle);

        // 描画のためのタイマーセット
        setInterval(this.draw.bind(this), options.interval);

        window.addEventListener('keydown', this.keydown.bind(this));
        window.addEventListener('keyup', this.keyup.bind(this));
    }

    keydown(evt) {
        if (evt.keyCode === 37 /*左キー*/) {
            this.leftKey = true;
        }
        else if (evt.keyCode === 39 /*右キー*/) {
            this.rightKey = true;
        } else if (evt.code === 'Space') {
            //debug
            this.ball.setSpeed(5,135);
        }
    }

    keyup(evt) {
        if (evt.keyCode === 37 /*左キー*/) {
            this.leftKey = false;
        } else if (evt.keyCode === 39 /*右キー*/) {
            this.rightKey = false;
        }
    }


    draw() {
        this.context.clearRect(0, 0, Breakout.width, Breakout.height);
        if (this.leftKey) {
            this.paddle.moveLeft();
        }
        if (this.rightKey) {
            this.paddle.moveRight();
        }
        if (Breakout.isGameOver) {
            this.context.save();

            this.context.fillStyle = '#ff0000'; //red
            this.context.font = "48pt Arial";
            this.context.textAlign = "center";
            this.context.fillText("GameOver", Breakout.width / 2, Breakout.height / 2);
            this.context.strokeText("GameOver", Breakout.width / 2, Breakout.height / 2);

            this.context.restore();
        } else {
            this.ball.draw(this.context);
        }
        this.paddle.draw(this.context);
    }
}

class Entity {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }

    getCornerPoints() {
        return [
            {x: this.x - this.width / 2, y: this.y - this.height / 2},
            {x: this.x + this.width / 2, y: this.y - this.height / 2},
            {x: this.x + this.width / 2, y: this.y + this.height / 2},
            {x: this.x - this.width / 2, y: this.y + this.height / 2}
        ]
    }

    hit() {
    }

}


class Paddle extends Entity{
    constructor(width, height, color){
        super();
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
    }

    /**
     * 描画処理するメソッド
     * @param context CanvasRenderingContext2D
     */
    draw(context){
        context.save();

        context.translate(this.x,this.y);
        context.fillStyle = this.color;
        context.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);

        context.restore();
    }

    /**
     * 位置を指定した座標へ移動する
     * @param x
     * @param y
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.fixPosition();
    }

    /**
     * 移動スピードを指定する
     * @param speed
     */
    setSpeed(speed) {
        this.speed = speed;
    }

    /**
     * 左へ移動する
     */
    moveLeft() {
        this.x -= this.speed;
        this.fixPosition();
    }

    /**
     * 右へ移動する
     */
    moveRight() {
        this.x += this.speed;
        this.fixPosition();
    }

    /**
     * はみ出さないように位置を調整する
     */
    fixPosition() {
        const left = this.x - (this.width / 2);
        if (left < 0) {
            this.x += Math.abs(left);
        }

        const right = this.x + (this.width / 2);
        if (right > Breakout.width) {
            this.x -= right - Breakout.width;
        }
    }

}

class Ball {
    constructor(radius, color) {
        this.radius = radius;
        this.color = color;
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.targetList = [];
    }

    /**
     * 当たり判定をするリストに追加する
     */
    addTarget(object) {
        if (Array.isArray(object)) {
            this.targetList.concat(object);
        } else {
            this.targetList.push(object);
        }
    }

    /**
     * 位置を指定した場所へ移動する
     * @param x
     * @param y
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 移動速度と向きを設定する
     * @param speed
     * @param direction
     */

    setSpeed(speed, direction) {
        const rad = direction * Math.PI / 180;
        this.dx = Math.cos(rad) * speed;
        this.dy = Math.sin(rad) * speed;
    }

    /**
     * 移動のメソッド
     */
    move() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.collision()) {
            this.dy *= -1;
        }
    }

    /**
     * 衝突判定のメソッド
     */
    collision() {
        let isCollision = false;
        this.targetList.forEach((target) => {
            //角チェック
            const points = target.getCornerPoints();
            points.forEach((point) => {
                const a = Math.sqrt(
                    Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y,2));
                if (a <= this.radius) {
                    isCollision = true;
                    target.hit();
                }
            }, this);

            //各側面のチェック
            const bl = this.x - this.radius;
            const br = this.x + this.radius;
            const bt = this.y - this.radius;
            const bb = this.y + this.radius;
            if (points[0].x < br && bl < points[1].x) {
                if (points[0].y < bb && bt < points[2].y) {
                    //console.log(bl,br,bt,bb,points[0].x,points[0].y,points[2].y
                    isCollision = true;
                    this.y -= bb - points[0].y;
                    target.hit();
                }
            }

        }, this);

        return isCollision;
    }

    /**
     * 反射角度を変える(1度)
     */
    changeAngle(ccw = false) {
        let theta = Math.atan(this.dy / this.dx);
        const speed = this.dx / Math.cos(theta);
        if (ccw) {
            theta -= Math.PI / 180;
        } else {
            theta += Math.PI /180;
        }
        if (theta <= 0.08726646259971647 || theta >= 3.0543261909900763) {
            //変更なしにする
            return;
        }
        this.dx = Math.cos(theta) * speed;
        this.dy = Math.sin(theta) * speed;
    }

    /**
     * はみ出さないように位置を調整する
     */
    fixPosition(){
        // 画面左側を超えているか判定と座標修正

        const left = this.x - this.radius;
        if (left < 0) {
            this.x += Math.abs(left);
            this.reflectionX();
        }

        // 画面上側を超えているか判定と座標修正
        const top = this.y - this.radius;
        if (top < 0) {
            this.y += Math.abs(top);
            this.reflectionY();
        }

        // 画面右側を超えているか判定と座標修正
        const right = this.x + this.radius;
        if (right > Breakout.width) {
            this.x -= right - Breakout.width;
            this.reflectionX();
        }

        // 画面の下側を超えているか判定と一時的に座標修正
        if (top > Breakout.height) {
            Breakout.setGameOver();
        }
    }

    /**
     * 移動スピードの左右反転
     */
    reflectionX() {
        this.dx *= -1;
    }

    /**
     * 移動スピードの上下反転
     */
    reflectionY() {
        this.dy *= -1;
    }


    /**
     * 描画処理するメソッド
     *
     * @param context CanvasRenderingContext2D
     */

    draw(context) {
        // 移動関連
        this.move();
        this.fixPosition();

        // 描画関連
        context.save();

        context.fillStyle = this.color;
        context.translate(this.x, this.y);

        context.beginPath();
        context.arc(0, 0, this.radius, 0, 2 * Math.PI);
        context.fill();

        context.restore();
    }

}
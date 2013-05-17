atom.declare('BattleCity.Bullet', App.Element, {
    speed: 0.2, // скорость полета пули

    configure: function method () {
        method.previous.call(this);

        this.controller.sounds.play('shot');

        this.angle = this.settings.get('angle');
        this.image = this.settings.get('images').get('bullet');
        this.source = this.settings.get('player');
        // Смещение для взрыва
        this.offset = 8;
    },

    get controller () {
        return this.settings.get('controller');
    },

    renderTo: function (ctx, resources) {
        ctx.drawImage({
            image : this.image,
            center: this.shape.center,
            angle: this.angle.degree()
        });
    },

    onUpdate: function (time) {
        var x = this.angle == 90 ? this.speed*time
            : this.angle == 270 ? -this.speed*time
            : 0;
        var y = this.angle == 0 ? -this.speed*time
            : this.angle == 180 ? this.speed*time
            : 0;

        // смещение по X
        var explosionXOffset = 0;
        // Смещение по Y
        var explosionYOffset = 0;

        // двигаем пулю
        this.shape.move(new Point(x, y));
        this.redraw();

        var collisionWithTextures = this.controller.collisions.checkCollisionWithTextures(this.shape, new Point(x, y));
        var collisionWithEnemies = this.controller.collisions.checkCollisionWithEnemies(this.shape, new Point(x, y));
        var collisionWithPlayers = this.controller.collisions.checkCollisionWithPlayers(this.shape, new Point(x, y));
        var collisionWithBullets = this.controller.collisions.checkCollisionWithBullets(this.shape, new Point(x, y), this);
        var outOfTheField = this.controller.collisions.checkOutOfTheField(this.shape, new Point(x, y));

        // считаем коллизию с пределами поля
        if (outOfTheField ||
            collisionWithTextures ||
            collisionWithEnemies ||
            collisionWithPlayers ||
            collisionWithBullets) {

            if (collisionWithTextures) {
                if (!(collisionWithTextures instanceof BattleCity.Breaks)) { //добавочное смещение для поврежденной стены
                    this.offset = 16;
                }

                explosionXOffset = this.angle == 90 ? this.offset
                    : this.angle == 270 ? -this.offset : 0;
                explosionYOffset = this.angle == 0 ? -this.offset
                    : this.angle == 180 ? this.offset : 0;
            }

            this.controller.collisions.destroyWalls(this.shape, new Point(x, y), this.angle);

            if (this.source instanceof BattleCity.Player) {
                this.settings.get('player').bullets--;
                this.controller.collisions.destroyEnemies(this.shape, new Point(x, y));
            } else if (this.source instanceof BattleCity.Enemy) {
                this.controller.collisions.destroyPlayers(this.shape, new Point(x, y));
            }

            // создаем инстанс взрыва
            new BattleCity.Explosion(this.controller.units, {
                shape: new LibCanvas.Shapes.Circle(
                    this.shape.center.x + explosionXOffset,
                    this.shape.center.y + explosionYOffset,
                    32
                ),
                animationSheet: this.animationSheet,
                animation: this.animation,
                images: this.settings.get('images')
            });

            // уничтожаем инстанс пули
            if (this.source instanceof BattleCity.Enemy) {
                this.controller.enemyBullets.erase(this);
            }
            this.destroy();
        }
    }
});

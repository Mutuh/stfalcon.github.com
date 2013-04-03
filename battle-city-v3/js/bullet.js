atom.declare('BattleCity.Bullet', App.Element, {
//    zIndex: 2,
    speed: 0.2,

    configure: function method () {
        method.previous.call(this);

        this.controller.sounds.play('shot');

        this.angle = this.settings.get('angle');

        // анимация взрыва
        this.animationSheet = new Animation.Sheet({
            frames: new Animation.Frames(this.settings.get('images').get('bang'), 32, 32),
            delay : 60,
//            looped: true
        });
        this.animation = new Animation({
            sheet   : this.animationSheet,
            onUpdate: this.redraw,
//            onStop: this.die
        });

        this.image = this.settings.get('images').get('bullet');
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

        if (!this.checkOutOfTheField(this.shape, new Point(x, y))) {
            this.shape.move(new Point(x, y));
            this.redraw();
        } else {
//            console.log(this.settings.get('player').bullets);
            this.settings.get('player').bullets--;
            this.image = this.animation.get();
        }
    },

    die: function () {
//        this.controller.game.remove(this);
        this.destroy();
    },


    // проверяем выезд за границы игрового поля
    checkOutOfTheField: function(shape, point) {
        var shape = shape.clone();
        shape.move(point); // сначала двигаем клонированный объект, а потом ищем столкновения

        var top = shape.from.y,
            bottom = shape.to.y - this.controller.size.height,
            left = shape.from.x,
            right = shape.to.x - this.controller.size.width;

        if (top < 0 || bottom > 0 || left < 0 || right > 0) {
            return true;
        }

        return false;
    }
});
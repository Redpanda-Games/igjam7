var clientWidth = jQuery(document).width();
var clientHeight = jQuery(document).height();
var i = 0;
var score = 0;
var life = 2;
var health = 1;
var $pauseMenu = jQuery('#pause-menu');

var objectSpawnRate = 3;
var spawnObjects = true;
var enemySpawnRate = 10;
var spawnEnemies = true;
var bossSpawnRate = 90;
var boss;
var bossLife = 5;
var bossSpawned = false;

var imagePath = 'img/';
var imageType = '.png';
var objects = Array(
    'ironman/object_bender|250|143',
    'ironman/object_steel|250|152',
    'ironman/object_truck|250|154',
    'panda/object_cat|250|244',
    'panda/object_rice|250|203',
    'pony/object_cloud|250|154',
    'pony/object_fluffy|150|250'
);
var enemies = Array(
    'ironman/enemy_|166|232',
    'panda/enemy_|136|250',
    'pony/enemy_|250|182'
);
var bosses = Array(
    'Ironman|250',
    'Panda|415'
);

Crafty.audio.add('background', "sound/Background.mp3");
Crafty.audio.add('endboss', "sound/Endboss.mp3");
Crafty.audio.add('enemyHit', "sound/Enemy.mp3");
Crafty.audio.add('objectHit', "sound/Hit.mp3");

Crafty.sprite(250, 500, 'img/ironman/ironman_animation_sprite.png', {
    IronmanSprite: [0,0]
});
Crafty.sprite(415, 340, 'img/panda/panda_animation_sprite.png', {
    PandaSprite: [0,0]
});

var characterLTRPolygon = new Crafty.polygon([0,0],[0,15],[60,95],[85,110],[105,134],[125,134],[250,105],[90,250],[175,70],[170,40],[150,20],[125,30],[120,65],[100,65],[80,15],[25,0]);
var characterPolygon = new Crafty.polygon([50,25],[200,25],[200,115],[50,115]);

Crafty.init(clientWidth, clientHeight, document.getElementById('stage'));

Crafty.audio.play('background', -1);

Crafty.bind('KeyDown', function(e) {
    if(e.key == Crafty.keys.ESC) {
        Crafty.pause();
        if(Crafty.isPaused()) {
            $pauseMenu.addClass('paused');
        } else {
            $pauseMenu.removeClass('paused');
        }
    }
});
jQuery('#resume').on('click', function() {
    if(Crafty.isPaused()) {
        $pauseMenu.removeClass('paused');
        Crafty.pause();
    }
});

Crafty.c('Enemy1', {
    init: function() {
        this.requires('2D, DOM, Image, Solid, Collision')
            .attr({y: -250})
            .bind('EnterFrame', this.moveDown)
            .onHit('Object', function(data) {
                this.destroy();
                addScore(5);
            });
    },
    moveDown: function() {
        this.y += 3;
        if(this.y >= clientHeight) {
            this.destroy();
            addScore(20);
        }
    }
});

Crafty.c('Enemy2', {
    init: function() {
        this.requires('2D, DOM, Image, Solid, Collision')
            .onHit('Object', function(data) {
                this.destroy();
                addScore(10);
            });
    },
    moveRight: function() {
        this.x += 4;
        if(this.x >= clientWidth) {
            this.destroy();
            addScore(30);
        }
    },
    moveLeft: function() {
        this.x -= 4;
        if(this.x <= -250) {
            this.destroy();
            addScore(30);
        }
    }
});

Crafty.c('Enemy3', {
    init: function() {
        this.requires('2D, DOM, Image, Solid, Collision')
            .attr({y: -250})
            .bind('EnterFrame', this.moveDown)
            .onHit('Object', function(data) {
                this.destroy();
                addScore(15);
            });
    },
    moveDown: function() {
        this.y += 5;
        if(this.y >= clientHeight) {
            this.destroy();
            addScore(40);
        }
    }
});

Crafty.c('Object', {
    init: function() {
        this.requires('2D, DOM, Image, Solid, Collision')
            .attr({y: clientHeight})
            .bind('EnterFrame', this.moveUp)
            .onHit('Ironman', function(data) {
                this.destroy();
                bossDamage();
            })
            .onHit('Panda', function(data) {
                this.destroy();
                bossDamage();
            });
    },
    moveUp: function() {
        this.y -= 2;
        if(this.y <= -250) {
            this.destroy();
            addScore(10);
        }
    }
});

var bossMovementHorizontal = '';
var bossMovementVertical = '';
Crafty.c('Ironman', {
    init: function() {
        this.requires('2D, DOM, Solid, Collision, SpriteAnimation, IronmanSprite')
            .attr({y: 100, w: 250, h: 500})
            .reel('IronmanIdle', 400, [[0, 0], [1, 0], [2, 0], [3, 0]])
            .animate('IronmanIdle', -1)
            .bind('EnterFrame', this.moveRandom)
    },
    moveRandom: function() {
        if(this.x >= (clientWidth-250-25)) {
            bossMovementHorizontal = 'left';
        }
        if(this.x <= (25)) {
            bossMovementHorizontal = 'right';
        }
        if(this.y >= (clientHeight-500-25)) {
            bossMovementVertical = 'up';
        }
        if(this.y <= (25)) {
            bossMovementVertical = 'down';
        }

        if(bossMovementHorizontal == 'left') {
            this.x -= 4;
        } else {
            this.x += 4;
        }
        if(bossMovementVertical == 'up') {
            this.y -= 3;
        } else {
            this.y += 3;
        }
    }
});

Crafty.c('Panda', {
    init: function() {
        this.requires('2D, DOM, Solid, Collision, SpriteAnimation, PandaSprite')
            .attr({y: 100, w: 415, h: 340})
            .reel('PandaIdle', 300, [[0, 0], [1, 0], [2, 0]])
            .animate('PandaIdle', -1)
            .bind('EnterFrame', this.moveRandom)
    },
    moveRandom: function() {
        if(this.x >= (clientWidth-415-25)) {
            bossMovementHorizontal = 'left';
        }
        if(this.x <= (25)) {
            bossMovementHorizontal = 'right';
        }
        if(this.y >= (clientHeight-340-25)) {
            bossMovementVertical = 'up';
        }
        if(this.y <= (25)) {
            bossMovementVertical = 'down';
        }

        if(bossMovementHorizontal == 'left') {
            this.x -= 3;
        } else {
            this.x += 3;
        }
        if(bossMovementVertical == 'up') {
            this.y -= 2;
        } else {
            this.y += 2;
        }
    }
});

var time_text = Crafty.e('2D, DOM, Text').attr({ x: 25, y: 25, w: 250, h: 25 }).text(i + ' Sekunden');
time_text.textColor('#000000');
time_text.textFont({ size: '1.5em', family: 'Lobster' });

var highscore_text = Crafty.e('2D, DOM, Text').attr({ x: 25, y: 50, w: 250, h: 25 }).text(score + ' Punkte');
highscore_text.textColor('#ffff00');
highscore_text.textFont({ size: '1.5em', family: 'Lobster' });

var life_text = Crafty.e('2D, DOM, Text').attr({ x: 25, y: 75, w: 250, h: 25 }).text(life + ' Leben');
life_text.textColor('#ff0000');
life_text.textFont({ size: '1.5em', family: 'Lobster' });

Crafty.sprite(250, 134, 'img/maincharacter/maincharacter_animation_naked.png', {
    PlayerSprite: [0,0]
});
var player = Crafty.e('2D, DOM, Solid, Collision, SpriteAnimation, PlayerSprite, Fourway')
    .attr({x: (clientWidth/2)-125, y: 25, w: 250, h: 134})
    .reel('PlayerFallingLTR', 200, [[0, 0], [1, 0]])
    .reel('PlayerFallingRTL', 200, [[2, 0], [3, 0]])
    .animate('PlayerFallingRTL', -1)
    .fourway(4)
    .collision(characterPolygon)
    .bind('NewDirection', function(movement) {
        if(movement.x > 0) {
            this
                .animate('PlayerFallingLTR', -1);
        } else if(movement.x < 0) {
            this
                .animate('PlayerFallingRTL', -1);
        }
    })
    .onHit('Enemy1', function(data) {
        playerDamage('enemy');
    })
    .onHit('Enemy2', function(data) {
        playerDamage('enemy');
    })
    .onHit('Enemy3', function(data) {
        playerDamage('enemy');
    })
    .onHit('Object', function(data) {
        playerDamage('object');
    })
    .onHit('Ironman', function(data) {
        playerDamage('enemy');
        boss.attr({x: 25, y: 100});
    });

var oneSecondTimer = setInterval( function(){
    if(!Crafty.isPaused()) {
        spawnObject(i);
        spawnEnemy(i);
        spawnBoss(i);
        i++;
        updateHUD();
        if(i % 15 == 0) {
            addScore(5);
        }
    }
}, 1000 );

function spawnObject(i) {
    if(spawnObjects) {
        if(i % objectSpawnRate == 0) {
            var rand = Math.floor(Math.random() * objects.length);
            if(rand == objects.length) {
                rand--;
            }
            var objectData = objects[rand].split('|');
            var object = Crafty.e('Object');
            object
                .attr({x: Math.floor((Math.random() * clientWidth)), w: objectData[1]*1, h: objectData[2]*1})
                .image(imagePath + objectData[0] + imageType);
        }
    }
}

function spawnEnemy(i) {
    if(spawnEnemies) {
        var rand = Math.floor(Math.random() * enemies.length);
        if(rand == enemies.length) {
            rand--;
        }
        var enemyData = enemies[rand].split('|');
        if(i % enemySpawnRate == 0) {
            var enemy = Crafty.e('Enemy1');
            enemy
                .attr({x: Math.floor((Math.random() * clientWidth)), w: enemyData[1]*1, h: enemyData[2]*1})
                .image(imagePath + enemyData[0] + 'green' + imageType);
        }
        if(i % Math.floor(enemySpawnRate * 1.5) == 0) {
            var enemy = Crafty.e('Enemy2');
            if(Math.random() > 0.5) {
                enemy
                    .attr({x: -250, y: Math.floor((Math.random() * (clientHeight/3*2))), w: enemyData[1]*1, h: enemyData[2]*1})
                    .bind('EnterFrame', enemy.moveRight)
                    .image(imagePath + enemyData[0] + 'blue' + imageType);
            } else {
                enemy
                    .attr({x: clientWidth, y: Math.floor((Math.random() * (clientHeight/3*2))), w: enemyData[1]*1, h: enemyData[2]*1})
                    .bind('EnterFrame', enemy.moveLeft)
                    .image(imagePath + enemyData[0] + 'blue' + imageType);
            }
        }
        if(i % (enemySpawnRate * 2) == 0) {
            var enemy = Crafty.e('Enemy3');
            enemy
                .attr({x: player.x})
                .image(imagePath + enemyData[0] + 'red' + imageType);
        }
    }
}

function spawnBoss(i) {
    if(i != 0 && i % bossSpawnRate == 0 && !bossSpawned) {
        var rand = Math.floor(Math.random() * bosses.length);
        if(rand == bosses.length) {
            rand--;
        }
        spawnEnemies = false;
        bossSpawned = true;
        bossLife = 5;
        clearStage();
        var bossData = bosses[rand].split('|');
        boss = Crafty.e(bossData[0]);
        if(player.x >= clientWidth/2) {
            boss.attr({x: 25});
        } else {
            boss.attr({x: clientWidth-bossData[1]-25});
        }
    }
}

function addScore(amount) {
    score += amount;
    updateHUD();
}

function playerDamage(type) {
    if(type == 'enemy') {
        Crafty.audio.play('enemyHit', 1);
    } else if(type == 'object') {
        Crafty.audio.play('objectHit', 1);
    }
    health--;
    if(health <= 0) {
        life--;
        clearStage();
        player.attr({x: (clientWidth/2)-125, y: 25})
    }
    if(life > 0) {
        health = 1;
    } else {
        player.destroy();
        Crafty.stop();
    }

    life_text.text(function () {
        return life;
    });
}

function bossDamage() {
    bossLife--;
    if(bossLife <= 0) {
        boss.destroy();
        addScore(250);
        spawnEnemies = true;
        bossSpawned = false;
        objectSpawnRate += 1;
        if(enemySpawnRate > 1) {
            enemySpawnRate -=1;
        }
        if(bossSpawnRate > 15) {
            bossSpawnRate -=5;
        }

        life++;
        updateHUD();
    }
}

function clearStage() {
    Crafty('Object').each(function() {
        this.destroy();
    });
    Crafty('Enemy1').each(function() {
        this.destroy();
    });
    Crafty('Enemy2').each(function() {
        this.destroy();
    });
    Crafty('Enemy3').each(function() {
        this.destroy();
    });
}

function updateHUD() {
    time_text.text(function () {
        return i + ' Sekunden';
    });
    highscore_text.text(function () {
        return score + ' Punkte';
    });
    life_text.text(function () {
        return life + ' Leben';
    });
}
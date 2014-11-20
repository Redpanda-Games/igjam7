jQuery(window).on('load', function() {
    var $pauseMenu = jQuery('#pause-menu');

    jQuery('#resume').on('click', function() {
        if(Crafty.isPaused()) {
            $pauseMenu.removeClass('paused');
            Crafty.pause();
        }
    });

    if(getCookie('audioMuted')) {
        jQuery('#mute').addClass('active').text('Sound on');
    }

    jQuery('#mute').on('click', function() {
        var $this = jQuery(this);
        $this.toggleClass('active');
        if($this.hasClass('active')) {
            titf.settings.audioMuted = true;
            $this.text('Sound on');
        } else {
            titf.settings.audioMuted = false;
            $this.text('Sound off');
        }
        if(titf.client.cookieEnabled) {
            setCookie('audioMuted', titf.settings.audioMuted, 28);
        }
    });

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) != -1) {
                return c.substring(name.length, c.length);
            }
        }
        return false;
    }

    var titf = new Object();

    titf.f = {
        client: {
            checkCookieEnabled: function() {
                var cookieEnabled = !!(navigator.cookieEnabled);
                if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
                    document.cookie = 'testcookie';
                    cookieEnabled = (document.cookie.indexOf('testcookie') != -1);
                }
                return cookieEnabled;
            }
        },
        game: {
            loadSounds: function () {
                jQuery.each(titf.settings.audioFiles, function() {
                    Crafty.audio.add(this.toLowerCase(), titf.settings.audioPath+this+titf.settings.audioType);
                });
            },
            muteSounds: function () {
                if(titf.settings.audioMuted) {
                    Crafty.audio.mute();
                } else {
                    Crafty.audio.unmute();
                }
            },
            updateHUD: function(i) {
                titf.texts.time.text(function () {
                    var secs = i % 60;
                    var mins = (i - secs) / 60;
                    if(secs < 10) {
                        secs = '0'+secs;
                    }
                    return mins + ':' + secs;
                });
                titf.texts.level.text(function () {
                    return 'Level ' + titf.game.level;
                });
                titf.texts.score.text(function () {
                    return titf.player.score + ' Punkte';
                });
                titf.texts.life.text(function () {
                    return titf.player.life + ' Leben';
                });
            },
            clearStage: function() {
                Crafty('Object').each(function(){ this.destroy(); });
                Crafty('Enemy1').each(function(){ this.destroy(); });
                Crafty('Enemy2').each(function(){ this.destroy(); });
                Crafty('Enemy3').each(function(){ this.destroy(); });
            },
            spawnObject: function(i) {
                if(titf.settings.objectSpawn) {
                    if(i % titf.settings.objectSpawnRate == 0) {
                        var objectsLength = titf.settings.objectFiles.length;
                        var rand = Math.floor(Math.random() * objectsLength);
                        if(rand == objectsLength) {
                            rand--;
                        }
                        var objectData = titf.settings.objectFiles[rand].split('|');
                        Crafty.e('Object')
                            .attr({x: Math.floor((Math.random() * titf.client.width)), w: objectData[1]*1, h: objectData[2]*1})
                            .image(titf.settings.imagePath + objectData[0] + titf.settings.imageType);
                    }
                }
            },
            spawnEnemy: function(i) {
                if(titf.settings.enemySpawn) {
                    var enemiesLength = titf.settings.enemyFiles.length;
                    var spawnRate = titf.settings.enemySpawnRate;
                    var rand = Math.floor(Math.random() * enemiesLength);
                    if(rand == enemiesLength) {
                        rand--;
                    }
                    var enemyData = titf.settings.enemyFiles[rand].split('|');
                    if(i % spawnRate == 0) {
                        new Crafty.e('Enemy1')
                            .attr({x: Math.floor((Math.random() * titf.client.width)), w: enemyData[1]*1, h: enemyData[2]*1})
                            .image(titf.settings.imagePath + enemyData[0] + 'green' + titf.settings.imageType);
                    }
                    if(i % Math.floor(spawnRate * 1.5) == 0) {
                        if(Math.random() > 0.5) {
                            new Crafty.e('Enemy2')
                                .attr({x: -250, y: Math.floor((Math.random() * (titf.client.height/3*2))), w: enemyData[1]*1, h: enemyData[2]*1})
                                .bind('EnterFrame', this.moveRight)
                                .image(titf.settings.imagePath + enemyData[0] + 'blue' + titf.settings.imageType);
                        } else {
                            new Crafty.e('Enemy2')
                                .attr({x: titf.client.width, y: Math.floor((Math.random() * (titf.client.height/3*2))), w: enemyData[1]*1, h: enemyData[2]*1})
                                .bind('EnterFrame', this.moveLeft)
                                .image(titf.settings.imagePath + enemyData[0] + 'blue' + titf.settings.imageType);
                        }
                    }
                    if(i % (spawnRate * 2) == 0) {
                        new Crafty.e('Enemy3')
                            .attr({x: titf.player.e.x, w: enemyData[1]*1, h: enemyData[2]*1})
                            .image(titf.settings.imagePath + enemyData[0] + 'red' + titf.settings.imageType);
                    }
                }
            },
            spawnBoss: function(i) {
                if(titf.settings.bossSpawn && !titf.settings.bossSpawned) {
                    if(i != 0 && i % titf.settings.bossSpawnRate == 0) {
                        Crafty.audio.stop();
                        var bossesLength = titf.settings.bossFiles.length;
                        var rand = Math.floor(Math.random() * bossesLength);
                        if(rand == bossesLength) {
                            rand--;
                        }
                        titf.settings.enemySpawn = false;
                        titf.settings.bossSpawned = true;
                        titf.boss.life = titf.settings.bossLifes + Math.floor(Math.random() * titf.game.level);
                        titf.settings.bossLifes = titf.boss.life;
                        titf.f.game.clearStage();
                        var bossData = titf.settings.bossFiles[rand].split('|');
                        var backgroundData = titf.settings.backgroundFiles[bossData[0].toLowerCase()].split('|');
                        titf.boss.type = bossData[0];
                        titf.boss.e = Crafty.e(bossData[0]);
                        titf.boss.b
                            .attr({w: (backgroundData[0]*1), h: (backgroundData[1]*1)})
                            .image(titf.settings.imagePath + bossData[0].toLowerCase() + '/background' + titf.settings.imageType);
                        if(titf.player.e.x >= titf.client.width/2) {
                            titf.boss.e.attr({x: 25});
                            titf.boss.b.attr({x: 25});
                        } else {
                            titf.boss.e.attr({x: titf.client.width - bossData[1] - 25});
                            titf.boss.b.attr({x: titf.client.width - backgroundData[0] - 25});
                        }

                        titf.texts.boss.text(bossData[0] + ': ' + titf.boss.life + ' / ' + titf.settings.bossLifes + ' Leben');
                        Crafty.audio.play('endboss', -1);
                    }
                }
            }
        },
        player: {
            addScore: function(amount) {
                titf.player.score += amount;
                titf.f.game.updateHUD(titf.game.seconds);
            },
            damage: function(type) {
                if(type == 'enemy') {
                    Crafty.audio.play('enemyHit', 1);
                } else if(type == 'object') {
                    Crafty.audio.play('objectHit', 1);
                }
                titf.player.life--;
                titf.f.game.updateHUD(titf.game.seconds);
                titf.f.game.clearStage();
                titf.player.e.attr({x: (titf.client.width/2)-125, y: 25});
                if(titf.player.life <= 0) {
                    titf.game.end();
                }
            }
        },
        boss: {
            damage: function() {
                titf.boss.life--;
                titf.texts.boss.text(titf.boss.type + ': ' + titf.boss.life + ' / ' + titf.settings.bossLifes + ' Leben');
                if(titf.boss.life <= 0) {
                    Crafty.audio.stop();
                    titf.boss.e.destroy();
                    titf.boss.b.image('');
                    titf.f.player.addScore(250);
                    titf.settings.enemySpawn = true;
                    titf.settings.bossSpawned = false;
                    titf.settings.objectSpawnRate += 1;
                    if(titf.settings.enemySpawnRate > 1) {
                        titf.settings.enemySpawnRate -=1;
                    }
                    if(titf.settings.bossSpawnRate > 15) {
                        titf.settings.bossSpawnRate -=5;
                    }

                    titf.player.life++;
                    titf.game.level++;
                    titf.f.game.updateHUD(titf.game.seconds);
                    titf.texts.boss.text('');
                    Crafty.audio.play('background', -1);
                }
            }
        }
    };

    titf.proto = {
        sprites: {
            player: Crafty.sprite(250, 134, 'img/maincharacter/maincharacter_animation_naked.png', { PlayerSprite: [0,0] }),
            ironman: Crafty.sprite(250, 500, 'img/ironman/ironman_animation_sprite.png', { IronmanSprite: [0,0] }),
            panda: Crafty.sprite(415, 340, 'img/panda/panda_animation_sprite.png', { PandaSprite: [0,0] }),
            pony: Crafty.sprite(460, 460, 'img/pony/pony_idle_sprite.png', { PonySprite: [0,0] })
        },

        texts: {
            hudText: Crafty.c('HudText', {
                init: function () {
                    this.requires('2D, DOM, Text')
                        .attr({x: 25, w: 250, h: 25})
                        .textFont({ size: '1.5em', family: 'Lobster' })
                }
            })
        },

        entities: {
            background: new Crafty.c('Background', {
                init: function() {
                    this.requires('2D, DOM, Image')
                        .attr({y: 50});
                }
            }),
            object: new Crafty.c('Object', {
                init: function() {
                    this.requires('2D, DOM, Image, Solid, Collision').attr({y: titf.client.height}).bind('EnterFrame', this.moveUp)
                        .onHit('Ironman', function() {
                            this.destroy();
                            titf.f.boss.damage();
                        })
                        .onHit('Panda', function() {
                            this.destroy();
                            titf.f.boss.damage();
                        })
                        .onHit('Pony', function() {
                            this.destroy();
                            titf.f.boss.damage();
                        });
                },
                moveUp: function() {
                    this.y -= 2;
                    if(this.y <= -250) {
                        this.destroy();
                        titf.f.player.addScore(10);
                    }
                }
            }),
            enemy1: new Crafty.c('Enemy1', {
                init: function() {
                    this.requires('2D, DOM, Image, Solid, Collision').attr({y: -250}).bind('EnterFrame', this.moveDown)
                        .onHit('Object', function() {
                            this.destroy();
                            titf.f.player.addScore(5);
                        });
                },
                moveDown: function() {
                    this.y += 3;
                    if(this.y >= titf.client.height) {
                        this.destroy();
                        titf.f.player.addScore(20);
                    }
                }
            }),
            enemy2: new Crafty.c('Enemy2', {
                init: function() {
                    this.requires('2D, DOM, Image, Solid, Collision')
                        .onHit('Object', function() {
                            this.destroy();
                            titf.f.player.addScore(10);
                        });
                },
                moveRight: function() {
                    this.x += 4;
                    if(this.x >= titf.client.width) {
                        this.destroy();
                        titf.f.player.addScore(30);
                    }
                },
                moveLeft: function() {
                    this.x -= 4;
                    if(this.x <= -250) {
                        this.destroy();
                        titf.f.player.addScore(30);
                    }
                }
            }),
            enemy3: new Crafty.c('Enemy3', {
                init: function() {
                    this.requires('2D, DOM, Image, Solid, Collision').attr({y: -250}).bind('EnterFrame', this.moveDown)
                        .onHit('Object', function() {
                            this.destroy();
                            titf.f.player.addScore(15);
                        });
                },
                moveDown: function() {
                    this.y += 5;
                    if(this.y >= titf.client.height) {
                        this.destroy();
                        titf.f.player.addScore(40);
                    }
                }
            }),
            ironman: new Crafty.c('Ironman', {
                init: function() {
                    this.requires('2D, DOM, Solid, Collision, SpriteAnimation, IronmanSprite')
                        .attr({y: 100, w: 250, h: 500})
                        .reel('IronmanIdle', 400, [[0, 0], [1, 0], [2, 0], [3, 0]])
                        .animate('IronmanIdle', -1)
                        .bind('EnterFrame', this.moveRandom)
                },
                moveRandom: function() {
                    if(this.x >= (titf.client.width-250-25)) {
                        titf.boss.horizontal = 'left';
                    }
                    if(this.x <= (25)) {
                        titf.boss.horizontal = 'right';
                    }
                    if(this.y >= (titf.client.height-500-25)) {
                        titf.boss.vertical = 'up';
                    }
                    if(this.y <= (25)) {
                        titf.boss.vertical = 'down';
                    }

                    if(titf.boss.horizontal == 'left') {
                        this.x -= 4;
                    } else {
                        this.x += 4;
                    }
                    if(titf.boss.vertical == 'up') {
                        this.y -= 3;
                    } else {
                        this.y += 3;
                    }
                }
            }),
            panda: new Crafty.c('Panda', {
                init: function() {
                    this.requires('2D, DOM, Solid, Collision, SpriteAnimation, PandaSprite')
                        .attr({y: 100, w: 415, h: 340})
                        .reel('PandaIdle', 300, [[0, 0], [1, 0], [2, 0]])
                        .animate('PandaIdle', -1)
                        .bind('EnterFrame', this.moveRandom)
                },
                moveRandom: function() {
                    if(this.x >= (titf.client.width-415-25)) {
                        titf.boss.horizontal = 'left';
                    }
                    if(this.x <= (25)) {
                        titf.boss.horizontal = 'right';
                    }
                    if(this.y >= (titf.client.height-340-25)) {
                        titf.boss.vertical = 'up';
                    }
                    if(this.y <= (25)) {
                        titf.boss.vertical = 'down';
                    }

                    if(titf.boss.horizontal == 'left') {
                        this.x -= 3;
                    } else {
                        this.x += 3;
                    }
                    if(titf.boss.vertical == 'up') {
                        this.y -= 2;
                    } else {
                        this.y += 2;
                    }
                }
            }),
            pony: new Crafty.c('Pony', {
                init: function() {
                    this.requires('2D, DOM, Solid, Collision, SpriteAnimation, PonySprite')
                        .attr({y: 100, w: 460, h: 460})
                        .reel('PonyIdleLTR', 300, [[0, 0], [1, 0], [2, 0]])
                        .reel('PonyIdleRTL', 300, [[3, 0], [4, 0], [5, 0]])
                        .animate('PonyIdleLTR', -1)
                        .bind('EnterFrame', this.moveRandom)
                },
                moveRandom: function() {
                    if(this.x >= (titf.client.width-460-25)) {
                        titf.boss.horizontal = 'left';
                        this.animate('PonyIdleRTL', -1);
                    }
                    if(this.x <= (25)) {
                        titf.boss.horizontal = 'right';
                        this.animate('PonyIdleLTR', -1);
                    }
                    if(this.y >= (titf.client.height-460-25)) {
                        titf.boss.vertical = 'up';
                    }
                    if(this.y <= (25)) {
                        titf.boss.vertical = 'down';
                    }

                    if(titf.boss.horizontal == 'left') {
                        this.x -= 5;
                    } else {
                        this.x += 5;
                    }
                    if(titf.boss.vertical == 'up') {
                        this.y -= 3;
                    } else {
                        this.y += 3;
                    }
                }
            })
        }
    };

    titf.client = {
        width: jQuery(document).width(),
        height: jQuery(document).height(),
        cookieEnabled: titf.f.client.checkCookieEnabled()
    };

    titf.settings = {
        enemySpawn: true,
        enemySpawnRate: 10,
        enemyLifes: 1,
        objectSpawn: true,
        objectSpawnRate: 3,
        objectLifes: 1,
        bossSpawn: true,
        bossSpawned: false,
        bossSpawnRate: 10,
        bossLifes: 5,

        audioMuted: getCookie('audioMuted'),

        imagePath: 'img/',
        imageType: '.png',
        objectFiles: Array(
            'ironman/object_bender|250|143',
            'ironman/object_steel|250|152',
            'ironman/object_truck|250|154',
            'panda/object_cat|250|244',
            'panda/object_rice|250|203',
            'pony/object_cloud|250|154',
            'pony/object_fluffy|150|250'
        ),
        enemyFiles: Array(
            'ironman/enemy_|166|232',
            'panda/enemy_|136|250',
            'pony/enemy_|250|182'
        ),
        bossFiles: Array(
            'Ironman|250',
            'Panda|415',
            'Pony|460'
        ),
        backgroundFiles: {
            ironman: '405|700',
            panda: '500|558',
            pony: '474|700'
        },

        audioPath: 'sound/',
        audioType: '.mp3',
        audioFiles: Array(
            'Background',
            'Endboss',
            'Enemy',
            'Object'
        )
    };

    titf.player = {
        life: 2,
        score: 0,
        c: Crafty.c('Player', {
            init: function() {
                this
                    .requires('2D, DOM, Solid, Collision, SpriteAnimation, PlayerSprite, Fourway')
                    .attr({x: (titf.client.width/2)-125, y: 25, w: 250, h: 134})
                    .reel('PlayerFallingLTR', 200, [[0, 0], [1, 0]])
                    .reel('PlayerFallingRTL', 200, [[2, 0], [3, 0]])
                    .animate('PlayerFallingRTL', -1)
                    .fourway(4)
                    .collision(new Crafty.polygon([50,25],[200,25],[200,115],[50,115]))
                    .bind('NewDirection', function(movement) {
                        if(movement.x > 0) {
                            this
                                .animate('PlayerFallingLTR', -1);
                        } else if(movement.x < 0) {
                            this
                                .animate('PlayerFallingRTL', -1);
                        }
                    })
                    .onHit('Enemy1', function() {
                        titf.f.player.damage('enemy');
                    })
                    .onHit('Enemy2', function() {
                        titf.f.player.damage('enemy');
                    })
                    .onHit('Enemy3', function() {
                        titf.f.player.damage('enemy');
                    })
                    .onHit('Object', function() {
                        titf.f.player.damage('object');
                    })
                    .onHit('Ironman', function() {
                        titf.f.player.damage('enemy');
                        titf.boss.e.attr({x: 25, y: 100});
                    })
                    .onHit('Panda', function() {
                        titf.f.player.damage('enemy');
                        titf.boss.e.attr({x: 25, y: 100});
                    })
                    .onHit('Pony', function() {
                        titf.f.player.damage('enemy');
                        titf.boss.e.attr({x: 25, y: 100});
                    })
            }
        }),
        e: {}
    };

    titf.boss = {
        type: false,
        life: 5,
        horizontal: '',
        vertical: '',
        e: {},
        b: {}
    };

    titf.texts = {
        time: null,
        level: null,
        score: null,
        life: null,
        boss: null
    };

    titf.game = {
        seconds: 0,
        level: 1,
        start: function() {
            Crafty.init(titf.client.width, titf.client.height, document.getElementById('stage'));
            titf.f.game.loadSounds();
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

            titf.boss.b = Crafty.e('Background');

            titf.texts.time = new Crafty.e('HudText').attr({y: 25}).text('0:00').textColor('#ffffff');
            titf.texts.level = new Crafty.e('HudText').attr({y: 50}).text('Level 1').textColor('#ffffff');
            titf.texts.score = new Crafty.e('HudText').attr({y: 75}).text('0 Punkte').textColor('#ffff00');
            titf.texts.life = new Crafty.e('HudText').attr({y: 100}).text(titf.player.life + ' Leben').textColor('#ff0000');
            titf.texts.boss = new Crafty.e('HudText').attr({x: (titf.client.width/2)-125, y: 25}).text('').textColor('#ff0000');

            titf.player.e = new Crafty.e('Player');

            var oneSecondTimer = setInterval( function(){
                if(!Crafty.isPaused()) {
                    titf.f.game.spawnObject(titf.game.seconds);
                    titf.f.game.spawnEnemy(titf.game.seconds);
                    titf.f.game.spawnBoss(titf.game.seconds);
                    titf.game.seconds++;
                    titf.f.game.muteSounds();
                    titf.f.game.updateHUD(titf.game.seconds);
                    if(titf.game.seconds % 15 == 0) {
                        titf.f.player.addScore(5);
                    }
                }
            }, 1000 );
        },
        end: function() {
            titf.player.e.destroy();
            titf.settings.objectSpawn = false;
            titf.settings.enemySpawn = false;
            titf.settings.bossSpawn = false;
            titf.f.game.clearStage();
            Crafty.stop();
            jQuery('#game-over').addClass('dead');
        }
    };

    titf.game.start();
});
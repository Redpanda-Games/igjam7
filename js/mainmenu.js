var $character = jQuery('#maincharacter');
var i = 1;
var bottom = '';
var left = '';

$character.animateSprite({
    fps: 24,
    animations: {
        fall: [0, 1]
    },
    loop: true
});

$character.animate({
    bottom: '-=1050'
}, 3000, "linear", function() {
    animateCharacter(i);
    $character.animateSprite('fps', 12);
});

function animateCharacter(i) {
    if(i % 2 == 0) {
        bottom = '+=50';
    } else {
        bottom = '-=50';
    }
    i++;
    $character.animate({
        bottom: bottom
    }, 750, "linear", function() {
        animateCharacter(i);
    });
}

jQuery('.ajax').on('click', function () {
    var $this = jQuery(this);
    var href = $this.attr('href');
    var id = $this.attr('data-id');
    jQuery('#ajax-holder').load(href + ' #stage');
    jQuery('body').attr('id', id.toLowerCase());
    return false;
});

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

if(getCookie('audioMuted')) {
    jQuery('#background-music').remove();
}
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
var itemPath = 'http://titf.tkwitkowski.de/img/credits/';
var itemType = '.png';
var items = Array(
    'bender',
    'face',
    'fluffy',
    'ironman_boss',
    'ironman_enemy',
    'maincharacter',
    'panda_boss',
    'pony_boss',
    'truck'
);
var i = 0;
var topDestroy = 600 + jQuery(document).height();

var oneSecondTimer = setInterval( function(){
    spawnItem(i);
    i++;
}, 1000 );

function spawnItem(i) {
    var rand = Math.floor( (Math.random() * items.length) );
    if(rand >= items.length) {
        rand--;
    }
    var itemURL = itemPath + items[rand] + itemType;

    var itemHTML = '<img src="'+itemURL+'" class="spawnedItem" id="item-'+i+'" />';
    var $item = jQuery( itemHTML );
    $item.css( 'left', function() {
        var left = Math.floor( (Math.random() * (jQuery(document).width() - $item.width()) ) );
        if(left >= (jQuery(document).width() - $item.width())) {
            left = (jQuery(document).width() - $item.width());
        }
        return left;
    } );
    jQuery('#spawnedItems').append( $item );
    $item.animate({
        bottom: "+="+topDestroy
    }, 5000, function() {
        $item.remove();
    });
}
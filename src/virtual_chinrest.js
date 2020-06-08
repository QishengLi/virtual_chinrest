/**
 * Created by Qisheng Li in 11/2019.
 */

//Store all the configuration data in variable 'data'
var data = {"dataType":"configurationData"};
data["ballPosition"] = [];
data["fullScreenClicked"] = false;
data["sliderClicked"] = false;

(function ( distanceSetup, $ ) {

    distanceSetup.round = function(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    };

    distanceSetup.px2mm = function(cardImageWidth) {
        const cardWidth = 85.6; //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
        var px2mm = cardImageWidth/cardWidth;
        data["px2mm"] = distanceSetup.round(px2mm, 2);
        return px2mm; 
    };

}( window.distanceSetup = window.distanceSetup || {}, jQuery));


function getCardWidth() {
    var cardWidthPx = $('#card').width();
    data["cardWidthPx"] = distanceSetup.round(cardWidthPx,2);
    return cardWidthPx
}


function configureBlindSpot() {

    drawBall();
    $('#page-size').remove();
    $('#blind-spot').css({'visibility':'visible'});
    $(document).on('keydown', recordPosition);

};


$( function() {
    $( "#slider" ).slider({value:"50"});
} );

$(document).ready(function() {
    $( "#slider" ).on("slide", function (event, ui) {
        var cardWidth = ui.value + "%";
        $("#card").css({"width":cardWidth});
    });

    $('#slider').on('slidechange', function(event, ui){
        data["sliderClicked"] = true;
    });

});


//=============================
//Ball Animation

function drawBall(pos=180){
    // pos: define where the fixation square should be.
    var mySVG = SVG("svgDiv");
    const cardWidthPx = getCardWidth()
    const rectX = distanceSetup.px2mm(cardWidthPx)*pos;
    
    const ballX = rectX*0.6 // define where the ball is
    var ball = mySVG.circle(30).move(ballX, 50).fill("#f00"); 
    window.ball = ball;
    var square = mySVG.rect(30, 30).move(Math.min(rectX - 50, 950), 50); //square position
    data["squarePosition"] = distanceSetup.round(square.cx(),2);
    data['rectX'] = rectX
    data['ballX'] = ballX
};


function animateBall(){
    ball.animate(7000).during(
        function(pos){
            moveX = - pos*data['ballX'];
            window.moveX = moveX;
            moveY = 0;
            ball.attr({transform:"translate("+moveX+","+moveY+")"});

        }
    ).loop(true, false).
    after(function(){
        animateBall();
    });

    //disbale the button after clicked once.
    $("#start").attr("disabled", true);
};

function recordPosition(event, angle=13.5) {
    // angle: define horizontal blind spot entry point position in degrees.
    if (event.keyCode == '32') { //Press "Space"

        data["ballPosition"].push(distanceSetup.round((ball.cx() + moveX),2));
        var sum = data["ballPosition"].reduce((a, b) => a + b, 0);
        var ballPosLen = data["ballPosition"].length;
        data["avgBallPos"] = distanceSetup.round(sum/ballPosLen, 2);
        var ball_sqr_distance = (data["squarePosition"]-data["avgBallPos"])/data["px2mm"];
        var viewDistance = ball_sqr_distance/Math.radians(angle)
        console.log(Math.radians(angle))
        data["viewDistance_mm"] = distanceSetup.round(viewDistance, 2);

        //counter and stop
        var counter = Number($('#click').text());
        counter = counter - 1;
        $('#click').text(Math.max(counter, 0));
        if (counter <= 0) {

            ball.stop();

            // Disable space key
            $('html').bind('keydown', function(e)
            {
               if (e.keyCode == 32) {return false;}
            });

            // Display data
            $('#info').css("visibility", "visible");
            $('#info-h').append(data["viewDistance_mm"]/10)



            // You can then DO SOMETHING HERE TO PROCEED TO YOUR NEXT STEPS OF THE EXPERIMENT. For example, add a button to go to the next page.        
            return;
        }

        ball.stop();
        animateBall();
    }
}

//===================
//Helper Functions
function fullScreen(){
    doc = document.documentElement;
    if(doc.requestFullScreen) {
        doc.requestFullScreen();
    } else if(doc.mozRequestFullScreen) {
        doc.mozRequestFullScreen();
    } else if(doc.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)) {
        doc.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
};

function registerClick(){
    data["fullScreenClicked"] = true;
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};


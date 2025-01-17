// Store frame for motion functions
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;


function contentTrigger(selection) {
    newContent(selection);
}
function navigateBack(){
    var contentList = document.getElementsByClassName('container');
    contentList[contentList.length - 1].remove();
    contentList[contentList.length - 1].classList.remove('hidden');
    document.getElementById('back').classList.remove('selected');
}

// Setup Leap loop with frame callback function
var controllerOptions = { enableGestures: true };

// to use HMD mode:
// controllerOptions.optimizeHMD = true;

Leap.loop(controllerOptions, function (frame) {
    if (paused) {
        return; // Skip this update
    }
if(document.getElementById('home-content').classList.contains('hidden')){
    document.getElementById('back').classList.remove('hidden');
}else{
    document.getElementById('back').classList.add('hidden');

}
    // Display Frame object data
    var frameOutput = document.getElementById("frameData");

    var frameString = "Frame ID: " + frame.id + "<br />"
        + "Timestamp: " + frame.timestamp + " &micro;s<br />"
        + "Hands: " + frame.hands.length + "<br />"
        + "Fingers: " + frame.fingers.length + "<br />"
        + "Tools: " + frame.tools.length + "<br />"
        + "Gestures: " + frame.gestures.length + "<br />";

    // Frame motion factors
    if (previousFrame && previousFrame.valid) {
        var translation = frame.translation(previousFrame);
        frameString += "Translation: " + vectorToString(translation) + " mm <br />";

        var rotationAxis = frame.rotationAxis(previousFrame);
        var rotationAngle = frame.rotationAngle(previousFrame);
        frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
        frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

        var scaleFactor = frame.scaleFactor(previousFrame);
        frameString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
    }
    frameOutput.innerHTML = "<div style='width:300px; float:left; padding:5px'>" + frameString + "</div>";

    // Display Hand object data
    var handOutput = document.getElementById("handData");
    var handString = "";
    if (frame.hands.length > 0) {

        for (var i = 0; i < frame.hands.length; i++) {
            var hand = frame.hands[i];
            handString += "<div style='width:300px; float:left; padding:5px'>";
            handString += "Hand ID: " + hand.id + "<br />";
            handString += "Type: " + hand.type + " hand" + "<br />";
            handString += "Direction: " + vectorToString(hand.direction, 2) + "<br />";
            handString += "Palm position: " + vectorToString(hand.palmPosition) + " mm<br />";
            handString += "Grab strength: " + hand.grabStrength + "<br />";
            handString += "Pinch strength: " + hand.pinchStrength + "<br />";
            handString += "Confidence: " + hand.confidence + "<br />";
            handString += "Arm direction: " + vectorToString(hand.arm.direction()) + "<br />";
            handString += "Arm center: " + vectorToString(hand.arm.center()) + "<br />";
            handString += "Arm up vector: " + vectorToString(hand.arm.basis[1]) + "<br />";

            /*if(hand.type == 'left'){
              document.getElementById(hand.type).style.display = "block";
            }
            if(hand.type == 'right'){
              document.getElementById(hand.type).style.display = "block";
            }*/


            // Hand motion factors
            if (previousFrame && previousFrame.valid) {
                var translation = hand.translation(previousFrame);
                handString += "Translation: " + vectorToString(translation) + " mm<br />";

                var rotationAxis = hand.rotationAxis(previousFrame, 2);
                var rotationAngle = hand.rotationAngle(previousFrame);
                handString += "Rotation axis: " + vectorToString(rotationAxis) + "<br />";
                handString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

                var scaleFactor = hand.scaleFactor(previousFrame);
                handString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
            }

            // IDs of pointables associated with this hand
            if (hand.pointables.length > 0) {
                var fingerIds = [];
                for (var j = 0; j < hand.pointables.length; j++) {
                    var pointable = hand.pointables[j];
                    fingerIds.push(pointable.id);
                }
                if (fingerIds.length > 0) {
                    handString += "Fingers IDs: " + fingerIds.join(", ") + "<br />";
                }
            }

            handString += "</div>";
        }
    }
    else {
        handString += "No hands";
        document.getElementById('cursor').classList.add('hidden');
        var stopSelecting = document.getElementsByClassName('option');
        for (var i = 0; i < stopSelecting.length; i++) {
            stopSelecting[i].classList.remove("selected");
        }

    }
    handOutput.innerHTML = handString;

    // Display Pointable (finger and tool) object data
    var pointableOutput = document.getElementById("pointableData");
    var pointableString = "";
    if (frame.pointables.length > 0) {
        var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];
        var boneTypeMap = ["Metacarpal", "Proximal phalanx", "Intermediate phalanx", "Distal phalanx"];
        for (var i = 0; i < frame.pointables.length; i++) {
            var pointable = frame.pointables[i];

            pointableString += "<div style='width:250px; float:left; padding:5px'>";

            if (pointable.tool) {
                pointableString += "Pointable ID: " + pointable.id + "<br />";
                pointableString += "Classified as a tool <br />";
                pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
                pointableString += "Width: " + pointable.width.toFixed(1) + " mm<br />";
                pointableString += "Direction: " + vectorToString(pointable.direction, 2) + "<br />";
                pointableString += "Tip position: " + vectorToString(pointable.tipPosition) + " mm<br />"
                pointableString += "</div>";
            }
            else {
                pointableString += "Pointable ID: " + pointable.id + "<br />";
                pointableString += "Type: " + fingerTypeMap[pointable.type] + "<br />";
                pointableString += "Belongs to hand with ID: " + pointable.handId + "<br />";
                pointableString += "Classified as a finger<br />";
                pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
                pointableString += "Width: " + pointable.width.toFixed(1) + " mm<br />";
                pointableString += "Direction: " + vectorToString(pointable.direction, 2) + "<br />";
                pointableString += "Extended?: " + pointable.extended + "<br />";
                pointable.bones.forEach(function (bone) {
                    pointableString += boneTypeMap[bone.type] + " bone <br />";
                    pointableString += "Center: " + vectorToString(bone.center()) + "<br />";
                    pointableString += "Direction: " + vectorToString(bone.direction()) + "<br />";
                    pointableString += "Up vector: " + vectorToString(bone.basis[1]) + "<br />";
                });
                pointableString += "Tip position: " + vectorToString(pointable.tipPosition) + " mm<br />";
                pointableString += "</div>";

            }
            ////////////////////////////////////////////////////////////
            if (fingerTypeMap[pointable.type] == "Index finger") {

                var pointer = document.getElementById("cursor");
                pointer.classList.remove('hidden');
                var indexX = (pointable.tipPosition[0] * 5) + window.innerWidth / 2;

                var indexY = (pointable.tipPosition[1] * 5) - window.innerHeight*1.1;
                var indexZ = pointable.tipPosition[2];

                document.getElementById("cursor").style.transform = "translate(" + indexX + "px," + -indexY + "px) ";
                var test = document.getElementsByClassName('option');
                //console.log(test);
                for (var i = 0; i < test.length; i++) {
                    var optionRect = test[i].getBoundingClientRect();
                    if ((indexX > optionRect.left) && (indexX < optionRect.right)&&(indexY*-1 > optionRect.top)&&(indexY*-1 < optionRect.bottom)) {
                        var selected = document.getElementById(test[i].id);
                        selected.classList.add('selected');
                        var id = test[i].id;
                        selected.onanimationend = function (event) {
                            contentTrigger(selected.id);
                        }
                    } else {
                        var notselected = document.getElementById(test[i].id);
                        notselected.classList.remove('selected');
                    }
                }
                var back = document.getElementById('back');
                var backRect = back.getBoundingClientRect();
                
                if((indexX > backRect.left)&&(indexX < backRect.right)&&(indexY*-1 > backRect.top)&&(indexY*-1 < backRect.bottom)){
                    back.classList.add('selected');
                    back.onanimationend = function (event){
                        navigateBack();
                    }
                    
                }else{
                    back.classList.remove('selected');
                }
            }
            ///////////////////////////////////////////////////////////////////
        }
    }
    else {


        pointableString += "<div>No pointables</div>";


    }
    pointableOutput.innerHTML = pointableString;

    // Display Gesture object data
    var gestureOutput = document.getElementById("gestureData");
    var gestureString = "";
    if (frame.gestures.length > 0) {
        if (pauseOnGesture) {
            togglePause();
        }
        for (var i = 0; i < frame.gestures.length; i++) {
            var gesture = frame.gestures[i];


            gestureString += "Gesture ID: " + gesture.id + ", "
                + "type: " + gesture.type + ", "
                + "state: " + gesture.state + ", "
                + "hand IDs: " + gesture.handIds.join(", ") + ", "
                + "pointable IDs: " + gesture.pointableIds.join(", ") + ", "
                + "duration: " + gesture.duration + " &micro;s, ";

            switch (gesture.type) {
                case "circle":
                    gestureString += "center: " + vectorToString(gesture.center) + " mm, "
                        + "normal: " + vectorToString(gesture.normal, 2) + ", "
                        + "radius: " + gesture.radius.toFixed(1) + " mm, "
                        + "progress: " + gesture.progress.toFixed(2) + " rotations";
                    break;
                case "swipe":
                    gestureString += "start position: " + vectorToString(gesture.startPosition) + " mm, "
                        + "current position: " + vectorToString(gesture.position) + " mm, "
                        + "direction: " + vectorToString(gesture.direction, 1) + ", "
                        + "speed: " + gesture.speed.toFixed(1) + " mm/s";
                    break;
                case "screenTap":
                case "keyTap":
                    gestureString += "position: " + vectorToString(gesture.position) + " mm";
                    break;
                default:
                    gestureString += "unkown gesture type";
            }
            gestureString += "<br />";
            ////////////////////////////////////////////

            ////////////////////////////////////////////////
        }
    }
    else {
        gestureString += "No gestures";
    }
    gestureOutput.innerHTML = gestureString;

    // Store frame for motion functions
    previousFrame = frame;
})

function vectorToString(vector, digits) {
    if (typeof digits === "undefined") {
        digits = 1;
    }
    return "(" + vector[0].toFixed(digits) + ", "
        + vector[1].toFixed(digits) + ", "
        + vector[2].toFixed(digits) + ")";
}

function togglePause() {
    paused = !paused;

    if (paused) {
        document.getElementById("pause").innerText = "Resume";
    } else {
        document.getElementById("pause").innerText = "Pause";
    }
}

function pauseForGestures() {
    if (document.getElementById("pauseOnGesture").checked) {
        pauseOnGesture = true;
    } else {
        pauseOnGesture = false;
    }
}
// Store frame for motion functions
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

var b_paths = false;
var b_paths2 = false;
var chosenPath = "";

function pathContent() {
  b_paths = false;
  var modal = document.createElement("DIV");
  modal.id = "paths-1";
  document.getElementById("content").appendChild(modal);
  paths(false);
}
function path2Content(id,pn) {
  b_paths2 = false;
  var modal = document.createElement("DIV");
  modal.id = id;
  modal.classList.add("path-details");
  document.getElementById("content").appendChild(modal);
  paths(true,pn);
}
var pathNumber;
var pH = 10;
var pW = 10;
// Setup Leap loop with frame callback function
var controllerOptions = { enableGestures: true };

// to use HMD mode:
// controllerOptions.optimizeHMD = true;

Leap.loop(controllerOptions, function (frame) {
  if (paused) {
    return; // Skip this update
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
    document.getElementById("left").style.display = "none";
    document.getElementById("right").style.display = "none";
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
        var pointer = document.getElementById("index");
        document.getElementById("index").style.display = "block";
        var indexX = (pointable.tipPosition[0] * 5) + window.innerWidth / 2;

        var indexY = (pointable.tipPosition[1] * 5) - window.innerHeight;
        //console.log(indexY);
        var indexZ = pointable.tipPosition[2];

        document.getElementById("index").style.transform = "translate(" + indexX + "px," + -indexY + "px) ";

        var facilities = document.getElementById("facilities");
        var paths = document.getElementById("paths");
        var pRect = paths.getBoundingClientRect();
        var pathboxes = document.getElementsByClassName("cycle-route");
        if ((indexX > pRect.left) && (indexX < pRect.right)) {
          if (!document.getElementById("paths-1")) {
            pH += 0.1;
            pW += 0.1;
            pointer.style.height = pH + "px";
            pointer.style.width = pW + "px";
            if (pH >= 20) {
              pH = 10;
              pW = 10;
              pointer.style.height = pH + "px";
              pointer.style.width = pW + "px";
              b_paths = true;
            }
          }


        }else if (pathboxes.length > 0) {
          for (var i = 0; i < pathboxes.length; i++) {
            var item = pathboxes[i];
            var itemBR = item.getBoundingClientRect();
            var newY = -indexY;
            
            if ((indexX > itemBR.left) && (indexX < itemBR.right) && (newY > itemBR.y) && (newY < itemBR.y + itemBR.height)) {
              if ((!document.getElementById(item.id + '-modal'))&&(document.getElementsByClassName('path-details').length <1)) {
                //console.log(item.id);
                pH += 0.1;
                pW += 0.1;
                pointer.style.height = pH + "px";
                pointer.style.width = pW + "px";
                if (pH >= 20) {
                  pH = 10;
                  pW = 10;
                  pointer.style.height = pH + "px";
                  pointer.style.width = pW + "px";
                  chosenPath = item.id;
                  b_paths2 = true;
                }
              }
            }
          }
        } else {
          var pointer = document.getElementById("index");
          pH = 10;
          pW = 10;
          pointer.style.height = pH + "px";
          pointer.style.width = pW + "px";
        }
        
        

        if ((b_paths) && (!document.getElementById("paths-1"))) {
          pathContent();
        }
        if ((b_paths2) && (!document.getElementById(chosenPath + '-modal'))) {
          pathNumber = document.getElementById(chosenPath).classList[1];
            
            pathNumber = pathNumber.split("-")[1];
           
          path2Content(chosenPath + '-modal',pathNumber);
        }
      }
      ///////////////////////////////////////////////////////////////////
    }
  }
  else {


    pointableString += "<div>No pointables</div>";
    document.getElementById("index").style.display = "none";
    document.getElementById("index").style.transform = "translate(" + window.innerWidth / 2 + "px," + 0 + "px) ";

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
      if ((gesture.type == "circle") && (document.getElementById("content").lastElementChild.id != "paths") && (document.getElementById("content").lastElementChild.id != "facilities")) {
        // console.log(gesture.duration/1000000);
        var gestureTime = gesture.duration / 1000000;
        // needs fixing
        
        var lst;
        if (gestureTime > 1.5) {
          lst = document.getElementById("content").lastElementChild;
          document.getElementById(lst.id).remove();
        }
      }
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
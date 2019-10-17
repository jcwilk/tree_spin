var game;
var gameOptions = {
  //this is how many pixels tall/wide the narrower of the two dimensions will be, according to the game
  //the canvas size will scale according to the window size but it will always seem this wide to the game logic
  //the long dimension will adjust automatically, see pixelsTall below
  pixelsWide: 800,
  bottomMargin: 100,
  newNodeTweenDuration: 500
}

var pixelsTall = gameOptions.pixelsWide;
var zoomLevel = .75;
var focusLevel = 2;

var getZoomOffset = function() {
  if (focusLevel > 0)
    return (pixelsTall - gameOptions.pixelsWide / 2) / 2 + gameOptions.pixelsWide / 2;
  else
    return 3 * gameOptions.pixelsWide / 4;
}

var rotator = {
  // takes in coords as if x was the long dimension, meaning it rotates if not
  landscape: function(x, y) {
    if (isRotated) {
      return new Phaser.Geom.Point(gameOptions.pixelsWide - y, x);
    } else {
      return new Phaser.Geom.Point(x,y);
    }
  },
  landscapeAngle: function(angle) {
    if (isRotated) {
      return angle - .25;
    } else {
      return angle;
    }
  },
  circleStretch: function(x,y) {
    if (isRotated) {
      if (y > gameOptions.pixelsWide / 2) {
        //TODO - clean this shit up lol worked the first try though yolo
        y = gameOptions.pixelsWide / 2 + (y - gameOptions.pixelsWide / 2) * (pixelsTall - gameOptions.pixelsWide / 2)  / (gameOptions.pixelsWide / 2);
      }
    } else {
      if (x > gameOptions.pixelsWide / 2) {
        //TODO - clean this shit up lol worked the first try though yolo
        x = gameOptions.pixelsWide / 2 + (x - gameOptions.pixelsWide / 2) * (pixelsTall - gameOptions.pixelsWide / 2)  / (gameOptions.pixelsWide / 2);
      }
    }
    return new Phaser.Geom.Point(x,y);
  },

  goDown: function() {
    var nextNode;
    if (isRotated) {
      nextNode = focusedNode.getChild();
    } else {
      nextNode = focusedNode.getOlderSister();
    }
    if (nextNode) {
      nextNode.select();
    }
  },
  goUp: function() {
    var nextNode;
    if (isRotated) {
      nextNode = focusedNode.getParent();
    } else {
      nextNode = focusedNode.getYoungerSister();
    }
    if (nextNode) {
      nextNode.select();
    }
  },
  goLeft: function() {
    var nextNode;
    if (isRotated) {
      nextNode = focusedNode.getOlderSister();
    } else {
      nextNode = focusedNode.getParent();
    }
    if (nextNode) {
      nextNode.select();
    }
  },
  goRight: function() {
    var nextNode;
    if (isRotated) {
      nextNode = focusedNode.getYoungerSister();
    } else {
      nextNode = focusedNode.getChild();
    }
    if (nextNode) {
      nextNode.select();
    }
  },
  getControlsCenter: function() {
    var offset = 100;
    if (isRotated) {
      return new Phaser.Geom.Point(offset, pixelsTall-offset-gameOptions.bottomMargin);
    } else {
      return new Phaser.Geom.Point(pixelsTall-offset, gameOptions.pixelsWide-offset-gameOptions.bottomMargin);
    }
  },
  setControlsUpstream: function(color) {
    if (isRotated) {
      upArrow.fillColor = color;
    } else {
      leftArrow.fillColor = color;
    }
  },
  setControlsDownstream: function(color) {
    if (isRotated) {
      downArrow.fillColor = color;
    } else {
      rightArrow.fillColor = color;
    }
  },
  setControlsOlder: function(color) {
    if (isRotated) {
      leftArrow.fillColor = color;
    } else {
      downArrow.fillColor = color;
    }
  },
  setControlsYounger: function(color) {
    if (isRotated) {
      rightArrow.fillColor = color;
    } else {
      upArrow.fillColor = color;
    }
  },
  getFocusControlsLess: function() {
    var offset = 100;

    if (isRotated) {
      return new Phaser.Geom.Point(gameOptions.pixelsWide - offset*2, pixelsTall - offset - gameOptions.bottomMargin);
    } else {
      return new Phaser.Geom.Point(pixelsTall - offset, offset*2);
    }
  },
  getFocusControlsMore: function() {
    var offset = 100;

    if (isRotated) {
      return new Phaser.Geom.Point(gameOptions.pixelsWide - offset, pixelsTall - offset - gameOptions.bottomMargin);
    } else {
      return new Phaser.Geom.Point(pixelsTall - offset, offset);
    }
  },
  getReplyCenter: function() {
    var offset = 100;

    if (isRotated) {
      return new Phaser.Geom.Point(gameOptions.pixelsWide / 2, pixelsTall - offset - gameOptions.bottomMargin);
    } else {
      return new Phaser.Geom.Point(pixelsTall - offset, gameOptions.pixelsWide / 2 - gameOptions.bottomMargin/2);
    }
  }
  // xyReverse: function(x, y) {
  //   return new Phaser.Geom.Point();
  // }
}

var gameUtils = {}
// gameUtils.getTilePosition = function(col, row) {
//   var posX = gameOptions.tileSize * col;
//   var posY = gameOptions.tileSize * row;
//   return new Phaser.Geom.Point(posX, posY);
// }


class bootGame extends Phaser.Scene {
  constructor() {
    super("BootGame");
  }

  preload() {
    // this.load.spritesheet("tree_tiles", "images/vines.png", {
    //   frameWidth: gameOptions.tileSize,
    //   frameHeight: gameOptions.tileSize
    // })
  }

  create() {
    console.log("game is booting...");
    this.scene.start("PlayGame");
  }
}

var rootNode;
var focusCircle;
var plusButton;
var focusedNode;

var downKey;
var upKey;
var leftKey;
var rightKey;

var upArrow;
var downArrow;
var leftArrow;
var rightArrow;

var focusMoreArrow;
var focusLessArrow;

class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }

  create() {
    //NB - this needs to use this function or else this happens https://phaser.discourse.group/t/problem-with-setinteractive-function/3261/13
    //game.scale.setGameSize(gameConfig.width, gameConfig.height);

    // var tilePosition = gameUtils.getTilePosition(0,0);
    // this.add.image(tilePosition.x, tilePosition.y, "tree_tiles", treeSprite.downNub).setOrigin(0,0);
    // this.add.image(tilePosition.x, tilePosition.y, "tree_tiles", treeSprite.leaf).setOrigin(0,0);
    rootNode = makeNode(this);
    // rootNode.addReply(makeNode(this));
    // rootNode.replies[0].addReply(makeNode(this));
    // rootNode.replies[0].addReply(makeNode(this));
    // rootNode.replies[0].addReply(makeNode(this));
    // rootNode.replies[0].replies[2].addReply(makeNode(this));
    // rootNode.replies[0].replies[2].addReply(makeNode(this));
    // rootNode.replies[0].addReply(makeNode(this));
    // rootNode.addReply(makeNode(this));
    // rootNode.replies[1].addReply(makeNode(this));
    // rootNode.replies[1].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].replies[1].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].replies[1].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].replies[1].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    // rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    // rootNode.addReply(makeNode(this));

    // rootNode.replies.push(makeNode());
    // rootNode.replies.push(makeNode());
    // rootNode.replies.push(makeNode());
    // rootNode.replies.push(makeNode());

    var focusPoint = rotator.landscape(getZoomOffset(), gameOptions.pixelsWide / 2);
    focusCircle = this.add.circle(focusPoint.x, focusPoint.y, 40, 0x0000ff);
    focusCircle.alpha = 0;



    this.graphics = this.add.graphics({lineStyle: { width: 2, color: 0x00ffff }}); //{fillStyle: { color: 0x00ff00 },
    this.circles = [];
    this.lines = [];

    var plus = [5,0,10,0,10,5,15,5,15,10,10,10,10,15,5,15,5,10,0,10,0,5,5,5];
    plusButton = this.add.polygon(0, 0, plus, 0xff00ff);
    plusButton.setScale(8);
    plusButton.setInteractive();
    //plusButton.alpha = 0;
    // plusButton.on('pointerdown', function(){
    //   startRecord(function(audio){
    //     var reply = makeNode(scene);
    //     reply.audio = audio;
    //     rootNode.addReply(reply);
    //     rootNode.storeAngles();
    //     angleOffset = -obj.angle;
    //     zoomLevel = depthToZoom(obj.getDepth());
    //     rootNode.placeGraphics();
    //     updateControlsBlocked();
    //   });

    var arrow = [0,0,20,0,10,10];
    var arrowScale = 4;
    upArrow = this.add.polygon(0,0,arrow, 0xff0000);
    upArrow.rotation = Math.PI;
    upArrow.setScale(arrowScale);
    upArrow.setInteractive().on('pointerdown',rotator.goUp);
    downArrow = this.add.polygon(0,0,arrow, 0xff0000);
    downArrow.setScale(arrowScale);
    downArrow.setInteractive().on('pointerdown',rotator.goDown);
    leftArrow = this.add.polygon(0,0,arrow, 0xff0000);
    leftArrow.rotation = Math.PI/2;
    leftArrow.setScale(arrowScale);
    leftArrow.setInteractive().on('pointerdown',rotator.goLeft);
    rightArrow = this.add.polygon(0,0,arrow, 0xff0000);
    rightArrow.rotation = 3*Math.PI/2;
    rightArrow.setScale(arrowScale);
    rightArrow.setInteractive().on('pointerdown',rotator.goRight);
    repositionControls();

    var focusArrowScale = 6;
    focusMoreArrow = this.add.polygon(0,0,arrow, 0x0000ff);
    focusMoreArrow.rotation = Math.PI;
    focusMoreArrow.setScale(focusArrowScale);
    focusMoreArrow.setInteractive().on('pointerdown', function() {
      if (focusLevel < 2) {
        console.log('up');
        focusLevel++;
        rootNode.placeGraphics();
        updateFocusControlsBlocked();
        repositionFocus();
      }
    });
    focusLessArrow = this.add.polygon(0,0,arrow, 0x0000ff);
    focusLessArrow.setScale(focusArrowScale);
    focusLessArrow.setInteractive().on('pointerdown', function() {
      if (focusLevel > 0) {
        console.log('down');
        focusLevel--;
        rootNode.placeGraphics();
        updateFocusControlsBlocked();
        repositionFocus();
      }
    });
    updateFocusControlsBlocked();
    repositionFocusControls();
    repositionAddReply();

    rootNode.storeAngles();
    rootNode.placeGraphics();

    rootNode.select();

    downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
  }

  update() {
    if (focusedNode) {
      if (Phaser.Input.Keyboard.JustDown(leftKey)) {
        rotator.goLeft();
      } else if (Phaser.Input.Keyboard.JustDown(rightKey)) {
        rotator.goRight();
      } else if (Phaser.Input.Keyboard.JustDown(downKey)) {
        rotator.goDown();
      } else if (Phaser.Input.Keyboard.JustDown(upKey)) {
        rotator.goUp();
      }
      if (focusCircle.tween && focusCircle.tween.state == Phaser.Tweens.ACTIVE) {
        focusCircle.setPosition(focusCircle.fromNode.circle.x + (focusedNode.circle.x - focusCircle.fromNode.circle.x) * focusCircle.tween.progress, focusCircle.fromNode.circle.y + (focusedNode.circle.y - focusCircle.fromNode.circle.y) * focusCircle.tween.progress);
      }
    }

    this.graphics.clear();
    for(var i=0; i < this.lines.length; i++) {
      this.graphics.strokeLineShape(this.lines[i]);
    }
    // for(var i=0; i < this.circles.length; i++) {
    //   this.graphics.fillCircleShape(this.circles[i]);
    // }
    // if (isRotated) {
    //   this.graphics.fillCircleShape(new Phaser.Geom.Circle(gameOptions.pixelsWide/2, pixelsTall-25, 25));
    // } else {
    //   this.graphics.fillCircleShape(new Phaser.Geom.Circle(pixelsTall-25, gameOptions.pixelsWide/2, 25));
    // }
  }
}

var gameConfig = {
  width:  pixelsTall,
  height: gameOptions.pixelsWide,
  scene: [bootGame, playGame]//,
  //backgroundColor: 0x00ffff
}

var angleOffset = 0;

function makeNode(scene) {
  var obj = {
    circle: null,
    line: null,
    path: [],
    angle: null, // 0 to 1
    replies: []
  };

  obj.isLeaf = function() {
    return obj.replies.length < 1;
  }

  obj.getDepth = function() {
    return obj.path.length;
  }

  obj.getNodeFromPath = function(path) {
    if (path.length < 1) {
      return obj;
    } else if (path[0] < obj.replies.length) {
      return obj.replies[path[0]].getNodeFromPath(path.slice(1));
    } else {
      return false;
    }
  }

  obj.getParent = function() {
    if (obj.isRoot()) {
      return false;
    } else {
      return rootNode.getNodeFromPath(obj.path.slice(0,obj.path.length-1));
    }
  }

  obj.getChild = function() {
    if (obj.isLeaf()) {
      return false;
    } else {
      return obj.replies[Math.floor(obj.replies.length/2)];
    }
  }

  obj.getYoungerSister = function() {
    if (obj.isRoot()) {
      return false;
    } else {
      var myIndex = obj.path[obj.path.length-1];
      if (myIndex < 1) {
        return false;
      } else {
        var parent = obj.getParent();
        return parent.replies[myIndex - 1];
      }
    }
  }

  obj.getOlderSister = function() {
    if (obj.isRoot()) {
      return false;
    } else {
      var myIndex = obj.path[obj.path.length-1];
      var parent = obj.getParent();
      if (myIndex > parent.replies.length - 2) {
        return false;
      } else {
        return parent.replies[myIndex + 1];
      }
    }
  }

  obj.addReply = function(node) {
    node.depth = obj.depth+1;
    node.path = obj.path.slice(0);
    node.path.push(obj.replies.length);
    obj.replies.push(node);
  }

  //TODO - this badly needs some caching
  obj.subtreeCount = function() {
    var count = 1;
    for(var i = 0; i < obj.replies.length; i++)
      count+= obj.replies[i].subtreeCount();
    return count;
  }

  obj.select = function() {
    if (obj.audio) {
      obj.audio.play();
    }

    obj.focus();
  }

  obj.focus = function() {
    angleOffset = -obj.angle;
    zoomLevel = depthToZoom(obj.getDepth());
    var lastFocused = focusedNode;
    focusedNode = obj;

    rootNode.placeGraphics();
    updateControlsBlocked();

    if (focusCircle.tween) {
      focusCircle.tween.stop(1);
    }
    focusCircle.alpha = 0;
    if (!obj.isRoot()) {
      focusCircle.fromNode = lastFocused;
      focusCircle.tween = scene.tweens.add({
        targets: focusCircle,
        alpha: 1,
        duration: gameOptions.newNodeTweenDuration
      }).setCallback('onComplete', function() {
        focusCircle.setPosition(focusedNode.circle.x, focusedNode.circle.y);
      }, {});
    }

    plusButton.removeListener('pointerdown');
    plusButton.on('pointerdown', function(){
      startRecord(function(audio){
        var reply = makeNode(scene);
        reply.audio = audio;
        obj.addReply(reply);
        rootNode.storeAngles();
        reply.select();
        //angleOffset = -obj.angle;
        //zoomLevel = depthToZoom(obj.getDepth());
        //rootNode.placeGraphics();
        //updateControlsBlocked();
      });
      plusButton.removeListener('pointerup');
      plusButton.on('pointerup', function(){
        console.log('pointerup');
        stopRecord();
      });
    });
  }

  var setCircle = function(x,y,r) {
    if (!obj.circle) {
      obj.circle = scene.add.circle(x, y, r, 0x00ff00);
      scene.circles.push(obj.circle);

      obj.circle.setInteractive().on('pointerdown', obj.focus);
    } else {
      scene.tweens.add({
        targets: obj.circle,
        x: x,
        y: y,
        r: r,
        duration: gameOptions.newNodeTweenDuration
      })
    }
  }

  var setLine = function(parentX, parentY, x, y, oldParentX, oldParentY) {
    // var toLine = new Phaser.Geom.Line(parentX, parentY, x, y);
    // var toPoint = toLine.getPoint(.5);
    if (!obj.line) {
      obj.line = new Phaser.Geom.Line(oldParentX, oldParentY, x, y);
      scene.lines.push(obj.line);
      scene.tweens.add({
        targets: obj.line,
        x1: parentX,
        y1: parentY,
        duration: gameOptions.newNodeTweenDuration
      })
    } else {
      scene.tweens.add({
        targets: obj.line,
        x1: parentX,
        y1: parentY,
        x2: x,
        y2: y,
        duration: gameOptions.newNodeTweenDuration
      });
    }
  }

  obj.isRoot = function() {
    return obj.getDepth() < 1;
  }

  // Basically recalculates where all the branches should be, do this after the tree changes
  obj.storeAngles = function(lowerAngle, angleRange) {
    lowerAngle = lowerAngle || .5;
    angleRange = angleRange || 1

    if (!obj.isRoot()) {
      obj.angle = lowerAngle + angleRange/2;
    }
    var myCount = obj.subtreeCount();
    var totalSpanned = 0;
    for(var i = 0; i < obj.replies.length; i++) {
      var thisSpanned = angleRange * obj.replies[i].subtreeCount() / (myCount-1);
      obj.replies[i].storeAngles(lowerAngle + totalSpanned, thisSpanned);
      totalSpanned+= thisSpanned;
    }
  }

  var depthToOffset = function(depth) {
    return 1 - 1 / Math.pow(depth+1,zoomLevel);
  }

  var depthToZoom = function(depth) {
    if (depth < 1)
      depth = 1;
    var offset = .5;
    return Math.log(1 / (1 - offset)) / Math.log(depth+1);
  }

  var skewAngleAwayTowardsFocus = function(angle) {
    //return angle;
    angle = ((angle % 1) + 1) % 1;
    if (angle > .5) {
      return Math.sqrt((angle - .5) * 2) / 2 + .5;
    }
    else {
      return .5 - Math.sqrt((.5 - angle) * 2) / 2;
    }
  }

  // Basically recalculates where all the branches should be, do this after the tree changes
  obj.placeGraphics = function(parentX, parentY, oldParentX, oldParentY) {
    var x, y;

    if (obj.isRoot()) {
      x = gameOptions.pixelsWide / 2;
      y = x;
      setCircle(x, y, 40);
    } else {
      var avgAngle = (obj.angle + angleOffset) % 1;

      if (focusLevel > 1)
        avgAngle = skewAngleAwayTowardsFocus(avgAngle);

      avgAngle = avgAngle - rotator.landscapeAngle(0);
      var offsetMultiplier = depthToOffset(obj.getDepth()); //TODO - this needs some more love
      x = (Math.cos(avgAngle * 2 * Math.PI) * offsetMultiplier + 1) * gameOptions.pixelsWide / 2;
      y = (Math.sin(avgAngle * 2 * Math.PI) * offsetMultiplier + 1) * gameOptions.pixelsWide / 2;

      if (focusLevel > 0) {
        var stretched = rotator.circleStretch(x,y);
        x = stretched.x;
        y = stretched.y;
      }

      var size = 1/(obj.getDepth()+1)*40;
      setCircle(x,y,size);
      setLine(parentX, parentY, x, y, oldParentX, oldParentY);
    }
    for(var i = 0; i < obj.replies.length; i++) {
      obj.replies[i].placeGraphics(x, y, obj.circle.x, obj.circle.y);
    }
  }

  return obj
}

window.onload = function() {
  game = new Phaser.Game(gameConfig);
  window.focus();
  resizeGame();
  window.addEventListener("resize",resizeGame);
}

function repositionControls() {
  var controlsCenter = rotator.getControlsCenter();

  var offset = 70;

  leftArrow.setPosition(controlsCenter.x - offset, controlsCenter.y);
  rightArrow.setPosition(controlsCenter.x + offset, controlsCenter.y);
  upArrow.setPosition(controlsCenter.x, controlsCenter.y - offset);
  downArrow.setPosition(controlsCenter.x, controlsCenter.y + offset);
}

function repositionFocusControls() {
  var less = rotator.getFocusControlsLess();
  var more = rotator.getFocusControlsMore();
  focusLessArrow.setPosition(less.x, less.y);
  focusMoreArrow.setPosition(more.x, more.y);
}

function updateControlsBlocked() {
  if (focusedNode.isRoot())
    rotator.setControlsUpstream(0xff0000);
  else
    rotator.setControlsUpstream(0x00ffff);

  if (focusedNode.getChild())
    rotator.setControlsDownstream(0x00ffff);
  else
    rotator.setControlsDownstream(0xff0000);

  if (focusedNode.getOlderSister())
    rotator.setControlsOlder(0x00ff00);
  else
    rotator.setControlsOlder(0xff0000);

  if (focusedNode.getYoungerSister())
    rotator.setControlsYounger(0x00ff00);
  else
    rotator.setControlsYounger(0xff0000);
}

function updateFocusControlsBlocked() {
  if (focusLevel >= 2) {
    focusMoreArrow.fillColor = 0xff0000;
    focusLessArrow.fillColor = 0x0000ff;
  }
  else if (focusLevel <= 0) {
    focusMoreArrow.fillColor = 0x0000ff;
    focusLessArrow.fillColor = 0xff0000;
  } else {
    focusMoreArrow.fillColor = 0x0000ff;
    focusLessArrow.fillColor = 0x0000ff;
  }
}

function repositionFocus() {
  if (focusCircle) {
    var focusPoint = rotator.landscape(getZoomOffset(), gameOptions.pixelsWide / 2);
    focusCircle.setPosition(focusPoint.x, focusPoint.y);
  }
}

function repositionAddReply() {
  if (plusButton) {
    var replyPoint = rotator.getReplyCenter();
    plusButton.setPosition(replyPoint.x, replyPoint.y);
  }
}

// var rec;
// var audio;
// navigator.mediaDevices.getUserMedia({audio:true})
// 	.then(stream => {
// 		rec = new MediaRecorder(stream);
// 		rec.ondataavailable = e => {
// 			audioChunks.push(e.data);
// 			if (rec.state == "inactive"){
//         //var blob = new Blob(audioChunks,{type:'audio/x-mpeg-3'});
//         var audioBlob = new Blob(audioChunks);
//         var audioUrl = URL.createObjectURL(audioBlob);
//         console.log('ya')
//         audio = new Audio(audioUrl);
//         // recordedAudio.src = URL.createObjectURL(blob);
//         // recordedAudio.controls=true;
//         // recordedAudio.autoplay=true;
//         // audioDownload.href = recordedAudio.src;
//         // audioDownload.download = 'mp3';
//         // audioDownload.innerHTML = 'download';
//      }
// 		}
// 	})
// 	.catch(e=>console.log(e));

var mediaRecorder;
function startRecord(onComplete) {
  // audioChunks = [];
  // rec.start();
  // console.log('start')
  var doRecording = function() {
    mediaRecorder.start();
    console.log(mediaRecorder.state);
    console.log("recorder started");
    var chunks = [];

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
    mediaRecorder.onstop = function(e) {
      console.log('stop');
      var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      var audioURL = window.URL.createObjectURL(blob);
      onComplete(new Audio(audioURL));
    }
  }

  if (mediaRecorder) {
    //debugger;
    doRecording();
    //debugger;
  } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia (
      // constraints - only audio needed for this app
      {
         audio: true
      })

      // Success callback
      .then(function(stream) {
        mediaRecorder = new MediaRecorder(stream);
        doRecording();
      })

      // Error callback
      .catch(function(err) {
         console.log('The following getUserMedia error occured: ' + err);
      }
    );
  } else {
    console.log('getUserMedia not supported on your browser!');
  }
}

function stopRecord() {
  mediaRecorder.stop();
  console.log(mediaRecorder.state);
  console.log("recorder stopped");
}

// var recorder;
// var audio;
// async function testRecord() {
//   recorder = await recordAudio();
//   recorder.start();
//
//   const audio = await recorder.stop();
// }
//
// async function testRecordStop() {
//   audio = await recorder.stop();
// }


var isRotated = false; //true when in portrait mode
function resizeGame() {
  var canvas = document.querySelector("canvas");
  var marginHor = 0;
  var marginVert = 0;
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var windowRatio = windowWidth / windowHeight;
  const minRatio = 1.5;

  //portrait
  if (windowWidth < windowHeight) {
    if (windowWidth * minRatio > windowHeight) {
      marginHor = (windowWidth - windowHeight / minRatio) / 2;
      windowWidth = windowWidth - marginHor*2;
      windowRatio = 1/minRatio;
    }

    pixelsTall = Math.floor(gameOptions.pixelsWide / windowRatio);
    game.scale.setGameSize(gameOptions.pixelsWide, pixelsTall);
    isRotated = true;
  } else { //landscape
    if (windowHeight * minRatio > windowWidth) {
      marginVert = (windowHeight - windowWidth / minRatio) / 2;
      windowHeight = windowHeight - marginVert*2;
      windowRatio = minRatio;
    }

    pixelsTall = Math.floor(gameOptions.pixelsWide * windowRatio);
    game.scale.setGameSize(pixelsTall, gameOptions.pixelsWide);
    isRotated = false;
  }

  // https://phaser.discourse.group/t/am-i-using-setgamesize-wrong-not-working-as-expected/3890/4
  // so simple! wish i found this sooner...
  // .....NOPE! Spoke too soon, this does some weird zoomed in shit
  //game.scale.displaySize.resize(windowWidth, windowHeight);

  canvas.style.width = windowWidth+"px";
  canvas.style.height = windowHeight+"px";
  console.log(marginVert+','+marginHor);
  // canvas.style['margin-top'] = marginVert+"px";
  // canvas.style['margin-bottom'] = marginVert+"px";
  // canvas.style['margin-left'] = marginHor+"px";
  // canvas.style['margin-right'] = marginHor+"px";

  game.scale.setGameSize(game.scale.gameSize.width, game.scale.gameSize.height);

  // if we ever do physics then this will be needed too
  //game.physics.world.setBounds(0, 0, windowWidth, windowHeight);


  if (rootNode) {
    repositionControls();
    repositionFocusControls();
    repositionAddReply();
    updateFocusControlsBlocked();

    rootNode.placeGraphics();
    repositionFocus();
  }
}

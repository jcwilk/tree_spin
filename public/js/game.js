var game;
var gameOptions = {
  //this is how many pixels tall/wide the narrower of the two dimensions will be, according to the game
  //the canvas size will scale according to the window size but it will always seem this wide to the game logic
  //the long dimension will adjust automatically, see pixelsTall below
  pixelsWide: 800,
  newNodeTweenDuration: 500
}

var pixelsTall = gameOptions.pixelsWide;
var zoomLevel = .75;

var getZoomOffset = function() {
  return (pixelsTall - gameOptions.pixelsWide / 2) / 2 + gameOptions.pixelsWide / 2;
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
    rootNode.addReply(makeNode(this));
    rootNode.replies[0].addReply(makeNode(this));
    rootNode.replies[0].addReply(makeNode(this));
    rootNode.replies[0].addReply(makeNode(this));
    rootNode.replies[0].replies[2].addReply(makeNode(this));
    rootNode.replies[0].replies[2].addReply(makeNode(this));
    rootNode.replies[0].addReply(makeNode(this));
    rootNode.addReply(makeNode(this));
    rootNode.replies[1].addReply(makeNode(this));
    rootNode.replies[1].addReply(makeNode(this));
    rootNode.replies[1].replies[1].addReply(makeNode(this));
    rootNode.replies[1].replies[1].addReply(makeNode(this));
    rootNode.replies[1].replies[1].replies[1].addReply(makeNode(this));
    rootNode.replies[1].replies[1].replies[1].addReply(makeNode(this));
    rootNode.replies[1].replies[1].replies[1].addReply(makeNode(this));
    rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    rootNode.replies[1].replies[1].replies[0].addReply(makeNode(this));
    rootNode.addReply(makeNode(this));

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
    plusButton = this.add.polygon(focusCircle.x+30, focusCircle.y-15, plus, 0xff00ff);
    plusButton.setScale(2);
    plusButton.setInteractive();
    plusButton.alpha = 0;

    rootNode.storeAngles();
    rootNode.placeGraphics();
  }

  update() {
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
    depth: 0,
    angle: null, // 0 to 1
    replies: []
  }

  obj.addReply = function(node) {
    node.depth = obj.depth+1;
    obj.replies.push(node);
  }

  //TODO - this badly needs some caching
  obj.subtreeCount = function() {
    var count = 1;
    for(var i = 0; i < obj.replies.length; i++)
      count+= obj.replies[i].subtreeCount();
    return count;
  }

  var setCircle = function(x,y,r) {
    if (!obj.circle) {
      obj.circle = scene.add.circle(x, y, r, 0x00ff00);
      scene.circles.push(obj.circle);

      obj.circle.setInteractive().on('pointerdown', function(){
        console.log('click');
        angleOffset = -obj.angle;
        zoomLevel = depthToZoom(obj.depth);
        rootNode.placeGraphics();
        focusCircle.alpha = 0;
        plusButton.alpha = 0;
        scene.tweens.add({
          targets: [focusCircle,plusButton],
          alpha: 1,
          duration: gameOptions.newNodeTweenDuration
        })

        plusButton.removeListener('pointerdown');
        plusButton.on('pointerdown', function(){
          obj.addReply(makeNode(scene));
          rootNode.storeAngles();
          angleOffset = -obj.angle;
          zoomLevel = depthToZoom(obj.depth);
          rootNode.placeGraphics();
        });
      });
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
    return !(obj.depth > 0); //if undefined, assume root
  }

  // Basically recalculates where all the branches should be, do this after the tree changes
  obj.storeAngles = function(lowerAngle, angleRange) {
    lowerAngle = lowerAngle || 0;
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
    return 1 - 1 / Math.pow(depth,zoomLevel);
  }

  var depthToZoom = function(depth) {
    var offset = .5;
    return Math.log(1 / (1 - offset)) / Math.log(depth);
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
      setCircle(x, y, 30);
    } else {
      var avgAngle = (obj.angle + angleOffset) % 1;
      avgAngle = skewAngleAwayTowardsFocus(avgAngle);
      avgAngle = avgAngle - rotator.landscapeAngle(0);
      var offsetMultiplier = depthToOffset(obj.depth); //TODO - this needs some more love
      x = (Math.cos(avgAngle * 2 * Math.PI) * offsetMultiplier + 1) * gameOptions.pixelsWide / 2;
      y = (Math.sin(avgAngle * 2 * Math.PI) * offsetMultiplier + 1) * gameOptions.pixelsWide / 2;

      var stretched = rotator.circleStretch(x,y);

      x = stretched.x;
      y = stretched.y;

      var size = 1/(obj.depth)*40;
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

function repositionFocus() {
  if (focusCircle) {
    var focusPoint = rotator.landscape(getZoomOffset(), gameOptions.pixelsWide / 2);
    focusCircle.setPosition(focusPoint.x, focusPoint.y);
    plusButton.setPosition(focusCircle.x+30, focusCircle.y-15);
  }
}

var isRotated = false; //true when in portrait mode
function resizeGame() {
  var canvas = document.querySelector("canvas");
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var windowRatio = windowWidth / windowHeight;

  if (windowWidth < windowHeight) {
    pixelsTall = Math.floor(gameOptions.pixelsWide / windowRatio);
    game.scale.setGameSize(gameOptions.pixelsWide, pixelsTall);
  }
  else {
    pixelsTall = Math.floor(gameOptions.pixelsWide * windowRatio);
    game.scale.setGameSize(pixelsTall, gameOptions.pixelsWide);
  }

  //NB - setting it to 100% makes it look ugly mid-resize
  canvas.style.width = windowWidth+"px";
  canvas.style.height = windowHeight+"px";

  // This does nothing, but appears to be required to avoid a bug where Objects
  // can't be clicked on until rotating the screen
  game.scale.setGameSize(game.scale.gameSize.width, game.scale.gameSize.height);

  if (windowRatio <= 1) {
    if (!isRotated) {
      //rotate everything counter-clockwise into portrait
      // for(var i = 0; i < game.scene.scenes[1].circles.length; i++) {
      //   var c = game.scene.scenes[1].circles[i];
      //   game.scene.scenes[1].tweens.add({
      //     targets: c,
      //     x: gameOptions.pixelsWide - c.y,
      //     y: c.x,
      //     duration: 100
      //   })
      // }
      isRotated = true;
    }
  }
  else {
    if (isRotated) {
      // rotate everything clockwise into landscape
      // for(var i = 0; i < game.scene.scenes[1].circles.length; i++) {
      //   var c = game.scene.scenes[1].circles[i];
      //   game.scene.scenes[1].tweens.add({
      //     targets: c,
      //     x: c.y,
      //     y: gameOptions.pixelsWide - c.x,
      //     duration: 100
      //   })
      // }
      isRotated = false;
    }
  }

  if (rootNode) {
    rootNode.placeGraphics();
    repositionFocus();
  }
}

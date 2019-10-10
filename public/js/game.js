var game;
var gameOptions = {
  //this is how many pixels tall/wide the narrower of the two dimensions will be, according to the game
  //the canvas size will scale according to the window size but it will always seem this wide to the game logic
  //the long dimension will adjust automatically, see pixelsTall below
  pixelsWide: 800,
  newNodeTweenDuration: 100
}

var pixelsTall = gameOptions.pixelsWide;

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

    this.graphics = this.add.graphics({lineStyle: { width: 2, color: 0x00ffff }}); //{fillStyle: { color: 0x00ff00 },
    this.circles = [];
    this.lines = [];

    rootNode.storeAngles();
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
        obj.addReply(makeNode(scene));
        rootNode.storeAngles();
      })
    } else {
      scene.tweens.add({
        targets: obj.circle,
        x: x,
        y: y,
        radius: r,
        duration: gameOptions.newNodeTweenDuration
      })
    }
  }

  var setLine = function(parentX, parentY, x, y, oldParentX, oldParentY) {
    var toLine = new Phaser.Geom.Line(parentX, parentY, x, y);
    var toPoint = toLine.getPoint(.5);
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
    lowerAngle = lowerAngle || 0
    angleRange = angleRange || 1

    if (!obj.isRoot()) {
      obj.angle = lowerAngle + angleRange/2;
    }
    var myCount = obj.subtreeCount();
    var totalSpanned = 0;
    for(var i = 0; i < obj.replies.length; i++) {
      var thisSpanned = angleRange * obj.replies[i].subtreeCount() / myCount;
      obj.replies[i].storeAngles(lowerAngle + totalSpanned, thisSpanned);
      totalSpanned+= thisSpanned;
    }

    if (obj.isRoot()) {
      obj.placeGraphics();
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
      var avgAngle = obj.angle;
      var offsetMultiplier = 1 - 1 / Math.pow(obj.depth,.75); //TODO - this needs some more love
      x = (Math.cos(avgAngle * 2 * Math.PI) * offsetMultiplier + 1) * gameOptions.pixelsWide / 2;
      y = (Math.sin(avgAngle * 2 * Math.PI) * offsetMultiplier + 1) * gameOptions.pixelsWide / 2;
      setCircle(x,y,15);
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
  window.focus()
  resizeGame();
  window.addEventListener("resize",resizeGame);
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

  // if (game.scene.scenes.length > 1) {
  //   if (windowRatio <= 1) {
  //     if (!isRotated) {
  //       //rotate everything counter-clockwise into portrait
  //       for(var i = 0; i < game.scene.scenes[1].circles.length; i++) {
  //         var c = game.scene.scenes[1].circles[i];
  //         game.scene.scenes[1].tweens.add({
  //           targets: c,
  //           x: gameOptions.pixelsWide - c.y,
  //           y: c.x,
  //           duration: 100
  //         })
  //       }
  //       isRotated = true;
  //     }
  //   }
  //   else {
  //     if (isRotated) {
  //       // rotate everything clockwise into landscape
  //       for(var i = 0; i < game.scene.scenes[1].circles.length; i++) {
  //         var c = game.scene.scenes[1].circles[i];
  //         game.scene.scenes[1].tweens.add({
  //           targets: c,
  //           x: c.y,
  //           y: gameOptions.pixelsWide - c.x,
  //           duration: 100
  //         })
  //       }
  //       isRotated = false;
  //     }
  //   }
  // }
}

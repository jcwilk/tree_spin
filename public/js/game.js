var game;
var gameOptions = {
  //this is how many pixels tall/wide the narrower of the two dimensions will be, according to the game
  //the canvas size will scale according to the window size but it will always seem this wide to the game logic
  //the long dimension will adjust automatically, see pixelsTall below
  pixelsWide: 768
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
    rootNode = makeNode();
    // rootNode.replies.push(makeNode());
    // rootNode.replies.push(makeNode());
    // rootNode.replies.push(makeNode());
    // rootNode.replies.push(makeNode());

    this.graphics = this.add.graphics({fillStyle: { color: 0x00ff00 } });
    this.circles = [];
    this.circles.push(new Phaser.Geom.Circle(100, 100, 25));
    this.circles.push(new Phaser.Geom.Circle(700, 100, 50));
    this.circles.push(new Phaser.Geom.Circle(700, 700, 75));
    this.circles.push(new Phaser.Geom.Circle(100, 700, 100));
  }

  update() {
    this.graphics.clear();
    for(var i=0; i < this.circles.length; i++) {
      this.graphics.fillCircleShape(this.circles[i]);
    }
    if (isRotated) {
      this.graphics.fillCircleShape(new Phaser.Geom.Circle(gameOptions.pixelsWide/2, pixelsTall-25, 25));
    } else {
      this.graphics.fillCircleShape(new Phaser.Geom.Circle(pixelsTall-25, gameOptions.pixelsWide/2, 25));
    }
  }
}

var gameConfig = {
  width:  pixelsTall,
  height: gameOptions.pixelsWide,
  scene: [bootGame, playGame]//,
  //backgroundColor: 0x00ffff
}

function makeNode() {
  var obj = {
    flower: null,
    replies: [],
    segments: [],
    nub: null,
    leaf: null,
    sprite: null
  }

  //builds node, flower, and segments leading up to it
  obj.buildNodeSprites = function(col, row, minWidth, frameIndex, scene) {

  }

  return obj
}

window.onload = function() {
  game = new Phaser.Game(gameConfig);
  window.focus()
  resizeGame();
  window.addEventListener("resize",resizeGame);
}

var isRotated = false;
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

  if (windowRatio <= 1) {
    if (!isRotated) {
      //TODO - rotate everything downwards into portrait mode
    }
    isRotated = true;
  }
  else {
    if (isRotated) {
      //TODO - unrotate everything back to portrait
    }
    isRotated = false;
  }
}

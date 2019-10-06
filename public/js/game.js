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
    var graphics = this.add.graphics({fillStyle: { color: 0x00ff00 } });

    var circle = new Phaser.Geom.Circle(100, 100, 25);

    graphics.fillCircleShape(circle);

    circle.setTo(700, 100, 50);
    graphics.fillCircleShape(circle);

    circle.setTo(700, 700, 75);
    graphics.fillCircleShape(circle);

    circle.setTo(100, 700, 100);
    graphics.fillCircleShape(circle);
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

  var gameWidth = Math.floor(gameOptions.pixelsWide / windowRatio);
  pixelsTall = gameWidth;

  game.scale.setGameSize(gameOptions.pixelsWide, pixelsTall);

   canvas.style.width = "100%";
   canvas.style.height = "100%";

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

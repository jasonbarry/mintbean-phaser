import Phaser from 'phaser'
// import logoImg from './assets/logo.png'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
}

let player
let trumps
let poops
let platforms
let cursors
let score = 0
let gameOver = false
let scoreText

const game = new Phaser.Game(config)

function preload() {
  this.load.image('hell', 'assets/hell.png')
  this.load.image('ground', 'assets/platform.png')
  this.load.image('trump', 'assets/trump-96.png')
  this.load.image('poop', 'assets/poop-96.png')
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })
}

function create() {
  //  A simple background for our game
  this.add.image(400, 300, 'hell')

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup()

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 150, 'ground').setScale(2).refreshBody()

  //  Now let's create some ledges
  platforms.create(400, 600, 'ground').setScale(2).refreshBody()

  // The player and its settings
  player = this.physics.add.sprite(100, 50, 'dude')

  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2)
  player.setCollideWorldBounds(true)

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  })

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20,
  })

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  })

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys()

  //  Some trumps to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  trumps = this.physics.add.group({
    key: 'trump',
    repeat: 11,
    setXY: { x: 12, y: 300, stepX: 70 },
  })

  trumps.children.iterate(function (trump) {
    //  Give each trump a slightly different bounce
    trump.setScale(0.25)
    trump.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    trump.setVelocityX(Phaser.Math.FloatBetween(100, 200))
  })

  poops = this.physics.add.group()

  this.input.keyboard.on('keydown-SPACE', (e) => {
    const poop = poops.create(player.x, player.y, 'poop')
    poop.setScale(0.5)
  })

  //  The score
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })

  //  Collide the player and the trumps with the platforms
  this.physics.add.collider(player, platforms)
  this.physics.add.collider(trumps, platforms)
  // this.physics.add.collider(poops, platforms)

  //  Checks to see if the player overlaps with any of the trumps, if he does call the collectStar function
  this.physics.add.overlap(poops, trumps, collectStar, null, this)

  // this.physics.add.collider(player, poops, hitBomb, null, this)
}

function update() {
  if (gameOver) {
    return
  }

  // trumps.setVelocityX(100)
  trumps.children.iterate(function (trump) {
    //  Give each trump a slightly different bounce
    if (trump.x < 0) {
      trump.setVelocityX(Phaser.Math.FloatBetween(100, 200))
    } else if (trump.x > 800) {
      trump.setVelocityX(Phaser.Math.FloatBetween(-100, -200))
    }
  })

  if (cursors.left.isDown) {
    player.setVelocityX(-160)

    player.anims.play('left', true)
  } else if (cursors.right.isDown) {
    player.setVelocityX(160)

    player.anims.play('right', true)
  } else {
    player.setVelocityX(0)

    player.anims.play('turn')
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330)
  }
}

function collectStar(poop, trump) {
  poop.disableBody(true, true)
  trump.disableBody(true, true)

  //  Add and update the score
  score += 10
  scoreText.setText('Score: ' + score)

  if (trumps.countActive(true) === 0) {
    //  A new batch of trumps to collect
    trumps.children.iterate(function (trump) {
      trump.enableBody(true, trump.x, 300, true, true)
      trump.setVelocityX(Phaser.Math.FloatBetween(100, 200))
      trump.setScale(0.25)
    })
  }
}

// function hitBomb(player, poop) {
//   this.physics.pause()
// 
//   player.setTint(0xff0000)
// 
//   player.anims.play('turn')
// 
//   gameOver = true
// }

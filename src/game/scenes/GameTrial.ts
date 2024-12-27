import {Scene} from "phaser";
import {EventBus} from "../EventBus";
import TilemapLayer = Phaser.Tilemaps.TilemapLayer;
import TiledObject = Phaser.Types.Tilemaps.TiledObject;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export class GameTrial extends Scene {
  override input: Phaser.Input.InputPlugin;
  override physics: Phaser.Physics.Arcade.ArcadePhysics;
  cameraControl: Phaser.Cameras.Controls.FixedKeyControl;
  player: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  characters: Phaser.Physics.Arcade.Sprite[] = [];

  constructor() {
    super('GameTrial');
  }

  preload() {
    this.load.image("tiles", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilemaps/tuxemon-town.json");

    this.load.atlas("atlas", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.png", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.json");
  }

  create() {
    console.log('GameTrial scene created');
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
    if (!tileset) {
      throw new Error('Tileset not loaded');
    }

    const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createLayer("World", tileset, 0, 0) as TilemapLayer;
    const aboveLayer = map.createLayer("Above Player", tileset, 0, 0) as TilemapLayer;

    worldLayer.setCollisionByProperty({ collides: true });
    aboveLayer.setDepth(10);

    const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point") as TiledObject;

    this.player = this.physics.add
      .sprite(spawnPoint.x as number, spawnPoint.y as number, "atlas", "misa-front")
      .setSize(30, 40)
      .setOffset(0, 24);

    this.characters = ['character1', 'character2', 'character3'].map((key, index) => {
      return this.physics.add.sprite(spawnPoint.x as number, spawnPoint.y as number, key).setSize(30, 40)
        .setOffset(0, 24);
    });

    this.physics.add.collider(this.player, worldLayer);
    this.characters.forEach(character => this.physics.add.collider(character, worldLayer));

    const anims = this.anims;
    anims.create({
      key: "misa-left-walk",
      frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-right-walk",
      frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-front-walk",
      frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-back-walk",
      frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });


    // Default camera
    const camera = this.cameras.main;
    camera.startFollow(this.player);
    this.cursors = this.input?.keyboard?.createCursorKeys() as CursorKeys;
    if (!this.cursors) {
      throw new Error('Cursors not loaded');
    }
    // this.cameraControl = new Phaser.Cameras.Controls.FixedKeyControl({
    //   camera: camera,
    //   left: this.cursors.left,
    //   right: this.cursors.right,
    //   up: this.cursors.up,
    //   down: this.cursors.down,
    //   speed: 0.5
    // });

    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.add
      .text(16, 16, "Arrow keys to scroll", {
        font: "18px monospace",
        color: "#ffffff",
        padding: { x: 20, y: 10 },
        backgroundColor: "#000000"
      })
      .setScrollFactor(0);

    this.add
      .text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
        font: "18px monospace",
        color: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setDepth(30);

    // Debug graphics
    this.input?.keyboard?.once("keydown-D", (event: any) => {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);
      worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
      });
    });

    EventBus.emit('current-scene-ready', this);
  }

  override update(time: number, delta: number) {
    // this.cameraControl.update(delta);

    const speed = 175;
    const prevVelocity = this.player?.body?.velocity.clone();

    // Stop any previous movement from the last frame
    this.player?.setVelocityX(0)
    this.player?.setVelocityY(0)

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player?.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player?.setVelocityX(speed);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player?.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that this.player? can't move faster along a diagonal
    this.player?.body?.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      this.player?.anims.play("misa-left-walk", true);
    } else if (this.cursors.right.isDown) {
      this.player?.anims.play("misa-right-walk", true);
    } else if (this.cursors.up.isDown) {
      this.player?.anims.play("misa-back-walk", true);
    } else if (this.cursors.down.isDown) {
      this.player?.anims.play("misa-front-walk", true);
    } else {
      this.player?.anims.stop();

      // If we were moving, pick and idle frame to use
      // if (prevVelocity) {
        if (prevVelocity && prevVelocity.x < 0) this.player?.setTexture("atlas", "misa-left");
        else if (prevVelocity && prevVelocity.x > 0) this.player?.setTexture("atlas", "misa-right");
        else if (prevVelocity && prevVelocity.y < 0) this.player?.setTexture("atlas", "misa-back");
        else if (prevVelocity && prevVelocity.y > 0) this.player?.setTexture("atlas", "misa-front");
      // }
    }
  }

  selectCharacter(index: number) {
    this.player = this.characters[index];
  }

  changeScene() {
    this.scene.start('GameOver');
  }
}

import {Scene} from "phaser";
import {EventBus} from "../EventBus";
import TilemapLayer = Phaser.Tilemaps.TilemapLayer;
import TiledObject = Phaser.Types.Tilemaps.TiledObject;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export enum Direction {
  UP='up',
  DOWN='down',
  LEFT='left',
  RIGHT='right'
}

export class GameTrial extends Scene {
  override input: Phaser.Input.InputPlugin;
  override physics: Phaser.Physics.Arcade.ArcadePhysics;
  cameraControl: Phaser.Cameras.Controls.FixedKeyControl;
  player: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  characters: Phaser.Physics.Arcade.Sprite[] = [];

  selectedCharacter: Phaser.Physics.Arcade.Sprite;
  selectedCharacterType: 'player' | 'character' = 'player';

  playerAnimationKeyMap: Record<Direction, string> = {
    [Direction.UP]: 'misa-back-walk',
    [Direction.DOWN]: 'misa-front-walk',
    [Direction.LEFT]: 'misa-left-walk',
    [Direction.RIGHT]: 'misa-right-walk',
  }

  characterAnimationKeyMap: Record<Direction, string> = {
    [Direction.UP]: 'character-walk-back',
    [Direction.DOWN]: 'character-walk-front',
    [Direction.LEFT]: 'character-walk-left',
    [Direction.RIGHT]: 'character-walk-right',
  }

  constructor() {
    super('GameTrial');
  }

  preload() {
    this.load.image("tiles", "assets/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/tuxemon-town.json");

    this.load.atlas("player_atlas", "assets/atlas/atlas.png", "assets/atlas/atlas.json");
    this.load.atlas("character_atlas", "/assets/sprites.png", "/assets/sprites.json");
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
      .sprite(spawnPoint.x as number, spawnPoint.y as number, "player_atlas", "misa-front")
      .setSize(30, 40)
      .setOffset(0, 24);

    this.characters = ['character1', 'character2', 'character3'].map((key, index) => {
      return this.physics.add.sprite(spawnPoint.x as number, spawnPoint.y as number, 'character_atlas', 'base_idle-s_idle-s.0')
        .setSize(30, 40)
        .setOffset(0, 24);
    });

    this.physics.add.collider(this.player, worldLayer);
    this.characters.forEach(character => this.physics.add.collider(character, worldLayer));

    const anims = this.anims;
    anims.create({
      key: "misa-left-walk",
      frames: anims.generateFrameNames("player_atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-right-walk",
      frames: anims.generateFrameNames("player_atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-front-walk",
      frames: anims.generateFrameNames("player_atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-back-walk",
      frames: anims.generateFrameNames("player_atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });

    anims.create({
      key: "character-walk-back",
      frames: anims.generateFrameNames("character_atlas", { prefix: "base_walk-s_walk-s.", start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "character-walk-front",
      frames: anims.generateFrameNames("character_atlas", { prefix: "base_walk-n_walk-n.", start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "character-walk-left",
      frames: anims.generateFrameNames("character_atlas", { prefix: "base_walk-ne_walk-ne.", start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "character-walk-right",
      frames: anims.generateFrameNames("character_atlas", { prefix: "base_walk-se_walk-se.", start: 0, end: 7 }),
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

    this.selectedCharacter = this.player;

    EventBus.emit('current-scene-ready', this);
  }

  override update(time: number, delta: number) {
    // this.cameraControl.update(delta);

    const speed = 175;
    const prevVelocity = this.player?.body?.velocity.clone();

    // Stop any previous movement from the last frame
    this.selectedCharacter?.setVelocityX(0);
    this.selectedCharacter?.setVelocityY(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.selectedCharacter?.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.selectedCharacter?.setVelocityX(speed);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.selectedCharacter.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.selectedCharacter?.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that this.selectedCharacter? can't move faster along a diagonal
    this.selectedCharacter?.body?.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    const animationMap = this.selectedCharacterType === 'player' ? this.playerAnimationKeyMap : this.characterAnimationKeyMap;
    if (this.cursors.left.isDown) {
      this.selectedCharacter?.anims.play(animationMap[Direction.LEFT], true);
    } else if (this.cursors.right.isDown) {
      this.selectedCharacter?.anims.play(animationMap[Direction.RIGHT], true);
    } else if (this.cursors.up.isDown) {
      this.selectedCharacter?.anims.play(animationMap[Direction.UP], true);
    } else if (this.cursors.down.isDown) {
      this.selectedCharacter?.anims.play(animationMap[Direction.DOWN], true);
    } else {
      this.selectedCharacter?.anims.stop();

      // // If we were moving, pick and idle frame to use
      // // if (prevVelocity) {
      //   if (prevVelocity && prevVelocity.x < 0) this.selectedCharacter?.setTexture("player_atlas", "misa-left");
      //   else if (prevVelocity && prevVelocity.x > 0) this.selectedCharacter?.setTexture("player_atlas", "misa-right");
      //   else if (prevVelocity && prevVelocity.y < 0) this.selectedCharacter?.setTexture("player_atlas", "misa-back");
      //   else if (prevVelocity && prevVelocity.y > 0) this.selectedCharacter?.setTexture("player_atlas", "misa-front");
      // // }
    }
  }

  selectCharacter(index: number) {
    console.log(index, this.characters.length)
    if (index >= 0 && index < this.characters.length) {
      this.selectedCharacter = this.characters[index];
      this.selectedCharacterType = 'character';
    } else {
      this.selectedCharacter = this.player;
      this.selectedCharacterType = 'player';
    }
    this.cameras.main.startFollow(this.selectedCharacter);
    console.log(this.selectedCharacter, this.selectedCharacterType)
  }

  changeScene() {
    this.scene.start('GameOver');
  }
}

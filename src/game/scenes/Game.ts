import {EventBus} from '../EventBus';
import {Scene} from 'phaser';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;
  characters: any[] = [
    { key: 'character1', name: 'Warrior' },
    { key: 'character2', name: 'Mage' },
    { key: 'character3', name: 'Rogue' },
  ];
  gridSize: number;
  gridWidth: number;
  gridHeight: number;

  currentTurn: number;
  selectedCharacter: any;
  isActionCompleted = false;

  constructor() {
    super('Game');
  }


  create(data: any) {

    console.log(data)

    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);

    this.background = this.add.image(512, 384, 'background');
    this.background.setAlpha(0.5);

    // this.gameText = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
    //   fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
    //   stroke: '#000000', strokeThickness: 8,
    //   align: 'center'
    // }).setOrigin(0.5).setDepth(100);

    EventBus.emit('current-scene-ready', this);

    // Grid setup
    this.gridSize = 80;
    this.gridWidth = 10;
    this.gridHeight = 10;

    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        this.add.image(x * this.gridSize + this.gridSize / 2, y * this.gridSize + this.gridSize / 2, 'star');
      }
    }

    // Add characters to the bottom of the screen
    this.characters = data.selectedCharacters.map((key: any, index: number) => {
      const x = (index + 2) * this.gridSize + this.gridSize / 2;
      const y = (this.gridHeight - 1) * this.gridSize + this.gridSize / 2;
      return this.add.image(x, y, key).setInteractive();
    });

    // Initialize turn system
    this.currentTurn = 0;
    this.selectedCharacter = null;

    this.input.on('pointerdown', this.handleGridClick, this);
  }

  handleGridClick(pointer: any) {
    const gridX = Math.floor(pointer.x / this.gridSize);
    const gridY = Math.floor(pointer.y / this.gridSize);
    console.log(gridX, gridY);

    const activeCharacter = this.characters[this.currentTurn];

    if (!this.selectedCharacter) {
      this.selectedCharacter = activeCharacter;
    }

    if (this.selectedCharacter === activeCharacter && !this.isActionCompleted) {
      const currentGridX = Math.floor(activeCharacter.x / this.gridSize);
      const currentGridY = Math.floor(activeCharacter.y / this.gridSize);

      const distanceX = Math.abs(gridX - currentGridX);
      const distanceY = Math.abs(gridY - currentGridY);

      if (distanceX <= 2 && distanceY <= 2) { // Allow movement within 2 tiles in all directions including diagonals
        activeCharacter.x = gridX * this.gridSize + this.gridSize / 2;
        activeCharacter.y = gridY * this.gridSize + this.gridSize / 2;
        this.isActionCompleted = true; // Mark action as completed after moving
      }
    }
  }

  attack() {
    if (this.selectedCharacter) {
      // Simulate an attack (basic logic, should be expanded)
      console.log('Attacking with', this.selectedCharacter.texture.key);

      // End turn
      this.currentTurn = (this.currentTurn + 1) % this.characters.length;
      this.selectedCharacter = null;
    }
  }

  endTurn() {
    this.currentTurn = (this.currentTurn + 1) % this.characters.length;
    this.selectedCharacter = null;
    this.isActionCompleted = false;
  }

  override update() {
    // Game logic (e.g., handling turns, checking win conditions)
    const activeCharacter = this.characters[this.currentTurn];

    // Highlight the current character's turn
    this.characters.forEach((character, index) => {
      character.setAlpha(index === this.currentTurn ? 1 : 0.5);
    });

    // Additional game updates can go here
  }

  changeScene() {
    this.scene.start('GameOver');
  }
}

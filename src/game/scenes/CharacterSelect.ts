import {GameObjects, Scene} from "phaser";
import {EventBus} from "../EventBus";

export class CharacterSelect extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  blob: GameObjects.Sprite;
  selectedCharacters: string[] = [];

  constructor() {
    super('CharacterSelect');
  }

  preload() {
    this.load.setPath('assets');
  }

  create() {

    this.background = this.add.image(512, 384, 'background');
    this.blob = this.add.sprite(100, 100, 'blob');

    this.blob.play({ key: 'down', repeat: -1 });

    this.add.text(400, 50, 'Select Your Characters', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const characters = [
      { key: 'character1', name: 'Warrior' },
      { key: 'character2', name: 'Mage' },
      { key: 'character3', name: 'Rogue' },
    ];

    characters.forEach((character, index) => {
      const x = 200 + index * 200;
      const y = 200;

      // Display character sprite
      // const charSprite =  this.add.sprite(100, 100, 'blob').setInteractive();
      // charSprite.play({ key: 'down', repeat: -1 });

      const charSprite = this.add.image(x, y, character.key).setInteractive();

      // Display character name
      this.add.text(x, y + 100, character.name, {
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5);

      // Add selection functionality
      charSprite.on('pointerdown', () => {
        if (this.selectedCharacters.length < 3 && !this.selectedCharacters.includes(character.key)) {
          this.selectedCharacters.push(character.key);
          charSprite.setTint(0x00ff00); // Highlight selected
        } else if (this.selectedCharacters.includes(character.key)) {
          this.selectedCharacters = this.selectedCharacters.filter(c => c !== character.key);
          charSprite.clearTint(); // Remove highlight
        }
      });
    });

    // Start button
    const startButton = this.add.text(400, 400, 'Start Game', {
      fontSize: '24px',
      color: '#ff0000',
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      if (this.selectedCharacters.length === 3) {
        this.scene.start('Game', { selectedCharacters: this.selectedCharacters });
      } else {
        this.add.text(400, 450, 'Please select 3 characters!', {
          fontSize: '18px',
          color: '#ffffff',
        }).setOrigin(0.5).setAlpha(0).setAlpha(1);
      }
    });


    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('MainMenu');
  }

}

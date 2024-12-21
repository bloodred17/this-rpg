import {GameObjects, Scene} from "phaser";
import {EventBus} from "../EventBus";

export class CharacterSelect extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super('CharacterSelect');
  }

  create() {
    this.background = this.add.image(512, 384, 'background');
    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('MainMenu');
  }

}

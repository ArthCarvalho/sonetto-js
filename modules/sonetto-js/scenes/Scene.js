import { EventDispatcher } from "../core/EventDispatcher";

class Scene extends EventDispatcher {
  constructor() {
    this.isScene = true;
    this.type = 'Scene';
  }

  toJSON(meta) {
    const data = super.toJSON(meta);

    return data;
  }
}

export { Scene };
import CommonStore from './CommonStore';
import ProductionStore from './ProductionStore';
import TabStore from './TabStore';
export class RootStore {
  constructor() {
    this.commonStore      = new CommonStore();
    this.productionStore  = new ProductionStore();
    this.tabStore         = new TabStore();
  }
}

export default function initializeStore() {
  return new RootStore();
}

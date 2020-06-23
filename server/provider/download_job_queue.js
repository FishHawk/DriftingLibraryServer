import events from 'events';

import { OrderStatus } from '../model/order.js';
import download from './download.js';
import factory from './sources.js';

class DownloadJobQueue {
  #isRunning;
  #queue = [];
  #emitter = new events.EventEmitter();

  constructor() {
    this.#emitter.on('run', async () => {
      if (this.#isRunning) return;
      this.#isRunning = true;
      await this.run();
      this.#isRunning = false;
    });
  }

  add(order) {
    order.status = OrderStatus.WAITING;
    order.errorMessage = '';
    order.save();
    this.#queue.push(order);
    this.#emitter.emit('run');
  }

  async run() {
    while (this.#queue.length > 0) {
      const order = this.#queue.shift();
      order.status = OrderStatus.PROCESSING;
      try {
        const source = factory.getSource(order.source);
        await download(source, order.sourceMangaId, order.targetMangaId, order.mode);
        order.status = OrderStatus.COMPLETED;
        order.save();
        console.log('success');
      } catch (error) {
        console.log(error);
        order.status = OrderStatus.ERROR;
        order.errorMessage = error.message;
        order.save();
      }
    }
  }
}

const downloadJobQueue = new DownloadJobQueue();

export default downloadJobQueue;

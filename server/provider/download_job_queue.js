import events from 'events';

import Order from '../model/order.js';
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
    order.status = 'waiting';
    order.save();
    this.#queue.push(order);
    this.#emitter.emit('run');
  }

  async run() {
    while (this.#queue.length > 0) {
      const order = this.#queue.shift();
      order.status = 'processing';
      try {
        const source = factory.getSource(order.source);
        await download.downloadManga(
          source,
          config.libraryDir,
          order.sourceMangaId,
          order.targetMangaId
        );
        order.destroy();
        console.log(`complete: ${order.id}`);
      } catch (error) {
        order.status = 'failed';
        order.save();
        console.log(`fail: ${order.id}`);
      }
    }
  }
}

const downloadJobQueue = new DownloadJobQueue();

export default downloadJobQueue;

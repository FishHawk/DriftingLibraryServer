import { assert } from 'chai';
import express, { Router } from 'express';
import request from 'supertest';

import { ProviderManager } from '../../src/provider/manager';
import { ProviderController } from '../../src/controller/controller.provider';

describe('Controller test: provider', function () {
  const providerManager = new ProviderManager();
  const controller = new ProviderController(providerManager);

  const app = express();
  controller.bind(app);

  const providerId = 'dmzj';

  it('GET /provider/:providerId/search', () => {
    return request(app)
      .get(`/provider/${providerId}/search`)
      .query({ keywords: '劫火之教典', page: 1 })
      .expect(200)
      .then((res) => {
        assert.equal(res.body[0].metadata.title, '劫火之教典');
      });
  });

  it('GET /provider/:providerId/popular', () => {
    return request(app)
      .get(`/provider/${providerId}/popular`)
      .query({ page: 1 })
      .expect(200)
      .then((res) => {
        assert.isArray(res.body);
        assert.isNotEmpty(res.body);
      });
  });

  it('GET /provider/:providerId/latest', () => {
    return request(app)
      .get(`/provider/${providerId}/latest`)
      .query({ page: 1 })
      .expect(200)
      .then((res) => {
        assert.isArray(res.body);
        assert.isNotEmpty(res.body);
      });
  });

  const mangaId: string = '29075';
  const chapterId: string = '62412';

  it('GET /provider/:providerId/manga/:mangaId', () => {
    return request(app)
      .get(`/provider/${providerId}/manga/${mangaId}`)
      .expect(200)
      .then((res) => {
        assert.equal(res.body.id, mangaId);
      });
  });

  it('GET /provider/:providerId/chapter/:mangaId/:chapterId', () => {
    return request(app)
      .get(`/provider/${providerId}/chapter/${mangaId}/${chapterId}`)
      .expect(200)
      .then((res) => {
        assert.isArray(res.body);
        assert.isNotEmpty(res.body);
      });
  });
});

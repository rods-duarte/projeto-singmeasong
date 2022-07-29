import { jest } from '@jest/globals'; //eslint-disable-line
import { Recommendation } from '@prisma/client';
import { recommendationService } from '../../src/services/recommendationsService.js';
import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';
import scenario from '../factories/scenarioFactory.js';
import { conflictError, notFoundError } from '../../src/utils/errorUtils.js';

beforeEach(async () => {
  await scenario.clearRecommendations();
});

describe('recommendation service unit tests', () => {
  describe('get by id tests', () => {
    it('given a valid id should return recommendation', async () => {
      const recommendation: Recommendation = {
        id: 1,
        name: 'name',
        youtubeLink: 'link',
        score: 10,
      };
      jest
        .spyOn(recommendationRepository, 'find')
        .mockResolvedValueOnce(recommendation);

      const response = await recommendationService.getById(recommendation.id);
      expect(response).toBe(recommendation);
    });

    it('given an invalid id should throw not found error', async () => {
      jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null);

      const promise = recommendationService.getById(0);
      expect(promise).rejects.toEqual(notFoundError());
    });
  });
});

afterAll(async () => {
  await scenario.clearRecommendations();
});

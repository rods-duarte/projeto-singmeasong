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

  describe('insert tests', () => {
    it('given a non existing recommendation should call repository', async () => {
      jest
        .spyOn(recommendationRepository, 'findByName')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(recommendationRepository, 'create')
        .mockResolvedValueOnce(null);

      await recommendationService.insert({ name: 'aa', youtubeLink: 'aa' });
      expect(recommendationRepository.create).toBeCalled();
    });

    it('given a existing recommendation should throw conflict error', async () => {
      jest.spyOn(recommendationRepository, 'findByName').mockResolvedValueOnce({
        id: 1,
        name: 'aa',
        score: 1,
        youtubeLink: 'aaa',
      });

      const promise = recommendationService.insert({
        name: 'name',
        youtubeLink: 'link',
      });
      expect(promise).rejects.toEqual(
        conflictError('Recommendations names must be unique')
      );
    });
  });
});

afterAll(async () => {
  await scenario.clearRecommendations();
});

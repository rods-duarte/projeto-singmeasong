import { jest } from '@jest/globals'; //eslint-disable-line
import { Recommendation } from '@prisma/client';
import { recommendationService } from '../../src/services/recommendationsService.js';
import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';
import { conflictError, notFoundError } from '../../src/utils/errorUtils.js';

afterEach(() => {
  jest.clearAllMocks();
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

  describe('get tests', () => {
    it('should call repository', async () => {
      jest
        .spyOn(recommendationRepository, 'findAll')
        .mockImplementationOnce(null);

      await recommendationService.get();
      expect(recommendationRepository.findAll).toBeCalled();
    });
  });

  describe('get random tests', () => {
    it('given a random number < 0.7 should get recommendations with score greater than 10', async () => {
      const recommendation: Recommendation = {
        id: 1,
        name: 'aaa',
        score: 10,
        youtubeLink: 'aaa',
      };
      jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.69);
      jest
        .spyOn(recommendationRepository, 'findAll')
        .mockResolvedValueOnce([recommendation]);

      await recommendationService.getRandom();
      expect(recommendationRepository.findAll).toBeCalledWith({
        score: 10,
        scoreFilter: 'gt',
      });
    });

    it('given no recommendation registered should throw not found error', async () => {
      jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.69);
      jest.spyOn(recommendationRepository, 'findAll').mockResolvedValue([]);

      const promise = recommendationService.getRandom();
      expect(promise).rejects.toEqual(notFoundError());
      expect(recommendationRepository.findAll).toBeCalledTimes(1);
    });

    it('given a random number >= 0.7 should get recommendations with score less then 10', async () => {
      const recommendation: Recommendation = {
        id: 1,
        name: 'aaa',
        score: -5,
        youtubeLink: 'aaa',
      };
      jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.7);
      jest
        .spyOn(recommendationRepository, 'findAll')
        .mockResolvedValueOnce([recommendation]);

      await recommendationService.getRandom();
      expect(recommendationRepository.findAll).toBeCalledWith({
        score: 10,
        scoreFilter: 'lte',
      });
    });
  });

  describe('get top tests', () => {
    it('should call repository', async () => {
      jest
        .spyOn(recommendationRepository, 'getAmountByScore')
        .mockImplementationOnce(null);

      const amount = 10;
      await recommendationService.getTop(amount);
      expect(recommendationRepository.getAmountByScore).toBeCalled();
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

  describe('voting tests', () => {
    it('should upvote', async () => {
      const recommendation: Recommendation = {
        id: 1,
        name: 'name',
        youtubeLink: 'link',
        score: 10,
      };
      jest
        .spyOn(recommendationRepository, 'find')
        .mockResolvedValueOnce(recommendation);
      jest
        .spyOn(recommendationRepository, 'updateScore')
        .mockResolvedValueOnce(null);

      await recommendationService.upvote(recommendation.id);
      expect(recommendationRepository.updateScore).toBeCalledWith(
        recommendation.id,
        'increment'
      );
    });

    it('should downvote', async () => {
      const recommendation: Recommendation = {
        id: 1,
        name: 'name',
        youtubeLink: 'link',
        score: 10,
      };
      jest
        .spyOn(recommendationRepository, 'find')
        .mockResolvedValueOnce(recommendation);
      jest
        .spyOn(recommendationRepository, 'updateScore')
        .mockResolvedValueOnce({
          ...recommendation,
          score: recommendation.score - 1,
        });

      await recommendationService.downvote(recommendation.id);
      expect(recommendationRepository.updateScore).toBeCalledWith(
        recommendation.id,
        'decrement'
      );
    });

    it('given a recommendation with -5 score should be deleted when downvoting', async () => {
      const recommendation: Recommendation = {
        id: 1,
        name: 'name',
        youtubeLink: 'link',
        score: -5,
      };
      jest
        .spyOn(recommendationRepository, 'find')
        .mockResolvedValueOnce(recommendation);
      jest
        .spyOn(recommendationRepository, 'updateScore')
        .mockResolvedValueOnce({
          ...recommendation,
          score: recommendation.score - 1,
        });
      jest
        .spyOn(recommendationRepository, 'remove')
        .mockResolvedValueOnce(null);

      await recommendationService.downvote(recommendation.id);
      expect(recommendationRepository.remove).toBeCalledWith(recommendation.id);
    });
  });
});

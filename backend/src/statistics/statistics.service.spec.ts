import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { getModelToken } from '@nestjs/mongoose';
import { Document } from '../documents/schemas/document.schema';
import { User } from '../users/schemas/user.schema';
import { PlatformStats } from './schemas/platform-stats.schema';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let documentModel: any;
  let userModel: any;
  let platformStatsModel: any;

  const mockStats = {
    totalUploads: 100,
    totalDownloads: 500,
    activeUsers: 50,
  };

  beforeEach(async () => {
    documentModel = jest.fn();
    documentModel.aggregate = jest
      .fn()
      .mockResolvedValue([
        { totalUploads: 100, currentDocumentDownloads: 425 },
      ]);

    userModel = jest.fn();

    platformStatsModel = jest.fn();
    platformStatsModel.findOne = jest.fn().mockResolvedValue(mockStats);
    platformStatsModel.create = jest.fn().mockResolvedValue({
      totalUploads: 0,
      totalDownloads: 0,
      activeUsers: 0,
    });
    platformStatsModel.updateOne = jest
      .fn()
      .mockResolvedValue({ modifiedCount: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: getModelToken(Document.name), useValue: documentModel },
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: getModelToken(PlatformStats.name),
          useValue: platformStatsModel,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlatformStats', () => {
    it('uses current documents for the count and average, and lifetime downloads for the total', async () => {
      const result = await service.getPlatformStats();

      expect(result).toEqual({
        totalUploads: 100,
        totalDownloads: 500,
        activeUsers: 50,
        avgDlPerDoc: 4.25,
      });
      expect(documentModel.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            totalUploads: { $sum: 1 },
            currentDocumentDownloads: {
              $sum: { $ifNull: ['$downloadCount', 0] },
            },
          },
        },
      ]);
    });

    it('should create stats if none exist', async () => {
      platformStatsModel.findOne.mockResolvedValue(null);
      documentModel.aggregate.mockResolvedValue([]);

      const result = await service.getPlatformStats();

      expect(platformStatsModel.create).toHaveBeenCalledWith({});
      expect(result).toEqual({
        totalUploads: 0,
        totalDownloads: 0,
        activeUsers: 0,
        avgDlPerDoc: 0,
      });
    });

    it('returns a zero average when no documents remain', async () => {
      platformStatsModel.findOne.mockResolvedValue({
        totalUploads: 0,
        totalDownloads: 30,
        activeUsers: 10,
      });
      documentModel.aggregate.mockResolvedValue([]);

      const result = await service.getPlatformStats();

      expect(result.avgDlPerDoc).toBe(0);
      expect(result.totalDownloads).toBe(30);
    });

    it('rounds the current document average to two decimals', async () => {
      platformStatsModel.findOne.mockResolvedValue({
        totalUploads: 99,
        totalDownloads: 30,
        activeUsers: 5,
      });
      documentModel.aggregate.mockResolvedValue([
        { totalUploads: 3, currentDocumentDownloads: 10 },
      ]);

      const result = await service.getPlatformStats();

      expect(result.totalUploads).toBe(3);
      expect(result.avgDlPerDoc).toBe(3.33);
    });
  });

  describe('getUploadsOverTime', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-03T13:30:00.000Z'));
      documentModel.aggregate.mockResolvedValue([
        { date: '2025-01-01', count: 5 },
        { date: '2025-01-02', count: 3 },
      ]);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('fills empty days and returns exactly the requested Vietnam dates', async () => {
      const result = await service.getUploadsOverTime(3);

      expect(result).toEqual([
        { date: '2025-01-01', count: 5 },
        { date: '2025-01-02', count: 3 },
        { date: '2025-01-03', count: 0 },
      ]);
      expect(documentModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            uploadDate: {
              $gte: new Date('2024-12-31T17:00:00.000Z'),
              $lt: new Date('2025-01-03T17:00:00.000Z'),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$uploadDate',
                timezone: 'Asia/Ho_Chi_Minh',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, date: '$_id', count: '$count' } },
      ]);
    });

    it('changes the current date at midnight in Vietnam', async () => {
      jest.setSystemTime(new Date('2025-01-03T16:59:59.000Z'));
      expect(await service.getUploadsOverTime(1)).toEqual([
        { date: '2025-01-03', count: 0 },
      ]);

      jest.setSystemTime(new Date('2025-01-03T17:00:00.000Z'));
      expect(await service.getUploadsOverTime(1)).toEqual([
        { date: '2025-01-04', count: 0 },
      ]);
      expect(documentModel.aggregate).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          {
            $match: {
              uploadDate: {
                $gte: new Date('2025-01-03T17:00:00.000Z'),
                $lt: new Date('2025-01-04T17:00:00.000Z'),
              },
            },
          },
        ]),
      );
    });

    it('defaults to 30 days including today', async () => {
      const result = await service.getUploadsOverTime();

      expect(result).toHaveLength(30);
      expect(result[0].date).toBe('2024-12-05');
      expect(result[29].date).toBe('2025-01-03');
    });

    it('returns zero counts when no uploads are in range', async () => {
      documentModel.aggregate.mockResolvedValue([]);

      const result = await service.getUploadsOverTime(7);

      expect(result).toHaveLength(7);
      expect(result[0]).toEqual({ date: '2024-12-28', count: 0 });
      expect(result[6]).toEqual({ date: '2025-01-03', count: 0 });
      expect(result.every(({ count }) => count === 0)).toBe(true);
    });
  });

  describe('incrementTotalUploads', () => {
    it('should increment total uploads', async () => {
      await service.incrementTotalUploads(1);

      expect(platformStatsModel.updateOne).toHaveBeenCalledWith(
        {},
        { $inc: { totalUploads: 1 } },
        { upsert: true },
      );
    });

    it('should handle negative amounts (decrement)', async () => {
      await service.incrementTotalUploads(-1);

      expect(platformStatsModel.updateOne).toHaveBeenCalledWith(
        {},
        { $inc: { totalUploads: -1 } },
        { upsert: true },
      );
    });
  });

  describe('incrementTotalDownloads', () => {
    it('should increment total downloads', async () => {
      await service.incrementTotalDownloads(1);

      expect(platformStatsModel.updateOne).toHaveBeenCalledWith(
        {},
        { $inc: { totalDownloads: 1 } },
        { upsert: true },
      );
    });
  });

  describe('incrementActiveUsers', () => {
    it('should increment active users', async () => {
      await service.incrementActiveUsers(1);

      expect(platformStatsModel.updateOne).toHaveBeenCalledWith(
        {},
        { $inc: { activeUsers: 1 } },
        { upsert: true },
      );
    });

    it('should handle decrement for blocked/deleted users', async () => {
      await service.incrementActiveUsers(-1);

      expect(platformStatsModel.updateOne).toHaveBeenCalledWith(
        {},
        { $inc: { activeUsers: -1 } },
        { upsert: true },
      );
    });
  });
});

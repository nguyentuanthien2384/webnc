import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document } from '../documents/schemas/document.schema';
import { User } from '../users/schemas/user.schema';
import { PlatformStats } from './schemas/platform-stats.schema';

const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<Document>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PlatformStats.name)
    private platformStatsModel: Model<PlatformStats>,
  ) {}

  async getPlatformStats() {
    const [storedStats, documentTotals] = await Promise.all([
      this.platformStatsModel.findOne(),
      this.documentModel.aggregate<{
        totalUploads: number;
        currentDocumentDownloads: number;
      }>([
        {
          $group: {
            _id: null,
            totalUploads: { $sum: 1 },
            currentDocumentDownloads: {
              $sum: { $ifNull: ['$downloadCount', 0] },
            },
          },
        },
      ]),
    ]);
    let stats = storedStats;
    if (!stats) {
      stats = await this.platformStatsModel.create({});
    }
    return this.formatStats(stats, documentTotals[0]);
  }

  private formatStats(
    stats: PlatformStats,
    documentTotals?: {
      totalUploads: number;
      currentDocumentDownloads: number;
    },
  ) {
    const totalUploads = documentTotals?.totalUploads ?? 0;
    const { totalDownloads, activeUsers } = stats;
    const currentDocumentAverage =
      totalUploads > 0
        ? (documentTotals?.currentDocumentDownloads ?? 0) / totalUploads
        : 0;

    return {
      totalUploads,
      totalDownloads,
      activeUsers,
      avgDlPerDoc: parseFloat(currentDocumentAverage.toFixed(2)),
    };
  }

  async getUploadsOverTime(days: number = 30) {
    // Vietnam has no daylight saving time. Shift to UTC+7 for calendar math,
    // then shift the query bounds back to UTC instants for MongoDB storage.
    const localToday = new Date(Date.now() + VIETNAM_UTC_OFFSET_MS);
    localToday.setUTCHours(0, 0, 0, 0);
    const localStartDate = new Date(localToday);
    localStartDate.setUTCDate(localStartDate.getUTCDate() - days + 1);
    const startDate = new Date(
      localStartDate.getTime() - VIETNAM_UTC_OFFSET_MS,
    );
    const endDate = new Date(
      localToday.getTime() + 24 * 60 * 60 * 1000 - VIETNAM_UTC_OFFSET_MS,
    );

    const results: { date: string; count: number }[] =
      await this.documentModel.aggregate([
        { $match: { uploadDate: { $gte: startDate, $lt: endDate } } },
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

    const countsByDate = new Map(
      results.map(({ date, count }) => [date, count]),
    );
    return Array.from({ length: days }, (_, offset) => {
      const date = new Date(localStartDate);
      date.setUTCDate(date.getUTCDate() + offset);
      const dateKey = date.toISOString().slice(0, 10);
      return { date: dateKey, count: countsByDate.get(dateKey) ?? 0 };
    });
  }

  async incrementTotalUploads(amount: number = 1) {
    await this.platformStatsModel.updateOne(
      {},
      { $inc: { totalUploads: amount } },
      { upsert: true },
    );
  }

  async incrementTotalDownloads(amount: number = 1) {
    await this.platformStatsModel.updateOne(
      {},
      { $inc: { totalDownloads: amount } },
      { upsert: true },
    );
  }

  async incrementActiveUsers(amount: number = 1) {
    await this.platformStatsModel.updateOne(
      {},
      { $inc: { activeUsers: amount } },
      { upsert: true },
    );
  }
}

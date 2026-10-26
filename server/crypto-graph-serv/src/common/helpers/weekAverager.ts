import { IWeek } from '../interfaces';
import { rounder } from './rounder';

export function weekAverager(weekData: Array<[number, number]>): IWeek[] {
  const samplesPerDay = 24;
  const maxSamples = 7 * samplesPerDay;
  const samples = weekData.slice(-maxSamples);
  const firstSampleOffset = maxSamples - samples.length;
  const firstDayIndex = Math.floor(firstSampleOffset / samplesPerDay);
  const lastDayIndex = Math.floor(
    (firstSampleOffset + samples.length - 1) / samplesPerDay,
  );
  const dayDuration = 24 * 60 * 60 * 1000;
  const weekStart = Date.now() - 7 * dayDuration;
  const week: IWeek[] = Array.from(
    { length: lastDayIndex - firstDayIndex + 1 },
    (_, index) => ({
      x: new Date(
        weekStart + (firstDayIndex + index) * dayDuration,
      ).toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      y: 0,
    }),
  );
  const sampleCounts = week.map(() => 0);

  samples.forEach(([, value], index) => {
    const dayIndex =
      Math.floor((firstSampleOffset + index) / samplesPerDay) - firstDayIndex;
    week[dayIndex].y += value;
    sampleCounts[dayIndex] += 1;
  });

  return week.map(({ x, y }, index) => ({
    x,
    y: rounder(y / sampleCounts[index], 2),
  }));
}

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);




//biased timestamps generator

//~90% between 8:00 → 23:00
//~10% during night (rare events like emergency sales)

/*
const timestamps = generateBiasedTimestamps({
  startDate: "2026-03-01T00:00:00Z",
  endDate: "2026-05-01T00:00:00Z",
  count: 50,
  minGapMinutes: 10,
});

console.log(timestamps);
*/

function generateBiasedTimestamps({
    startDate,
    endDate,
    count,
    minGapMinutes = 5,
}) {
    const results = [];

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const minGapMs = minGapMinutes * 60 * 1000;

    let current = start;

    for (let i = 0; i < count; i++) {
        // ensure we don't exceed range
        if (current >= end) break;

        // 90% chance to generate within 8AM–11PM
        const isPeak = Math.random() < 0.9;

        const baseDate = new Date(current);

        let nextTime;

        if (isPeak) {
            // Generate time between 8AM–11PM
            const dayStart = new Date(baseDate);
            dayStart.setHours(8, 0, 0, 0);

            const dayEnd = new Date(baseDate);
            dayEnd.setHours(23, 0, 0, 0);

            const randomTime =
                dayStart.getTime() +
                Math.random() * (dayEnd.getTime() - dayStart.getTime());

            nextTime = Math.max(randomTime, current + minGapMs);
        } else {
            //Rare occurance (11PM–8AM)
            const nightStart = new Date(baseDate);
            nightStart.setHours(23, 0, 0, 0);

            const nextMorning = new Date(baseDate);
            nextMorning.setDate(nextMorning.getDate() + 1);
            nextMorning.setHours(8, 0, 0, 0);

            const randomTime =
                nightStart.getTime() +
                Math.random() * (nextMorning.getTime() - nightStart.getTime());

            nextTime = Math.max(randomTime, current + minGapMs);
        }

        // Clamp to end date
        if (nextTime > end) break;

        results.push(new Date(nextTime));

        // move forward (enforces ordering)
        current = nextTime + minGapMs;
    }

    return results;
}

//date formatter based on local timezone

export function formatToLocalTimeZone(date) {
    const formatted = dayjs(date)
        .tz(dayjs.tz.guess()) // auto-detect user's timezone
        .format("YYYY-MM-DD hh:mm A");

    return formatted;
}


/*
=========================================================
REALISTIC TIMESTAMP GENERATOR
=========================================================

- Generates timestamps in BUSINESS timezone
- Returns actual UTC JS Dates
- Safe for multi-country deployment
- Uses weighted Egyptian activity windows

70% -> 1PM–6PM
20% -> 6PM–10PM
10% -> off-hours

*/

export function generateRealisticTimestamps({
    startDate,
    endDate,
    count,
    minGapMinutes = 5,
    timezone = "Africa/Cairo",
}) {

    // =====================================================
    // CONVERT INPUT RANGE INTO BUSINESS TIMEZONE
    // =====================================================

    const start = dayjs.tz(startDate, timezone);
    const end = dayjs.tz(endDate, timezone);

    const startMs = start.valueOf();
    const endMs = end.valueOf();

    const minGapMs = minGapMinutes * 60 * 1000;

    // =====================================================
    // VALIDATE SPACE
    // =====================================================

    if ((count - 1) * minGapMs > endMs - startMs) {
        throw new Error(
            "Not enough time range for requested constraints"
        );
    }

    // =====================================================
    // REALISTIC EGYPTIAN ACTIVITY WINDOWS
    // =====================================================

    const windows = [
        {
            startHour: 13,
            endHour: 18,
            weight: 0.7,
        },
        {
            startHour: 18,
            endHour: 22,
            weight: 0.2,
        },
        {
            startHour: 0,
            endHour: 24,
            weight: 0.1,
        },
    ];

    // =====================================================
    // ALLOCATE EVENT COUNTS
    // =====================================================

    let remaining = count;

    const allocations = windows.map((window, index) => {

        if (index === windows.length - 1) {
            return remaining;
        }

        const allocated = Math.floor(
            count * window.weight
        );

        remaining -= allocated;

        return allocated;
    });

    const allTimestamps = [];

    // =====================================================
    // GENERATE EVENTS PER WINDOW
    // =====================================================

    for (let i = 0; i < windows.length; i++) {

        const window = windows[i];

        const windowCount = allocations[i];

        if (windowCount <= 0) continue;

        // =================================================
        // BUILD WINDOW RANGE INSIDE BUSINESS TIMEZONE
        // =================================================

        const windowStart = start
            .clone()
            .hour(window.startHour)
            .minute(0)
            .second(0)
            .millisecond(0);

        const windowEnd = start
            .clone()
            .hour(window.endHour)
            .minute(0)
            .second(0)
            .millisecond(0);

        const ws = Math.max(
            windowStart.valueOf(),
            startMs
        );

        const we = Math.min(
            windowEnd.valueOf(),
            endMs
        );

        if (we <= ws) continue;

        const totalTime = we - ws;

        const requiredMinimum =
            (windowCount - 1) * minGapMs;

        // =================================================
        // FALLBACK IF WINDOW TOO SMALL
        // =================================================

        if (requiredMinimum > totalTime) {

            let current = ws;

            const spacing =
                totalTime / windowCount;

            for (let j = 0; j < windowCount; j++) {

                allTimestamps.push(
                    dayjs(current).utc().toDate()
                );

                current += spacing;
            }

            continue;
        }

        // =================================================
        // RANDOM DISTRIBUTION
        // =================================================

        const extraTime =
            totalTime - requiredMinimum;

        const randomWeights =
            Array.from(
                { length: windowCount },
                () => Math.random()
            );

        const weightSum =
            randomWeights.reduce(
                (a, b) => a + b,
                0
            );

        const normalized =
            randomWeights.map(
                (r) =>
                    (r / weightSum) * extraTime
            );

        let current = ws;

        for (let j = 0; j < windowCount; j++) {

            current += normalized[j];

            const safeCurrent = Math.min(
                current,
                we - (Math.random() * minGapMs)
            );

            let finalTimestamp = current;

            if (j === windowCount - 1) {

                const minAllowed =
                    current - normalized[j];

                const maxAllowed =
                    we;

                finalTimestamp =
                    minAllowed +
                    Math.random() *
                    (maxAllowed - minAllowed);
            }

            allTimestamps.push(
                dayjs(finalTimestamp).utc().toDate()
            );

            current += minGapMs;
        }
    }

    // =====================================================
    // SORT CHRONOLOGICALLY
    // =====================================================

    allTimestamps.sort((a, b) => a - b);

    return allTimestamps;
}


//////////
export function egyptDateToUtcRange(date, tz = "Africa/Cairo") {
    // STEP 1: force clean local interpretation (NO chaining .tz() twice)
    const local = dayjs.tz(date, tz);

    if (!local.isValid()) {
        throw new Error(`Invalid input date: ${date}`);
    }

    // STEP 2: compute boundaries in LOCAL timezone
    const startLocal = local.startOf("day");
    const endLocal = local.endOf("day");

    // STEP 3: convert ONCE to UTC
    return {
        startDate: startLocal.toDate().toISOString(),
        endDate: endLocal.toDate().toISOString(),
    };
}

/**
 * Generates daily UTC ranges between two dates (inclusive)
 *
 * Example:
 * generateDailyRanges("2026-03-01", "2026-03-03")
 */

export function generateDailyRanges(
    startDate,
    endDate
) {
    const ranges = [];

    let current =
        dayjs.utc(startDate).startOf("day");

    const end =
        dayjs.utc(endDate).startOf("day");

    while (
        current.isBefore(end) ||
        current.isSame(end, "day")
    ) {
        ranges.push({
            startDate:
                current
                    .startOf("day")
                    .toISOString(),

            endDate:
                current
                    .endOf("day")
                    .toISOString(),
        });

        current = current.add(1, "day");
    }

    return ranges;
}
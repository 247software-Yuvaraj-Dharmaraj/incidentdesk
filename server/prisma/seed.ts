import { IncidentType, PrismaClient, Priority, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TREND_DAYS = 14;

// Deterministic PRNG so every reseed produces the same demo dataset (stable screenshots).
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const TITLES = [
	'Main entrance turnstile jammed',
	'Request: extra security for VIP event',
	'Spilled drink near section 104',
	'Fire exit sign flickering',
	'Lost child reported at gate B',
	'HVAC failure in concourse C',
	'Elevator stuck between levels 2 and 3',
	'Request: additional first-aid station',
	'Broken seat in row F, section 210',
	'Water leak in restroom near gate D',
	'Lighting outage in parking lot B',
	'Request: wheelchair assistance at gate A',
	'Vendor power outage at kiosk 12',
	'Slippery floor by the north entrance',
	'Request: signage update for new exit',
	'Wi-Fi access point down in suite level',
	'Crowd congestion at south stairwell',
	'Damaged railing on level 3 walkway',
];

const TYPES = [IncidentType.INCIDENT, IncidentType.REQUEST, IncidentType.MAINTENANCE];
const PRIORITIES = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL];
// "Created" counts per day across the window — a believable, varied trend (~32 total).
const PER_DAY = [2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 3, 2, 4, 2];

async function main() {
	const rand = mulberry32(20260615);
	const [adminHash, reporterHash] = await Promise.all([bcrypt.hash('Admin123!', 10), bcrypt.hash('Reporter123!', 10)]);

	const admin = await prisma.user.upsert({
		where: { email: 'admin@incidentdesk.dev' },
		update: {},
		create: { email: 'admin@incidentdesk.dev', passwordHash: adminHash, fullName: 'Avery Admin', role: Role.ADMIN },
	});

	const reporter = await prisma.user.upsert({
		where: { email: 'reporter@incidentdesk.dev' },
		update: {},
		create: { email: 'reporter@incidentdesk.dev', passwordHash: reporterHash, fullName: 'Riley Reporter', role: Role.REPORTER },
	});

	// Reset sample incidents for a clean, deterministic demo dataset.
	await prisma.incident.deleteMany({ where: { reporterId: reporter.id } });

	const now = new Date();
	let made = 0;
	let titleIdx = 0;

	// Spread incidents across the last 14 days so the dashboard trend + MTTR are
	// meaningful. Older incidents are more likely already resolved/closed.
	for (let dayOffset = TREND_DAYS - 1; dayOffset >= 0; dayOffset--) {
		const count = PER_DAY[TREND_DAYS - 1 - dayOffset];
		for (let k = 0; k < count; k++) {
			const createdAt = new Date(now);
			createdAt.setUTCDate(now.getUTCDate() - dayOffset);
			createdAt.setUTCHours(8 + Math.floor(rand() * 9), Math.floor(rand() * 60), 0, 0);
			if (createdAt > now) createdAt.setTime(now.getTime() - 60_000);

			const title = TITLES[titleIdx % TITLES.length];
			titleIdx++;
			const type = TYPES[Math.floor(rand() * TYPES.length)];
			const priority = PRIORITIES[Math.floor(rand() * PRIORITIES.length)];

			const ageBias = dayOffset / TREND_DAYS;
			let status: Status;
			let resolvedAt: Date | null = null;
			let dueDate: Date | null = null;

			if (rand() < 0.35 + 0.45 * ageBias) {
				status = rand() < 0.5 ? Status.RESOLVED : Status.CLOSED;
				const hours = 2 + Math.floor(rand() * 70);
				resolvedAt = new Date(createdAt.getTime() + hours * 3_600_000);
				if (resolvedAt > now) resolvedAt = now;
			} else {
				status = rand() < 0.5 ? Status.OPEN : Status.IN_PROGRESS;
				// Some open items get a due date — a few overdue, a few upcoming.
				if (rand() < 0.5) {
					dueDate = new Date(now);
					dueDate.setUTCHours(12, 0, 0, 0);
					dueDate.setUTCDate(now.getUTCDate() + (Math.floor(rand() * 7) - 3));
				}
			}

			await prisma.incident.create({
				data: {
					title,
					type,
					priority,
					status,
					createdAt,
					resolvedAt,
					dueDate,
					description: 'Seeded sample incident.',
					reporterId: reporter.id,
					assigneeId: rand() < 0.5 ? admin.id : null,
				},
			});
			made++;
		}
	}

	console.log('✅ Seeded:');
	console.log('   ADMIN     admin@incidentdesk.dev / Admin123!');
	console.log('   REPORTER  reporter@incidentdesk.dev / Reporter123!');
	console.log(`   ${made} incidents spread across the last ${TREND_DAYS} days`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

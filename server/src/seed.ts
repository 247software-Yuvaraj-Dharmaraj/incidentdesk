// TEMP — rich demo dataset for recruiter-facing demos.
//
// Seeds the demo accounts plus extra reporters and ~40 incidents across every type/priority/status,
// backdated over the last month, with audit-log history and comment threads so the dashboard,
// incident list, audit trail and comments all look populated. Called on boot by src/server.ts
// (self-heals the demo) and by the `npm run seed` runner in prisma/seed.ts. Revert this commit
// to restore the minimal seed.
import { IncidentType, PrismaClient, Priority, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const INCIDENT_TITLES = [
	'Slip and fall near section 104',
	'Lost child reported at gate B',
	'Phone stolen at food court',
	'Altercation in parking lot C',
	'Medical assistance needed in the stands',
	'Unattended bag at entrance',
	'Crowd surge at gate A',
	'Vandalism in restroom 2',
];
const REQUEST_TITLES = [
	'Request: extra security for VIP event',
	'Request: wheelchair assistance at gate D',
	'Request: additional wayfinding signage',
	'Request: lost & found pickup',
	'Request: vendor parking pass',
	'Request: press box access',
];
const MAINTENANCE_TITLES = [
	'Main entrance turnstile jammed',
	'Fire exit sign flickering',
	'Broken AC unit 3',
	'Leaking pipe in the concourse',
	'Elevator 2 out of service',
	'Flickering lights in tunnel',
	'Escalator handrail loose',
	'Scoreboard pixel failure',
];
const COMMENTS = [
	'On site, investigating now.',
	'Assigned to the facilities team.',
	'Awaiting parts, ETA tomorrow.',
	'Resolved — replaced the faulty unit.',
	'Coordinating with the event manager.',
	'Cordoned off the area as a precaution.',
	'Follow-up scheduled for next shift.',
];

const HOUR = 3_600_000;
const DAY = 86_400_000;
const rint = (n: number): number => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]): T => arr[rint(arr.length)];

function titleFor(type: IncidentType, i: number): string {
	const pool = type === IncidentType.INCIDENT ? INCIDENT_TITLES : type === IncidentType.REQUEST ? REQUEST_TITLES : MAINTENANCE_TITLES;
	return pool[(Math.floor(i / 3) + i) % pool.length];
}

/** Wipes demo data and reseeds the rich dataset. Pass a client to reuse one, else a throwaway is created. */
export async function seedDatabase(client?: PrismaClient): Promise<void> {
	const prisma = client ?? new PrismaClient();
	try {
		await prisma.auditLog.deleteMany({});
		await prisma.comment.deleteMany({});
		await prisma.incident.deleteMany({});
		await prisma.user.deleteMany({});

		const [adminHash, reporterHash] = await Promise.all([bcrypt.hash('Admin123!', 10), bcrypt.hash('Reporter123!', 10)]);
		const admin = await prisma.user.create({ data: { email: 'admin@incidentdesk.dev', passwordHash: adminHash, fullName: 'Avery Admin', role: Role.ADMIN } });
		const reporter = await prisma.user.create({ data: { email: 'reporter@incidentdesk.dev', passwordHash: reporterHash, fullName: 'Riley Reporter', role: Role.REPORTER } });
		const reporters = [reporter];
		for (const [email, fullName] of [
			['sam@incidentdesk.dev', 'Sam Okafor'],
			['jordan@incidentdesk.dev', 'Jordan Diaz'],
			['casey@incidentdesk.dev', 'Casey Wong'],
		]) {
			reporters.push(await prisma.user.create({ data: { email, passwordHash: reporterHash, fullName, role: Role.REPORTER } }));
		}

		const types = [IncidentType.INCIDENT, IncidentType.REQUEST, IncidentType.MAINTENANCE];
		const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL];
		const statusPool = [Status.OPEN, Status.OPEN, Status.IN_PROGRESS, Status.IN_PROGRESS, Status.RESOLVED, Status.RESOLVED, Status.CLOSED, Status.CLOSED, Status.CLOSED];

		const total = 40;
		let auditCount = 0;
		let commentCount = 0;
		for (let i = 0; i < total; i++) {
			const type = types[i % types.length];
			const priority = pick(priorities);
			const status = pick(statusPool);
			// The demo reporter (Riley) authors ~45% so their scoped list is full.
			const rep = rint(100) < 45 ? reporter : pick(reporters);
			const createdAt = new Date(Date.now() - rint(30) * DAY - rint(8) * HOUR);
			const worked = status !== Status.OPEN;
			const resolved = status === Status.RESOLVED || status === Status.CLOSED;
			const title = titleFor(type, i);

			const incident = await prisma.incident.create({
				data: {
					title,
					type,
					priority,
					status,
					description: `Reported via the operations console. ${title}.`,
					reporterId: rep.id,
					assigneeId: worked ? admin.id : null,
					createdAt,
					resolvedAt: resolved ? new Date(createdAt.getTime() + (2 + rint(40)) * HOUR) : null,
				},
			});

			if (worked) {
				await prisma.auditLog.create({ data: { incidentId: incident.id, actorId: admin.id, field: 'assignee', oldValue: null, newValue: admin.fullName, createdAt: new Date(createdAt.getTime() + HOUR) } });
				await prisma.auditLog.create({ data: { incidentId: incident.id, actorId: admin.id, field: 'status', oldValue: Status.OPEN, newValue: Status.IN_PROGRESS, createdAt: new Date(createdAt.getTime() + HOUR) } });
				auditCount += 2;
				if (resolved) {
					await prisma.auditLog.create({ data: { incidentId: incident.id, actorId: admin.id, field: 'status', oldValue: Status.IN_PROGRESS, newValue: status, createdAt: new Date(createdAt.getTime() + 6 * HOUR) } });
					auditCount += 1;
				}
			}
			if (Math.random() < 0.5) {
				await prisma.comment.create({ data: { incidentId: incident.id, authorId: admin.id, body: pick(COMMENTS), internal: rint(100) < 30, createdAt: new Date(createdAt.getTime() + 2 * HOUR) } });
				commentCount += 1;
				if (rint(100) < 40) {
					await prisma.comment.create({ data: { incidentId: incident.id, authorId: rep.id, body: 'Thanks — keeping an eye on this.', internal: false, createdAt: new Date(createdAt.getTime() + 3 * HOUR) } });
					commentCount += 1;
				}
			}
		}

		console.log(`✅ Seeded: ${reporters.length + 1} users, ${total} incidents, ${auditCount} audit logs, ${commentCount} comments`);
		console.log('   ADMIN     admin@incidentdesk.dev / Admin123!');
		console.log('   REPORTER  reporter@incidentdesk.dev / Reporter123!');
	} finally {
		if (!client) await prisma.$disconnect();
	}
}

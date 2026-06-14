import { IncidentType, PrismaClient, Priority, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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

	const samples = [
		{ title: 'Main entrance turnstile jammed', type: IncidentType.MAINTENANCE, priority: Priority.HIGH, status: Status.OPEN },
		{ title: 'Request: extra security for VIP event', type: IncidentType.REQUEST, priority: Priority.MEDIUM, status: Status.IN_PROGRESS, assigneeId: admin.id },
		{ title: 'Spilled drink near section 104', type: IncidentType.INCIDENT, priority: Priority.LOW, status: Status.RESOLVED, assigneeId: admin.id },
		{ title: 'Fire exit sign flickering', type: IncidentType.MAINTENANCE, priority: Priority.CRITICAL, status: Status.OPEN },
		{ title: 'Lost child reported at gate B', type: IncidentType.INCIDENT, priority: Priority.CRITICAL, status: Status.CLOSED, assigneeId: admin.id },
	];

	for (const sample of samples) {
		await prisma.incident.create({
			data: { ...sample, description: 'Seeded sample incident.', reporterId: reporter.id },
		});
	}

	console.log('✅ Seeded:');
	console.log('   ADMIN     admin@incidentdesk.dev / Admin123!');
	console.log('   REPORTER  reporter@incidentdesk.dev / Reporter123!');
	console.log(`   ${samples.length} sample incidents`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

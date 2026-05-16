import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function main() {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Shalu@1234', 12);
  const harshPassword = await bcrypt.hash('Harsh@1234', 12);
  const prishaPassword = await bcrypt.hash('Prisha!234', 12);

  const admin = await prisma.user.create({
    data: { name: 'Shalu', email: 'shalubhardwaj7@gmail.com', password, role: 'Admin' }
  });

  const harsh = await prisma.user.create({
    data: { name: 'Harsh', email: 'harshsharma19@gmail.com', password: harshPassword, role: 'Member' }
  });

  const prisha = await prisma.user.create({
    data: { name: 'Prisha', email: 'prisha9@gmail.com', password: prishaPassword, role: 'Member' }
  });

  const launch = await prisma.project.create({
    data: {
      title: 'Product Launch',
      description: 'Coordinate release tasks for the new team workspace.',
      createdBy: admin.id
    }
  });

  const ops = await prisma.project.create({
    data: {
      title: 'Operations Upgrade',
      description: 'Improve internal reporting and weekly team routines.',
      createdBy: admin.id
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Finalize onboarding checklist',
        description: 'Review the onboarding flow and publish the checklist.',
        status: 'InProgress',
        priority: 'High',
        dueDate: futureDate(3),
        assignedTo: harsh.id,
        projectId: launch.id,
        createdBy: admin.id
      },
      {
        title: 'Create launch analytics view',
        description: 'Build initial dashboard charts for launch metrics.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: futureDate(7),
        assignedTo: prisha.id,
        projectId: launch.id,
        createdBy: admin.id
      },
      {
        title: 'Archive stale operations tasks',
        description: 'Clean up stale work items and document the process.',
        status: 'Completed',
        priority: 'Low',
        dueDate: futureDate(-2),
        assignedTo: harsh.id,
        projectId: ops.id,
        createdBy: admin.id
      },
      {
        title: 'Update weekly reporting template',
        description: 'Refresh the reporting template with owner and status fields.',
        status: 'Overdue',
        priority: 'High',
        dueDate: futureDate(-1),
        assignedTo: prisha.id,
        projectId: ops.id,
        createdBy: admin.id
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed data created');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

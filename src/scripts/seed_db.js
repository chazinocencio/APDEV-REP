import { connectDB } from '../db.js';
import * as model from '../model/model.js';

async function seed() {
    await connectDB();

    console.log('Clearing collections...');
    await model.studentModel.deleteMany({});
    await model.technicianModel.deleteMany({});
    await model.reservationModel.deleteMany({});
    await model.roomModel.deleteMany({});
    await model.seatModel.deleteMany({});

    console.log('Inserting technicians...');
    const technicians = [
        {
            username: 'marty.mcfly',
            email: 'marty.mcfly@example.com',
            passwordHash: 'password123',
            lastName: 'McFly',
            firstName: 'Marty',
            middleName: '',
            profilePicture: '/uploads/profilepics/marty.png',
            bio: 'Temporal technician.',
            isActive: true,
            employeeID: 'TECH-1001',
            department: 'IT',
            role: 'technician'
        },
        {
            username: 'emmet.brown',
            email: 'emmet.brown@example.com',
            passwordHash: 'password123',
            lastName: 'Brown',
            firstName: 'Emmet',
            middleName: '',
            profilePicture: '/uploads/profilepics/emmet.png',
            bio: 'Head of Chrono Support.',
            isActive: true,
            employeeID: 'TECH-1002',
            department: 'IT',
            role: 'technician'
        }
    ];

    await model.technicianModel.insertMany(technicians);

    console.log('Inserting students...');
    const students = [
        {
            username: 'naomireyes',
            idNumber: 1240001,
            email: 'naomi.reyes@example.com',
            passwordHash: 'password123',
            lastName: 'Reyes',
            firstName: 'Naomi',
            middleName: 'A',
            profilePicture: '/uploads/profilepics/naomi.png',
            bio: 'Student of CS.',
            degreeProgram: 'BS Computer Science',
            college: 'Manila',
            isActive: true,
            canReserve: true
        },
        {
            username: 'jrsantiago',
            idNumber: 1240002,
            email: 'jr.santiago@example.com',
            passwordHash: 'password123',
            lastName: 'Santiago',
            firstName: 'JR',
            middleName: 'B',
            profilePicture: '/uploads/profilepics/jr.png',
            bio: 'Enthusiastic learner.',
            degreeProgram: 'BS Information Technology',
            college: 'Manila',
            isActive: true,
            canReserve: true
        },
        {
            username: 'adrianbacolod',
            idNumber: 1240003,
            email: 'adrian.bacolod@example.com',
            passwordHash: 'password123',
            lastName: 'Bacolod',
            firstName: 'Adrian',
            middleName: 'C',
            profilePicture: '/uploads/profilepics/adrian.png',
            bio: 'Aspiring developer.',
            degreeProgram: 'BS Software Engineering',
            college: 'Manila',
            isActive: true,
            canReserve: true
        },
        {
            username: 'chazinocencio',
            idNumber: 1240004,
            email: 'chaz.inocencio@example.com',
            passwordHash: 'password123',
            lastName: 'Inocencio',
            firstName: 'Chaz',
            middleName: 'D',
            profilePicture: '/uploads/profilepics/chaz.png',
            bio: 'Quiet student.',
            degreeProgram: 'BS Computer Science',
            college: 'Manila',
            isActive: true,
            canReserve: true
        }
    ];

    await model.studentModel.insertMany(students);

    console.log('Inserting reservations...');

    const reservations = [];

    // Naomi (1240001) - 3 reservations
    reservations.push(
        {
            seatID: 'g301-1',
            idNumber: 1240001,
            startTime: new Date('2026-02-14T08:00:00'),
            endTime: new Date('2026-02-14T09:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Study group',
            status: 'Active'
        },
        {
            seatID: 'g302-2',
            idNumber: 1240001,
            startTime: new Date('2026-02-15T10:00:00'),
            endTime: new Date('2026-02-15T11:30:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Project work',
            status: 'Pending'
        },
        {
            seatID: 'g303-3',
            idNumber: 1240001,
            startTime: new Date('2026-02-16T13:00:00'),
            endTime: new Date('2026-02-16T15:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Exam prep',
            status: 'Completed'
        }
    );

    // JR (1240002) - 3 reservations
    reservations.push(
        {
            seatID: 'g301-4',
            idNumber: 1240002,
            startTime: new Date('2026-03-01T09:00:00'),
            endTime: new Date('2026-03-01T10:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Lab practice',
            status: 'Active'
        },
        {
            seatID: 'g304-1',
            idNumber: 1240002,
            startTime: new Date('2026-03-02T11:00:00'),
            endTime: new Date('2026-03-02T12:30:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Presentation',
            status: 'Pending'
        },
        {
            seatID: 'g305-2',
            idNumber: 1240002,
            startTime: new Date('2026-03-03T14:00:00'),
            endTime: new Date('2026-03-03T15:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Group meeting',
            status: 'Completed'
        }
    );

    // Adrian (1240003) - 3 reservations
    reservations.push(
        {
            seatID: 'g306-3',
            idNumber: 1240003,
            startTime: new Date('2026-04-01T08:30:00'),
            endTime: new Date('2026-04-01T10:30:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Coding session',
            status: 'Active'
        },
        {
            seatID: 'g301-2',
            idNumber: 1240003,
            startTime: new Date('2026-04-05T12:00:00'),
            endTime: new Date('2026-04-05T13:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Tutorial',
            status: 'Pending'
        },
        {
            seatID: 'g302-5',
            idNumber: 1240003,
            startTime: new Date('2026-04-10T15:00:00'),
            endTime: new Date('2026-04-10T16:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Study time',
            status: 'Completed'
        }
    );

    // Chaz (1240004) - zero reservations (explicitly none)

    await model.reservationModel.insertMany(reservations);

    console.log('Seeding complete.');
    console.log('Students:', await model.studentModel.countDocuments());
    console.log('Technicians:', await model.technicianModel.countDocuments());
    console.log('Reservations:', await model.reservationModel.countDocuments());

    process.exit(0);
}

seed().catch(err => {
    console.error('Seed error', err);
    process.exit(1);
});
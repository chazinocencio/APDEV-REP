import { connectDB } from '../db.js';
import * as model from '../model/model.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

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
            email: 'marty.mcfly@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
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
            email: 'emmet.brown@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Brown',
            firstName: 'Emmet',
            middleName: '',
            profilePicture: '/uploads/profilepics/emmet.png',
            bio: 'Head of Chrono Support.',
            isActive: true,
            employeeID: 'TECH-1002',
            department: 'IT',
            role: 'technician'
        }, 
        {
            username: 'peterparker',
            email: 'peter.parker@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Parker',
            firstName: 'Peter',
            middleName: 'P',
            profilePicture: '/uploads/profilepics/peter.png',
            bio: 'Head of Spidey Sense.',
            isActive: true,
            employeeID: 'TECH-1003',
            department: 'IT',
            role: 'technician'
        },
        {
            username: 'naomwick',
            email: 'chazwick.reyes@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Chazwick',
            firstName: 'Reyes',
            middleName: 'I',
            profilePicture: '/uploads/profilepics/chaz.png',
            bio: 'Head of Front End.',
            isActive: true,
            employeeID: 'TECH-1004',
            department: 'IT',
            role: 'technician'
        },
        {
            username: 'jardrian',
            email: 'adrian.santiago@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Bacolod',
            firstName: 'JR',
            middleName: 'A',
            profilePicture: '/uploads/profilepics/bacolod.png',
            bio: 'Head of Labs.',
            isActive: true,
            employeeID: 'TECH-1005',
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
            email: 'naomi.reyes@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Reyes',
            firstName: 'Naomi',
            middleName: 'A',
            profilePicture: '/uploads/profilepics/naomi.jpg',
            bio: 'Student of CS.',
            degreeProgram: 'BS Computer Science',
            college: 'College of Computer Studies',
            isActive: true,
            canReserve: true
        },
        {
            username: 'jrsantiago',
            idNumber: 12414387,
            email: 'jrsantiago@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Santiago',
            firstName: 'JR',
            middleName: 'B',
            profilePicture: '/uploads/profilepics/jr.jpg',
            bio: 'Enthusiastic learner.',
            degreeProgram: 'BS Computer Science',
            college: 'College of Computer Studies',
            isActive: true,
            canReserve: true
        },
        {
            username: 'adrianbacolod',
            idNumber: 1240003,
            email: 'adrian.bacolod@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Bacolod',
            firstName: 'Adrian',
            middleName: 'C',
            profilePicture: '/uploads/profilepics/adrian.jpg',
            bio: 'Aspiring developer.',
            degreeProgram: 'BS Software Engineering',
            college: 'College of Computer Studies',
            isActive: true,
            canReserve: true
        },
        {
            username: 'chazinocencio',
            idNumber: 1240004,
            email: 'chaz.inocencio@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Inocencio',
            firstName: 'Chaz',
            middleName: 'D',
            profilePicture: '/uploads/profilepics/chaz.jpg',
            bio: 'Quiet student.',
            degreeProgram: 'BS Computer Science',
            college: 'College of Computer Studies',
            isActive: true,
            canReserve: true
        },
        {
            username: 'joseriz',
            idNumber: 1240005,
            email: 'jose.rizal@dlsu.edu.ph',
            passwordHash: await bcrypt.hash('password123', saltRounds),
            lastName: 'Rizal',
            firstName: 'Jose',
            middleName: 'P',
            profilePicture: '/uploads/profilepics/rizal.jpg',
            bio: 'El fili author.',
            degreeProgram: 'BS Computer Science',
            college: 'College Liberal Arts',
            isActive: true,
            canReserve: true
        }
    ];

    await model.studentModel.insertMany(students);

    console.log('Inserting rooms...');
    const rooms = [
        { roomID: 'G301' },
        { roomID: 'G302' },
        { roomID: 'G303' },
        { roomID: 'G304' },
        { roomID: 'G305' },
        { roomID: 'G306' }
    ];

    await model.roomModel.insertMany(rooms);

    console.log('Inserting seats...');
    const seats = [
        { seatID: 'G301-1', roomID: 'G301' },
        { seatID: 'G301-2', roomID: 'G301' },
        { seatID: 'G301-3', roomID: 'G301' },
        { seatID: 'G301-4', roomID: 'G301' },
        { seatID: 'G301-5', roomID: 'G301' },
        { seatID: 'G301-6', roomID: 'G301' },
        { seatID: 'G301-7', roomID: 'G301' },
        { seatID: 'G301-8', roomID: 'G301' },
        { seatID: 'G301-9', roomID: 'G301' },
        { seatID: 'G301-10', roomID: 'G301' },
        { seatID: 'G301-11', roomID: 'G301' },
        { seatID: 'G301-12', roomID: 'G301' },
        { seatID: 'G301-13', roomID: 'G301' },
        { seatID: 'G301-14', roomID: 'G301' },
        { seatID: 'G301-15', roomID: 'G301' },
        { seatID: 'G301-16', roomID: 'G301' },
        { seatID: 'G301-17', roomID: 'G301' },
        { seatID: 'G301-18', roomID: 'G301' },
        { seatID: 'G301-19', roomID: 'G301' },
        { seatID: 'G301-20', roomID: 'G301' },
        { seatID: 'G301-21', roomID: 'G301' },
        { seatID: 'G301-22', roomID: 'G301' },
        { seatID: 'G301-23', roomID: 'G301' },
        { seatID: 'G301-24', roomID: 'G301' },
        { seatID: 'G302-1', roomID: 'G302' },
        { seatID: 'G302-2', roomID: 'G302' },
        { seatID: 'G302-3', roomID: 'G302' },
        { seatID: 'G302-4', roomID: 'G302' },
        { seatID: 'G302-5', roomID: 'G302' },
        { seatID: 'G302-6', roomID: 'G302' },
        { seatID: 'G302-7', roomID: 'G302' },
        { seatID: 'G302-8', roomID: 'G302' },
        { seatID: 'G302-9', roomID: 'G302' },
        { seatID: 'G302-10', roomID: 'G302' },
        { seatID: 'G302-11', roomID: 'G302' },
        { seatID: 'G302-12', roomID: 'G302' },
        { seatID: 'G302-13', roomID: 'G302' },
        { seatID: 'G302-14', roomID: 'G302' },
        { seatID: 'G302-15', roomID: 'G302' },
        { seatID: 'G302-16', roomID: 'G302' },
        { seatID: 'G302-17', roomID: 'G302' },
        { seatID: 'G302-18', roomID: 'G302' },
        { seatID: 'G302-19', roomID: 'G302' },
        { seatID: 'G302-20', roomID: 'G302' },
        { seatID: 'G302-21', roomID: 'G302' },
        { seatID: 'G302-22', roomID: 'G302' },
        { seatID: 'G302-23', roomID: 'G302' },
        { seatID: 'G302-24', roomID: 'G302' },
        { seatID: 'G303-1', roomID: 'G303' },
        { seatID: 'G303-2', roomID: 'G303' },
        { seatID: 'G303-3', roomID: 'G303' },
        { seatID: 'G303-4', roomID: 'G303' },
        { seatID: 'G303-5', roomID: 'G303' },
        { seatID: 'G303-6', roomID: 'G303' },
        { seatID: 'G303-7', roomID: 'G303' },
        { seatID: 'G303-8', roomID: 'G303' },
        { seatID: 'G303-9', roomID: 'G303' },
        { seatID: 'G303-10', roomID: 'G303' },
        { seatID: 'G303-11', roomID: 'G303' },
        { seatID: 'G303-12', roomID: 'G303' },
        { seatID: 'G303-13', roomID: 'G303' },
        { seatID: 'G303-14', roomID: 'G303' },
        { seatID: 'G303-15', roomID: 'G303' },
        { seatID: 'G303-16', roomID: 'G303' },
        { seatID: 'G303-17', roomID: 'G303' },
        { seatID: 'G303-18', roomID: 'G303' },
        { seatID: 'G303-19', roomID: 'G303' },
        { seatID: 'G303-20', roomID: 'G303' },
        { seatID: 'G303-21', roomID: 'G303' },
        { seatID: 'G303-22', roomID: 'G303' },
        { seatID: 'G303-23', roomID: 'G303' },
        { seatID: 'G303-24', roomID: 'G303' },
        { seatID: 'G304-1', roomID: 'G304' },
        { seatID: 'G304-2', roomID: 'G304' },
        { seatID: 'G304-3', roomID: 'G304' },
        { seatID: 'G304-4', roomID: 'G304' },
        { seatID: 'G304-5', roomID: 'G304' },
        { seatID: 'G304-6', roomID: 'G304' },
        { seatID: 'G304-7', roomID: 'G304' },
        { seatID: 'G304-8', roomID: 'G304' },
        { seatID: 'G304-9', roomID: 'G304' },
        { seatID: 'G304-10', roomID: 'G304' },
        { seatID: 'G304-11', roomID: 'G304' },
        { seatID: 'G304-12', roomID: 'G304' },
        { seatID: 'G304-13', roomID: 'G304' },
        { seatID: 'G304-14', roomID: 'G304' },
        { seatID: 'G304-15', roomID: 'G304' },
        { seatID: 'G304-16', roomID: 'G304' },
        { seatID: 'G304-17', roomID: 'G304' },
        { seatID: 'G304-18', roomID: 'G304' },
        { seatID: 'G304-19', roomID: 'G304' },
        { seatID: 'G304-20', roomID: 'G304' },
        { seatID: 'G304-21', roomID: 'G304' },
        { seatID: 'G304-22', roomID: 'G304' },
        { seatID: 'G304-23', roomID: 'G304' },
        { seatID: 'G304-24', roomID: 'G304' },
        { seatID: 'G305-1', roomID: 'G305' },
        { seatID: 'G305-2', roomID: 'G305' },
        { seatID: 'G305-3', roomID: 'G305' },
        { seatID: 'G305-4', roomID: 'G305' },
        { seatID: 'G305-5', roomID: 'G305' },
        { seatID: 'G305-6', roomID: 'G305' },
        { seatID: 'G305-7', roomID: 'G305' },
        { seatID: 'G305-8', roomID: 'G305' },
        { seatID: 'G305-9', roomID: 'G305' },
        { seatID: 'G305-10', roomID: 'G305' },
        { seatID: 'G305-11', roomID: 'G305' },
        { seatID: 'G305-12', roomID: 'G305' },
        { seatID: 'G305-13', roomID: 'G305' },
        { seatID: 'G305-14', roomID: 'G305' },
        { seatID: 'G305-15', roomID: 'G305' },
        { seatID: 'G305-16', roomID: 'G305' },
        { seatID: 'G305-17', roomID: 'G305' },
        { seatID: 'G305-18', roomID: 'G305' },
        { seatID: 'G305-19', roomID: 'G305' },
        { seatID: 'G305-20', roomID: 'G305' },
        { seatID: 'G305-21', roomID: 'G305' },
        { seatID: 'G305-22', roomID: 'G305' },
        { seatID: 'G305-23', roomID: 'G305' },
        { seatID: 'G305-24', roomID: 'G305' },
        { seatID: 'G306-1', roomID: 'G306' },
        { seatID: 'G306-2', roomID: 'G306' },
        { seatID: 'G306-3', roomID: 'G306' },
        { seatID: 'G306-4', roomID: 'G306' },
        { seatID: 'G306-5', roomID: 'G306' },
        { seatID: 'G306-6', roomID: 'G306' },
        { seatID: 'G306-7', roomID: 'G306' },
        { seatID: 'G306-8', roomID: 'G306' },
        { seatID: 'G306-9', roomID: 'G306' },
        { seatID: 'G306-10', roomID: 'G306' },
        { seatID: 'G306-11', roomID: 'G306' },
        { seatID: 'G306-12', roomID: 'G306' },
        { seatID: 'G306-13', roomID: 'G306' },
        { seatID: 'G306-14', roomID: 'G306' },
        { seatID: 'G306-15', roomID: 'G306' },
        { seatID: 'G306-16', roomID: 'G306' },
        { seatID: 'G306-17', roomID: 'G306' },
        { seatID: 'G306-18', roomID: 'G306' },
        { seatID: 'G306-19', roomID: 'G306' },
        { seatID: 'G306-20', roomID: 'G306' },
        { seatID: 'G306-21', roomID: 'G306' },
        { seatID: 'G306-22', roomID: 'G306' },
        { seatID: 'G306-23', roomID: 'G306' },
        { seatID: 'G306-24', roomID: 'G306' }
    ];

    await model.seatModel.insertMany(seats);

    console.log('Inserting reservations...');

    const reservations = [];

    /*// Naomi (1240001) - 3 reservations
    reservations.push(
        {
            seatID: 'G301-1',
            idNumber: 1240001,
            startTime: new Date('2026-02-14T08:00:00'),
            endTime: new Date('2026-02-14T09:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Study group',
            status: 'Active'
        },
        {
            seatID: 'G302-2',
            idNumber: 1240001,
            startTime: new Date('2026-02-15T10:00:00'),
            endTime: new Date('2026-02-15T11:30:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Project work',
            status: 'Pending'
        },
        {
            seatID: 'G303-3',
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
            seatID: 'G301-4',
            idNumber: 1240002,
            startTime: new Date('2026-03-01T09:00:00'),
            endTime: new Date('2026-03-01T10:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Lab practice',
            status: 'Active'
        },
        {
            seatID: 'G304-1',
            idNumber: 1240002,
            startTime: new Date('2026-03-02T11:00:00'),
            endTime: new Date('2026-03-02T12:30:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Presentation',
            status: 'Pending'
        },
        {
            seatID: 'G305-2',
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
            seatID: 'G306-3',
            idNumber: 1240003,
            startTime: new Date('2026-04-01T08:30:00'),
            endTime: new Date('2026-04-01T10:30:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Coding session',
            status: 'Active'
        },
        {
            seatID: 'G301-2',
            idNumber: 1240003,
            startTime: new Date('2026-04-05T12:00:00'),
            endTime: new Date('2026-04-05T13:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Tutorial',
            status: 'Pending'
        },
        {
            seatID: 'G302-5',
            idNumber: 1240003,
            startTime: new Date('2026-04-10T15:00:00'),
            endTime: new Date('2026-04-10T16:00:00'),
            isAnonymous: false,
            reservationType: 'Student',
            description: 'Study time',
            status: 'Completed'
        }
    );*/

    // Chaz (1240004) - zero reservations (explicitly none)

    await model.reservationModel.insertMany(reservations);

    console.log('Seeding complete.');
    console.log('Students:', await model.studentModel.countDocuments());
    console.log('Technicians:', await model.technicianModel.countDocuments());
    console.log('Rooms:', await model.roomModel.countDocuments());
    console.log('Seats:', await model.seatModel.countDocuments());
    console.log('Reservations:', await model.reservationModel.countDocuments());

    process.exit(0);
}

seed().catch(err => {
    console.error('Seed error', err);
    process.exit(1);
});
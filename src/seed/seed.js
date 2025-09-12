const mongoose = require('mongoose');
const doenv = require('dotenv').config()
const Profile = require('../models/Profile')
const Project = require('../models/Project')

const sampleProfile = {
    name: 'Kunal Sahu',
    email: 'kunal@example.com',
    password:'Kunal@123',
    education: [
        {
            degree: 'MERN Full Stack Certificate',
            institution: 'Sheryians Coding School',
            startYear: 2024,
            endYear: 2024
        }
    ],
    skills: [
        'JavaScript',
        'React',
        'Node.js',
        'Express.js',
        'MongoDB',
        'Tailwind CSS',
        'Passport.js',
        'Multer.js',
        'GSAP',
        'Framer Motion',
        'Socket.IO',
        'TypeScript',
        'Firebase'
    ],
    work: [
        {
            company: 'CoreCard Pvt. Ltd.',
            role: '.NET Intern',
            location: 'Bhopal',
            startDate: '2024-10',
            endDate: '2024-11',
            description: 'Worked on ASP.NET backend solutions and Azure SSO.'
        },
        {
            company: 'Tudip Digital',
            role: 'React Native Intern',
            location: 'Pune',
            startDate: '2024-06',
            description: 'React Native news app development.'
        }
    ],
    links: {
        github: 'https://github.com/Kunalsahuji',
        linkedin: 'https://www.linkedin.com/in/kunalsahuji',
        portfolio: 'https://kunalsahuji.github.io',
        resume: 'https://link-to-resume.example'
    }
};

const sampleProjects = [
    {
        title: 'Photogram',
        description: 'React + Vite photo social app using Firebase/Firestore, UploadCare, Google sign-in, stories and feed.',
        links: { github: 'https://github.com/Kunalsahuji/photogram', live: '' },
        skills: ['React', 'Vite', 'Firebase', 'Tailwind CSS', 'UploadCare']
    },
    {
        title: 'Real Estate Management System',
        description: 'MERN app with buyers, sellers, agents, appointment booking; uses MongoDB, Passport.js, Multer for images.',
        links: { github: 'https://github.com/Kunalsahuji/real-estate', live: '' },
        skills: ['React', 'Express', 'MongoDB', 'Passport.js', 'Multer.js', 'Tailwind CSS']
    },
    {
        title: 'Amazon Clone (Frontend)',
        description: 'HTML, CSS, JS clone with responsive mobile-first layout and animations.',
        links: { github: 'https://github.com/Kunalsahuji/amazon-clone', live: '' },
        skills: ['HTML', 'CSS', 'JavaScript']
    }
];


async function seed() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not set in .env');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');


    try {
        await Profile.deleteMany({});
        await Project.deleteMany({});


        const profile = await Profile.create(sampleProfile);
        console.log('Inserted profile:', profile._id.toString());


        const projectsToInsert = sampleProjects.map((p) => ({ ...p, owner: profile._id }));
        const inserted = await Project.insertMany(projectsToInsert);
        console.log('Inserted projects:', inserted.map((p) => p._id.toString()));


        console.log('Seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('Seed error', err);
        process.exit(1);
    }
}


seed();
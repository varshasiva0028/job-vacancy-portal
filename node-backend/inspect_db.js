const mysql = require('mysql2/promise');

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Mysql@123',
            database: 'job_portal'
        });

        console.log('--- Users ---');
        const [users] = await connection.execute('SELECT * FROM portal_users');
        console.log(users);

        console.log('--- Applicants ---');
        const [applicants] = await connection.execute('SELECT * FROM applicant');
        console.log(applicants);

        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

run();

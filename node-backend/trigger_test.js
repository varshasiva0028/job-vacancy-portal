const { Blob } = require('buffer');

async function testFlow() {
    const username = 'testuser_' + Date.now();
    const email = username + '@example.com';
    const password = 'Password@123';

    console.log('1. Registering user:', username);
    const registerFormData = new URLSearchParams();
    registerFormData.append('username', username);
    registerFormData.append('password', password);

    const regRes = await fetch('http://localhost:8081/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: registerFormData
    });
    console.log('Register response status:', regRes.status, await regRes.text());

    console.log('2. Logging in...');
    const loginFormData = new URLSearchParams();
    loginFormData.append('username', username);
    loginFormData.append('password', password);

    const loginRes = await fetch('http://localhost:8081/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginFormData
    });
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);
    const token = loginData.token;

    console.log('3. Creating applicant profile...');
    const createForm = new FormData();
    createForm.append('name', 'Test User');
    createForm.append('email', email);
    createForm.append('phone', '1234567890');
    createForm.append('qualification', 'B.Tech');
    createForm.append('dob', '2000-01-01');
    createForm.append('gender', 'Male');
    createForm.append('languages', '["English"]');
    createForm.append('companies', '[]');

    const dummyResume = new Blob(['dummy resume'], { type: 'application/pdf' });
    createForm.append('resume', dummyResume, 'resume.pdf');

    const dummyPhoto = new Blob(['dummy photo'], { type: 'image/jpeg' });
    createForm.append('photos', dummyPhoto, 'photo.jpg');

    const dummyMarksheet = new Blob(['dummy marksheet'], { type: 'application/pdf' });
    createForm.append('marksheet', dummyMarksheet, 'marksheet.pdf');

    const createRes = await fetch('http://localhost:8081/api/applicants', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: createForm
    });
    console.log('Create applicant response:', createRes.status, await createRes.text());

    console.log('4. Getting own applicant ID...');
    const getRes = await fetch('http://localhost:8081/api/applicants/my', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const applicant = await getRes.json();
    console.log('My applicant ID:', applicant.id);

    console.log('5. Triggering PUT /api/applicants/{id} (Update WITHOUT companies)...');
    const updateForm = new FormData();
    updateForm.append('name', 'Test User Updated');
    updateForm.append('email', email);
    updateForm.append('phone', '9876543210');
    updateForm.append('qualification', 'M.Tech');
    updateForm.append('dob', '2000-01-01');
    updateForm.append('gender', 'Male');
    updateForm.append('languages', '["English", "German"]');
    // NOT appending 'companies'

    const updateRes = await fetch(`http://localhost:8081/api/applicants/${applicant.id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: updateForm
    });
    console.log('PUT Update response status:', updateRes.status, await updateRes.text());
}

testFlow().catch(console.error);

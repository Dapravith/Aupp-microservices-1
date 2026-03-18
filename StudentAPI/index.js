const e1 = require('express');
const app = e1();

app.use(e1.json());
app.use(e1.urlencoded({ extended: true }));

// ─── IN-MEMORY STORE ──────────────────────────────────────────────────────────
let students = [
    { id: 1, name: 'Dapravith', age: 22, subject: 'Computer Science', grade: 'A', email: 'dapravith@example.com', phone: '012-000-001', address: 'Phnom Penh', status: 'active' },
    { id: 2, name: 'Dara',      age: 21, subject: 'Math',             grade: 'B', email: 'dara@example.com',      phone: '012-000-002', address: 'Siem Reap',   status: 'active' },
    { id: 3, name: 'Bopha',     age: 20, subject: 'Physics',          grade: 'A', email: 'bopha@example.com',     phone: '012-000-003', address: 'Battambang',  status: 'inactive' },
];
let nextId = 4;

// ─── HEALTH CHECK API ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Student Service is running', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ─── GET ALL STUDENTS API ─────────────────────────────────────────────────────
// GET /students
// GET /students?subject=Math
// GET /students?grade=A
// GET /students?status=active
// GET /students?subject=Math&grade=A
app.get('/students', (req, res) => {
    let result = [...students];
    if (req.query.subject)
        result = result.filter(s => s.subject.toLowerCase().includes(req.query.subject.toLowerCase()));
    if (req.query.grade)
        result = result.filter(s => s.grade === req.query.grade.toUpperCase());
    if (req.query.status)
        result = result.filter(s => s.status === req.query.status.toLowerCase());
    res.json({ success: true, count: result.length, data: result });
});

// ─── GET STUDENT BY ID API ────────────────────────────────────────────────────
// GET /students/1
app.get('/students/:id', (req, res) => {
    const student = students.find(s => s.id === parseInt(req.params.id));
    if (!student) return res.status(404).json({ success: false, message: `Student with id ${req.params.id} not found.` });
    res.json({ success: true, data: student });
});

// ─── SEARCH STUDENTS API ──────────────────────────────────────────────────────
// GET /students/search?q=dap  (searches name, email, subject, address)
app.get('/students/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    if (!q) return res.status(400).json({ success: false, message: 'Query param ?q= is required.' });
    const result = students.filter(s =>
        s.name.toLowerCase().includes(q)    ||
        s.email.toLowerCase().includes(q)   ||
        s.subject.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
    );
    res.json({ success: true, count: result.length, data: result });
});

// ─── CREATE STUDENT API ───────────────────────────────────────────────────────
// POST /students
// Body: { name, age, subject, grade, email, phone, address }
app.post('/students', (req, res) => {
    const { name, age, subject, grade, email, phone, address } = req.body;
    if (!name || !subject || !email)
        return res.status(422).json({ success: false, message: 'name, subject and email are required.' });
    if (students.find(s => s.email.toLowerCase() === email.toLowerCase()))
        return res.status(409).json({ success: false, message: `Email '${email}' already exists.` });
    const student = { id: nextId++, name, age: age || null, subject, grade: grade || null, email, phone: phone || null, address: address || null, status: 'active', createdAt: new Date().toISOString() };
    students.push(student);
    res.status(201).json({ success: true, message: 'Student created successfully.', data: student });
});

// ─── UPDATE STUDENT API (FULL) ────────────────────────────────────────────────
// PUT /students/1
// Body: { name, age, subject, grade, email, phone, address }
app.put('/students/:id', (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, message: `Student with id ${req.params.id} not found.` });
    const { name, age, subject, grade, email, phone, address } = req.body;
    if (!name || !subject || !email)
        return res.status(422).json({ success: false, message: 'name, subject and email are required.' });
    if (students.find(s => s.email.toLowerCase() === email.toLowerCase() && s.id !== parseInt(req.params.id)))
        return res.status(409).json({ success: false, message: `Email '${email}' is already used by another student.` });
    students[index] = { ...students[index], name, age: age || null, subject, grade: grade || null, email, phone: phone || null, address: address || null, updatedAt: new Date().toISOString() };
    res.json({ success: true, message: 'Student updated successfully.', data: students[index] });
});

// ─── PARTIAL UPDATE STUDENT API ───────────────────────────────────────────────
// PATCH /students/1
// Body: any fields to update e.g. { grade: 'A' } or { address: 'Kampot' }
app.patch('/students/:id', (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, message: `Student with id ${req.params.id} not found.` });
    if (Object.keys(req.body).length === 0)
        return res.status(400).json({ success: false, message: 'Request body cannot be empty.' });
    if (req.body.email && students.find(s => s.email.toLowerCase() === req.body.email.toLowerCase() && s.id !== parseInt(req.params.id)))
        return res.status(409).json({ success: false, message: `Email '${req.body.email}' is already used by another student.` });
    students[index] = { ...students[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, message: 'Student partially updated.', data: students[index] });
});

// ─── UPDATE STUDENT STATUS API ────────────────────────────────────────────────
// PATCH /students/1/status
// Body: { status: 'active' | 'inactive' }
app.patch('/students/:id/status', (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, message: `Student with id ${req.params.id} not found.` });
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status))
        return res.status(422).json({ success: false, message: "status must be 'active' or 'inactive'." });
    students[index].status = status;
    students[index].updatedAt = new Date().toISOString();
    res.json({ success: true, message: `Student status updated to '${status}'.`, data: students[index] });
});

// ─── UPDATE STUDENT GRADE API ─────────────────────────────────────────────────
// PATCH /students/1/grade
// Body: { grade: 'A' | 'B' | 'C' | 'D' | 'F' }
app.patch('/students/:id/grade', (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, message: `Student with id ${req.params.id} not found.` });
    const { grade } = req.body;
    if (!['A', 'B', 'C', 'D', 'F'].includes(grade))
        return res.status(422).json({ success: false, message: "grade must be one of: A, B, C, D, F." });
    students[index].grade = grade;
    students[index].updatedAt = new Date().toISOString();
    res.json({ success: true, message: `Student grade updated to '${grade}'.`, data: students[index] });
});

// ─── DELETE STUDENT API ───────────────────────────────────────────────────────
// DELETE /students/1
app.delete('/students/:id', (req, res) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, message: `Student with id ${req.params.id} not found.` });
    const [deleted] = students.splice(index, 1);
    res.json({ success: true, message: 'Student deleted successfully.', data: deleted });
});

// ─── DELETE ALL STUDENTS API ──────────────────────────────────────────────────
// DELETE /students
app.delete('/students', (req, res) => {
    const total = students.length;
    students = [];
    nextId = 1;
    res.json({ success: true, message: `All ${total} students deleted successfully.` });
});

// START THE EXPRESS SERVER. 5000 is the PORT NUMBER
app.listen(5000, () =>
    console.log('EXPRESS Server Started at Port No: 5000'));
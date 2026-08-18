const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'ModernTech HR API Running ✅ Port 3000' });
});

// AUTH - LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM employees WHERE email =?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const valid = await bcrypt.compare(password, rows[0].password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: rows[0].id, email: rows[0].email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// EMPLOYEES - GET ALL
app.get('/api/employees', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM employees');
    res.json(rows);
});

// EMPLOYEES - ADD NEW
app.post('/api/employees', async (req, res) => {
    const { first_name, last_name, email, job_title, salary, department_id } = req.body;
    await pool.query('INSERT INTO employees (first_name, last_name, email, job_title, salary, department_id) VALUES (?,?,?,?,?,?)',
    [first_name, last_name, email, job_title, salary, department_id]);
    res.json({ message: 'Employee added successfully' });
});

// DEPARTMENTS - GET ALL
app.get('/api/departments', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM departments');
    res.json(rows);
});

// TIME OFF - GET ALL
app.get('/api/timeoff', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM time_off_requests');
    res.json(rows);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

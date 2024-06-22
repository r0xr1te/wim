const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();

// In-memory storage (replace with a database in a real production app)
const userDataStore = new Map();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Generate unique 8-digit code
function generateUniqueCode() {
    return crypto.randomBytes(4).toString('hex');
}

// Save user data
app.post('/api/save', (req, res) => {
    const { answers, score, goals } = req.body;
    const id = generateUniqueCode();
    
    userDataStore.set(id, { answers, score, goals });
    res.json({ id });
});

// Retrieve user data
app.get('/api/retrieve/:id', (req, res) => {
    const { id } = req.params;
    
    if (userDataStore.has(id)) {
        res.json(userDataStore.get(id));
    } else {
        res.status(404).json({ error: 'Data not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
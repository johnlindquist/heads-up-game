const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('.'));

// File path
const categoriesFile = path.join(__dirname, 'categories.json');

// Helper function to read categories
async function readCategories() {
    try {
        const data = await fs.readFile(categoriesFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading categories:', error);
        return {};
    }
}

// Helper function to write categories
async function writeCategories(categories) {
    try {
        await fs.writeFile(categoriesFile, JSON.stringify(categories, null, 4));
    } catch (error) {
        console.error('Error writing categories:', error);
        throw error;
    }
}

// Routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await readCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read categories' });
    }
});

// Add new category
app.post('/api/categories', async (req, res) => {
    try {
        const { id, name } = req.body;
        const categories = await readCategories();
        
        if (categories[id]) {
            return res.status(400).json({ error: 'Category already exists' });
        }
        
        categories[id] = {
            name: name,
            words: []
        };
        
        await writeCategories(categories);
        res.json({ message: 'Category added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add category' });
    }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const categories = await readCategories();
        const { id } = req.params;
        
        if (!categories[id]) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        delete categories[id];
        await writeCategories(categories);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Add word to category
app.post('/api/categories/:id/words', async (req, res) => {
    try {
        const categories = await readCategories();
        const { id } = req.params;
        const { word } = req.body;
        
        if (!categories[id]) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        if (categories[id].words.includes(word)) {
            return res.status(400).json({ error: 'Word already exists in category' });
        }
        
        categories[id].words.push(word);
        await writeCategories(categories);
        res.json({ message: 'Word added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add word' });
    }
});

// Delete word from category
app.delete('/api/categories/:id/words/:word', async (req, res) => {
    try {
        const categories = await readCategories();
        const { id, word } = req.params;
        
        if (!categories[id]) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        const decodedWord = decodeURIComponent(word);
        const wordIndex = categories[id].words.indexOf(decodedWord);
        
        if (wordIndex === -1) {
            return res.status(404).json({ error: 'Word not found' });
        }
        
        categories[id].words.splice(wordIndex, 1);
        await writeCategories(categories);
        res.json({ message: 'Word deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete word' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Admin interface available at http://localhost:${port}/admin`);
});

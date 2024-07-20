const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Handle formatting request
app.post('/format', (req, res) => {
    const trackers = req.body.trackers.split(/\s+/).filter(Boolean);
    const formattedTrackers = trackers.join('\n\n');
    res.json({ formattedTrackers });
});

// Handle fetch request
app.get('/fetch', async (req, res) => {
    try {
        console.log('Fetching trackers...');
        
        // Fetch data from the first source
        const trackersListResponse = await axios.get('https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt');
        const trackersText = trackersListResponse.data.trim();
        const trackersList = trackersText.split(/\s+/).filter(Boolean);

        // Fetch trackers from newtrackon.com API
        let newTrackonTrackers = [];
        try {
            const apiResponse = await axios.get('https://newtrackon.com/api/live', {
                responseType: 'text'
            });
            newTrackonTrackers = apiResponse.data.trim().split('\n').filter(Boolean);
        } catch (apiError) {
            console.error('Error fetching from API:', apiError.message);
        }

        console.log('Trackers from newTrackon:', newTrackonTrackers.length);
        console.log('Trackers from trackers_all:', trackersList.length);

        // Combine and format trackers
        const combinedTrackers = [...new Set([...trackersList, ...newTrackonTrackers])];
        const formattedTrackers = combinedTrackers.join('\n\n');

        console.log('Formatted trackers:', formattedTrackers);

        res.json({ formattedTrackers });
    } catch (error) {
        console.error('Error fetching trackers:', error);
        res.status(500).json({ error: 'Failed to fetch trackers' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./rtls_demo.db');
const { HUB_TO_ZONE, MAIN_BLE_BEACONS } = require('./config');

const app = express();
const PORT = 3000;
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());


app.use(express.json());

// Endpoint to receive data from hubs
app.post('/data', (req, res) => {
    const hubData = req.body;
    const hubId = hubData.id;

    const calculateAverageForHubAndBeacon = (hubId, macAddress, callback) => {
        const thirtySecondsAgo = Date.now() - 61000; // X seconds in the past
        db.all("SELECT rssi FROM beacon_history WHERE macAddress = ? AND hubId = ? AND timestamp > ?", [macAddress, hubId, thirtySecondsAgo], (err, rows) => {
            if (err) {
                return callback(err);
            }

            const totalPossibleReadings = 20;
            let sum = 0;

            rows.forEach(row => {
                sum += row.rssi;
            });

            const missingReadings = totalPossibleReadings - rows.length;
            sum += missingReadings * (-100); // Use Y for missing readings

            const average = sum / totalPossibleReadings;

            callback(null, average);
        });
    };
    if (HUB_TO_ZONE[hubId]) {
        hubData.items.forEach(item => {
            if (MAIN_BLE_BEACONS.includes(item.macAddress)) {
                const currentRssi = item.rssi[0].rssi;
                const currentTime = Date.now();

                // Insert into beacon_history
                db.run("INSERT INTO beacon_history (macAddress, rssi, hubId, timestamp) VALUES (?, ?, ?, ?)", [item.macAddress, currentRssi, hubId, currentTime], (err) => {
                    if (err) {
                        return console.error("Error inserting into beacon_history:", err.message);
                    }

                    // Calculate moving average for current hub and compare with best hub
                    calculateAverageForHubAndBeacon(hubId, item.macAddress, (err, currentHubAverage) => {
                        db.get("SELECT bestHubId FROM beacons WHERE macAddress = ?", [item.macAddress], (err, row) => {
                            let bestHubId = row ? row.bestHubId : null;

                            if (bestHubId) {
                                calculateAverageForHubAndBeacon(bestHubId, item.macAddress, (err, bestHubAverage) => {
                                    if (currentHubAverage > bestHubAverage) {
                                        db.run("UPDATE beacons SET bestHubId = ? WHERE macAddress = ?", [hubId, item.macAddress]);
                                    }
                                });
                            } else {
                                db.run("REPLACE INTO beacons (macAddress, bestHubId, lastUpdatedTimestamp) VALUES (?, ?, ?)", [item.macAddress, hubId, currentTime]);
                            }
                        });
                    });
                });
            }
        });

        db.run("REPLACE INTO hubs (id, zone) VALUES (?, ?)", [hubId, HUB_TO_ZONE[hubId]]);
    }

    res.send({ status: 'OK' });
});


// Endpoint to serve zone data
app.get('/zones', (req, res) => {
    const zones = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];

    // Helper function to get the beacon count for a zone
    const getCountForZone = (zone) => {
        return new Promise((resolve, reject) => {
            // Fetch the count based on bestHubId for each zone
            db.get("SELECT COUNT(macAddress) as count FROM beacons WHERE bestHubId IN (SELECT id FROM hubs WHERE zone = ?)", [zone], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        name: zone,
                        count: row ? row.count : 0
                    });
                }
            });
        });
    };

    // Use Promise.all to wait for all database calls to complete
    Promise.all(zones.map(zone => getCountForZone(zone)))
        .then(results => {
            res.json({ zones: results });
        })
        .catch(error => {
            console.error('Error fetching zone data:', error);
            res.status(500).send({ error: 'Internal server error' });
        });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('exit', () => {
  db.close();
});

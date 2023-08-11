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

    if (HUB_TO_ZONE[hubId]) {
        // Step 1: Set RSSI of all beacons associated with this hub to -999
        db.run("UPDATE beacons SET rssi = -999 WHERE hubId = ?", [hubId], err => {
            if (err) {
                return console.error("Error updating RSSI values:", err.message);
            }

            // Now process the incoming beacon data
            hubData.items.forEach(item => {
                if (MAIN_BLE_BEACONS.includes(item.macAddress)) {
                    const currentRssi = item.rssi[0].rssi;

                    // Step 2: Update the RSSI of the beacon regardless of its value
                    db.run("REPLACE INTO beacons (macAddress, rssi, hubId) VALUES (?, ?, ?)", [item.macAddress, currentRssi, hubId]);
                }
            });

            // Step 3: Delete beacons with RSSI of -999 for this hub
            db.run("DELETE FROM beacons WHERE hubId = ? AND rssi = -999", [hubId], err => {
                if (err) {
                    console.error("Error deleting beacons:", err.message);
                }
            });

            db.run("REPLACE INTO hubs (id, zone) VALUES (?, ?)", [hubId, HUB_TO_ZONE[hubId]]);
        });
    }

    res.send({ status: 'OK' });
});

  


// Endpoint to serve zone data
app.get('/zones', (req, res) => {
  const zones = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];
  let responseData = [];

  zones.forEach((zone, index) => {
      db.all("SELECT COUNT(macAddress) as count FROM beacons WHERE hubId IN (SELECT id FROM hubs WHERE zone = ?)", [zone], (err, rows) => {
          if (rows && rows.length > 0) {
              responseData.push({ name: zone, count: rows[0].count });
          } else {
              responseData.push({ name: zone, count: 0 });
          }

          if (index === zones.length - 1) {
              res.json({ zones: responseData });
          }
      });
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('exit', () => {
  db.close();
});

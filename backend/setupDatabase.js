const sqlite3 = require('sqlite3').verbose();

// Create a new database file
let db = new sqlite3.Database('./rtls_demo.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create tables for hubs, beacons, and beacon history
db.serialize(() => {
    // Table for hubs
    db.run("CREATE TABLE hubs (id TEXT PRIMARY KEY, zone TEXT)");

    // Table for beacons to store the current best hub for each beacon
    db.run("CREATE TABLE beacons (macAddress TEXT PRIMARY KEY, bestHubId TEXT, lastUpdatedTimestamp INTEGER)");

    // Table for beacon history to store RSSI readings over time
    db.run("CREATE TABLE beacon_history (id INTEGER PRIMARY KEY AUTOINCREMENT, macAddress TEXT, rssi INTEGER, hubId TEXT, timestamp INTEGER)");
    
    // Add an index to speed up the search for specific beacon and hub combinations
    db.run("CREATE INDEX idx_mac_hub ON beacon_history(macAddress, hubId)");
});

db.close();

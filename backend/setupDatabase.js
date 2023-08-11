const sqlite3 = require('sqlite3').verbose();

// Create a new database file
let db = new sqlite3.Database('./rtls_demo.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create tables for hubs and beacons
db.serialize(() => {
    db.run("CREATE TABLE hubs (id TEXT PRIMARY KEY, zone TEXT)");
    db.run("CREATE TABLE beacons (macAddress TEXT PRIMARY KEY, rssi INTEGER, hubId TEXT)");
});

db.close();

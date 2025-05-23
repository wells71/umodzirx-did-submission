const mysql = require('mysql2');

// MySQL configuration
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  port: 3306,
});

// Connect to MySQL and create the database
mysqlConnection.connect(err => {
  if (err) {
    console.error('MySQL connection error', err);
    return;
  }

  console.log('Connected to MySQL');

  // Create the test_db database
  mysqlConnection.query('CREATE DATABASE IF NOT EXISTS staff', (err, results) => {
    if (err) {
      console.error('Error creating database:', err);
    } else {
      console.log('Database staff created or already exists.');
    }
    mysqlConnection.end();
  });
});

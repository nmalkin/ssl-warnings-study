/// <reference path='../../typings/vendor/mysql/mysql.d.ts' />

import mysql = require('mysql');

var connection = null;
/**
 * Set up the MySQL connection
 */
function connect() : void {
    connection = mysql.createConnection({
        host: process.env['MYSQL_HOST'],
        database: process.env['MYSQL_DATABASE'],
        user: process.env['MYSQL_USER'],
        password: process.env['MYSQL_PASSWORD']
    });

    connection.connect(function(err) {
      if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        connection = null;
      }

      console.log('Connected to the database with ID ' + connection.threadId);
    });

    // Handle connection errors
    connection.on('error', function(err) {
        console.log('Database connection error:', err);

        // Reconnect if connection gets lost
        if(err.code == 'PROTOCOL_CONNECTION_LOST') {
            console.log('Attempting to reconnect to the database');
            connect();
        } else {
            throw new Error(JSON.stringify(err));
        }
    });

    // Handle app shutdown
    process.on('SIGTERM', function () {
        console.log('Shutting down database connection');
        connection.end(function(err) {
            process.exit();
        });
    });
}

/**
 * Execute the given query, interpolating the provided values
 */
export function execute(statement : string, values : any) : void {
    connection.query(statement, values, function(err, rows, fields) {
        if(err) {
            console.error(err);
        }
    });
}

// On app start-up:
connect();

/// <reference path='../../typings/vendor/mysql/mysql.d.ts' />

import mysql = require('mysql');

/**
 * Set up the MySQL connection
 */
function connect() : mysql.IConnection {
    var connection = mysql.createConnection({
        host: 'mysql', // With Docker compose, the app name becomes the hostname.
        database: process.env['MYSQL_DATABASE'],
        user: process.env['MYSQL_USER'],
        password: process.env['MYSQL_PASSWORD']
    });

    connection.connect(function(err) {
      if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return null;
      }

      console.log('Connected to the database with ID ' + connection.threadId);
    });


    process.on('exit', function () {
        console.log('Shutting down database connection');
        connection.end();
    });

    return connection;
}

var connection = connect();

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

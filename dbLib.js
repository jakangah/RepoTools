'use strict';
require('dotenv').config();
const DB_NAME = process.env.DB_NAME || 'GithubUtils'
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(DB_NAME);
 
const runQuery = (query)=>{
    try {
        const res = db.run(query);
        db.close();
        return res
    } catch (error) {
        console.error(error);
        throw error;
    }

}

module.exports = {
    runQuery
}
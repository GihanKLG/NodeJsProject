const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');


// Default configuration
let tableName = '_upgrade_version';
let verbose = false;
let filePath;
let db;


// Logs something if verbose option is set
function log(msg, skipIndent) {
	if(verbose === false) return;
	if(skipIndent) return console.log(msg);
	console.log('  -> ' + msg);
}

// Async wrapper around fs.readdir
function readFiles(dir) {
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, files) => {
			if(err) return reject(err);
			resolve(files);
		});
	});
}



// Creates the upgrade table
async function createVersionTable() {

	log('Creating table ' + tableName + '...');

	let query = [];
	query.push('CREATE TABLE ' + db.connection.escapeId(tableName) + ' (`version` int(11) unsigned NOT NULL);');
	query.push('INSERT INTO ' + db.connection.escapeId(tableName) + ' SET `version` = 0;');

	let result = await db.query(query.join(' '));
	return 0;
}

// Gets the current database version
async function getVersion() {

	log('Checking database table ' + tableName + ' for version info...');
	let query = 'SELECT `version` FROM ' + db.connection.escapeId(tableName) + ' LIMIT 1';

	let result;
	try {
		result = await db.query(query);
	} catch(err) {
		if(err && err.code === 'ER_NO_SUCH_TABLE') return -1;
		throw err;
	}

	if(result[0].length === 0) return reject(new Error('No version record found in table ' + tableName));
	return parseInt(result[0][0].version);
}

// Starts the upgrade
function tryUpgrade(currentVersion, files) {
	return new Promise((resolve, reject) => {
		upgradeStep(currentVersion, files, (err, newVersion) => {
			if (err)
				return reject(err);
			resolve({ oldVersion: currentVersion, newVersion: newVersion });
		});
	});
}

// Upgrades the database to the next version
// Uses callback because that's easier to work with
function upgradeStep(currentVersion, files, callback) {
	let nextVersion = currentVersion + 1;
	let nextVersionFile = nextVersion.toString() + '.sql';
	if (files.indexOf(nextVersionFile) === -1)
		return callback(null, currentVersion);
	fs.readFile(path.join(filePath, nextVersionFile), (err, sql) => {
		if (err)
			return callback(err);
		let query = sql.toString();
		query += '\nUPDATE ' + db.connection.escapeId(tableName) + ' SET `version` = `version` + 1';
		log('Running update ' + nextVersionFile + ' on database...');
		db.query(query).then(() => {
			upgradeStep(nextVersion, files, callback);
		}, (err) => {
			return callback(err);
		});
	});
}




module.exports = async function(options) {

	if(!options)
		throw new Error('No options object given');

	if(options.mysql.user === undefined || options.mysql.password === undefined || options.mysql.database === undefined)
		throw new Error('No MySQL credentials set. Expected: user, password, database');


	if(options.verbose) verbose = options.verbose;
	if(options.table) tableName = options.table;
	filePath = path.resolve(options.path || './database');

	log('MySQL Upgrade starting...', true);
	let dbOptions = Object.assign({}, options.mysql, {multipleStatements: true});

	db = await mysql.createConnection(dbOptions);

	log('Finding .sql files in directory ' + filePath + '...');
	let sqlFiles = await readFiles(filePath);
	sqlFiles = sqlFiles.filter((name) => name.indexOf('.sql') !== -1);
	if(sqlFiles.length === 0) {
		db.end();
		throw new Error('No SQL files found in ' + filePath);
	}

	log('Found ' + sqlFiles.length + ' SQL file' + (sqlFiles.length === 1 ? '' : 's'));
	let dbVersion = await getVersion();
	if(dbVersion === -1) {
		log('Database not yet initialised');
		dbVersion = await createVersionTable();
	} else {
		log('Database is at version ' + dbVersion);
	}

	let upgraded = await tryUpgrade(dbVersion, sqlFiles);
	db.end();
	if(upgraded['oldVersion'] === upgraded['newVersion']) {
		log('Database already up to date');
	} else {
		log('Database upgraded from version ' + upgraded['oldVersion'] + ' to version ' + upgraded['newVersion'], true);
	}

	return upgraded;

}

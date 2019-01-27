const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('gg')

const _run = db.run
db.run = function () {
  console.log('sql:', arguments[0])
  return _run.apply(db, Array.prototype.slice.apply(arguments))
}

const _all = db.all
db.all = function () {
  console.log('sql:', arguments[0])
  return _all.apply(db, Array.prototype.slice.apply(arguments))
}

const tableName = 'teacher'

export async function initTable () {
  const exist = await existTable(tableName)
  console.log(`exist ${exist}`)
  if (!exist) {
    await makeTable(tableName)
    console.log(`make table ${tableName}`)
  }
}

export async function existTable () {
  const sql = `select count(*) as c from sqlite_master where type='table' and name = '${tableName}';`
  return new Promise((resolve, reject) => {
    db.get(sql, function (err, result) {
      if (err) {
        return reject(err)
      }
      resolve(result && result.c && result.c > 0)
    })
  })
}

export async function makeTable () {
  const sql = `
  CREATE TABLE ${tableName}(
    id integer  PRIMARY KEY  AUTOINCREMENT   NOT NULL,
    name           TEXT    NOT NULL,
    sex            TEXT     NOT NULL
  ); 
  `
  return new Promise((resolve, reject) => {
    db.run(sql, function (err) {
      if (err) {
        return reject(err)
      }
      resolve(this)
    })
  })
}

export async function insertData (records) {
  if (records.length < 1) {
    throw new Error('数据不能为空')
  }
  const dataSql = records.map(item => `('${item[0]}','${item[1]}')`).join(',')
  const sql = `
    INSERT INTO ${tableName}(
      name,
      sex
    ) VALUES ${dataSql}; 
    `
  return new Promise((resolve, reject) => {
    db.run(sql, function (err) {
      if (err) {
        return reject(err)
      }
      resolve(this)
    })
  })
}

export async function selectData (offset = 0, limit = 10) {
  const sql = `select * from ${tableName} limit ${offset},${limit};`
  return new Promise((resolve, reject) => {
    db.all(sql, function (err, result) {
      console.log(err, result)
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

export async function selectDataByName (name, offset = 0, limit = 10) {
  const sql = `select * from ${tableName} where name like '%${name}%' limit ${offset},${limit};`
  return new Promise((resolve, reject) => {
    db.all(sql, function (err, result) {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

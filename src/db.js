const Sequelize = require('sequelize')
const fs = require('fs')
const { createContext } = require('dataloader-sequelize')
const association = require('../db/association')

const { db } = require('../config')

const sequelize = new Sequelize(db.database, db.username, db.password, {
  dialect: 'postgres',
  host: db.host,
  port: db.port
})

// import all schemas
fs.readdirSync(`${__dirname}/../db/_schemas`).forEach((file) => {
  sequelize.import(`${__dirname}/../db/_schemas/${file}`)
})

association(sequelize)
createContext(sequelize, {
  cache: true
})

module.exports = sequelize

const Logger = require('logger.js').LoggerFactory
const args = require('minimist')(process.argv.slice(2))
const logger = Logger.getLogger('db', 'purple')
logger.info('Connecting...')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const config = require('../config.yml')
const sequelize = new Sequelize.Sequelize(config.database.name, config.database.user, config.database.pass, {
  host: config.database.host,
  dialect: config.database.type,
  storage: `${__dirname}/../database.sqlite`,
  logging: false,
})
sequelize.authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.')
    process.emit('dbready')
  })
  .catch(err => {
    logger.emerg('Unable to connect to the database: ' + err)
    process.exit(1)
  })
const Server = sequelize.define('servers', {
  server_id: {
    type: Sequelize.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  banned: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
})
const Commit = sequelize.define('commits', {
  commit_hash: {
    type: Sequelize.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  server_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  data: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  committed_at: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
})
if (args.forceSync) logger.warn('Forced sync, it will drop table!!!')

sequelize.sync({ force: args.forceSync })

module.exports = {
  /**
   * Get or create from server table and return Server data.
   * @param {string} server_id ID of the server
   * @returns {Promise<Server>} A created/loaded server
   */
  async getServer(server_id) {
    return (await Server.findOrCreate({
      where: { server_id },
      defaults: { server_id },
    }))[0]
  },
  /**
   * Find and get all commits by server ID.
   * @param {string} server_id ID of the server
   * @returns {Promise<Commit[]>} All found commits by server id.
   */
  getServerCommits(server_id) {
    return Commit.findAll({
      where: {
        server_id,
        [Op.not]: { server_id: null },
      },
    })
  },
  /**
   * Get commit from the provided commit hash.
   * @param {string} commit A commit hash
   * @returns {Promise<Commit>} A commit
   */
  getCommit(commit) {
    return Commit.findOne({
      where: { commit },
    })
  },
  /**
   * Commits changes
   * @param {string} commit_hash Commit hash generated by generateCommitHash.js
   * @param {string} server_id ID of the server(guild)
   * @param {string} type Type of commit or audit
   * @param {string} data Data of this commit, probably server name or something
   * @param {number} committed_at Timestamp of this commit has made
   * @returns {Promise<Commit>} A new commit
   */
  commit(commit_hash, server_id, type, data, committed_at) {
    return Commit.create({ commit_hash, server_id, type, data, committed_at })
  },
  /**
   * Get commit logs for specified server, ordered by timestamp.
   * @param {string} server_id ID of the server
   * @returns {Promise<Commit[]>} All commits
   */
  async getCommitLogs(server_id) {
    return await Commit.findAll({
      where: { server_id },
      order: [['committed_at', 'DESC']],
    })
  },
}

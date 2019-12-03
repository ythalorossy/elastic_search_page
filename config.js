var conf = module.exports = {
  apm: {
    serviceName: 'Training Search Webpage',
    serverUrl: 'http://server2:8200',
    active: false,
  },
  es: {
    host: 'blogs_user:password@server1:9200',
    log: 'info',
  },
  pg: {
    user: 'postgres',
    host: 'db_server',
    database: 'postgres',
    password: 'password',
    port: 5432,
  },
  suggester: false
}

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const axios = require('axios')

const typeDef = `
  scalar ConstraintString
  scalar ConstraintNumber

  input Like {
    like: String!
  }

  input Order {
    field: String!
    asc: Boolean = true
  }

  input TimeBetween {
    # [DateTime, DateTime] 表示起止时间
    between: [DateTime!]!
  }

  type Query {
    ping: String!

    error: Int!
    reqError: Int
    cache: Int! @cache(age: "1h")

    me: User @findOption @auth
    users: [User!] @findOption @auth(role: ADMIN)
  }
`

const resolver = {
  Query: {
    ping () {
      return 'pong'
    },
    error () {
    },
    reqError (root, args, { Exception }) {
      // ECONREFUSED error
      // 尽量都显式地抛出异常，方便在 sentry 中定位
      return axios.get('http://localhost:8080', {
        params: {
          a: 3,
          b: 4
        }
      })
    },
    cache () {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(100), 10000)
      })
    },
    me (root, args, { models, user, Exception }, { attributes }) {
      return models.users.findOne({
        where: {
          id: user.id
        },
        attributes
      })
    },
    users (root, args, { models }, { attributes }) {
      return models.users.findAll({ attributes })
    }
  }
}

const schemas = fs.readdirSync(path.resolve(__dirname)).filter(x => x[0].charCodeAt() < 96)
const { typeDefs, resolvers } = schemas.reduce(({ typeDefs, resolvers }, file) => {
  const { resolver, typeDef } = require(`./${file}`)
  return {
    typeDefs: [...typeDefs, typeDef],
    resolvers: _.merge(resolvers, resolver)
  }
}, {
  typeDefs: [typeDef],
  resolvers: resolver
})

module.exports = {
  typeDefs,
  resolvers
}

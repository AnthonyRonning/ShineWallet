import {Model} from 'vue-mc'

const uuidV4 = require('uuid/v4')

/**
 * Task model
 */
export class Wallet extends Model {
  defaults () {
    return {
      id: uuidV4(),
      alias: '',
      type: '',
      hostAndPort: '',
      macaroon: null,
      username: null,
      password: null,
      fileLocation: 'wallets/',
      testnet: false
    }
  }

  mutations () {
    return {
      fileLocation: (fileLocation) => fileLocation + this.id + '.json',
      testnet: Boolean
    }
  }

  options () {
    return {
      methods: {
        save: 'POST'
      }
    }
  }

  routes () {
    return {
      save: 'wallet.save.blockstack'
    }
  }

  save (blockstack) {
    console.log('saving file: ' + JSON.stringify(this.toJSON()))
    return blockstack.putFile(this.fileLocation, JSON.stringify(this.toJSON()), {encrypt: true})
  }
}

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
      testnet: false,
      activeChannels: 0,
      peers: 0
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
        save: 'POST',
        retrieve: 'GET'
      }
    }
  }

  routes () {
    return {
      save: 'wallet.save.blockstack',
      retrieve: 'wallet.retrieve.blockstack'
    }
  }

  save (blockstack) {
    console.log('saving file: ' + JSON.stringify(this.toJSON()))
    return blockstack.putFile(this.fileLocation, JSON.stringify(this.toJSON()), {encrypt: true})
  }

  retrieve (blockstack) {
    return blockstack.getFile('wallets/' + this.id + '.json', {decrypt: true})
      .then((walletJson) => {
        if (walletJson !== null) {
          let wallet = JSON.parse(walletJson || '[]')
          this.id = wallet.id
          this.alias = wallet.alias
          this.type = wallet.type
          this.hostAndPort = wallet.hostAndPort
          this.macaroon = wallet.macaroon
          this.username = wallet.username
          this.password = wallet.password
          this.fileLocation = wallet.fileLocation
          this.testnet = wallet.testnet
          this.activeChannels = wallet.activeChannels
          this.peers = wallet.peers
        }
      })
  }
}

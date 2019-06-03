import {Collection} from 'vue-mc'
import {Wallet} from '../Wallet'

let WALLET_LIST_LOC = 'wallets/list.json'

export class WalletList extends Collection {
  model () {
    return Wallet
  }

  defaults () {
    return {
      orderBy: 'alias'
    }
  }

  options () {
    return {
      methods: {
        save: 'POST',
        get: 'GET'
      }
    }
  }

  routes () {
    return {
      save: 'walletlist.save.blockstack',
      get: 'walletlist.get.blockstack'
    }
  }

  save (blockstack) {
    console.log('saving file: ' + JSON.stringify(this.toJSON()))
    return blockstack.putFile(WALLET_LIST_LOC, JSON.stringify(this.toJSON()), {encrypt: true})
  }

  get (blockstack) {
    return blockstack.getFile(WALLET_LIST_LOC, { decrypt: true })
      .then((walletListJson) => {
        if (walletListJson !== null) {
          let walletList = JSON.parse(walletListJson || '[]')
          this.models = walletList
        }
      })
  }
}

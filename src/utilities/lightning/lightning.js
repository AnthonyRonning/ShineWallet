import {Lnd} from './lnd/lnd'
import {CLightning} from './c-lightning/c-lightning'

let LND = 'LND'
let LIGHTNINGD = 'C-Lightning'

export class Lightning {
  constructor (wallet) {
    this.wallet = wallet
  }

  getInfo () {
    switch (this.wallet.type) {
      case LND :
        return Lnd.getInfo(this.wallet)
      case LIGHTNINGD :
        return CLightning.getInfo(this.wallet)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }
}

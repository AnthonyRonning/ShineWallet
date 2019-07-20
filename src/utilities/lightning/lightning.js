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

  listChannels () {
    switch (this.wallet.type) {
      case LND :
        return Lnd.listChannels(this.wallet)
      case LIGHTNINGD :
        return CLightning.listChannels(this.wallet)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  walletBalance () {
    switch (this.wallet.type) {
      case LND :
        return Lnd.walletBalance(this.wallet)
      case LIGHTNINGD :
        return CLightning.walletBalance(this.wallet)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  channelBalance () {
    switch (this.wallet.type) {
      case LND :
        return Lnd.channelBalance(this.wallet)
      case LIGHTNINGD :
        return CLightning.channelBalance(this.wallet)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  decodePayReq (bolt11) {
    switch (this.wallet.type) {
      case LND :
        return Lnd.decodePayReq(this.wallet, bolt11)
      case LIGHTNINGD :
        return CLightning.decodePayReq(this.wallet, bolt11)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  pay (bolt11) {
    switch (this.wallet.type) {
      case LND :
        return Lnd.pay(this.wallet, bolt11)
      case LIGHTNINGD :
        return CLightning.pay(this.wallet, bolt11)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  createInvoice (invoiceInfo) {
    switch (this.wallet.type) {
      case LND :
        return Lnd.createInvoice(this.wallet, invoiceInfo)
      case LIGHTNINGD :
        return CLightning.createInvoice(this.wallet, invoiceInfo)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  listAllTransactions () {
    switch (this.wallet.type) {
      case LND :
        return Lnd.listAllTransactions(this.wallet)
      case LIGHTNINGD :
        return CLightning.listAllTransactions(this.wallet)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  openChannel (channelReq) {
    switch (this.wallet.type) {
      case LND :
        return Lnd.openChannel(this.wallet, channelReq)
      case LIGHTNINGD :
        return CLightning.openChannel(this.wallet, channelReq)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  connect (channelReq) {
    switch (this.wallet.type) {
      case LND :
        return Lnd.connect(this.wallet, channelReq)
      case LIGHTNINGD :
        return CLightning.connect(this.wallet, channelReq)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }

  closeChannel (channel) {
    switch (this.wallet.type) {
      case LND :
        return Lnd.closeChannel(this.wallet, channel)
      case LIGHTNINGD :
        return CLightning.closeChannel(this.wallet, channel)
      default :
        throw new Error('Lightning Daemon not supported')
    }
  }
}

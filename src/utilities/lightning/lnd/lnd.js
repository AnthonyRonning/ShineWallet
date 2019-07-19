import rp from 'request-promise'
import {Channel} from '../../../models/LNWrappers/Channel'
import {PayReq} from '../../../models/LNWrappers/PayReq'
import {Transaction} from '../../../models/LNWrappers/Transaction'

export class Lnd {
  static getInfo (wallet) {
    console.log('lnd getInfo')

    var options = this.createOptions(wallet, 'getinfo')

    return rp.get(options)
      .then((body) => {
        console.log('made request')
        console.log(body)

        if (body) {
          console.log('response from LND successful')
          return this.getInfoToWallet(body)
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static getInfoToWallet (body) {
    body.pubkey = body.identity_pubkey
    return body
  }

  static listChannels (wallet) {
    console.log('lnd listChannels')

    var options = this.createOptions(wallet, 'channels')

    return rp.get(options)
      .then((body) => {
        // console.log(body)

        if (body) {
          return this.listChannelsToChannelList(wallet, body)
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static listChannelsToChannelList (wallet, body) {
    let channelList = []
    body.channels.forEach(function (channel) {
      let newChannel = new Channel()
      newChannel.alias = channel.alias
      newChannel.remote_pubkey = channel.remote_pubkey
      newChannel.active = channel.active ? channel.active : false
      newChannel.capacity = parseInt(channel.capacity)
      newChannel.local_balance = channel.local_balance ? parseInt(channel.local_balance) : 0
      newChannel.remote_balance = channel.remote_balance ? parseInt(channel.remote_balance) : 0
      newChannel.fee = parseInt(channel.commit_fee)
      newChannel.private = channel.private ? channel.private : false

      channelList.push(newChannel)
    })

    this.getChannelListPeerData(wallet, channelList)

    return channelList
  }

  static async getChannelListPeerData (wallet, channelList) {
    for await (let channel of channelList) {
      var options = this.createOptions(wallet, 'graph/node/' + channel.remote_pubkey)

      rp.get(options)
        .then(res => {
          console.log(res)
          channel.alias = res.node.alias
          console.log(channel)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }

  static walletBalance (wallet) {
    console.log('lnd walletbalance')

    var options = this.createOptions(wallet, 'balance/blockchain')

    return rp.get(options)
      .then((body) => {
        // console.log(body)

        if (body) {
          // confirmed balance might be null, but unconfirmed has a balance
          return body.confirmed_balance
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static channelBalance (wallet) {
    console.log('lnd channelbalance')

    var options = this.createOptions(wallet, 'balance/channels')

    return rp.get(options)
      .then((body) => {
        // console.log(body)

        if (body) {
          return body.balance
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static decodePayReq (wallet, bolt11) {
    console.log('lnd decodepayreq')

    var options = this.createOptions(wallet, 'payreq/' + bolt11)

    return rp.get(options)
      .then((body) => {
        // console.log(body)

        if (body) {
          return this.decodePayReqToPayReq(body)
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static decodePayReqToPayReq (body) {
    let payReq = new PayReq()
    payReq.amount = body.num_satoshis
    payReq.description = body.description
    payReq.destination = body.destination

    return payReq
  }

  static pay (wallet, bolt11) {
    console.log('lnd pay')

    var requestBody = {
      payment_request: bolt11
    }

    var options = this.createOptions(wallet, 'channels/transactions')
    options.body = requestBody

    return rp.post(options)
      .then((body) => {
        // console.log(body)

        if (body) {
          return body.payment_error
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static createInvoice (wallet, invoiceInfo) {
    console.log('lnd createinvoice')

    var requestBody = {
      value: invoiceInfo.amount,
      memo: invoiceInfo.description
    }

    var options = this.createOptions(wallet, 'invoices')
    options.body = requestBody

    return rp.post(options)
      .then((body) => {
        // console.log(body)

        return body.payment_request
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static async listAllTransactions (wallet) {
    console.log('lnd listAllTransactions')
    let transactionList = []

    transactionList = transactionList.concat(await this.listInvoices(wallet))
    transactionList = transactionList.concat(await this.listPayments(wallet))

    transactionList.sort(function compare (a, b) {
      let dateA = new Date(a.date)
      let dateB = new Date(b.date)
      return dateB - dateA
    })

    return transactionList
  }

  static listInvoices (wallet) {
    console.log('lnd listAllTransactions')

    var options = this.createOptions(wallet, 'invoices')

    return rp.get(options)
      .then((body) => {
        // console.log(body)

        if (body) {
          return this.listInvoicesToTransactionList(body.invoices)
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static listInvoicesToTransactionList (invoices) {
    let transactionList = []
    let filteredInvoices = invoices.filter((i) => { return i.state === 'SETTLED' })

    filteredInvoices.forEach(function (invoice) {
      let newTransaction = new Transaction()
      newTransaction.type = 'LIGHTNING'
      newTransaction.incoming = true
      newTransaction.date = new Date(invoice.settle_date * 1000).toUTCString()
      newTransaction.description = invoice.memo
      newTransaction.amount = invoice.amt_paid_sat
      newTransaction.status = 'PAID'

      transactionList.push(newTransaction)
    })

    return transactionList
  }

  static listPayments (wallet) {
    console.log('lnd listAllTransactions')

    var options = this.createOptions(wallet, 'payments')

    return rp.get(options)
      .then((body) => {
        // console.log(body)

        if (body) {
          return this.listPaymentsToTransactionList(body.payments)
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static listPaymentsToTransactionList (payments) {
    let transactionList = []

    payments.forEach(function (payment) {
      let newTransaction = new Transaction()
      newTransaction.type = 'LIGHTNING'
      newTransaction.incoming = false
      newTransaction.date = new Date(payment.creation_date * 1000).toUTCString()
      newTransaction.amount = 0 - payment.value_sat
      newTransaction.status = 'PAID'

      transactionList.push(newTransaction)
    })

    return transactionList
  }

  static openChannel (wallet, channelReq) {
    console.log('lnd openChannel')

    var requestBody = {
      local_funding_amount: channelReq.amount,
      node_pubkey_string: channelReq.pubKey
    }

    var options = this.createOptions(wallet, 'channels')
    options.body = requestBody

    return rp.post(options)
      .then((body) => {
        // console.log(body)

        return body.funding_txid_str
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }

  static connect (wallet, channelReq) {
    console.log('lnd connect')

    var requestBody = {
      addr: {
        pubkey: channelReq.pubKey,
        host: channelReq.host
      }
    }

    var options = this.createOptions(wallet, 'peers')
    options.body = requestBody

    return rp.post(options)
      .then((body) => {
      })
      .catch(function (error) {
        console.log(error)
        console.log('error code: ' + error.error.code)
        // this is an already connected error, is okay
        if (error.error.code === 2) {
          console.log('connect error code = 2, ignoring')
          return
        }
        throw error
      })
  }

  static createOptions (wallet, endpoint) {
    return {
      url: wallet.hostAndPort + '/v1/' + endpoint,
      // Work-around for self-signed certificates.
      rejectUnauthorized: false,
      json: true,
      headers: {
        'Grpc-Metadata-macaroon': wallet.macaroon
      }
    }
  }
}

import rp from 'request-promise'
import {Channel} from '../../../models/LNWrappers/Channel'
import {PayReq} from '../../../models/LNWrappers/PayReq'

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

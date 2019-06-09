import rp from 'request-promise'
import {Channel} from '../../../models/LNWrappers/Channel'

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

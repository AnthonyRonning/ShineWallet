import {CLightningHelpers} from './helpers'
import {Channel} from '../../../models/LNWrappers/Channel'
import {PayReq} from '../../../models/LNWrappers/PayReq'

const MSATOSHI = 1000

export class CLightning {
  static getInfo (wallet) {
    console.log('clightning getInfo')
    return this.rpcCall(wallet, 'getinfo')
      .then(res => {
        console.log('response from getinfo:')
        console.log(res)
        return this.getInfoToWallet(res)
      })
      .catch((error) => {
        console.log(error)
        return error
      })
  }

  static getInfoToWallet (body) {
    // console.log('getInfoToWallet')
    body.pubkey = body.id
    body.short_channel_id = body.short_channel_id
    // console.log(body)

    return body
  }

  static listChannels (wallet) {
    console.log('clightning listChannels')
    let command = 'listchannels'
    return this.rpcCall(wallet, command)
      .then(res => {
        return this.listChannelsToChannelList(wallet, res, wallet.pubkey)
      })
      .catch((error) => {
        return error
      })
  }

  static listChannelsToChannelList (wallet, body, id) {
    let channelList = []
    // console.log(body.channels)
    let filteredChannels = body.channels.filter((c) => { return c.source === id })

    // console.log('filtered list of channels:')
    // console.log(filteredChannels)

    filteredChannels.forEach(function (channel) {
      let newChannel = new Channel()
      newChannel.remote_pubkey = channel.destination
      newChannel.active = channel.active ? channel.active : false
      newChannel.capacity = parseInt(channel.satoshis)
      newChannel.private = channel.public ? !channel.public : true

      channelList.push(newChannel)
    })

    this.getChannelListPeerData(wallet, channelList)

    return channelList
  }

  static async getChannelListPeerData (wallet, channelList) {
    for await (let channel of channelList) {
      // get balance info
      this.rpcCall(wallet, 'listpeers', [channel.remote_pubkey])
        .then(res => {
          // console.log(res)
          let channelInfo = res.peers[0].channels[0]
          channel.local_balance = channelInfo.msatoshi_to_us / MSATOSHI
          channel.remote_balance = channel.capacity - channel.local_balance
          // console.log(channel)
        })
        .catch(error => {
          console.log(error)
        })

      // get alias
      this.rpcCall(wallet, 'listnodes', [channel.remote_pubkey])
        .then(res => {
          // console.log(res)
          let channelInfo = res.nodes[0]
          channel.alias = channelInfo.alias
          // console.log(channel)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }

  static walletBalance (wallet) {
    console.log('clightning walletBalance')
    let command = 'listfunds'
    return this.rpcCall(wallet, command)
      .then(res => {
        return this.walletBalanceToTotalAmount(wallet, res)
      })
      .catch((error) => {
        return error
      })
  }

  static walletBalanceToTotalAmount (wallet, body) {
    let totalAmount = 0

    if (body.outputs) {
      totalAmount = _.sumBy(body.outputs, 'value')
    }

    return totalAmount
  }

  static channelBalance (wallet) {
    console.log('clightning channelBalance')
    let command = 'listfunds'
    return this.rpcCall(wallet, command)
      .then(res => {
        return this.channelBalanceToTotalAmount(wallet, res)
      })
      .catch((error) => {
        return error
      })
  }

  static channelBalanceToTotalAmount (wallet, body) {
    let totalAmount = 0

    if (body.channels) {
      totalAmount = _.sumBy(body.channels, 'channel_sat')
    }

    return totalAmount
  }

  static decodePayReq (wallet, bolt11) {
    console.log('clightning decodePayReq')
    let command = 'decodepay'
    return this.rpcCall(wallet, command, [bolt11])
      .then(res => {
        return this.decodePayReqToPayReq(res)
      })
      .catch((error) => {
        return error
      })
  }

  static decodePayReqToPayReq (body) {
    let payReq = new PayReq()
    payReq.amount = body.msatoshi / MSATOSHI
    payReq.description = body.description
    payReq.destination = body.payee

    return payReq
  }

  static pay (wallet, bolt11) {
    console.log('clightning pay')
    let command = 'pay'
    return this.rpcCall(wallet, command, [bolt11])
      .then(res => {
        if (res.status && res.status === 'complete') {
          return null
        } else if (res.status) {
          return res.status
        } else if (res.message) {
          return res.message
        } else {
          return 'Unknown Error'
        }
      })
      .catch((error) => {
        return error
      })
  }

  static rpcCall (wallet, method, params = []) {
    console.log('making rpc call for ' + method)
    return fetch(CLightningHelpers.normalizeURL(wallet.hostAndPort) + '/rpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'shine-wallet',
        'X-Access': CLightningHelpers.makeAccessKey(wallet.username, wallet.password)
      },
      body: JSON.stringify({method, params})
    })
      .then(r => r.json())
      .then(res => {
        console.log(res)
        if (res.code) {
          throw new Error(res.message || res.code)
        }
        return res
      })
  }
}

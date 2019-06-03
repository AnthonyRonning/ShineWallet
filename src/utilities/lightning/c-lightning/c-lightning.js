import {CLightningHelpers} from './helpers'

export class CLightning {
  static getInfo (wallet) {
    console.log('clightning getInfo')
    return this.rpcCall(wallet, 'getinfo')
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

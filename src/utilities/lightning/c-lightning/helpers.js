import createHmac from 'create-hmac'

export class CLightningHelpers {

  static normalizeURL (endpoint) {
    console.log(endpoint)
    let url = new URL(endpoint.trim(), 'http://localhost:9737/')
    let finalizeUrl = url.protocol + '//' + url.host
    console.log('c-lightning reference url: ' + finalizeUrl)
    return url.protocol + '//' + url.host
  }

  static makeAccessKey (username, password) {
    return createHmac('sha256', `${username}:${password}`)
      .update('access-key')
      .digest('base64')
      .replace(/\W+/g, '')
  }
}

import rp from 'request-promise'

export class Lnd {
  static getInfo (wallet) {
    console.log('lnd getInfo')

    var options = {
      url: wallet.hostAndPort + '/v1/getinfo',
      // Work-around for self-signed certificates.
      rejectUnauthorized: false,
      json: true,
      headers: {
        'Grpc-Metadata-macaroon': wallet.macaroon
      }
    }

    return rp.get(options)
      .then((body) => {
        console.log('made request')
        console.log(body)

        if (body) {
          console.log('response from LND successful')
          return body
        }
      })
      .catch(function (error) {
        console.log(error)
        throw error
      })
  }
}

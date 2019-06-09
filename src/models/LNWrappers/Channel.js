export class Channel {
  constructor () {
    this.alias = 'Channel'  // short_channel_id for c-lightning, alias for lnd
    this.remote_pubkey = ''
    this.active = true
    this.capacity = 0
    this.local_balance = 0  // msatoshi_to_us for c-lightning, local_balance for lnd
    this.remote_balance = 0
    this.fee = 0
    this.private = false
    this.color = '#000000'
  }
}

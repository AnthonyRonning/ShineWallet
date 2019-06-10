export class Transaction {
  constructor () {
    this.type = ''
    this.incoming = false
    this.date = ''
    this.description = ''
    this.amount = 0
    this.status = ''
    this.label = '' // c-lightning only
  }
}

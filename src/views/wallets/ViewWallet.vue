<template>
  <div class="animated fadeIn">
    <!-- Header Info Panels -->
    <b-row>
      <b-col sm="6" md="3">
        <b-card class="text-white bg-primary">
          <div class="h1 text-muted text-right mb-4">
            <i class="fa fa-btc"></i>
          </div>
          <div class="h4 mb-0">{{walletInfo.onChainSat}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Funds On Chain (sats)</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="3">
        <b-card class="text-white bg-primary">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-energy"></i>
          </div>
          <div class="h4 mb-0">{{walletInfo.offChainSat}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Funds Off Chain (sats)</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="3">
        <b-card class="text-white bg-primary">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-cloud-upload"></i>
          </div>
          <div class="h4 mb-0">{{wallet.activeChannels}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Channels</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="3">
        <b-card class="text-white bg-primary">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-people"></i>
          </div>
          <div class="h4 mb-0">{{wallet.peers}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Peers</small>
        </b-card>
      </b-col>

      <!-- Channels -->
      <b-col lg="12">
        <b-card header="Channels">
          <b-row>
            <b-col v-for="channel in walletInfo.channels" sm="6" md="4">
              <b-card :header="channel.alias" :border-variant="channel.active ? 'success' : 'secondary'">
                <div slot="header">
                  {{channel.alias}}
                  <b-badge v-if="channel.active" variant="success" class="float-right">Active</b-badge>
                  <b-badge v-if="!channel.active" variant="secondary" class="float-right">InActive</b-badge>
                </div>
                Capacity: {{channel.capacity}} SATS
                <b-progress class="mt-1" :max="channel.capacity" show-value>
                  <b-progress-bar
                    v-b-tooltip.hover
                    title="Outbound Capacity"
                    :value="channel.local_balance"
                    variant="success"></b-progress-bar>
                  <b-progress-bar
                    v-b-tooltip.hover
                    title="Inbound Capacity"
                    :value="channel.remote_balance"
                    variant="warning"></b-progress-bar>
                </b-progress>

                <div class="text-center">
                  <b-button
                    v-if="channel.active"
                    class="active mt-3"
                    pressed variant="danger"
                    aria-pressed="true">Close Channel</b-button>
                </div>
              </b-card>
            </b-col>
          </b-row>
        </b-card>
      </b-col>

      <!-- Transactions -->
      <b-col lg="12">
        <c-table
          :table-data="walletInfo.transactions"
          :fields="transactionFields"
          caption="Transactions"></c-table>
      </b-col>

      <!-- Peers -->
      <!-- <b-col lg="12">
        <c-table
          :table-data="walletInfo.peers"
          :fields="peerFields"
          caption="Peers"></c-table>
      </b-col> -->
    </b-row>

    <!-- showPayModal invoice modal -->
      <b-modal
        title="Pay Invoice"
        size="lg"
        v-model="payInvoiceModal">

        <!-- Success Alert -->
        <b-alert  v-model="showSuccessAlert" variant="success" dismissible>
          Payment Successful!
        </b-alert>
        <!-- Failure Alert -->
        <b-alert  v-model="showFailureAlert" variant="danger" dismissible>
          Failure sending payment: {{payFailureReason}}
        </b-alert>

        <b-form>

          <!-- invoice -->
          <b-form-group
            description="Enter Bolt11 Invoice"
            label="Invoice"
            label-for="invoice"
            :label-cols="3">
            <b-form-input id="invoice" type="text" v-model="invoice"></b-form-input>
          </b-form-group>
        </b-form>

        <div v-if="payReqInfo">
          <b-card>
            <p>Amount: {{payReqInfo.amount}} SATS</p>
            <p>Destination: {{payReqInfo.destination}}</p>
            <p>Description: {{payReqInfo.description}}</p>
          </b-card>
        </div>

        <div slot="modal-footer">
          <b-button
            variant="primary"
            size="md"
            class="btn btn-secondary"
            style="margin: 5px;"
            @click="payInvoiceModal=false"
          >
            Close
          </b-button>
          <b-button
            v-if="payInvoiceModalOkTitle === 'Check Invoice'"
            variant="primary"
            size="md"
            class="btn btn-primary"
            @click="decodeInvoice"
          >
            {{payInvoiceModalOkTitle}}
          </b-button>
          <b-button
            v-if="payInvoiceModalOkTitle === 'Pay Invoice'"
            variant="primary"
            size="md"
            class="btn btn-primary"
            @click="payInvoice"
          >
            {{payInvoiceModalOkTitle}}
          </b-button>
        </div>
      </b-modal>

    <!-- createinvoice modal -->
    <b-modal
      title="Create Invoice"
      size="lg"
      v-model="createInvoiceModal">
      <b-form>

        <!-- invoice -->
        <b-form-group
          description="Enter Amount In SATS"
          label="Amount"
          label-for="amount"
          :label-cols="3">
          <b-form-input id="amount" type="text" v-model="invoiceForm.amount"></b-form-input>
        </b-form-group>

        <b-form-group
          description="Enter Description"
          label="Description"
          label-for="description"
          :label-cols="3">
          <b-form-input id="description" type="text" v-model="invoiceForm.description"></b-form-input>
        </b-form-group>

        <b-form-group
          v-if="this.wallet.type === 'C-Lightning'"
          description="Enter Label"
          label="Label"
          label-for="label"
          :label-cols="3">
          <b-form-input id="label" type="text" v-model="invoiceForm.label"></b-form-input>
        </b-form-group>
      </b-form>

      <div v-if="newPayReq">
        <b-card>
          <p>PayReq: {{newPayReq}}</p>
        </b-card>
      </div>

      <div slot="modal-footer">
        <b-button
          variant="primary"
          size="md"
          class="btn btn-secondary"
          style="margin: 5px;"
          @click="payInvoiceModal=false"
        >
          Close
        </b-button>
        <b-button
          variant="primary"
          size="md"
          class="btn btn-primary"
          @click="createInvoice"
        >
          Create New Invoice
        </b-button>
      </div>
    </b-modal>

    <!-- fab -->
    <div>
      <fab :actions="fabActions"
           bg-color="#4dbd74"
           @invoice="showInvoiceModal"
           @showPayModal="showPayModal"
      ></fab>
    </div>
  </div>
</template>

<script>

  import {Wallet} from '../../models/Wallet'
  import {Lightning} from '../../utilities/lightning/lightning'
  import cTable from '../../views/base/Table.vue'
  import fab from 'vue-fab'

export default {
    name: 'ViewWallet',
    components: {
      cTable,
      fab
    },
    data: function () {
      return {
        blockstack: window.blockstack,
        wallet: new Wallet({id: this.$route.params.id}),
        walletInfo: {
          onChainSat: 0, // todo
          offChainSat: 0, // todo
          channels: [],
          transactions: [ // todo
            {
              to: 'Sent to',
              from: 'me',
              amount: 32223,
              date: '05/21/2019'
            },
            {
              to: 'Another sent to',
              from: 'me',
              amount: 11,
              date: '06/02/2019'
            }
          ],
          peers: [
            {
              name: 'peer 1',
              pubKey: 'DAF3QWF323ASDF3SDFA3232QASDF32ASDFASDF'
            },
            {
              name: 'peer 2',
              pubKey: 'JKFADSOIF3WASD31ASDF23QFASDF3QWR32QAF'
            }
          ]
        },
        transactionFields: [
          {key: 'type', sortable: true},
          {key: 'amount', sortable: true},
          {key: 'date', sortable: true}
        ],
        peerFields: [
          {key: 'name', sortable: true},
          {key: 'pubKey', sortable: false}
        ],
        walletId: '',
        activeChannels: 0,
        peers: 0,
        fabActions: [
          {
            name: 'invoice',
            icon: 'save_alt'
          },
          {
            name: 'showPayModal',
            icon: 'send'
          }
        ],
        payInvoiceModal: false,
        createInvoiceModal: false,
        invoice: '',
        payReqInfo: null,
        payInvoiceModalOkTitle: 'Check Invoice',
        showSuccessAlert: false,
        showFailureAlert: false,
        payFailureReason: '',
        invoiceForm: {
          amount: 0,
          description: '',
          label: ''
        },
        newPayReq: null
      }
    },
    created () {
      this.walletId = this.$route.params.id
    },
    mounted () {
      this.initializeNewWallet()
    },
    beforeRouteUpdate (to, from, next) {
      console.log('route changed to ' + to.params.id)
      this.walletId = to.params.id
      this.wallet = new Wallet({id: this.walletId})
      this.initializeNewWallet()
      next()
    },
    methods: {
      initializeNewWallet () {
        this.retrieveWalletInfo()
          .then(() => {
            console.log('retrieved wallet info')
            // console.log(this.wallet)
            let ln = new Lightning(this.wallet)
            ln.getInfo()
              .then((body) => {
                // console.log(body)
                this.wallet.activeChannels = body.num_active_channels
                this.wallet.peers = body.num_peers

                this.wallet.pubkey = body.pubkey

                this.retrieveAllWalletMetadata()
              })
          })
          .catch((error) => {
            console.log(error)
          })

        // reset variables
        this.invoice = ''
        this.payReqInfo = null
        this.payInvoiceModalOkTitle = 'Check Invoice'
        this.showFailureAlert = false
        this.showSuccessAlert = false
        this.payFailureReason = ''
        this.createInvoiceModal = false
        this.payInvoiceModal = false
        this.invoiceForm.amount = 0
        this.invoiceForm.description = ''
        this.invoiceForm.label = ''
        this.newPayReq = null
      },
      retrieveWalletInfo () {
        console.log('retrieving wallet info')
        return this.wallet.retrieve(this.blockstack)
      },
      retrieveAllWalletMetadata () {
        this.retrieveChannels()
        this.retrieveWalletBalance()
        this.retrieveChannelBalance()
        this.retrieveTransactions()
      },
      retrieveChannels () {
        console.log('retrieving channel info')
        let ln = new Lightning(this.wallet)
        ln.listChannels()
          .then((channels) => {
            // console.log(channels)
            this.walletInfo.channels = channels
          })
      },
      retrieveWalletBalance () {
        console.log('retrieving walletbalance info')
        let ln = new Lightning(this.wallet)
        ln.walletBalance()
          .then((amount) => {
            // console.log(amount)
            this.walletInfo.onChainSat = amount
          })
      },
      retrieveChannelBalance () {
        console.log('retrieving channelbalance info')
        let ln = new Lightning(this.wallet)
        ln.channelBalance()
          .then((amount) => {
            // console.log(amount)
            this.walletInfo.offChainSat = amount
          })
      },
      retrieveTransactions () {
        console.log('retrieving transactions')
        let ln = new Lightning(this.wallet)
        ln.listAllTransactions()
          .then((transactions) => {
            console.log(transactions)
            this.walletInfo.transactions = transactions
          })
      },
      decodeInvoice () {
        let ln = new Lightning(this.wallet)
        ln.decodePayReq(this.invoice)
          .then((payReqInfo) => {
            this.payReqInfo = payReqInfo
            this.payInvoiceModalOkTitle = 'Pay Invoice'
          })
          .catch((error) => {
            console.log(error)
          })
      },
      payInvoice () {
        console.log('paying invoice: ' + this.invoice)
        let ln = new Lightning(this.wallet)
        ln.pay(this.invoice)
          .then((payError) => {
            if (payError) {
              console.log('payment error: ' + payError)
              this.payFailureReason = payError
              this.showFailureAlert = true
            } else {
              console.log('payment successful')
              this.showSuccessAlert = true
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },
      createInvoice () {
        console.log('creating invoice')
        let ln = new Lightning(this.wallet)
        ln.createInvoice(this.invoiceForm)
          .then((payReq) => {
            if (payReq) {
              console.log('payment request: ' + payReq)
              this.newPayReq = payReq
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },
      showPayModal () {
        console.log('showPayModal clicked')
        this.payInvoiceModal = true
      },
      showInvoiceModal () {
        console.log('create invoice clicked')
        this.createInvoiceModal = true
      }
    }
  }
</script>

<style>
  /* IE fix */
  #card-chart-01, #card-chart-02 {
    width: 100% !important;
  }
  i.md-36.material-icons {
    margin-left: 0px !important;
  }
  div#bottom-right-wrapper.fab-wrapper {
    right: 2vw !important;
    bottom: 4vw !important;
  }
  .modal-content {
    margin-top: 60px;
  }
</style>

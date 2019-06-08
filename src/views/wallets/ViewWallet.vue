<template>
  <div class="animated fadeIn">
    <!-- Header Info Panels -->
    <b-row>
      <b-col sm="6" md="2">
        <b-card class="text-white bg-primary">
          <div class="h1 text-muted text-right mb-4">
            <i class="fa fa-btc"></i>
          </div>
          <div class="h4 mb-0">{{walletInfo.onChainSat}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Funds On Chain (sats)</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="2">
        <b-card class="text-white bg-primary">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-energy"></i>
          </div>
          <div class="h4 mb-0">{{walletInfo.offChainSat}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Funds Off Chain (sats)</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="2">
        <b-card class="text-white bg-primary">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-cloud-upload"></i>
          </div>
          <div class="h4 mb-0">{{wallet.activeChannels}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Active Channels</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="2">
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
              <b-card :header="channel.name" border-variant="success">
                Capacity: {{channel.capacity}} SATS
                <b-progress class="mt-1" :max="channel.capacity" show-value>
                  <b-progress-bar
                    v-b-tooltip.hover
                    title="Outbound Capacity"
                    :value="channel.localBalance"
                    variant="success"></b-progress-bar>
                  <b-progress-bar
                    v-b-tooltip.hover
                    title="Inbound Capacity"
                    :value="channel.remoteBalance"
                    variant="warning"></b-progress-bar>
                </b-progress>

                <div class="text-center">
                  <b-button class="active mt-3" pressed variant="danger" aria-pressed="true">Close Channel</b-button>
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
      <b-col lg="12">
        <c-table
          :table-data="walletInfo.peers"
          :fields="peerFields"
          caption="Peers"></c-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>

  import {Wallet} from '../../models/Wallet'
  import {Lightning} from '../../utilities/lightning/lightning'
  import cTable from '../../views/base/Table.vue'

export default {
    name: 'ViewWallet',
    components: {
      cTable
    },
    data: function () {
      return {
        blockstack: window.blockstack,
        wallet: new Wallet({id: this.$route.params.id}),
        walletInfo: {
          onChainSat: 0, // todo
          offChainSat: 0, // todo
          channels: [ // todo
            {
              name: 'ACINQ',
              capacity: 10000,
              remoteBalance: 1000,
              localBalance: 9000,
              status: 'open'
            },
            {
              name: 'Lightning Labs',
              capacity: 30000,
              remoteBalance: 2000,
              localBalance: 28000,
              status: 'open'
            },
            {
              name: 'Open Node',
              capacity: 10000,
              remoteBalance: 9000,
              localBalance: 1000,
              status: 'pending'
            }
          ],
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
          {key: 'to', sortable: true},
          {key: 'from', sortable: true},
          {key: 'amount', sortable: true},
          {key: 'date', sortable: true}
        ],
        peerFields: [
          {key: 'name', sortable: true},
          {key: 'pubKey', sortable: false}
        ],
        walletId: '',
        activeChannels: 0,
        peers: 0
      }
    },
    created () {
      this.walletId = this.$route.params.id
    },
    mounted () {
      this.retrieveWalletInfo()
    },
    beforeRouteUpdate (to, from, next) {
      console.log('route changed to ' + to.params.id)
      this.walletId = to.params.id
      this.wallet = new Wallet({id: this.walletId})
      this.retrieveWalletInfo()
      next()
    },
    methods: {
      retrieveWalletInfo () {
        console.log('retrieving wallet info')
        this.wallet.retrieve(this.blockstack)
          .then(() => {
            let ln = new Lightning(this.wallet)
            ln.getInfo()
              .then((body) => {
                console.log(body)
                this.wallet.activeChannels = body.num_active_channels
                this.wallet.peers = body.num_peers
              })
          })
          .catch((error) => {
            console.log(error)
          })
      }
    }
  }
</script>

<style>
  /* IE fix */
  #card-chart-01, #card-chart-02 {
    width: 100% !important;
  }
</style>

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
          <small class="text-muted text-uppercase font-weight-bold">Channels</small>
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
      <!-- <b-col lg="12">
        <c-table
          :table-data="walletInfo.transactions"
          :fields="transactionFields"
          caption="Transactions"></c-table>
      </b-col> -->

      <!-- Peers -->
      <!-- <b-col lg="12">
        <c-table
          :table-data="walletInfo.peers"
          :fields="peerFields"
          caption="Peers"></c-table>
      </b-col> -->
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
      },
      retrieveWalletInfo () {
        console.log('retrieving wallet info')
        return this.wallet.retrieve(this.blockstack)
      },
      retrieveAllWalletMetadata () {
        this.retrieveChannels()
        this.retrieveWalletBalance()
        this.retrieveChannelBalance()
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

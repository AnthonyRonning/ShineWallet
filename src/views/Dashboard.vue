<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col sm="6" md="6">
        <b-card class="text-white bg-success">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-user-follow"></i>
          </div>
          <div class="h4 mb-0">{{totalActiveChannels}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Total Active Channels</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="6">
        <b-card class="text-white bg-info">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-people"></i>
          </div>
          <div class="h4 mb-0">{{totalPeers}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Total Peers</small>
        </b-card>
      </b-col>
    </b-row>

    <!-- welcome modal -->
    <b-modal
      title="Welcome!"
      size="md"
      v-model="showWelcome"
      @hidden="setViewedWelcome">
      <p>
        Thank you for trying out Shine Wallet!
      </p>

      <p>
        This is an alpha release until LND & C-Lightning's Spark Server
        implement CORS - this work is currently underway.
        Until then, I recommend only connecting to testnet wallets with CORS
        disabled in your browser.
      </p>

      <p>
        Hope you enjoy Shine Wallet! Any issues or recommendations can be submitted
        <a href="https://github.com/AnthonyRonning/ShineWallet/issues">here</a>.
      </p>
      <div slot="modal-footer">
        <b-button
          variant="primary"
          size="md"
          class="btn btn-primary"
          @click="setViewedWelcome"
        >
          Okay
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>

import {WalletList} from '../models/collections/WalletList'
import {Lightning} from '../utilities/lightning/lightning'

export default {
  name: 'dashboard',
  components: {
  },
  data: function () {
    return {
      blockstack: window.blockstack,
      walletList: new WalletList(),
      totalActiveChannels: 0,
      totalPeers: 0,
      showWelcome: false
    }
  },
  computed: {
  },
  mounted () {
    this.retrieveWalletInfo()
    this.checkIfViewedWelcome()
  },
  methods: {
    retrieveWalletInfo () {
      console.log('retrieving wallet info')
      this.walletList.get(this.blockstack)
        .then(() => {
          this.walletList.models.forEach((wallet) => {
            let ln = new Lightning(wallet)
            ln.getInfo()
              .then((body) => {
                console.log(body)
                wallet.activeChannels = body.num_active_channels
                wallet.peers = body.num_peers

                this.totalActiveChannels = _.sumBy(this.walletList.models, 'activeChannels')
                this.totalPeers = _.sumBy(this.walletList.models, 'peers')
              })
          })
        })
    },
    checkIfViewedWelcome () {
      const viewedWelcome = localStorage.getItem('welcome')
      if (!viewedWelcome) {
        this.showWelcome = true
      }
    },
    setViewedWelcome () {
      localStorage.setItem('welcome', true)
      this.showWelcome = false
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

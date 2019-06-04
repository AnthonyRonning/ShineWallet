<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col sm="6" md="2">
        <b-card class="text-white bg-success">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-user-follow"></i>
          </div>
          <div class="h4 mb-0">{{totalActiveChannels}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Total Active Channels</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="2">
        <b-card class="text-white bg-info">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-people"></i>
          </div>
          <div class="h4 mb-0">{{totalPeers}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Total Peers</small>
        </b-card>
      </b-col>
    </b-row>
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
      totalPeers: 0
    }
  },
  computed: {
  },
  mounted () {
    this.retrieveWalletInfo()
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

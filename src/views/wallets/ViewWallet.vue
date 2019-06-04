<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col sm="6" md="2">
        <b-card class="text-white bg-success">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-user-follow"></i>
          </div>
          <div class="h4 mb-0">{{wallet.activeChannels}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Active Channels</small>
        </b-card>
      </b-col>
      <b-col sm="6" md="2">
        <b-card class="text-white bg-info">
          <div class="h1 text-muted text-right mb-4">
            <i class="icon-people"></i>
          </div>
          <div class="h4 mb-0">{{wallet.peers}}</div>
          <small class="text-muted text-uppercase font-weight-bold">Peers</small>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>

  import {Wallet} from '../../models/Wallet'
  import {Lightning} from '../../utilities/lightning/lightning'

export default {
    name: 'ViewWallet',
    components: {
    },
    data: function () {
      return {
        blockstack: window.blockstack,
        wallet: new Wallet({id: this.$route.params.id}),
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

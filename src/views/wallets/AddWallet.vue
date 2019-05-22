<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col md="12">
        <b-card>
          <div slot="header">
            <strong>Add New Lightning Wallet</strong>
          </div>
          <b-form>
            <!-- wallet name -->
            <b-form-group
              description="Enter a name for this wallet"
              label="Wallet Name"
              label-for="basicName"
              :label-cols="3"
              :horizontal="true">
              <b-form-input id="basicName" type="text" v-model="walletForm.name"></b-form-input>
            </b-form-group>

            <!-- lightning radio select -->
            <b-form-group
              label="Radios"
              label-for="basicRadios"
              :label-cols="3"
              :horizontal="true">
              <b-form-radio-group id="basicRadios"
                                  :plain="true"
                                  :options=walletOptions
                                  checked="LND"
                                  stacked
                                  v-model="walletForm.type">
              </b-form-radio-group>
            </b-form-group>


            <!-- host & port -->
            <b-form-group
              description="Enter the host & port of your LND node (ex. 1.1.1.1:1111)"
              label="LND Host & Port"
              label-for="hostAndPort"
              :label-cols="3"
              :horizontal="true">
              <b-form-input id="hostAndPort" type="text" v-model="walletForm.hostAndPort"></b-form-input>
            </b-form-group>

            <!-- macaroon upload -->
            <b-form-group
              label="Macaroon"
              label-for="macaroonFile"
              :label-cols="3"
              :horizontal="true">
              <b-form-file id="macaroonFile" :plain="true" v-model="walletForm.macaroon"></b-form-file>
            </b-form-group>

            <!-- certificate upload -->
            <b-form-group
              label="TLS Certificate"
              label-for="TLSCertificate"
              :label-cols="3"
              :horizontal="true">
              <b-form-file id="certificateFile" :plain="true" v-model="walletForm.tlsCertificate"></b-form-file>
            </b-form-group>

            <!-- form footer -->
            <div slot="footer">
              <b-button size="sm" variant="primary" v-on:click="submitForm">
                <i class="fa fa-dot-circle-o"></i> Submit
              </b-button>
              <b-button type="reset" size="sm" variant="danger"><i class="fa fa-ban"></i> Reset</b-button>
            </div>
          </b-form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  // import request from 'request'

  export default {
    name: 'addwallet',
    data () {
      return {
        walletOptions: [
          {text: 'LND', value: 'LND'},
          {text: 'C-Lightning', value: 'C-Lightning', disabled: true}
        ],
        walletForm: {
          name: '',
          type: 'LND',
          hostAndPort: '',
          macaroon: null,
          tlsCertificate: null
        }
      }
    },
    methods: {
      submitForm () {
        console.log('submitting form:' +
          ' Name: ' + this.walletForm.name +
          ' Type: ' + this.walletForm.type +
          ' Host: ' + this.walletForm.hostAndPort +
          ' Macaroon: ' + this.walletForm.macaroon +
          ' Certificate: ' + this.walletForm.tlsCertificate)

        this.testLND()
      },
      testLND () {
        console.log('testing lnd connection')
        /*
        var options = {
          url: 'https://' + this.walletForm.hostAndPort + '/v1/balance/blockchain',
          // Work-around for self-signed certificates.
          rejectUnauthorized: false,
          json: true,
          headers: {
            'Grpc-Metadata-macaroon': this.walletForm.macaroon
          }
        }
        request.get(options, function (error, response, body) {
          console.log('made request')
          console.log(error)
          console.log(response)
          console.log(body)
        })

        */
        /*
        const grpc = new LndGrpc({
          host: this.walletForm.hostAndPort,
          cert: this.walletForm.tlsCertificate,
          macaroon: this.walletForm.macaroon,
          waitForCert: true,
          waitForMacaroon: true
        })

        // Establish a connection.
        grpc.connect().then(function () {
          console.log('connection established')

          // Do something cool if we detect that the wallet is locked.
          grpc.on(`locked`, () => console.log('wallet locked!'))

          // Do something cool when the wallet gets unlocked.
          grpc.on(`active`, () => console.log('wallet unlocked!'))

          // Do something cool when the connection gets disconnected.
          grpc.on(`disconnected`, () => console.log('disconnected from lnd!'))

          // Make some api calls...
          const { Lightning } = grpc.services
          // Fetch current balance.
          Lightning.walletBalance().then(function (balance) {
            console.log('grabbed balance: ' + balance)
          })
        }) */
      }
    }
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
</style>

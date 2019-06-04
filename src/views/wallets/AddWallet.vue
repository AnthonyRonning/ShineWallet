<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col md="12">
        <b-card>
          <div slot="header">
            <strong>Add New Lightning Wallet</strong>
          </div>
          <b-form>
            <!-- Success Alert -->
            <b-alert  v-model="showSuccessAlert" variant="success" dismissible>
              Test connection successful, saving settings and adding wallet...
            </b-alert>
            <!-- Failure Alert -->
            <b-alert  v-model="showFailureAlert" variant="danger" dismissible>
              Failure connecting to wallet: {{failureReason}}
            </b-alert>

            <!-- lightning radio select -->
            <b-form-group
              label="Lightning Daemon"
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
              description="Enter the host & port of your node (ex. https://1.1.1.1:1111)"
              label="Host & Port"
              label-for="hostAndPort"
              :label-cols="3"
              :horizontal="true">
              <b-form-input id="hostAndPort" type="text" v-model="walletForm.hostAndPort"></b-form-input>
            </b-form-group>

            <!-- LND -->
            <!-- macaroon upload -->
            <b-form-group
              v-if="walletForm.type === 'LND'"
              label="Admin Macaroon"
              label-for="macaroonFile"
              :label-cols="3"
              :horizontal="true">
              <b-form-file id="macaroonFile" :plain="true" v-model="tempMacaroonFile"></b-form-file>
            </b-form-group>

            <!-- certificate upload -->
            <!--
            <b-form-group
              label="TLS Certificate"
              label-for="TLSCertificate"
              :label-cols="3"
              :horizontal="true">
              <b-form-file id="certificateFile" :plain="true" v-model="walletForm.tlsCertificate"></b-form-file>
            </b-form-group> -->

            <!-- C-Lightning -->
            <!-- username -->
            <b-form-group
              v-if="walletForm.type === 'C-Lightning'"
              description="Username"
              label="Username"
              label-for="username"
              :label-cols="3"
              :horizontal="true">
              <b-form-input id="username" type="text" v-model="walletForm.username"></b-form-input>
            </b-form-group>

            <!-- password -->
            <b-form-group
              v-if="walletForm.type === 'C-Lightning'"
              description="Password"
              label="Password"
              label-for="password"
              :label-cols="3"
              :horizontal="true">
              <b-form-input id="password" type="password" v-model="walletForm.password"></b-form-input>
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
  import {Wallet} from '../../models/Wallet'
  import {Lightning} from '../../utilities/lightning/lightning'
  import {WalletList} from '../../models/collections/WalletList'

export default {
    name: 'addwallet',
    data () {
      return {
        blockstack: window.blockstack,
        walletOptions: [
          {text: 'LND', value: 'LND'},
          {text: 'C-Lightning via Spark', value: 'C-Lightning', disabled: false}
        ],
        walletForm: {
          type: 'LND',
          hostAndPort: '',
          macaroon: null,
          username: '',
          password: ''
        },
        tempMacaroonFile: null,
        showSuccessAlert: false,
        showFailureAlert: false,
        failureReason: '',
        walletList: new WalletList()
      }
    },
    watch: {
      tempMacaroonFile () {
        this.convertAdminMacaroonToHex()
      }
    },
    mounted () {
      this.getWalletList()
    },
    methods: {
      getWalletList () {
        console.log('Get wallet list')
        this.walletList.get(this.blockstack)
      },
      submitForm () {
        console.log('submitting form:' +
          ' Type: ' + this.walletForm.type +
          ' Host: ' + this.walletForm.hostAndPort)

        this.testConnection()
      },
      testConnection () {
        console.log('testing lnd connection')
        let ln = new Lightning(this.walletForm)

        ln.getInfo().then((body) => {
          console.log(body)

          if (body) {
            console.log('response from lightning daemon successful')
            this.showSuccessAlert = true

            let newWallet = new Wallet(
              {
                alias: body.alias,
                type: this.walletForm.type,
                hostAndPort: this.walletForm.hostAndPort,
                macaroon: this.walletForm.macaroon,
                username: this.walletForm.username,
                password: this.walletForm.password,
                testnet: body.testnet
              })

            console.log(newWallet)
            newWallet.save(this.blockstack)
              .then(() => {
                console.log('saved wallet info')
                this.walletList.add(newWallet)
                this.walletList.save(this.blockstack)
                  .then(() => {
                    console.log('saved wallet list info')
                  })
              })
          }
        })
        .catch((error) => {
          console.log(error)
          this.failureReason = error.message
          this.showFailureAlert = true
        })
      },
      convertAdminMacaroonToHex () {
        var callback = this.setFile
        var file = this.tempMacaroonFile
        console.log('trying to convert file:' + file)
        var reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = function () {
          var u = new Uint8Array(this.result)
          var a = new Array(u.length)
          var i = u.length
          while (i--) { a[i] = (u[i] < 16 ? '0' : '') + u[i].toString(16) }
          u = null // free memory
          console.log(a.join(''))
          callback(a.join(''))
        }
        reader.onerror = function (error) {
          console.log('Error: ', error)
        }
      },
      setFile (file) {
        this.walletForm.macaroon = file
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

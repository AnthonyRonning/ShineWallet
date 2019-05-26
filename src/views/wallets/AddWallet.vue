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
              description="Enter the host & port of your node (ex. 1.1.1.1:1111)"
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
              <b-form-input id="password" type="text" v-model="walletForm.password"></b-form-input>
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
  import rp from 'request-promise'
  import createHmac from 'create-hmac'

  export default {
    name: 'addwallet',
    data () {
      return {
        walletOptions: [
          {text: 'LND', value: 'LND'},
          {text: 'C-Lightning via Spark', value: 'C-Lightning', disabled: false}
        ],
        walletForm: {
          name: '',
          type: 'LND',
          hostAndPort: '',
          macaroon: null,
          username: '',
          password: ''
        },
        tempMacaroonFile: null,
        showSuccessAlert: false
      }
    },
    watch: {
      tempMacaroonFile (val) {
        this.convertAdminMacaroonToHex()
      }
    },
    methods: {
      submitForm () {
        console.log('submitting form:' +
          ' Name: ' + this.walletForm.name +
          ' Type: ' + this.walletForm.type +
          ' Host: ' + this.walletForm.hostAndPort)

        if (this.walletForm.type === 'LND') {
          this.testLND()
        } else if (this.walletForm.type === 'C-Lightning') {
          this.testCLightning()
        }
      },
      testLND () {
        console.log('testing lnd connection')

        var options = {
          url: 'https://' + this.walletForm.hostAndPort + '/v1/getinfo',
          // Work-around for self-signed certificates.
          rejectUnauthorized: false,
          json: true,
          headers: {
            'Grpc-Metadata-macaroon': this.walletForm.macaroon
          }
        }

        rp.get(options).then((body) => {
          console.log('made request')
          console.log(body)

          if (body) {
            console.log('response from LND successful')
            this.showSuccessAlert = true
            // todo save wallet settings
          }
        })
        .catch(function (error) {
          console.log(error)
        })
      },
      testCLightning () {
        this.rpcCall('getinfo')
      },
      rpcCall (method, params = []) {
        console.log('making rpc call for ' + method)
        return fetch(this.normalizeURL('http://' + this.walletForm.hostAndPort) + '/rpc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'shine-wallet',
            'X-Access': this.makeAccessKey(this.walletForm.username, this.walletForm.password)
          },
          body: JSON.stringify({method, params})
        })
        .then(r => r.json())
        .then(res => {
          console.log(res)
          if (res.code) {
            throw new Error(res.message || res.code)
          }

          // todo save wallet settings
          this.showSuccessAlert = true
          return res
        })
      },
      normalizeURL (endpoint) {
        let url = new URL(endpoint.trim(), 'http://localhost:9737/')
        return url.protocol + '//' + url.host
      },
      makeAccessKey (username, password) {
        return createHmac('sha256', `${username}:${password}`)
          .update('access-key')
          .digest('base64')
          .replace(/\W+/g, '')
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

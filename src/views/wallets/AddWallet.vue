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
              description="Enter the host & port of your LND node (ex. 1.1.1.1:1111)"
              label="LND Host & Port"
              label-for="hostAndPort"
              :label-cols="3"
              :horizontal="true">
              <b-form-input id="hostAndPort" type="text" v-model="walletForm.hostAndPort"></b-form-input>
            </b-form-group>

            <!-- macaroon upload -->
            <b-form-group
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
          macaroon: null
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
          ' Host: ' + this.walletForm.hostAndPort +
          ' Macaroon: ' + this.walletForm.macaroon)

        this.testLND()
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

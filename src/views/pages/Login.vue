<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <h2>Log in</h2>
                  <p>Log in using your blockstack account.</p>
                  <b-button @click="signIn" variant="primary" class="active mt-3">Log in!</b-button>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      blockstack: window.blockstack
    }
  },
  methods: {
    signIn () {
      this.blockstack.redirectToSignIn()
    }
  }
}
</script>

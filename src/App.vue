<template>
  <router-view
    v-if="userSession.isUserSignedIn()">
  </router-view>
  <login
    v-else-if="! userSession.isUserSignedIn() && ! userSession.isSignInPending()">
  </login>
</template>

<script>
import { UserSession, AppConfig } from 'blockstack'
import Login from './views/pages/Login'

const appConfig = new AppConfig(['store_write', 'publish_data'], process.env.VUE_APP_APP_URI)
const userSession = new UserSession({ appConfig })

export default {
  name: 'app',
  components: {Login},
  data () {
    return {
      blockstack: window.blockstack,
      userSession: userSession,
      user: this.user
    }
  },
  beforeMount () {
    this.login()
  },
  methods: {
    login () {
      var userSession = new UserSession()
      if (userSession.isUserSignedIn()) {
        let userData = userSession.loadUserData().profile
        this.user = new this.blockstack.Person(userData.profile)
        console.info('user logged in', { username: this.user.username })
      } else if (userSession.isSignInPending()) {
        console.info('sign in pending')
        userSession.handlePendingSignIn().then(function (userData) {
          window.location = window.location.origin
        })
      } else {
        console.info('user not signed in & sign in not pending')
      }
    }
  }
}
</script>

<style lang="scss">
  // CoreUI Icons Set
  @import '~@coreui/icons/css/coreui-icons.min.css';
  /* Import Font Awesome Icons Set */
  $fa-font-path: '~font-awesome/fonts/';
  @import '~font-awesome/scss/font-awesome.scss';
  /* Import Simple Line Icons Set */
  $simple-line-font-path: '~simple-line-icons/fonts/';
  @import '~simple-line-icons/scss/simple-line-icons.scss';
  /* Import Flag Icons Set */
  @import '~flag-icon-css/css/flag-icon.min.css';
  /* Import Bootstrap Vue Styles */
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  // Import Main styles for this application
  @import 'assets/scss/style';
</style>

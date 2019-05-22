<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <img
        src="img/avatar-placeholder.png"
        class="img-avatar"
        alt="admin@bootstrapmaster.com" />
    </template>\
    <template slot="dropdown">
      <b-dropdown-item>
        <a @click="signOut" href="#"><i class="fa fa-lock" /> Logout</a>
      </b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'

export default {
  name: 'DefaultHeaderDropdownAccnt',
  components: {
    AppHeaderDropdown
  },
  data: () => {
    return { blockstack: window.blockstack }
  },
  methods: {
    signOut () {
      console.debug('sign out initiated')
      this.blockstack.signUserOut(window.location.href)
      this.$router.push('/dashboard?signedOut=True')
    }
  }
}
</script>

export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer'
    },
    {
      name: 'Wallets',
      url: '/wallets',
      icon: 'icon-energy',
      children: [
        {
          name: 'Add Wallet',
          url: '/wallets/add',
          icon: 'icon-plus'
        }
      ]
    }
  ]
}

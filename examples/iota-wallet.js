const UserPass = require('../index')

UserPass.generateIotaWallet('johndoe', '12345six')
.then(wallet => {
  console.log(wallet)
}).catch(console.error)

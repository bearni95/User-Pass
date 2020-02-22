const argon2 = require('argon2')
const argon2id = argon2.argon2id
const shake128 = require('js-sha3').shake128
const EthWallet = require('ethereumjs-wallet')
const core = require('@iota/core')
const converter = require('@iota/converter')

class UserPass {
  constructor (){
    this.SALT_LENGTH = 512
    this.INTERNAL_LENGTH = 2048
    this.PRIVATE_KEY_LENGTH = 256
  }

  async generateEthereumWallet(username, password){
    const privateKey = await this.generatePrivateKey(username, password)
    const wallet = EthWallet.fromPrivateKey(Buffer.from(privateKey, 'hex'))
    return wallet
  }

  async generateIotaWallet(username, password, idx=0){
    const privateKey = await this.generatePrivateKey(username, password, 324)
    const trytes = converter.asciiToTrytes(privateKey)
    const address = core.generateAddress(trytes, idx )
    return {
      privateKey: trytes,
      address
    }
  }

  async generatePrivateKey(username, password, length=256){
    const hashedUsername = this.hash(username, this.SALT_LENGTH)
    const hashedPassword = this.hash(password, this.SALT_LENGTH)

    const user = await this.argon2(username, hashedPassword, this.INTERNAL_LENGTH)
    const pass = await this.argon2(password, hashedUsername, this.INTERNAL_LENGTH)

    const salt = this.hash(user + pass + 'USERPASS', this.SALT_LENGTH)

    const privateKey = await this.argon2((user + pass), salt, length)

    return privateKey
  }

  hash (input, length) {
    return shake128(input, length)
  }

  argon2 (input, salt, length=2048) {
    return new Promise((resolve, reject) => {
      argon2.hash(input, {
        salt: Buffer.from(salt, 'hex'),
        time: 10,
        type: argon2id
      })
      .then(res => {
        resolve(shake128(res, length))
      })
      .catch(reject)
    })
  }
}

module.exports = new UserPass()

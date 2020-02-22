# UserPass

## Installation
```bash
npm install
```

## Running
```bash
node examples/iota-wallet.js
node examples/ethereum-wallet.js
```


### Chosen technologies
To savely use user-provided input as cryptographically secure keys we need a Key Derivation Function (KDF). You may be familiar with bcrypt. It is usually involved in deriving passwords with a given salt to be stored in centralized databases.

Ethereum uses, for it's v3 wallet storage, two other KDFs; PBKDF2 and scrypt.

bcrypt, PBKDF2 and scrypt are consuming algorithms; they require high specs to run fast. When executed on web browsers, mobile phones or IoT devices they can take a long time (almost a minute!) to derive a key. That means that each time a user wants to use their private key (sign a transaction) they will be required to wait a while to just figure it out.

Back in 2015 argon2 won the Password Hashing Competition, an open competition inspired by the NIST's AES and SHA-3. Their objective was to establish a standard key derivation function that would fullfil the needs of modern applications on a secure way.

Besides from the KDF there is also a need for a hashing function that will help put together all the bits and pieces. Our choice is the shake128 algorithm from the SHA-3 family. It is an algorithm of variable output size, which will come in handy later on.


### UserPass Pattern
UserPass takes any given combination of username/email and password to generate a private key. The private key is never stored on the containing device and gets flushed from memory right after using it. The user is still able to sign transactions at ease, without being reprompted for their password. You'll see now how.


First off, we'll create the Cross Salts. Argon2 needs a salt argument to be fed, along with the word to derive, to operate.

We'll be creating a private key for our user `jdoe` with password `123456`

```javascript
let username = 'jdoe'
let password = '123456'


let hashedUsername = shake128(username, 512)
let hashedPassword = shake128(password, 512)

let user = argon2(username, {salt : hashedPassword})
let pass = argon2(password, {salt : hashedUsername})
```

`user` and `pass` will now be used to derive our beloved wallet:

```javascript
let salt = shake128(user + pass + 'static_salt')
let userpass = argon2(user + pass, {salt})
```

You got your UserPass!

Let's turn that into an Iota wallet:
```javascript
const trytes = iotaConverter.asciiToTrytes(userpass)
// this is your private key or seed
const address = iotaCore.generateAddress(trytes, 0)
// this is the public address where you can receive funds

```
Or into an Ethereum wallet:

```javascript
// this is your private key
const wallet = EthereumjsWallet.fromPrivateKey(Buffer.from(userpass, 'hex'))
// this is your fully flexed Ethereum wallet
```

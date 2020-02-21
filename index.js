const argon2 = require('argon2')
const { argon2i, argon2d, argon2id, defaults, limits } = argon2
const shake128 = require('js-sha3').shake128
const Base64 = require('js-base64').Base64

var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
const emailRegex =   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const main = async () => {
	let username = 'johndoe@gmail.com'
	let password = 'Q1w2e3r4!'

	if (!emailRegex.test(username)){
		throw new Error('Username must be a valid email')
	}
	if (!strongRegex.test(password)){
		throw new Error('Password strength is not enough. The password must contain, at least, 1 lowercase letter, 1 uppercase letter, 1 numeric character, 1 special character and be 8 characters long')
	}


	console.log('username', username)
	console.log('password', password)

	let hashedUsername = Buffer.from(shake128(username, 512), 'hex')
	let hashedPassword = Buffer.from(shake128(password, 512), 'hex')

	console.log('hashedUsername', hashedUsername.toString('hex'))
	console.log('hashedPassword', hashedPassword.toString('hex'))

	let user = shake128(await argon2.hash(username, {salt : hashedPassword, type: argon2id}), 2048)
	let pass = shake128(await argon2.hash(password, {salt : hashedUsername, type: argon2id}), 2048)

	console.log('user', user)
	console.log('pass', pass)

	let salt = Buffer.from(shake128(user + pass + 'salt', 512), 'hex')
	let userpass = shake128(await argon2.hash(user + pass, {salt, type: argon2id}), 2048)

	console.log('userpass', userpass)

	let privateKey = shake128(userpass, 256)
	console.log('privateKey', privateKey)
}

main()

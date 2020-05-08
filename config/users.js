const authConfig = require('../config/authentication');
const usersService = require('../services/usersService');

var registeredUsers = null;

const getRegisteredUsers = function () {
	return registeredUsers;
}

const getUserByDocumentId = (documentId) => {
	let users = Object.values(registeredUsers);
	return users.find((item) => item.documentId === documentId);
}

const getUserByexternalD = (externalId) => {
	return registeredUsers ? registeredUsers[externalId]: null;
}
const getUserByUsername = (username) => {
	let userEmail = username + authConfig.USER_EMAIL_TENANT;
	let users = Object.values(registeredUsers);
	return users.find((item) => item.email === userEmail);
}

const getUserByAddress = (address) => {
	let users = Object.values(registeredUsers);
	return users.find((item) => item.address === address);
}

const getUsersByRole = (role) => {
	let users = Object.values(registeredUsers);
	return users.filter((user) => user.roles.includes(role));
}




const setRegisteredUsers = () => new Promise( async function(resolve, reject) {
	let users = await usersService.getRegisteredUsers();
	let qldbUsers = await usersService.getQldbRegisteredUserDetails();
	registeredUsers = {};

	for (var i = 0; i < users.length; i++) {
		let userData = users[i];
		let fields = userData.Attributes.reduce((result, item) => { 
			result[item.Name] = item.Value;
			return result;
		}, {});

		let qldbUser = qldbUsers[fields.sub];
		let roles = qldbUser ? qldbUser.roles : [];
		let documentId = qldbUser ?  qldbUser.documentId : null;

		let user = {
			id: fields.sub,
			//firstName: userData.Attributes.find(item=>item.Name === 'given_name'),
			firstName: fields.given_name,
			lastName: fields.family_name,
			email: fields.email,
			// address: userData.userChainMappings[0] ? userData.userChainMappings[0].chainIdentifier : null,  // TODO: get the chain identifier from the connection being used (low priority)
			address: null,
			externalId: fields.sub,
			roles,
			documentId
		};

		registeredUsers[fields.sub] = user;
	}
	
	console.log("--> List of all users refreshed!");
	resolve(registeredUsers)
	setTimeout(setRegisteredUsers, 300000); // Refresh list of users every 5min
});

module.exports = {
	getRegisteredUsers,
	setRegisteredUsers,
	getUserByDocumentId,
	getUserByAddress,
	getUserByexternalD,
	getUserByUsername,
	getUsersByRole
};

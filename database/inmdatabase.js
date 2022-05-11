// This class was placed in the JavaScript-file where it was used
class Database {
	movieId = 1;
	userId = 1;

	movies = [];
	users = [];

	constructor() {}

	// --------------------------------- Begin Table User ----------------------------------- //
	containsUserName(name) {
		console.log(name);
		return this.getUserFromName(name) != null;
	}

	addUser(info) {
		const id = this.userId;
		const user = {
			id,
			...info,
		};

		this.users.push(user);
		console.log(user);

		this.userId++;

		return user;
	}

	getAllUsers() {
		return this.users;
	}

	getUserFromId(id) {
		console.log(`Searching user with Id ${id}`);
		const user = this.users.filter((item) => item.id == id);

		console.log(`Search results: ${user}`);

		return user.length == 0 ? null : user[0];
	}

	getUserFromName(name) {
		console.log(`Searching user with Name ${name}`);
		const user = this.users.filter((item) => item.name == name);

		console.log(`Search results: ${user}`);

		return user.length == 0 ? null : user[0];
	}

	deleteAllUsers() {
		this.users = [];

		console.log(`Table users emptied`);
	}

	deleteUserFromId(id) {
		const user = this.getUserFromId(id);
		console.log(`Deleting: ${user}`);

		if (user != null) {
			const index = this.users.indexOf(user);

			if (index < 0) return;

			this.users.splice(index, 1);
		}

		return user;
	}

	// --------------------------------- End Table User ----------------------------------- //
}

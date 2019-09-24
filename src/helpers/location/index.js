export const getUserLocationData = async() => {

	let userLocationData = {};

	try {
		const response = await fetch('http://ip-api.com/json');
		userLocationData = response.json();
	}
	catch(error){
       console.error(error);
	}

	return userLocationData;
}
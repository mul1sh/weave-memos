export const getUserLocationData = async() => {

	let userLocationData = {};

	try {
		const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=3a456c8e36b94dd9b270ec45491c41f0');
		userLocationData = response.json();
	}
	catch(error){
       console.error(error);
	}

	return userLocationData;
}
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
	let pageToken = "";
	let photos = [];
    const month = req.query.month;
	const year = req.query.year;
    
    const secret = process.env.SECRET;
    const token = await getToken({ req, secret, encryption: true });
	const accessToken = token.accessToken;

	while (true) {
		const response = await fetch(
			"https://photoslibrary.googleapis.com/v1/mediaItems:search?key=AIzaSyA_SwmEbyA7SnEqkFHiA2pS3gEL_ZuPGtk",
			{
				method: "POST",
				credentials: 'include',
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/json",
					// 'Connection': 'keep-alive'
				},
				body: JSON.stringify({
					filters: {
						dateFilter: {
							dates: [
								{
									year: year,
									month: month,
								},
							],
						},
						// mediaTypeFilter: {
						// 	mediaTypes: ["VIDEO"],
						// },
					},
					pageSize: 100,
					pageToken: pageToken,
				}),
			}
		);

		
		const data = await response.json();

		// if(data.error) {
		// 	return res.status(401).json(data.error)
		// }

		console.log('first fetch: ', response)
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('')
		console.log('first fetch: ', data)
		
		photos = photos.concat(data.mediaItems);
		if (!data.nextPageToken) {
			break;
		}
		pageToken = data.nextPageToken;
	}
    

	res.status(200).json(photos);
}

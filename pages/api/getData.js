import axios from "axios";
import { getSession } from "next-auth/client";
import { getToken } from "next-auth/jwt";
const JSZip = require("jszip");

const secret = process.env.SECRET;
let accessToken;

const getData = async (month, year, pageSize, res) => {
	let pageToken = "";
	let photos = [];

	while (true) {
		const response = await fetch(
			"https://photoslibrary.googleapis.com/v1/mediaItems:search?key=AIzaSyA_SwmEbyA7SnEqkFHiA2pS3gEL_ZuPGtk",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/json",
					"Content-Type": "application/json",
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

		if(data.error) {
			return res.status(401).json(data.error)
		}
		
		photos = photos.concat(data.mediaItems);
		if (!data.nextPageToken) {
			break;
		}
		pageToken = data.nextPageToken;
	}

	// const response = await axios.get(
	// 	`https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${pageSize}`,
	// 	{
	// 		headers: {
	// 			Authorization: `Bearer ${accessToken}`,
	// 			"Content-Type": "application/json",
	// 		},
	// 	}
	// );

	// const data = response.data;

	const imgs = await Promise.all(
		photos.map(async (item) => {
			try {
				const response = await axios({
					method: "get",
					url: item.baseUrl + "=d",
					responseType: "arraybuffer",
				});

				// console.log('')
				// console.log('buffer (response.data)')
				// console.log(buffer)

				const base64 = response.data.toString("base64");

				return {
					base64,
					filename: item.mediaMetadata.creationTime + '.' + item.filename.split('.')[1],
					baseUrl: item.baseUrl + "=d",
				};
			} catch (err) {
				// console.log(err);
			}
		})
	);

	return imgs;

	// const imgs = await data.mediaItems.map((img) => {
	//   fetch(img.baseUrl).then(imageRes => {
	//     imageRes.blob().then(blob => {
	//       return {
	//         url: img.baseUrl,
	//         filename: img.filename,
	//         blob
	//       }
	//     })
	//   })
	// });

	// if (data?.nextPageToken) {
	// 	return data.items.concat(await getData(data.nextPageToken));
	// }
};

export default async (req, res) => {
	const session = await getSession({ req });

	if (!session) {
		return res.status(401).end();
	}

	const token = await getToken({ req, secret, encryption: true });
	accessToken = token.accessToken;

	
	if (!accessToken) {
		return res.status(401).end();
	}
	
	const month = req.query.month;
	const year = req.query.year;
	const pageSize = req.query.pageSize;
	const data = await getData(month, year, pageSize, res);
	if (!data) {
		return res.status(401).end();
	}

	res.setHeader("X-Progress", 12345);
	res.status(200).json(data);
};

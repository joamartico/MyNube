import axios from "axios";
import { getSession } from "next-auth/client";
import { getToken } from "next-auth/jwt";
const JSZip = require("jszip");

let newPhoto

export default async function handler(req, res) {
	const photo = req.query.photo
	const item = JSON.parse(photo)
	console.log('item')
	console.log(item);


	// const imgs = await Promise.all(
	// 	photos.map(async (item) => {
	try {
		const response = await axios({
			method: "get",
			url: item.baseUrl + "=d",
			responseType: "arraybuffer",
			withCredentials: true,
			// headers: {
			// 	'Connection': 'keep-alive'
			// }
		});

		// console.log('')
		// console.log('buffer (response.data)')
		// console.log(buffer)

		const base64 = response.data.toString("base64");

		newPhoto = {
			base64,
			filename:
				item.mediaMetadata.creationTime +
				"." +
				item.filename.split(".")[1],
			baseUrl: item.baseUrl + "=d",
		};
	} catch (err) {
		console.log(err);
	}
	// 	})
	// );

	// res.setHeader("X-Progress", 12345);
	console.log('newPhoto')
	console.log(newPhoto)
	console.log('newPhoto')
	res.status(200).json(newPhoto);
}

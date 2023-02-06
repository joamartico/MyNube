import axios from "axios";
import { getSession } from "next-auth/client";
import { getToken } from "next-auth/jwt";
const JSZip = require("jszip");
const fs = require("fs");

let newPhoto;

export default async function handler(req, res) {
	const photo = req.query.photo;
	const item = JSON.parse(photo);

	// const imgs = await Promise.all(
	// 	photos.map(async (item) => {
	try {
		const response = await axios({
			method: "get",
			url: item.mimeType == 'video/mp4' ? `${item.baseUrl}=dv` : `${item.baseUrl}=d` ,
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
			// baseUrl: item.baseUrl + "=d",
			baseUrl: item.baseUrl,
		};

		const data = response.data;
		console.log("item.mimeType");
		console.log(item.filename)
		console.log(item.mimeType);
		console.log("item.mimeType");
		console.log("");
		console.log("");
		console.log("");

		if (item.mimeType == "video/mp4") {
			const zip = new JSZip();
			zip.file(item.filename, data, { binary: true });
			const content = await zip.generateAsync({ type: "nodebuffer" });
			fs.writeFileSync(`${item.filename}.zip`, content, {
				encoding: null,
			});
		}
	} catch (err) {
		console.log(err);
	}
	// 	})
	// );

	// res.setHeader("X-Progress", 12345);
	// console.log('newPhoto')
	// console.log(newPhoto)
	// console.log('newPhoto')
	res.status(200).json(newPhoto);
}

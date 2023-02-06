import axios from "axios";
const JSZip = require("jszip");

let newPhoto;

export default async function handler(req, res) {
	const photo = req.query.photo;
	const item = JSON.parse(photo);

	try {
		const response = await axios({
			method: "get",
			url:
				item.mimeType == "video/mp4"
					? `${item.baseUrl}=dv`
					: `${item.baseUrl}=d`,
			responseType: "arraybuffer",
			withCredentials: true,
		});

		const base64 = response.data.toString("base64"); // hace falta?

		newPhoto = {
			base64,
			filename:
				item.mediaMetadata.creationTime +
				"." +
				item.filename.split(".")[1],
		};
	} catch (err) {
		console.log(err);
	}

	res.status(200).json(newPhoto);
}

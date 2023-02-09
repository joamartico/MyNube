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

		const fileDate = item.mediaMetadata.creationTime.split("T")[0];

		newPhoto = {
			base64,
			filename: fileDate + "__" + item.filename,
			// filename:
			// 	item.mediaMetadata.creationTime +
			// 	"." +
			// 	item.filename.split(".")[1],
		};
	} catch (err) {
		console.log("cant get photo data: ", err);
	}

	res.status(200).json(newPhoto);
}

export const config = {
	api: {
		externalResolver: true,
		responseLimit: "50mb",
		bodyParser: {
			sizeLimit: "50mb",
		},
	},
};

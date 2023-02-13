import axios from "axios";

let newPhoto;

export default async function handler(req, res) {
	const photo = req.query.photo;
	const item = JSON.parse(photo);

	try {
		const response = await fetch(
			item.mimeType == "video/mp4"
				? `${item.baseUrl}=dv`
				: `${item.baseUrl}=d`,
			{
				method: "GET",
				//   headers: {
				// 	Accept: "application/octet-stream"
				//   }
			}
		);

		const arrayBuffer = await response.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString("base64");

		const fileDate = item.mediaMetadata.creationTime.split("T")[0];

		newPhoto = {
			base64,
			filename: fileDate + "__" + item.filename,
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

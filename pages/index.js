import { getSession, signIn, signOut, useSession } from "next-auth/client";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { getToken } from "next-auth/jwt";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import styled from "styled-components";

export default function Home({ accessToken }) {
	const [session, loadingSession] = useSession();
	const [images, setImages] = useState([]);
	const [pageSize, setPageSize] = useState(101);
	const [progress, setProgress] = useState(2000000);
	const [popover, setPopover] = useState(false);

	async function zipImages(_images) {
		const zip = new JSZip();

		// Fetch each image and add it to the zip file
		_images.forEach((image) => {
			if (!image) return;
			zip.file(image?.filename, image?.base64, {
				base64: true,
				compression: "STORE",
			});
		});

		// Generate the zip file
		const content = await zip.generateAsync({ type: "blob" });

		// Download zip
		saveAs(content, "images.zip");

		return content;
	}

	useEffect(() => {
		if (session && !accessToken) {
			signOut();
		}
		console.log('images: ', images)
		if (session && images.length == 0) {
			getData();
		}
	}, [session]);

	async function getData() {
		console.log('getting Data')
		axios
			.get("/api/getData", {
				withCredentials: true,
				params: {
					pageSize,
				},
				onDownloadProgress: (progressEvent) => {
					console.log(progressEvent)
					// console.log(progressEvent);
					const { loaded } = progressEvent;
					// const total =
					// 	progressEvent.currentTarget.getResponseHeader(
					// 		"content-length"
					// 	);
					setProgress(loaded);
				},
			})
			.then((response) => {
				console.log('successful fetch: ', response);

				if(response.data.length < 2){ // no deberia ser asi
					signOut()
				}

				// console.log("response-headers: ", response.headers["content-length"]);
				setProgress();
				setImages(response.data);
			})
			.catch(e => console.log('failed fetch: ', e))
	}

	return (
		<>
			<Popover isOpen={popover} onClick={() => signOut()}>
				Sign Out
			</Popover>

			<ion-header>
				<ion-toolbar>
					{session && (
						<>
							<ion-buttons slot="primary">
								{session.user.email}
								<ion-button
									onClick={() => setPopover((prev) => !prev)}
								>
									<Avatar
										src={session.user.image}
										referrerpolicy="no-referrer"
										layout="fill"
									/>
								</ion-button>
							</ion-buttons>
						</>
					)}
					<Logo>MyNube</Logo>
				</ion-toolbar>
			</ion-header>

			<ion-content>
				{!session && (
					<CenterDiv>
						<h2>Inicia sesión en MyNube</h2>
						<ion-button
							color="dark"
							fill="outline"
							onClick={() => signIn("google")}
						>
							<ion-icon name="google" />
							&nbsp;&nbsp;Continue with Google
						</ion-button>
					</CenterDiv>
				)}

				{session && (
					<>
						<DownloadButton
							expand="block"
							onClick={() => {
								zipImages(images);
							}}
						>
							Download zip
						</DownloadButton>

						<List>
							{images?.map((img, i) => (
								<Img src={img?.baseUrl} key={i} />
							))}

							{progress && (
								<progress
									value={progress}
									max={pageSize * 1200000}
								/>
							)}
						</List>
					</>
				)}
			</ion-content>
		</>
	);
}

export async function getServerSideProps({ req }) {
	const secret = process.env.SECRET;

	const session = await getSession({ req });

	const token = await getToken({ req, secret, encryption: true });
	if (!token) return { props: { session } };
	const accessToken = token?.accessToken;

	// PROBAR HACER UN GET DE TODOS LOS ALBUMES (IDs)

	// const filter = {
	// 	albumId: "AF1QipOHZIYiUtG8KOaahXJcYjwg6qHxwaqbi2uVKkNW",
	// 	pageSize: 10,
	//   }

	// const { data } = await axios.post(
	// 	"https://photoslibrary.googleapis.com/v1/mediaItems:search",
	// 	filter,
	// 	{
	// 		headers: {
	// 			Authorization: `Bearer ${accessToken}`,

	// 		},

	// 	}
	// )

	// const imgs = await Promise.all(
	// 	data.mediaItems.map(async (item) => {
	// 		try {
	// 			const response = await axios({
	// 				method: "get",
	// 				url: item.baseUrl + '=d',
	// 				responseType: "arraybuffer",
	// 			});

	// 			const base64 = response.data.toString("base64");

	// 			return {
	// 				base64,
	// 				filename: item.filename,
	// 				baseUrl: item.baseUrl + '=d'
	// 			};

	// 		} catch (err) {
	// 			console.log(err);
	// 		}
	// 	})
	// );

	return {
		props: { session, accessToken },
	};
}

const CenterDiv = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const Logo = styled.h1`
	font-weight: 700;
	margin: auto 15px;
`;

const Avatar = styled.img`
	border-radius: 50%;
	/* height: 38px;
	width: 38px; */
	height: 100%;
	margin-left: 6px;
`;

const Popover = styled.div`
	position: absolute;
	z-index: 999;
	background: red;
	display: ${({ isOpen }) => (isOpen ? "block" : "none")};
	right: 10px;
	top: 60px;
	background: white;
	border-radius: 10px;
	/* border: 1px solid #aaa; */
	padding: 18px;
	font-weight: 600;
	cursor: pointer;
	box-shadow: 0px 0px 5px 3px rgba(0, 0, 0, 0.2);
`;

const DownloadButton = styled.div`
	background: var(--ion-color-primary);
	border-radius: 10px;
	height: 60px;
	width: 93%;
	max-width: 800px;
	position: fixed;
	bottom: 15px;
	// left: 50%;
	// right: 50%;
	left: 50%;
	transform: translateX(-50%);
	margin: auto;
	display: flex;
	font-weight: 700;
	cursor: pointer;
	text-align: center;
	justify-content: center;
	align-items: center;
	box-shadow: 0px 0px 5px 3px rgba(0, 0, 0, 0.2);
	color: white;
`;

const Img = styled.img`
	max-height: 200px;
	margin-right: 16px;
	margin-bottom: 16px;
	border-radius: 5px;
`;

const List = styled.div`
	width: 100%;
	height: 100%;
	padding: 20px;
	padding-bottom: 150px;
	display: flex;
	flex-wrap: wrap;
	/* justify-content: center; */
`;
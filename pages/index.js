import { getSession, signOut, useSession } from "next-auth/client";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { getToken } from "next-auth/jwt";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import styled from "styled-components";
import IonSelect from "../components/IonSelect";
import { loadingController } from "@ionic/core";

const months = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

const todayDate = new Date();

export default function Home({ accessToken }) {
	const [session, loadingSession] = useSession();
	const [images, setImages] = useState();
	const [progress, setProgress] = useState(0);
	const [popover, setPopover] = useState(false);
	const [filter, setFilter] = useState({
		year: todayDate.getFullYear(),
		month: todayDate.getMonth() + 1,
		max: null,
	});

	async function getPhotos() {
		const loading = await loadingController.create({
			message: "Loading photos",
		});
		loading.present();

		axios
			.get("/api/getPhotos", {
				withCredentials: true,
				params: {
					month: filter.month,
					year: filter.year,
				},
			})
			.then((response) => {
				response.data && setImages(response.data.reverse());
				loading.dismiss();
				setProgress(0);
			})
			.catch((e) => {
				console.log("failed fetch: ", e);
				signOut();
			});
	}

	const getImagesData = async (_images) => {
		const imagesData = [];
		for (const item of _images) {
			try {
				const res = await axios.get("/api/getPhotoData", {
					withCredentials: true,
					params: {
						photo: JSON.stringify(item),
					},
				});
				imagesData.push(res.data);
				setProgress((prev) => {
					const newPerc = prev + 100 / images.length;
					return newPerc;
				});
				const newImages = [...images]
				newImages[_images.indexOf(item)].status = 'ok'
				setImages(newImages)
			} catch (e) {
				console.log("NOT succesfull!", e);
				const newImages = [...images]
				newImages[_images.indexOf(item)].status = 'error'
				setImages(newImages)
			}
		}
		return imagesData;
	};

	async function zipImages(_images) {
		const imagesData = await getImagesData(_images);

		const zip = new JSZip();

		// Add each image to the zip file
		imagesData.forEach((image) => {
			if (!image) return;
			zip.file(image?.filename, image?.base64, {
				base64: true,
				compression: "STORE",
			});
		});

		// Generate the zip file
		const content = await zip.generateAsync({ type: "blob" });

		// Download zip
		saveAs(content, `${months[filter.month - 1]}_${filter.year}.zip`);

		return content;
	}

	useEffect(() => {
		if (session && !accessToken) {
			console.log("!accessToken");
			signOut();
		}
	}, [session]);

	return (
		<>
			<ion-header>
				<ion-toolbar>
					<ion-buttons slot="primary">
						{session?.user.email}
						<ion-button onClick={() => setPopover((prev) => !prev)}>
							<Avatar
								src={session?.user.image}
								referrerpolicy="no-referrer"
								layout="fill"
							/>
						</ion-button>
					</ion-buttons>

					{!images ? (
						<Logo>MyNube</Logo>
					) : (
						<ion-buttons slot="start">
							<ion-back-button
								default-href="/"
								onClick={() => {
									setImages();
									setFilter();
								}}
							></ion-back-button>
						</ion-buttons>
					)}
				</ion-toolbar>
			</ion-header>

			<Popover isOpen={popover} onClick={() => signOut()}>
				Sign Out
			</Popover>

			<ion-content>
				{images ? (
					<>
						<ion-toolbar
							style={{ marginBottom: 15, marginTop: 20 }}
						>
							<ion-title size="large">
								{months[filter.month - 1]} {filter.year}
							</ion-title>
						</ion-toolbar>
						<Subtitle>{images.length} images</Subtitle>
					</>
				) : (
					""
				)}

				{images?.length > 0 ? (
					<>
						<List>
							{images?.map((img, i) => (
								<Content
									href={img?.productUrl}
									rel="noreferrer"
									target="_blank"
								>
									{img.mimeType == "video/mp4" ? (
										<video
											key={i}
											src={img.baseUrl + "=dv"}
											// type="video/mp4"
											controls
											width="300"
											height="200"
										/>
									) : (
										<Img src={img?.baseUrl} key={i} />
									)}

									{img.status && <Check status={img.status}/>}
								</Content>
							))}
						</List>

						<DownloadButton
							expand="block"
							onClick={() => {
								zipImages(images);
							}}
							style={{
								pointerEvents: progress ? "none" : "",
								background:
									progress && progress < 95 ? "#bbbd" : "",
							}}
						>
							{progress
								? `${progress.toFixed(0)}%`
								: "Descargar ZIP"}
							<Progress
								val={progress}
								style={{
									borderRadius: progress > 99 ? 10 : "",
								}}
							/>
						</DownloadButton>
					</>
				) : (
					<ion-list>
						<ion-list-header>
							<ion-label>Filtra las fotos a descargar</ion-label>
						</ion-list-header>

						<ion-item fill="outline">
							<ion-label>Selecciona un mes</ion-label>
							<IonSelect
								interface="popover"
								placeholder="Mes"
								value={todayDate.getMonth() + 1}
								onChange={(e) => {
									setFilter((prev) => {
										const newFilter = { ...prev };
										newFilter.month = e.detail.value;
										return newFilter;
									});
								}}
							>
								{months.map((month, i) => (
									<ion-select-option
										value={i + 1}
										onClick={(prev) => {
											const newFilter = { ...prev };
											newFilter.month = i + 1;
											setFilter(newFilter);
										}}
									>
										{month}
									</ion-select-option>
								))}
							</IonSelect>
						</ion-item>

						<ion-item>
							<ion-label>Selecciona un año</ion-label>
							<IonSelect
								interface="popover"
								placeholder="Año"
								value={todayDate.getFullYear()}
								onChange={(e) => {
									setFilter((prev) => {
										const newFilter = { ...prev };
										newFilter.year = e.detail.value;
										return newFilter;
									});
								}}
							>
								{years.map((year) => (
									<ion-select-option value={year}>
										{year}
									</ion-select-option>
								))}
							</IonSelect>
						</ion-item>

						<div class="ion-padding">
							<ion-button
								expand="block"
								fill="outline"
								onClick={() => getPhotos()}
							>
								Buscar
							</ion-button>
						</div>
					</ion-list>
				)}
			</ion-content>
		</>
	);
}

export async function getServerSideProps({ req }) {
	const secret = process.env.SECRET;

	const session = await getSession({ req });

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

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
	top: 50px;
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
	transition: all ease-in-out 0.5s;
	border-radius: 10px;
	height: 60px;
	width: 93%;
	max-width: 800px;
	position: fixed;
	z-index: 9999999;
	bottom: 15px;
	// left: 50%;
	// right: 50%;
	left: 50%;
	transform: translateX(-50%);
	margin: auto;
	display: flex;
	font-weight: 700;
	font-size: 17px;
	cursor: pointer;
	text-align: center;
	justify-content: center;
	align-items: center;
	box-shadow: 0px 4px 43px 15px rgba(0, 0, 0, 0.8);
	color: white;
	border: 2px solid #8bb3ff;
	justify-content: center;
`;

const Progress = styled.div`
	background: var(--ion-color-primary);
	transition: all ease-in-out 0.5s;
	border-radius: 10px 0 0 10px;
	/* height: 60px; */
	height: 100%;
	width: ${({ val }) => val}%;
	max-width: 800px;
	z-index: -5;
	/* position: fixed; */
	/* bottom: 15px; */
	// left: 50%;
	// right: 50%;
	/* left: 50%; */
	/* transform: translateX(-50%); */
	margin-right: auto;
	display: flex;
	font-weight: 700;
	font-size: 17px;
	cursor: pointer;
	text-align: center;
	justify-content: center;
	align-items: center;
	color: white;
	position: absolute;
	left: 0;
	/* border-left: 2px solid #fff6;
	border-top: 2px solid #fff6;
	border-bottom: 2px solid #fff6; */
`;

const Content = styled.div`
	margin-right: 6px;
	margin-left: 6px;
	margin-bottom: 20px;
	position: relative;
	height: fit-content;
	max-height: 200px;
`;

const Check = styled.div`
	position: absolute;
	z-index: 9;
	right: 5px;
	bottom: 5px;
	height: 10px;
	width: 10px;
	border-radius: 50%;
	background: ${({status}) => status == 'ok' ? '#7CCE4E' : 'red'};
`;

const Img = styled.img`
	border-radius: 5px;
	max-height: 200px;
`;

const Subtitle = styled.p`
	margin-top: -15px;
	margin-left: 18px;
	padding-bottom: 0px;
`;

const List = styled.div`
	width: 100%;
	/* height: 100%; */
	padding: 10px;
	padding-bottom: 75px;
	display: flex;
	flex-wrap: wrap;
	/* justify-content: center; */
`;



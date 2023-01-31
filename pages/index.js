import { getSession, signOut, useSession } from "next-auth/client";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { getToken } from "next-auth/jwt";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import styled from "styled-components";
import IonSelect from "../components/IonSelect";

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
	const [pageSize, setPageSize] = useState(100);
	const [progress, setProgress] = useState(null);
	const [popover, setPopover] = useState(false);
	const [filter, setFilter] = useState({
		year: todayDate.getFullYear(),
		month: todayDate.getMonth() + 1,
		max: null,
	});

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
			console.log("!accessToken");
			signOut();
		}
	}, [session]);

	async function getData() {
		console.log("getting Data");
		setProgress(10000000);
		axios
			.get("/api/getData", {
				withCredentials: true,
				params: {
					pageSize,
					month: filter.month,
					year: filter.year,
				},
				headers: {
					'Connection': 'keep-alive',	
				},
				onDownloadProgress: (progressEvent) => {
					console.log(progressEvent);
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
				console.log("successful fetch: ", response);
				// console.log("response-headers: ", response.headers["content-length"]);
				setProgress();
				setImages(response.data);
			})
			.catch((e) => {
				console.log("failed fetch: ", e);
				// signOut();
			});
	}

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
							<ion-back-button default-href="/" onClick={() => setImages()}></ion-back-button>
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
						<ion-toolbar style={{ marginBottom: 15, marginTop: 20 }}>
							<ion-title
								size="large"
								
							>
								{months[filter.month - 1]} {filter.year}
							</ion-title>
						</ion-toolbar>
					</>
				) : (
					""
				)}

				{images?.length > 0 ? (
					<>
						<List>
							{images?.map((img, i) => (
								<Img src={img?.baseUrl} key={i} />
							))}
						</List>

						<DownloadButton
							expand="block"
							onClick={() => {
								zipImages(images);
							}}
						>
							Obtener ZIP
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

						{/* <ion-item>
							<ion-label>Cantidad máxima</ion-label>
							<ion-select
								interface="popover"
								placeholder="Número"
							>
								<ion-select-option value="All">
									All
								</ion-select-option>
								<ion-select-option value="10">
									10
								</ion-select-option>
								<ion-select-option value="50">
									50
								</ion-select-option>
								<ion-select-option value="100">
									100
								</ion-select-option>
							</ion-select>
						</ion-item> */}

						<div class="ion-padding">
							<ion-button
								expand="block"
								fill="outline"
								onClick={() => getData()}
							>
								Buscar
							</ion-button>
						</div>
					</ion-list>
				)}

				{progress && (
					<progress value={progress} max={pageSize * 1200000} />
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
	font-size: 17px;
	cursor: pointer;
	text-align: center;
	justify-content: center;
	align-items: center;
	box-shadow: 0px 4px 43px 15px rgba(0, 0, 0, 0.8);
	color: white;
	border: 2px solid #fff6;
`;

const Img = styled.img`
	max-height: 200px;
	margin-right: 6px;
	margin-left: 6px;
	margin-bottom: 20px;
	border-radius: 5px;
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

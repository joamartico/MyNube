import { getSession, signIn } from "next-auth/client";
import styled from "styled-components";

const login = () => {
	return (
		<>
			<Head>
				<link rel="canonical" href="https://mynube.vercel.app/login" />
			</Head>

			<ion-header>
				<ion-toolbar>
					<Logo>MyNube</Logo>
				</ion-toolbar>
			</ion-header>

			<ion-content>
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
			</ion-content>
		</>
	);
};

export async function getServerSideProps({ req }) {
	const session = await getSession({ req });

	if (session) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	return {
		props: {},
	};
}

export default login;

const Logo = styled.h1`
	font-weight: 700;
	margin: auto 15px;
`;

const CenterDiv = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

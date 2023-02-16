import { useRouter } from "next/router";
import styled from "styled-components";

const onboarding = () => {
	const router = useRouter();

	
	

	return (
		<>
			<ion-content style={{ background: "red" }}>
				<Background>
					<Card>
						<TextContainer>
							<MainTitle>Welcome to MyNube !</MainTitle>

							<MainSubtitle>
								The best web app to see and download your google
								photos organized by month and year
							</MainSubtitle>
						</TextContainer>

						<ion-button
							class="full"
							onClick={() => {
								router.push("/login");
                                // window.open('http://192.168.0.220:3000/', "_blank")
							}}
						>
							Get Started
						</ion-button>
					</Card>
				</Background>
			</ion-content>
		</>
	);
};

export default onboarding;

const Background = styled.div`
	height: 100vh;
	width: 100vw;
	background: #59f;
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Card = styled.div`
	background-color: #fff;
	border-radius: 15px;
	margin: auto;
	width: 94vw;
	max-width: 560px;
	box-shadow: 0 7px 5px ${() => "#0004"};
	display: flex;
	flex: 1;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	height: 82%;
	/* margin-top: 2%; */
	padding: 30px 15px;
`;

const MainTitle = styled.h1`
	font-size: 6.5vh;
	font-weight: bold;
	color: var(--ion-color-primary);
	align-items: center;
	max-width: 500px;
`;

const MainSubtitle = styled.h2`
	font-size: 20px;
	display: flex;
	align-items: center;
	/* color: var(--ion-color-primary); */
	color: #36a;
	margin-bottom: 5px;
	margin-top: 3vh;
	max-width: 500px;
	font-weight: bold !important;
	line-height: 1.6;
`;

const TextContainer = styled.div`
	margin-top: 150px;
`;

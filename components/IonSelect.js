import { useEffect, useRef } from "react";

const IonSelect = (props) => {
	const ref = useRef();

	useEffect(() => {
		ref?.current?.addEventListener("ionChange", props.onChange);

		// cleanup this component
		return () => {
			ref?.current?.removeEventListener("ionChange", props.onChange);
		};
	}, []);

	return (
		<ion-select
			ref={ref}
			// multiple="true"
			// interface="action-sheet"
			{...props}
		>
			{props.children}
		</ion-select>
	);
};

export default IonSelect;

import { Suspense } from "react";
import { Login } from "~/components/shared/auth";

export default function HomePage() {
	return (
		<Suspense>
		<Login />
		</Suspense>
	);
}

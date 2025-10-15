import { GetServerSidePropsContext } from "next";
import { IUser } from "./client";

type ServerSideProps<T = any> = { props: T };

type ServerSideRedirect = {
	redirect: {
		destination: string;
		permanent: boolean;
	};
};

export type ServerSideResult<T = any> =
	| ServerSideProps<T | { error: string }>
	| ServerSideRedirect;

export type AuthSimpleResponse<
	T extends ServerSideResult,
	U extends ServerSideResult,
> = {
	onLoggedOut: () => T;
	onLoggedIn: (_: IUser, __?: any) => U | Promise<U>;
};

export type AuthOnboardingResponse<
	T extends ServerSideResult,
	U extends ServerSideResult,
	V extends ServerSideResult,
> = {
	onLoggedOut: () => T;
	onLoggedInAndOnboarded: (_: IUser, __?: any) => U | Promise<U>;
	onLoggedInAndNotOnboarded: (_: IUser, __?: any) => V | Promise<V>;
};

export type AdminResponse<
	T extends ServerSideResult,
	U extends ServerSideResult,
	V extends ServerSideResult,
> = {
	onLoggedOut: () => T;
	onAdmin: (_: IUser, __?: any) => U | Promise<U>;
	onNonAdmin: (_: IUser, __?: any) => V | Promise<V>;
};

export type ServerSideAuthInterceptor = <
	T extends ServerSideResult = ServerSideResult,
	U extends ServerSideResult = T,
	V extends ServerSideResult = U,
>(
	_context: GetServerSidePropsContext,
	_responses: AuthSimpleResponse<T, U> | AuthOnboardingResponse<T, U, V>
) => Promise<T | U | V>;

export type ServerSideAdminInterceptor = <
	T extends ServerSideResult = ServerSideResult,
	U extends ServerSideResult = T,
	V extends ServerSideResult = U,
>(
	_context: GetServerSidePropsContext,
	_responses: AdminResponse<T, U, V>
) => Promise<T | U | V>;

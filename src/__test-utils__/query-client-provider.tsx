import React from "react";
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

export function createQueryClientWrapper(config?: ConstructorParameters<typeof QueryClient>[0]) {
	const queryClient = new QueryClient(config);
	return ({ children }: PropsWithChildren<unknown>) => (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}

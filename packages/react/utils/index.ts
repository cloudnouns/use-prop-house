const queryUrl = 'https://prod.backend.prop.house/graphql';

export const fetchDataByQuery = async (
	query: string,
	variables: Record<string, any> = {}
) => {
	try {
		const response = await fetch(queryUrl, {
			method: 'post',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify({ query, variables }),
		});
		return await response.json();
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const timestamp = (date: string): number => {
	if (!date) return 0;
	return new Date(date).valueOf() ?? 0;
};

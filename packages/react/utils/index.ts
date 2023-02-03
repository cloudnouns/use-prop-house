const baseUrl = 'https://prop.house';
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

export const slug = (str: string): string => {
	if (!str) return '';
	return str.toLowerCase().replaceAll(' ', '-') ?? '';
};

export const url = (parts: string[] = []): string => {
	if (!parts.length) return '';
	const path = parts.map((part) => slug(part)).join('/');
	return baseUrl + '/' + path;
};

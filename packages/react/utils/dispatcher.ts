import { Dispatch } from 'react';

export default class Dispatcher<T> {
	private setData: Dispatch<T>;
	private setLoading: Dispatch<boolean>;
	private setError: Dispatch<string>;

	constructor(
		setDataFn: Dispatch<T>,
		setLoadingFn: Dispatch<boolean>,
		setErrorFn: Dispatch<string>
	) {
		this.setData = setDataFn;
		this.setLoading = setLoadingFn;
		this.setError = setErrorFn;
	}

	reset() {
		this.setLoading(true);
		this.setError('');
	}

	update(data: T) {
		this.setData(data);
		this.setError('');
		this.setLoading(false);
	}

	err(msg: string, fallback: T) {
		console.error(msg);
		this.setError(msg);
		this.setData(fallback);
		this.setLoading(false);
	}
}

import { Dispatch } from 'react';

export default class Dispatcher<T> {
	private setData: Dispatch<T>;
	private setLoading: Dispatch<boolean>;
	private setError: Dispatch<boolean>;
	private errorMsg: Dispatch<string>;

	constructor(
		setDataFn: Dispatch<T>,
		setLoadingFn: Dispatch<boolean>,
		setErrorFn: Dispatch<boolean>,
		errorMsgFn: Dispatch<string>
	) {
		this.setData = setDataFn;
		this.setLoading = setLoadingFn;
		this.setError = setErrorFn;
		this.errorMsg = errorMsgFn;
	}

	reset() {
		this.setLoading(true);
		this.setError(false);
		this.errorMsg('');
	}

	update(data: T) {
		this.setData(data);
		this.setLoading(false);
	}

	err(msg: string, fallback: T) {
		console.error(msg);
		this.errorMsg(msg);
		this.setError(true);
		this.setData(fallback);
		this.setLoading(false);
	}
}

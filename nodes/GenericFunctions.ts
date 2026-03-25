import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

import { NodeApiError, NodeOperationError } from 'n8n-workflow';


/**
 * Make an API request to WhatsApp
 *
 * @param {IHookFunctions} this
 * @param {string} method
 * @param {string} url
 * @param {object} body
 * @returns {Promise<any>}
 */
export async function apiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	body: IDataObject = {},
	query: IDataObject = {},
	uri?: string,
) {
	const options: IHttpRequestOptions = {
		method,
		body,
		qs: query,
		url: uri ?? 'https://api.chatarchitect.com/whatsappmessage',
		json: true,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'chatArchitectWhatsAppApi', options);
	} catch (error) {
		if (error instanceof NodeApiError) throw error;
		throw new NodeOperationError(this.getNode(), error as Error);
	}
}

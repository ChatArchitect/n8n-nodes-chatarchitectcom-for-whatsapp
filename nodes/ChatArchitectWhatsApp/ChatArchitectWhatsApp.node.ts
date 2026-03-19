import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionTypes } from 'n8n-workflow';
import { apiRequest } from '../GenericFunctions';

export class ChatArchitectWhatsApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatArchitect WhatsApp',
		name: 'chatArchitectWhatsApp',
		icon: 'file:whatsapp.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'ChatArchitect WhatsApp integration',
		defaults: {
			name: 'ChatArchitect WhatsApp',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'chatArchitectWhatsAppApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'message',
				options: [
					{ name: 'Message', value: 'message' },
					{ name: 'Media', value: 'media' },
					{ name: 'Webhook', value: 'webhook' },
				],
			},

			/* MESSAGE */
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'sendText',
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{
						name: 'Send Text',
						value: 'sendText',
						action: 'Send a text message',
					},
				],
			},
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendText'] },
				},
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendText'] },
				},
			},

			/* MEDIA */
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'sendImage',
				displayOptions: { show: { resource: ['media'] } },
				options: [
					{ name: 'Send Image', value: 'sendImage', action: 'Send an image' },
					{ name: 'Send Video', value: 'sendVideo', action: 'Send a video' },
					{ name: 'Send Audio', value: 'sendAudio', action: 'Send an audio file' },
					{ name: 'Send Document', value: 'sendDocument', action: 'Send a document' },
				],
			},
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['media'] },
				},
			},
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['media'] },
				},
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['media'] },
				},
			},

			/* WEBHOOK */
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'set',
				displayOptions: { show: { resource: ['webhook'] } },
				options: [
					{ name: 'Set Webhook', value: 'set', action: 'Set a webhook' },
				],
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['webhook'], operation: ['set'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				let body: IDataObject = {};
				let response: IDataObject;
				const method = 'POST' as IHttpRequestMethods;
				let endpoint: string = '/whatsappmessage';

				if (resource === 'message' && operation === 'sendText') {
					body = {
						channel: 'whatsapp',
						destination: this.getNodeParameter('destination', i),
						payload: {
							type: 'text',
							message: this.getNodeParameter('text', i),
						},
					};
				}

				if (resource === 'media') {

					let type = operation.replace('send', '').toLowerCase()

					if (type === 'document') {
						type = 'file';
					}

					body = {
						channel: 'whatsapp',
						destination: this.getNodeParameter('destination', i),
						payload: {
							type: type,
							url: this.getNodeParameter('fileUrl', i),
						},
					};

					if (type !== 'audio') {
						(body.payload as IDataObject).caption = this.getNodeParameter('caption', i)
					}
				}

				if (resource === 'webhook' && operation === 'set') {

					endpoint = '/webhook';

					body = {
						channel: 'whatsapp',
						webhook_separate: 'false',
						webhook: this.getNodeParameter('webhookUrl', i),
						webhook_message_event: this.getNodeParameter('webhookUrl', i),
						webhook_user_event: this.getNodeParameter('webhookUrl', i),
					};
				}

				response = (await apiRequest.call(this, method, body, {}, 'https://api.chatarchitect.com' + endpoint)) as IDataObject;

				returnData.push({
					json: response,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return this.prepareOutputData(returnData);
	}
}

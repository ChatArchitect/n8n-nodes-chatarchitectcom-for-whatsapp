import type { IAuthenticateGeneric, Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class ChatArchitectWhatsAppApi implements ICredentialType {
	name = 'chatArchitectWhatsAppApi';
	displayName = 'WhatsApp Account API';
	documentationUrl = 'https://support.chatarchitect.com/l_eng/knowledge_base/category/62064';
	icon: Icon = { light: 'file:../icons/whatsapp.svg', dark: 'file:../icons/whatsapp.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'APP ID',
			name: 'appId',
			type: 'string',
			default: '',
			description:
				"Chat with the <a href='https://www.chatarchitect.com/whatsapp/'>https://www.chatarchitect.com/whatsapp/</a> to obtain the APP ID",
		},
		{
			displayName: 'APP SECRET',
			name: 'appSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description:
				"Chat with the <a href='https://www.chatarchitect.com/whatsapp/'>https://www.chatarchitect.com/whatsapp/</a> to obtain the APP SECRET",
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.appId}}',
				password: '={{$credentials.appSecret}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.chatarchitect.com',
			url: '/whatsappmessage',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				channel: 'whatsapp',
			},
		},
	};
}

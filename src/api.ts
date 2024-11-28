import { requestUrl } from "obsidian";
import { API_URLS } from "./settings";

interface GetArticlesResponse {
	code: number;
	data: {
		items: Article[];
		total: number;
	};
}

export interface Article {
	id: string;
	type: string;
	app_name: string;
	if_from_web_page: boolean;
	if_from_extension: boolean;
	if_from_weixin: boolean;
	file_url: string;
	alias: string;
	key_points: string[];
	title: string;
	create_time: string;
	collect: boolean;
	unread: boolean;
	summary: {
		menu_id: string;
		alias: string;
		img_url: string;
		category: string;
		source: string;
		Keywords: string[];
		source_key_points: Array<{
			q: string;
			a: string;
		}>;
		guess_qas: Array<{
			q: string;
			a: string;
		}>;
		title: string;
		key_points: string[];
		golden_sentences: string[];
		template: string;
		language: string;
	};
	have_comment: boolean;
	tags: { name: string; id: number }[];
	is_fragmented: boolean;
	image_content: string;
	is_audio: boolean;
	is_video: boolean;
	content: string;
	innerHTML: string;
	words_count: number;
	cost_seconds: string;
}

export const getArticles = async (
	apiKey: string,
	limit = 200,
	page = 1,
	url: string = API_URLS.DOMESTIC,
	lastTime = ""
): Promise<GetArticlesResponse> => {
	const urlWithSource = `${url}?source=iframe_sdk`;
	const response = await requestUrl({
		method: "POST",
		body: JSON.stringify({
			limit: limit,
			page: page,
			lastTime,
		}),
		headers: {
			Token: apiKey,
		},
		url: urlWithSource,
	});
	return response.json();
};

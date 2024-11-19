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
  tags: string[];
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
    limit = 15, 
    page = 1, 
    url = API_URLS.DOMESTIC
): Promise<GetArticlesResponse> => {
    
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            "limit": limit,
            "page": page
        }),
        headers: {
            "Token": apiKey
        }
    })
    return response.json()
}

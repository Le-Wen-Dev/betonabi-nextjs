import { Article } from "./mockData";

export interface ArticleDetail extends Article {
  location?: string;
  content: ArticleContent[];
  tags: string[];
}

export interface ArticleContent {
  type: "paragraph" | "image" | "quote";
  text?: string;
  src?: string;
  caption?: string;
}

export const detailedArticleJP: ArticleDetail = {
  id: "detail-1",
  title: "AI系スタートアップの創業者がますます若年化",
  summary: "生成AI の波により、多くのGen Zエンジニアがわずか数年の起業で億万長者、億万長者のテクノロジー企業家になっています。",
  category: "ビジネス",
  image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
  author: "Minh Châu",
  date: "2025/01/19",
  readTime: "8分",
  location: "サンフランシスコ",
  tags: ["AI", "スタートアップ", "テクノロジー", "シリコンバレー", "Gen Z"],
  content: [
    {
      type: "paragraph",
      text: "シリコンバレーは、人工知能分野でかつてない起業ブームを目撃しています。若い顔ぶれ、その多くはGen Z世代に属し、数十億ドル規模のテクノロジー企業のリーダーとして台頭しています。注目すべきは、彼らの多くがまだ20代前半でありながら、グローバルな影響力を持つ企業を構築していることです。"
    },
    {
      type: "paragraph",
      text: "CB Insightsの最新レポートによると、2024年には10億ドル以上の評価額を持つAIスタートアップの数が前年比で倍増しました。注目すべきは、創業者の平均年齢が27歳まで低下し、10年前の34歳から大幅に減少したことです。この傾向は、経験がもはや成功の唯一の決定要因ではないテクノロジー業界の根本的な変化を反映しています。"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80",
      caption: "サンフランシスコのAIスタートアップのオフィス。オープンで創造的なスペースは、若いテクノロジー企業の特徴です。"
    },
    {
      type: "paragraph",
      text: "この傾向を推進する重要な要因の1つは、OpenAIやGoogle DeepMindから多数の才能あるエンジニアが離れていることです。彼らは大規模言語モデル（LLM）や先進的なAI技術に関する深い知識を持ち込み、新しいスタートアップの強固な基盤を作っています。Andreessen Horowitz、Sequoia Capital、Tiger Globalなどのベンチャーキャピタルファンドは、これらの企業への投資を激しく競っています。"
    },
    {
      type: "paragraph",
      text: "典型的な例は、19歳でScale AIを設立したAlexandr Wangのケースです。現在、彼の会社は70億ドル以上の評価額を持ち、世界最大のテクノロジー企業のほとんどにデータラベリングサービスを提供しています。同様に、Runway MLは大学を卒業したばかりの学生グループによって設立され、現在はデジタルコンテンツ制作業界で不可欠なツールとなり、15億ドルを超える評価額を持っています。"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1000&q=80",
      caption: "ベンチャーキャピタリストは、Gen Zが設立したAIスタートアップに数十億ドルを投資しています。"
    },
    {
      type: "paragraph",
      text: "しかし、すべてがバラ色というわけではありません。専門家は、高い評価額が業界にバブルを生み出す可能性があると警告しています。多くのスタートアップは、実際の収益ではなく潜在能力に基づいて評価されています。人材をめぐる激しい競争も運営コストを押し上げており、シリコンバレーのAIエンジニアの平均給与は年間30万ドルを超えています。これは、長期的なビジネスモデルの持続可能性について疑問を投げかけています。"
    },
    {
      type: "paragraph",
      text: "将来を見据えると、専門家はAI分野での若年化傾向が続くと予測しています。オンラインコース、オープンソース資料、ますますアクセスしやすくなる開発ツールの普及により、AI技術を習得するのに必要な時間が短縮されています。次世代の起業家はさらに若くなる可能性があり、学習と起業の境界線がますます曖昧になっています。"
    }
  ]
};

// Most viewed articles
export const mostViewedArticlesJP: Article[] = [
  {
    id: "mv-1",
    title: "OpenAI、優れた推論能力を持つGPT-5を発表",
    summary: "",
    category: "テクノロジー",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    author: "Tech Editor",
    date: "2025/01/19",
    readTime: "5分"
  },
  {
    id: "mv-2",
    title: "ベトナム株式市場、1月に新記録を樹立",
    summary: "",
    category: "ビジネス",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    author: "Finance Desk",
    date: "2025/01/19",
    readTime: "4分"
  },
  {
    id: "mv-3",
    title: "Apple、より安価なVision Pro第2世代を発表",
    summary: "",
    category: "テクノロジー",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80",
    author: "Tech Editor",
    date: "2025/01/18",
    readTime: "3分"
  },
  {
    id: "mv-4",
    title: "ベトナム代表、インドネシアに4-0で大勝",
    summary: "",
    category: "スポーツ",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    author: "Sports Desk",
    date: "2025/01/18",
    readTime: "3分"
  },
  {
    id: "mv-5",
    title: "2025年旧正月：新しい消費トレンド",
    summary: "",
    category: "ライフスタイル",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    author: "Lifestyle",
    date: "2025/01/18",
    readTime: "4分"
  }
];

// Related category articles
export const relatedCategoryArticlesJP: Article[] = [
  {
    id: "rc-1",
    title: "デジタル銀行、2024年に40％成長",
    summary: "金融分野でのデジタル変革トレンドが引き続き爆発的に成長。",
    category: "ビジネス",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    author: "Thanh Mai",
    date: "2025/01/18",
    readTime: "3分"
  },
  {
    id: "rc-2",
    title: "水産物輸出、記録的な100億ドルを達成",
    summary: "エビとパンガシウスが主力商品。",
    category: "ビジネス",
    image: "https://images.unsplash.com/photo-1524177778556-9e90089e0ee5?w=600&q=80",
    author: "Hải Yến",
    date: "2025/01/17",
    readTime: "3分"
  },
  {
    id: "rc-3",
    title: "産業用不動産、FDI資本を強力に誘致",
    summary: "南部の工業団地で高い入居率を記録。",
    category: "ビジネス",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    author: "Quốc Bảo",
    date: "2025/01/17",
    readTime: "4分"
  },
  {
    id: "rc-4",
    title: "ベトナムのスタートアップ、シリーズCで1億ドルを調達",
    summary: "ベトナムのスタートアップ史上最大の資金調達ラウンド。",
    category: "ビジネス",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    author: "Startup Editor",
    date: "2025/01/16",
    readTime: "4分"
  }
];

// Related news articles for bottom section
export const relatedNewsArticlesJP: Article[] = [
  {
    id: "rn-1",
    title: "Google、ベトナムのデータセンターに20億ドルを投資",
    summary: "東南アジアにおけるGoogleの最大の投資。",
    category: "テクノロジー",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80",
    author: "Tech Desk",
    date: "2025/01/19",
    readTime: "4分"
  },
  {
    id: "rn-2",
    title: "Microsoft、ベトナムのAIスタートアップを5億ドルで買収",
    summary: "ベトナムのテクノロジー業界最大のM&A取引。",
    category: "ビジネス",
    image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&q=80",
    author: "Business Editor",
    date: "2025/01/18",
    readTime: "5分"
  },
  {
    id: "rn-3",
    title: "イーロン・マスク、ベトナムを訪問しTesla工場について協議",
    summary: "東南アジアでのバッテリー製造工場建設の可能性。",
    category: "ビジネス",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80",
    author: "International Desk",
    date: "2025/01/18",
    readTime: "4分"
  },
  {
    id: "rn-4",
    title: "FPT Software、日本企業と3億ドルの契約を締結",
    summary: "同社史上最大のアウトソーシング契約。",
    category: "ビジネス",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80",
    author: "Business Desk",
    date: "2025/01/17",
    readTime: "3分"
  }
];

// Navigation articles (previous/next)
export const previousArticleJP: Article = {
  id: "prev-1",
  title: "VN-Index、5日連続で上昇",
  summary: "",
  category: "ビジネス",
  image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  author: "Quang Huy",
  date: "2025/01/18",
  readTime: "4分"
};

export const nextArticleJP: Article = {
  id: "next-1",
  title: "ベトナムのテックスタートアップ、海外ファンドから5000万ドルを調達",
  summary: "",
  category: "ビジネス",
  image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
  author: "Thanh Tùng",
  date: "2025/01/18",
  readTime: "3分"
};

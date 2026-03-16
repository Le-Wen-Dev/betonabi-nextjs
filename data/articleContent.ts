import { Article } from "./mockData";

export interface ArticleDetail extends Article {
  location?: string;
  content: ArticleContent[];
  tags: string[];
}

export interface ArticleContent {
  type: "paragraph" | "image" | "quote" | "heading";
  text?: string;
  src?: string;
  caption?: string;
}

export const detailedArticle: ArticleDetail = {
  id: "detail-1",
  title: "Nhà sáng lập các startup AI tỷ USD ngày càng trẻ hóa",
  summary: "Làn sóng AI tạo sinh đã đưa hàng loạt kỹ sư Gen Z trở thành triệu phú, tỷ phú công nghệ chỉ sau vài năm khởi nghiệp.",
  category: "Kinh doanh",
  image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
  author: "Minh Châu",
  date: "19/01/2025",
  readTime: "8 phút đọc",
  location: "San Francisco",
  tags: ["AI", "Startup", "Công nghệ", "Silicon Valley", "Gen Z"],
  content: [
    {
      type: "paragraph",
      text: "Silicon Valley đang chứng kiến một làn sóng khởi nghiệp chưa từng có trong lĩnh vực trí tuệ nhân tạo. Những gương mặt trẻ tuổi, phần lớn thuộc thế hệ Gen Z, đang nổi lên như những nhà lãnh đạo của các công ty công nghệ trị giá hàng tỷ USD. Điều đáng chú ý là nhiều người trong số họ mới chỉ ngoài 20 tuổi nhưng đã xây dựng được những doanh nghiệp có tầm ảnh hưởng toàn cầu."
    },
    {
      type: "paragraph",
      text: "Theo báo cáo mới nhất từ CB Insights, năm 2024 chứng kiến số lượng startup AI được định giá trên 1 tỷ USD tăng gấp đôi so với năm trước. Đáng chú ý, độ tuổi trung bình của các nhà sáng lập đã giảm xuống còn 27, thấp hơn đáng kể so với mức 34 tuổi của thập kỷ trước. Xu hướng này phản ánh sự thay đổi căn bản trong ngành công nghệ, nơi kinh nghiệm không còn là yếu tố quyết định duy nhất để thành công."
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80",
      caption: "Văn phòng làm việc của một startup AI tại San Francisco. Không gian mở và sáng tạo là đặc trưng của các công ty công nghệ trẻ."
    },
    {
      type: "paragraph",
      text: "Một trong những yếu tố quan trọng thúc đẩy xu hướng này là sự ra đi của hàng loạt kỹ sư tài năng từ OpenAI và Google DeepMind. Những người này mang theo kiến thức chuyên sâu về mô hình ngôn ngữ lớn (LLM) và các công nghệ AI tiên tiến, tạo nền tảng vững chắc cho các startup mới. Các quỹ đầu tư mạo hiểm như Andreessen Horowitz, Sequoia Capital và Tiger Global đang cạnh tranh gay gắt để rót vốn vào những doanh nghiệp này."
    },
    {
      type: "paragraph",
      text: "Điển hình là trường hợp của Alexandr Wang, người sáng lập Scale AI khi mới 19 tuổi. Hiện tại, công ty của anh được định giá hơn 7 tỷ USD và đang cung cấp dịch vụ gán nhãn dữ liệu cho hầu hết các công ty công nghệ lớn nhất thế giới. Tương tự, Runway ML được thành lập bởi một nhóm sinh viên vừa tốt nghiệp đại học, nay đã trở thành công cụ không thể thiếu trong ngành sản xuất nội dung số với định giá vượt 1,5 tỷ USD."
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1000&q=80",
      caption: "Các nhà đầu tư mạo hiểm đang đổ hàng tỷ USD vào các startup AI do Gen Z sáng lập."
    },
    {
      type: "paragraph",
      text: "Tuy nhiên, không phải mọi thứ đều màu hồng. Các chuyên gia cảnh báo rằng định giá cao có thể tạo ra bong bóng trong ngành. Nhiều startup được định giá dựa trên tiềm năng thay vì doanh thu thực tế. Sự cạnh tranh khốc liệt về nhân tài cũng đẩy chi phí hoạt động lên cao, với mức lương trung bình cho kỹ sư AI đã vượt 300.000 USD/năm tại Silicon Valley. Điều này đặt ra câu hỏi về tính bền vững của mô hình kinh doanh trong dài hạn."
    },
    {
      type: "paragraph",
      text: "Nhìn về tương lai, các chuyên gia dự đoán xu hướng trẻ hóa trong lĩnh vực AI sẽ tiếp tục. Sự phổ biến của các khóa học trực tuyến, tài liệu mã nguồn mở và công cụ phát triển ngày càng dễ tiếp cận đã giúp rút ngắn thời gian cần thiết để nắm vững công nghệ AI. Thế hệ doanh nhân tiếp theo có thể còn trẻ hơn nữa, khi mà ranh giới giữa học tập và khởi nghiệp ngày càng mờ nhạt."
    }
  ]
};

// Most viewed articles
export const mostViewedArticles: Article[] = [
  {
    id: "mv-1",
    title: "OpenAI ra mắt GPT-5 với khả năng suy luận vượt trội",
    summary: "",
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    author: "Tech Editor",
    date: "19/01/2025",
    readTime: "5 phút đọc"
  },
  {
    id: "mv-2",
    title: "Thị trường chứng khoán Việt Nam lập đỉnh mới trong tháng 1",
    summary: "",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    author: "Finance Desk",
    date: "19/01/2025",
    readTime: "4 phút đọc"
  },
  {
    id: "mv-3",
    title: "Apple công bố kính Vision Pro thế hệ 2 giá rẻ hơn",
    summary: "",
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80",
    author: "Tech Editor",
    date: "18/01/2025",
    readTime: "3 phút đọc"
  },
  {
    id: "mv-4",
    title: "Đội tuyển Việt Nam thắng đậm 4-0 trước Indonesia",
    summary: "",
    category: "Thể thao",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    author: "Sports Desk",
    date: "18/01/2025",
    readTime: "3 phút đọc"
  },
  {
    id: "mv-5",
    title: "Tết Nguyên đán 2025: Những xu hướng tiêu dùng mới",
    summary: "",
    category: "Đời sống",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    author: "Lifestyle",
    date: "18/01/2025",
    readTime: "4 phút đọc"
  }
];

// Related category articles
export const relatedCategoryArticles: Article[] = [
  {
    id: "rc-1",
    title: "Ngân hàng số tăng trưởng 40% trong năm 2024",
    summary: "Xu hướng chuyển đổi số tiếp tục bùng nổ trong lĩnh vực tài chính.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    author: "Thanh Mai",
    date: "18/01/2025",
    readTime: "3 phút đọc"
  },
  {
    id: "rc-2",
    title: "Xuất khẩu thủy sản đạt kỷ lục 10 tỷ USD",
    summary: "Tôm và cá tra là hai mặt hàng chủ lực.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1524177778556-9e90089e0ee5?w=600&q=80",
    author: "Hải Yến",
    date: "17/01/2025",
    readTime: "3 phút đọc"
  },
  {
    id: "rc-3",
    title: "Bất động sản công nghiệp hút vốn FDI mạnh mẽ",
    summary: "Các khu công nghiệp phía Nam ghi nhận tỷ lệ lấp đầy cao.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    author: "Quốc Bảo",
    date: "17/01/2025",
    readTime: "4 phút đọc"
  },
  {
    id: "rc-4",
    title: "Startup Việt gọi vốn 100 triệu USD Series C",
    summary: "Đây là vòng gọi vốn lớn nhất trong lịch sử startup Việt Nam.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    author: "Startup Editor",
    date: "16/01/2025",
    readTime: "4 phút đọc"
  }
];

// Related news articles for bottom section
export const relatedNewsArticles: Article[] = [
  {
    id: "rn-1",
    title: "Google đầu tư 2 tỷ USD vào trung tâm dữ liệu tại Việt Nam",
    summary: "Khoản đầu tư lớn nhất của Google tại Đông Nam Á.",
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80",
    author: "Tech Desk",
    date: "19/01/2025",
    readTime: "4 phút đọc"
  },
  {
    id: "rn-2",
    title: "Microsoft mua lại startup AI Việt với giá 500 triệu USD",
    summary: "Thương vụ M&A lớn nhất ngành công nghệ Việt Nam.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&q=80",
    author: "Business Editor",
    date: "18/01/2025",
    readTime: "5 phút đọc"
  },
  {
    id: "rn-3",
    title: "Elon Musk thăm Việt Nam, thảo luận về nhà máy Tesla",
    summary: "Khả năng xây dựng nhà máy sản xuất pin tại Đông Nam Á.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80",
    author: "International Desk",
    date: "18/01/2025",
    readTime: "4 phút đọc"
  },
  {
    id: "rn-4",
    title: "FPT Software ký hợp đồng 300 triệu USD với tập đoàn Nhật",
    summary: "Hợp đồng outsourcing lớn nhất lịch sử công ty.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80",
    author: "Business Desk",
    date: "17/01/2025",
    readTime: "3 phút đọc"
  }
];

// Navigation articles (previous/next)
export const previousArticle: Article = {
  id: "prev-1",
  title: "VN-Index tăng điểm phiên thứ 5 liên tiếp",
  summary: "",
  category: "Kinh doanh",
  image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  author: "Quang Huy",
  date: "18/01/2025",
  readTime: "4 phút đọc"
};

export const nextArticle: Article = {
  id: "next-1",
  title: "Startup công nghệ Việt gọi vốn 50 triệu USD từ quỹ ngoại",
  summary: "",
  category: "Kinh doanh",
  image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
  author: "Thanh Tùng",
  date: "18/01/2025",
  readTime: "3 phút đọc"
};

// Helper to get article by ID
export const getArticleById = (id: string): ArticleDetail | null => {
  // In a real app, this would fetch from an API
  // For now, return the detailed article for any ID
  return {
    ...detailedArticle,
    id
  };
};

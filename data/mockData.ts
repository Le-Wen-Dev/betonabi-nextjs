export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
}

export const heroArticle: Article = {
  id: "hero-1",
  title: "Việt Nam đạt tăng trưởng kinh tế ấn tượng trong quý đầu năm 2025",
  summary: "GDP quý I/2025 tăng 7.2%, vượt kỳ vọng của các chuyên gia kinh tế. Xuất khẩu và đầu tư trực tiếp nước ngoài là động lực chính thúc đẩy tăng trưởng.",
  category: "Kinh doanh",
  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  author: "Minh Tuấn",
  date: "18/01/2025",
  readTime: "5 phút đọc"
};

export const subHeroArticles: Article[] = [
  {
    id: "sub-1",
    title: "Thủ tướng gặp gỡ cộng đồng doanh nghiệp tại Diễn đàn Kinh tế Thế giới",
    summary: "Cuộc gặp nhằm thu hút thêm đầu tư và hợp tác quốc tế.",
    category: "Chính trị",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    author: "Hồng Vân",
    date: "18/01/2025",
    readTime: "3 phút đọc"
  },
  {
    id: "sub-2",
    title: "Dự báo thời tiết: Miền Bắc đón đợt không khí lạnh mạnh nhất mùa đông",
    summary: "Nhiệt độ có thể xuống dưới 5°C tại các tỉnh vùng núi phía Bắc.",
    category: "Xã hội",
    image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&q=80",
    author: "Thu Hà",
    date: "18/01/2025",
    readTime: "2 phút đọc"
  }
];

export const latestNews: Article[] = [
  {
    id: "latest-1",
    title: "VN-Index tăng điểm phiên thứ 5 liên tiếp",
    summary: "Thị trường chứng khoán tiếp tục khởi sắc với thanh khoản cao.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
    author: "Quang Huy",
    date: "18/01/2025",
    readTime: "4 phút đọc"
  },
  {
    id: "latest-2",
    title: "Startup công nghệ Việt gọi vốn 50 triệu USD từ quỹ ngoại",
    summary: "Đây là khoản đầu tư lớn nhất trong lĩnh vực fintech năm nay.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80",
    author: "Thanh Tùng",
    date: "18/01/2025",
    readTime: "3 phút đọc"
  },
  {
    id: "latest-3",
    title: "Đội tuyển Việt Nam chuẩn bị cho vòng loại World Cup 2026",
    summary: "HLV trưởng công bố danh sách 25 cầu thủ triệu tập.",
    category: "Thể thao",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80",
    author: "Đức Anh",
    date: "18/01/2025",
    readTime: "3 phút đọc"
  },
  {
    id: "latest-4",
    title: "Phát hiện di tích khảo cổ 3.000 năm tuổi tại Thanh Hóa",
    summary: "Các hiện vật cho thấy nền văn minh Đông Sơn phát triển rực rỡ.",
    category: "Văn hóa",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&q=80",
    author: "Lan Phương",
    date: "17/01/2025",
    readTime: "5 phút đọc"
  },
  {
    id: "latest-5",
    title: "Hà Nội công bố quy hoạch metro giai đoạn 2025-2035",
    summary: "Thêm 6 tuyến metro mới sẽ được triển khai trong 10 năm tới.",
    category: "Xã hội",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80",
    author: "Văn Minh",
    date: "17/01/2025",
    readTime: "4 phút đọc"
  },
  {
    id: "latest-6",
    title: "Triển lãm nghệ thuật đương đại thu hút giới trẻ",
    summary: "Không gian sáng tạo mới tại trung tâm thành phố.",
    category: "Văn hóa",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&q=80",
    author: "Ngọc Lan",
    date: "16/01/2025",
    readTime: "3 phút đọc"
  }
];

export const recommendedArticles: Article[] = [
  {
    id: "rec-1",
    title: "Bí quyết đầu tư bất động sản thông minh năm 2025",
    summary: "Chuyên gia chia sẻ chiến lược đầu tư hiệu quả.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1560518883-ce09059ee971?w=800&q=80",
    author: "Hoàng Nam",
    date: "17/01/2025",
    readTime: "6 phút đọc"
  },
  {
    id: "rec-2",
    title: "10 điểm đến du lịch hấp dẫn nhất Đông Nam Á",
    summary: "Khám phá những địa danh không thể bỏ qua.",
    category: "Du lịch",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    author: "Mai Anh",
    date: "16/01/2025",
    readTime: "5 phút đọc"
  },
  {
    id: "rec-3",
    title: "Cách chăm sóc sức khỏe mùa đông hiệu quả",
    summary: "Lời khuyên từ các chuyên gia y tế hàng đầu.",
    category: "Sức khỏe",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    author: "Bác sĩ Hương",
    date: "16/01/2025",
    readTime: "4 phút đọc"
  }
];

export const editorsPick: Article[] = [
  {
    id: "pick-1",
    title: "Phỏng vấn độc quyền: CEO VinFast về tương lai xe điện Việt",
    summary: "Kế hoạch mở rộng thị trường toàn cầu trong năm 2025.",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80",
    author: "Minh Châu",
    date: "15/01/2025",
    readTime: "8 phút đọc"
  }
];

export const longformArticle: Article = {
  id: "longform-1",
  title: "Hành trình chinh phục đỉnh Fansipan: Từ rừng già đến nóc nhà Đông Dương",
  summary: "Khám phá vẻ đẹp hùng vĩ của dãy Hoàng Liên Sơn và những câu chuyện của người dân địa phương qua góc nhìn của phóng viên.",
  category: "Longform",
  image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
  author: "Phóng viên Thảo Nguyên",
  date: "15/01/2025",
  readTime: "12 phút đọc"
};

export const categoryData: Record<string, Article[]> = {
  "Kinh doanh": [
    {
      id: "kd-1",
      title: "Tỷ giá USD/VND biến động mạnh, Ngân hàng Nhà nước vào cuộc",
      summary: "Các biện pháp ổn định tỷ giá được triển khai kịp thời.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80",
      author: "Minh Đức",
      date: "18/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "kd-2",
      title: "Xuất khẩu thủy sản đạt kỷ lục 10 tỷ USD",
      summary: "Tôm và cá tra là hai mặt hàng chủ lực.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1524177778556-9e90089e0ee5?w=600&q=80",
      author: "Hải Yến",
      date: "17/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "kd-3",
      title: "Bất động sản công nghiệp hút vốn FDI mạnh mẽ",
      summary: "Các khu công nghiệp phía Nam ghi nhận tỷ lệ lấp đầy cao.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
      author: "Quốc Bảo",
      date: "17/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "kd-4",
      title: "Ngân hàng số tăng trưởng 40% trong năm 2024",
      summary: "Xu hướng chuyển đổi số tiếp tục bùng nổ.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&q=80",
      author: "Thanh Mai",
      date: "16/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "kd-5",
      title: "Việt Nam lọt top 10 thị trường bán lẻ hấp dẫn nhất",
      summary: "Tầng lớp trung lưu gia tăng thúc đẩy tiêu dùng.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&q=80",
      author: "Hoàng Linh",
      date: "16/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "kd-6",
      title: "Thương mại điện tử: Cuộc đua của những 'gã khổng lồ'",
      summary: "Các sàn TMĐT tung ra nhiều chiến dịch khuyến mãi lớn.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
      author: "Ngọc Minh",
      date: "15/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "kd-7",
      title: "Giá vàng thế giới lập đỉnh mới",
      summary: "Nhà đầu tư tìm đến kênh trú ẩn an toàn.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&q=80",
      author: "Thanh Hà",
      date: "15/01/2025",
      readTime: "2 phút đọc"
    },
    {
      id: "kd-8",
      title: "Doanh nghiệp dệt may đón nhận nhiều đơn hàng mới",
      summary: "Tín hiệu phục hồi tích cực cho ngành xuất khẩu chủ lực.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1534078362425-387ae9668c17?w=600&q=80",
      author: "Văn Hùng",
      date: "14/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "kd-9",
      title: "Làn sóng đầu tư xanh tại Việt Nam",
      summary: "Các dự án năng lượng tái tạo thu hút vốn ngoại.",
      category: "Kinh doanh",
      image: "https://images.unsplash.com/photo-1508514177221-188b1cf2f24f?w=600&q=80",
      author: "Minh Tuấn",
      date: "14/01/2025",
      readTime: "5 phút đọc"
    }
  ],
  "Xã hội": [
    {
      id: "xh-1",
      title: "TP.HCM triển khai dự án chống ngập 10.000 tỷ đồng",
      summary: "Hệ thống cống và hồ điều tiết được nâng cấp toàn diện.",
      category: "Xã hội",
      image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
      author: "Thành Đạt",
      date: "18/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "xh-2",
      title: "Cải cách tiền lương: Những thay đổi từ tháng 7/2025",
      summary: "Mức lương cơ sở tăng 30% theo lộ trình.",
      category: "Xã hội",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
      author: "Ngọc Ánh",
      date: "17/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "xh-3",
      title: "Hà Nội cấm xe máy vào nội đô từ năm 2030",
      summary: "Phương án được Hội đồng nhân dân thông qua.",
      category: "Xã hội",
      image: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=600&q=80",
      author: "Trung Kiên",
      date: "17/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "xh-4",
      title: "Tình trạng ô nhiễm không khí tại các đô thị lớn",
      summary: "Chỉ số AQI vượt ngưỡng an toàn nhiều ngày liên tiếp.",
      category: "Xã hội",
      image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80",
      author: "Phương Thảo",
      date: "16/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "xh-5",
      title: "Chương trình nhà ở xã hội đạt mục tiêu 50.000 căn",
      summary: "Giải quyết nhu cầu nhà ở cho người thu nhập thấp.",
      category: "Xã hội",
      image: "https://images.unsplash.com/photo-1460317442991-0ec2aa24e565?w=600&q=80",
      author: "Việt Hùng",
      date: "16/01/2025",
      readTime: "3 phút đọc"
    }
  ],
  "Đời sống": [
    {
      id: "ds-1",
      title: "Xu hướng ẩm thực healthy chinh phục giới trẻ Việt",
      summary: "Thực phẩm hữu cơ và chế độ ăn lành mạnh ngày càng phổ biến.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
      author: "Bích Ngọc",
      date: "18/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "ds-2",
      title: "Bí quyết cân bằng công việc và cuộc sống",
      summary: "Lời khuyên từ các chuyên gia tâm lý.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
      author: "Thu Hương",
      date: "17/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "ds-3",
      title: "Thời trang bền vững: Xu hướng của tương lai",
      summary: "Các thương hiệu Việt tiên phong trong phong trào xanh.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
      author: "Khánh Linh",
      date: "17/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "ds-4",
      title: "Cách thiết kế không gian sống tối giản hiệu quả",
      summary: "Phong cách minimalist được ưa chuộng.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
      author: "Minh Anh",
      date: "16/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "ds-5",
      title: "Những cuốn sách hay nên đọc đầu năm 2025",
      summary: "Danh sách sách được độc giả yêu thích nhất.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
      author: "Lan Chi",
      date: "16/01/2025",
      readTime: "3 phút đọc"
    },
    // More articles to fill the feed
    {
      id: "ds-6",
      title: "Trồng cây trong nhà: Xu hướng xanh cho không gian sống",
      summary: "Các loại cây dễ trồng giúp lọc không khí và trang trí nhà cửa.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
      author: "Thanh Hằng",
      date: "15/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "ds-7",
      title: "Mẹo sắp xếp tủ quần áo gọn gàng đón Tết",
      summary: "Phương pháp KonMari giúp tối ưu không gian lưu trữ.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80",
      author: "Minh Trang",
      date: "15/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "ds-8",
      title: "Làm nến thơm handmade tại nhà",
      summary: "Thú vui tao nhã giúp thư giãn tinh thần cuối tuần.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80",
      author: "Thu Thủy",
      date: "14/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "ds-9",
      title: "Chế độ ăn Plant-based cho người mới bắt đầu",
      summary: "Lợi ích sức khỏe và thực đơn mẫu cho 7 ngày.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
      author: "Dinh Dưỡng Xanh",
      date: "14/01/2025",
      readTime: "6 phút đọc"
    },
    {
      id: "ds-10",
      title: "Gợi ý quà tặng ý nghĩa cho dịp lễ Valentine",
      summary: "Những món quà handmade chứa đựng nhiều tình cảm.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80",
      author: "Love Letter",
      date: "13/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "ds-11",
      title: "Thiền định mỗi ngày: Liều thuốc cho tâm hồn",
      summary: "Hướng dẫn thiền cơ bản cho người bận rộn.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
      author: "Thiền Sư",
      date: "12/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "ds-12",
      title: "Khám phá các quán cà phê vintage tại Sài Gòn",
      summary: "Không gian hoài cổ cho những ngày cuối tuần thảnh thơi.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
      author: "Coffee Lover",
      date: "11/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "ds-13",
      title: "Tự làm mỹ phẩm thiên nhiên tại nhà",
      summary: "An toàn, tiết kiệm và thân thiện với môi trường.",
      category: "Đời sống",
      image: "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=600&q=80",
      author: "Green Beauty",
      date: "10/01/2025",
      readTime: "4 phút đọc"
    }
  ],
  "Du lịch": [
    {
      id: "dl-1",
      title: "Khám phá hang Sơn Đoòng: Kỳ quan thiên nhiên thế giới",
      summary: "Tour thám hiểm hấp dẫn du khách quốc tế suốt mùa xuân.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      author: "Phương Nam",
      date: "18/01/2025",
      readTime: "6 phút đọc"
    },
    {
      id: "dl-2",
      title: "Mùa hoa anh đào Nhật Bản: Lịch trình hoàn hảo",
      summary: "Hướng dẫn chi tiết ngắm hoa sakura từ Tokyo đến Kyoto.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&q=80",
      author: "Yuki Trần",
      date: "17/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "dl-4",
      title: "Ẩm thực đường phố Hội An lọt top thế giới",
      summary: "Bánh mì và cao lầu được du khách quốc tế ca ngợi.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
      author: "An Nhiên",
      date: "16/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "dl-5",
      title: "Du lịch Phú Quốc bùng nổ dịp đầu năm",
      summary: "Các resort 5 sao kín phòng nhờ lượng khách quốc tế tăng vọt.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1540202404-a671b47ee758?w=600&q=80",
      author: "Hải Đăng",
      date: "15/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "dl-6",
      title: "Chinh phục đỉnh Tà Xùa: Biển mây tuyệt đẹp",
      summary: "Điểm đến lý tưởng cho dân phượt thích săn mây.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
      author: "Minh Khang",
      date: "15/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "dl-7",
      title: "Kinh nghiệm du lịch Thái Lan tự túc cho người mới",
      summary: "Lịch trình 4 ngày 3 đêm khám phá Bangkok và Pattaya.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
      author: "Thu Thảo",
      date: "14/01/2025",
      readTime: "6 phút đọc"
    },
    {
      id: "dl-8",
      title: "Hà Giang mùa hoa tam giác mạch: Vẻ đẹp nao lòng",
      summary: "Những cánh đồng hoa trải dài trên cao nguyên đá.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80",
      author: "Văn Nam",
      date: "14/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "dl-9",
      title: "Top 5 homestay đẹp nhất Đà Lạt giá rẻ",
      summary: "Không gian chill, view đồi thông mộng mơ.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=600&q=80",
      author: "Thanh Trúc",
      date: "13/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "dl-10",
      title: "Du lịch sinh thái miền Tây: Trải nghiệm sông nước",
      summary: "Tham quan chợ nổi Cái Răng và vườn trái cây sai trĩu quả.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1565619624-9c4c7c980869?w=600&q=80",
      author: "Miền Tây",
      date: "13/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "dl-11",
      title: "Cẩm nang du thuyền Hạ Long 2 ngày 1 đêm",
      summary: "Tận hưởng dịch vụ sang trọng giữa kỳ quan thiên nhiên.",
      category: "Du lịch",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      author: "Luxury Travel",
      date: "12/01/2025",
      readTime: "4 phút đọc"
    }
  ],
  "Văn hóa": [
    {
      id: "dl-3",
      title: "Lễ hội đền Hùng 2025: Những hoạt động nổi bật",
      summary: "Chương trình văn hóa đặc sắc mừng Giỗ Tổ Hùng Vương.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=600&q=80",
      author: "Hồng Phúc",
      date: "17/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "dl-5",
      title: "Bảo tàng Lịch sử quốc gia ra mắt triển lãm mới",
      summary: "Trưng bày hiện vật quý hiếm từ thời Lý - Trần.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1565060169194-124b6f790c6a?w=600&q=80",
      author: "Thanh Trúc",
      date: "16/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "vh-3",
      title: "Nghệ thuật Sơn mài Việt Nam: Hành trình ra thế giới",
      summary: "Các tác phẩm sơn mài Việt Nam ngày càng được đánh giá cao trên thị trường quốc tế.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1578321272176-b7bbc06b9cc3?w=600&q=80",
      author: "Hoàng Anh",
      date: "15/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "vh-4",
      title: "Khôi phục lễ hội truyền thống tại các làng nghề cổ",
      summary: "Nỗ lực gìn giữ bản sắc văn hóa dân tộc trong thời kỳ hội nhập.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1583096114844-065dc69bc283?w=600&q=80",
      author: "Minh Tâm",
      date: "14/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "vh-5",
      title: "Điện ảnh Việt Nam 2024: Một năm nhìn lại",
      summary: "Những bộ phim đạt doanh thu trăm tỷ và dấu ấn nghệ thuật.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
      author: "Hồng Đăng",
      date: "13/01/2025",
      readTime: "6 phút đọc"
    },
    {
      id: "vh-6",
      title: "Văn hóa đọc trong kỷ nguyên số",
      summary: "Sách giấy vẫn giữ vị trí quan trọng trong lòng độc giả trẻ.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80",
      author: "Thu Trang",
      date: "13/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "vh-7",
      title: "Áo dài Việt Nam: Biểu tượng vẻ đẹp vượt thời gian",
      summary: "Các nhà thiết kế trẻ cách tân áo dài nhưng vẫn giữ nét truyền thống.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1604514287895-8857c5a01944?w=600&q=80",
      author: "Mai Phương",
      date: "12/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "vh-8",
      title: "Giao lưu văn hóa Việt - Nhật kỷ niệm 50 năm quan hệ",
      summary: "Nhiều hoạt động nghệ thuật đặc sắc diễn ra tại Hà Nội và TP.HCM.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80",
      author: "Đức Hùng",
      date: "12/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "vh-9",
      title: "Bảo tồn làn điệu dân ca quan họ Bắc Ninh",
      summary: "Truyền dạy cho thế hệ trẻ niềm đam mê với di sản.",
      category: "Văn hóa",
      image: "https://images.unsplash.com/photo-1596282072382-7e761c519c25?w=600&q=80",
      author: "Thanh Hương",
      date: "11/01/2025",
      readTime: "4 phút đọc"
    }
  ],
  "Giáo dục": [
    {
      id: "gd-1",
      title: "Đại học Việt Nam lọt bảng xếp hạng QS châu Á",
      summary: "5 trường đại học được công nhận chất lượng quốc tế.",
      category: "Giáo dục",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
      author: "Thùy Linh",
      date: "18/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "gd-2",
      title: "Chương trình STEM được đưa vào giảng dạy từ lớp 1",
      summary: "Đổi mới giáo dục nhằm phát triển tư duy sáng tạo.",
      category: "Giáo dục",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
      author: "Văn Phong",
      date: "17/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "gd-3",
      title: "Học sinh Việt Nam giành huy chương vàng Olympic Toán",
      summary: "Thành tích xuất sắc tại kỳ thi quốc tế.",
      category: "Giáo dục",
      image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=600&q=80",
      author: "Hà My",
      date: "17/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "gd-4",
      title: "Học bổng du học 2025: Cơ hội và thách thức",
      summary: "Hướng dẫn apply học bổng các nước phát triển.",
      category: "Giáo dục",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
      author: "Minh Khoa",
      date: "16/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "gd-5",
      title: "AI trong giáo dục: Xu hướng không thể đảo ngược",
      summary: "Công nghệ thay đổi cách dạy và học truyền thống.",
      category: "Giáo dục",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
      author: "Quang Vinh",
      date: "16/01/2025",
      readTime: "4 phút đọc"
    }
  ],
  "Sức khỏe": [
    {
      id: "sk-1",
      title: "Vaccine mới phòng ngừa sốt xuất huyết được cấp phép",
      summary: "Bước tiến quan trọng trong phòng chống dịch bệnh.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80",
      author: "BS. Thanh Hà",
      date: "18/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "sk-2",
      title: "Chế độ ăn Mediterranean tốt cho tim mạch",
      summary: "Nghiên cứu mới khẳng định lợi ích của dầu olive.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
      author: "BS. Minh Tuệ",
      date: "17/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "sk-3",
      title: "Tập thể dục buổi sáng: Lợi ích vượt trội",
      summary: "Các bài tập đơn giản giúp tăng cường sức khỏe.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
      author: "HLV Hoàng Anh",
      date: "17/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "sk-4",
      title: "Stress và cách quản lý hiệu quả",
      summary: "Phương pháp thư giãn được khoa học chứng minh.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1499209974431-9bbb4ab001a2?w=600&q=80",
      author: "TS. Lan Anh",
      date: "16/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "sk-5",
      title: "Giấc ngủ chất lượng: Bí quyết sống khỏe",
      summary: "Thói quen ngủ tốt giúp cải thiện sức khỏe tổng thể.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1511295742362-92c96b53b035?w=600&q=80",
      author: "BS. Thu Vân",
      date: "16/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "sk-6",
      title: "Uống đủ nước mỗi ngày: Lợi ích không ngờ",
      summary: "Nước giúp thanh lọc cơ thể và làm đẹp da.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80",
      author: "Dinh Dưỡng",
      date: "15/01/2025",
      readTime: "2 phút đọc"
    },
    {
      id: "sk-7",
      title: "Yoga cho dân văn phòng: Giảm đau vai gáy",
      summary: "Các động tác giãn cơ đơn giản có thể tập tại chỗ làm.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=600&q=80",
      author: "Yogi Mai",
      date: "15/01/2025",
      readTime: "5 phút đọc"
    },
    {
      id: "sk-8",
      title: "Cảnh báo gia tăng các bệnh về hô hấp ở trẻ em",
      summary: "Cha mẹ cần lưu ý giữ ấm và vệ sinh mũi họng cho trẻ.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80",
      author: "BS. Nhi Khoa",
      date: "14/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "sk-9",
      title: "Thực phẩm giàu Vitamin C tăng sức đề kháng",
      summary: "Cam, ổi, kiwi là những lựa chọn hàng đầu.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1565355204285-8b010c733355?w=600&q=80",
      author: "Nutritionist",
      date: "14/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "sk-10",
      title: "Tác hại của việc ngồi quá lâu và cách khắc phục",
      summary: "Những bài tập nhỏ giúp tăng cường tuần hoàn máu.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80",
      author: "HLV Thể Lực",
      date: "13/01/2025",
      readTime: "4 phút đọc"
    }
  ],
  "Longform": [
    {
      id: "latest-1",
      title: "VN-Index tăng điểm phiên thứ 5 liên tiếp",
      summary: "Thị trường chứng khoán tiếp tục khởi sắc với thanh khoản cao.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
      author: "Quang Huy",
      date: "18/01/2025",
      readTime: "4 phút đọc"
    },
    {
      id: "latest-2",
      title: "Startup công nghệ Việt gọi vốn 50 triệu USD từ quỹ ngoại",
      summary: "Đây là khoản đầu tư lớn nhất trong lĩnh vực fintech năm nay.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80",
      author: "Thanh Tùng",
      date: "18/01/2025",
      readTime: "3 phút đọc"
    },
    {
      id: "longform-japan",
      title: "Làn sóng đầu tư Nhật Bản vào Việt Nam: Tầm nhìn thập kỷ mới",
      summary: "Từ những nhà máy sản xuất xe máy đầu tiên đến các dự án công nghệ cao và bán lẻ hiện đại, dòng vốn FDI từ Nhật Bản đang chuyển mình mạnh mẽ.",
      category: "Longform", // Changed from E-Magazine
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80",
      author: "Trần Anh & Kenji Tanaka",
      date: "20/01/2025",
      readTime: "15 phút đọc"
    },
    {
      id: "longform-1",
      title: "Hành trình chinh phục đỉnh Fansipan: Từ rừng già đến nóc nhà Đông Dương",
      summary: "Khám phá vẻ đẹp hùng vĩ của dãy Hoàng Liên Sơn và những câu chuyện của người dân địa phương qua góc nhìn của phóng viên.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
      author: "Phóng viên Thảo Nguyên",
      date: "15/01/2025",
      readTime: "12 phút đọc"
    },
    {
      id: "longform-3",
      title: "Kiến trúc Đông Dương: Dấu ấn thời gian",
      summary: "Hành trình tìm về những công trình kiến trúc mang đậm dấu ấn lịch sử giữa lòng Hà Nội.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=600&q=80",
      author: "KTS. Thanh Tùng",
      date: "14/01/2025",
      readTime: "10 phút đọc"
    },
    {
      id: "longform-4",
      title: "Người trẻ bỏ phố về quê: Giấc mơ hay thực tế khốc liệt?",
      summary: "Những câu chuyện chưa kể về trào lưu 'bỏ phố về rừng'.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
      author: "Ngọc Lan",
      date: "12/01/2025",
      readTime: "15 phút đọc"
    },
    // New Longform Articles
    {
      id: "longform-5",
      title: "Một số vấn đề cốt lõi trong chính sách đối ngoại mới",
      summary: "Phân tích sâu sắc về những thay đổi chiến lược trong quan hệ quốc tế.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&q=80",
      author: "Minh Quân",
      date: "10/01/2025",
      readTime: "20 phút đọc"
    },
    {
      id: "longform-6",
      title: "Tăng cường quan hệ hữu nghị và hợp tác toàn diện",
      summary: "Những bước tiến mới trong việc thắt chặt tình đoàn kết giữa các quốc gia.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1529104661501-69671d579633?w=800&q=80",
      author: "Hồng Hà",
      date: "09/01/2025",
      readTime: "18 phút đọc"
    },
    {
      id: "longform-7",
      title: "Chiến lược phát triển kinh tế vùng biên giới",
      summary: "Cơ hội và thách thức trong việc thúc đẩy giao thương cửa khẩu.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
      author: "Tuấn Anh",
      date: "08/01/2025",
      readTime: "15 phút đọc"
    },
    {
      id: "longform-8",
      title: "Bảo tồn văn hóa cồng chiêng Tây Nguyên",
      summary: "Nỗ lực gìn giữ di sản văn hóa phi vật thể của nhân loại.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1583096114844-065dc69bc283?w=800&q=80",
      author: "Mai Phương",
      date: "07/01/2025",
      readTime: "12 phút đọc"
    },
    {
      id: "longform-9",
      title: "Đổi mới sáng tạo: Chìa khóa cho tăng trưởng bền vững",
      summary: "Cách mạng công nghiệp 4.0 và những tác động đến nền kinh tế.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
      author: "Thanh Sơn",
      date: "06/01/2025",
      readTime: "16 phút đọc"
    },
    {
      id: "longform-10",
      title: "Hành trình di sản: Từ Huế đến Hội An",
      summary: "Khám phá con đường di sản miền Trung qua lăng kính nhiếp ảnh.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      author: "Nam Khánh",
      date: "05/01/2025",
      readTime: "14 phút đọc"
    },
    {
      id: "longform-11",
      title: "Biến đổi khí hậu và tác động đến Đồng bằng sông Cửu Long",
      summary: "Thực trạng xâm nhập mặn và giải pháp thích ứng cho người dân.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1536869408432-83569477a33c?w=800&q=80",
      author: "Hoàng Dũng",
      date: "04/01/2025",
      readTime: "22 phút đọc"
    },
    {
      id: "longform-12",
      title: "Làng nghề truyền thống trước nguy cơ mai một",
      summary: "Câu chuyện của những nghệ nhân cuối cùng.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1593457176162-84950e309cc8?w=800&q=80",
      author: "Thu Thảo",
      date: "03/01/2025",
      readTime: "10 phút đọc"
    },
    {
      id: "longform-13",
      title: "Nông nghiệp công nghệ cao: Hướng đi mới cho nông dân",
      summary: "Ứng dụng IoT vào sản xuất nông nghiệp tại Đà Lạt.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800&q=80",
      author: "Văn Hùng",
      date: "02/01/2025",
      readTime: "15 phút đọc"
    },
    {
      id: "longform-14",
      title: "Vẻ đẹp hùng vĩ của Cao nguyên đá Đồng Văn",
      summary: "Sức sống mãnh liệt trên miền đá xám.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
      author: "Minh Tâm",
      date: "01/01/2025",
      readTime: "12 phút đọc"
    },
    {
      id: "longform-15",
      title: "Thúc đẩy bình đẳng giới trong thời đại số",
      summary: "Cơ hội lãnh đạo cho phụ nữ trong kỷ nguyên công nghệ.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80",
      author: "Lan Hương",
      date: "30/12/2024",
      readTime: "18 phút đọc"
    },
    {
      id: "longform-16",
      title: "Giáo dục vùng cao: Những con chữ gieo mầm hy vọng",
      summary: "Hành trình mang tri thức đến với trẻ em nghèo.",
      category: "Longform",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
      author: "Đức Trí",
      date: "29/12/2024",
      readTime: "14 phút đọc"
    }
  ]
};

export const hotTopicsVN = [
  "#Bầu_cử_2025",
  "#AI_Technology",
  "#Khởi_nghiệp",
  "#Thời_tiết",
  "#Chứng_khoán"
];

export const hotTopicsJP = [
  "#2025年選挙",
  "#AI技術",
  "#起業",
  "#天気",
  "#株式市場"
];

export const getHotTopics = (lang: string) => {
  return lang === 'JP' ? hotTopicsJP : hotTopicsVN;
};

export const mostViewedArticles: Article[] = [
  ...latestNews,
  ...subHeroArticles,
  latestNews[0] // Add one more to make it 8 if needed, or simply use slice later. 
  // actually latestNews is 6 items + subHero is 2 items = 8 items. Perfect.
];

export const categories = [
  "Mới nhất",
  "Đọc nhiều",
  "Văn hóa",
  "Kinh doanh",
  "Đời sống",
  "Du lịch",
  "Sức khỏe",
  "Longform"
];

// Category slug mapping
export const categorySlugMap: Record<string, string> = {
  "moi-nhat": "Mới nhất",
  "doc-nhieu": "Đọc nhiều",
  "kinh-doanh": "Kinh doanh",
  "van-hoa": "Văn hóa",
  "doi-song": "Đời sống",
  "du-lich": "Du lịch",
  "suc-khoe": "Sức khỏe",
  "longform-e-magazine": "Longform",
  // Keep these for legacy urls
  "xa-hoi": "Xã hội",
  "giao-duc": "Giáo dục"
};

export const getCategorySlug = (categoryName: string): string => {
  const entry = Object.entries(categorySlugMap).find(([_, name]) => name === categoryName);
  return entry ? entry[0] : categoryName.toLowerCase().replace(/\s+/g, '-');
};

export const getCategoryDisplayName = (slug: string): string => {
  return categorySlugMap[slug] || "";
};

export const getArticlesByCategory = (categoryName: string): Article[] => {
  if (categoryName === "Mới nhất") {
    return [
      ...latestNews,
      ...categoryData["Kinh doanh"],
      ...categoryData["Xã hội"],
      ...categoryData["Văn hóa"],
      ...categoryData["Du lịch"],
      ...categoryData["Sức khỏe"],
    ];
  }
  if (categoryName === "Đọc nhiều") {
    return [
      ...mostViewedArticles,
      ...categoryData["Đời sống"],
      ...categoryData["Du lịch"],
      ...categoryData["Sức khỏe"],
      ...categoryData["Kinh doanh"],
    ];
  }

  const categoryArticles = categoryData[categoryName] || [];

  // Generate more articles to ensure the feed is always full (aim for ~30-40 items)
  // Repeat the existing articles 4 times with unique IDs
  const extendedArticles: Article[] = [];

  for (let i = 0; i < 4; i++) {
    const chunk = categoryArticles.map((article, index) => ({
      ...article,
      id: `${article.id}-gen-${i}-${index}`, // Unique ID
      title: i === 0 ? article.title : `[Tin cũ ${i}] ${article.title}`,
      date: i === 0 ? article.date : "10/01/2025"
    }));
    extendedArticles.push(...chunk);
  }

  return extendedArticles.length > 0 ? extendedArticles : [];
};

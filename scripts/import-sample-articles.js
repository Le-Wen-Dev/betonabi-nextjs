import PocketBase from 'pocketbase';

const pb = new PocketBase('https://apibetonabi.vmst.com.vn');

// Helper function to generate long content in Tiptap format
function generateLongContent(topic, language = 'vi') {
  const paragraphs = [];
  
  // Generate 15-20 paragraphs for ~2000 words
  for (let i = 0; i < 18; i++) {
    const sampleText = language === 'vi' 
      ? `Đây là đoạn văn số ${i + 1} về chủ đề ${topic}. Nội dung này được tạo ra để minh họa cách hiển thị và xử lý các bài viết dài trong hệ thống. Mỗi đoạn văn chứa khoảng 100-150 từ để đảm bảo tổng số từ của bài viết đạt khoảng 2000 từ như yêu cầu. Việc có nội dung dài giúp kiểm tra khả năng hiển thị, cuộn trang, và trải nghiệm đọc của người dùng trên các thiết bị khác nhau. Ngoài ra, nội dung dài còn giúp đánh giá hiệu suất tải trang và khả năng xử lý dữ liệu của hệ thống backend.`
      : `これは${topic}に関する第${i + 1}段落です。このコンテンツは、システム内の長い記事の表示と処理方法を示すために作成されました。各段落には約100〜150語が含まれており、記事の総単語数が要求どおり約2000語に達することを保証します。長いコンテンツを持つことで、さまざまなデバイスでのページスクロール、表示機能、ユーザーの読書体験をテストできます。さらに、長いコンテンツは、ページの読み込みパフォーマンスとバックエンドシステムのデータ処理能力を評価するのに役立ちます。`;
    
    paragraphs.push({
      type: 'paragraph',
      content: [{ type: 'text', text: sampleText }]
    });
    
    // Add heading every 5 paragraphs
    if ((i + 1) % 5 === 0) {
      paragraphs.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ 
          type: 'text', 
          text: language === 'vi' ? `Phần ${Math.floor((i + 1) / 5)}: ${topic}` : `セクション${Math.floor((i + 1) / 5)}：${topic}`
        }]
      });
    }
  }
  
  return { type: 'doc', content: paragraphs };
}

// Sample articles data
const articles = [
  {
    title_vi: 'Khám Phá Văn Hóa Trà Đạo Nhật Bản: Nghệ Thuật Sống Chậm Giữa Đời Thường',
    title_jp: '日本の茶道文化を探る：日常の中のスローライフの芸術',
    sapo_vi: 'Trà đạo không chỉ là việc pha trà, mà là một triết lý sống, một nghệ thuật tinh tế phản ánh tâm hồn Nhật Bản qua từng động tác, từng khoảnh khắc tĩnh lặng.',
    sapo_jp: '茶道は単にお茶を淹れることではなく、生き方の哲学であり、一つ一つの動作、静寂の瞬間を通じて日本の魂を反映する繊細な芸術です。',
    location: 'Tokyo, Nhật Bản',
    tags: ['văn hóa', 'trà đạo', 'Nhật Bản', 'nghệ thuật'],
    featured: true,
    editorsPick: true
  },
  {
    title_vi: 'Ẩm Thực Đường Phố Việt Nam: Hành Trình Khám Phá Hương Vị Đất Nước',
    title_jp: 'ベトナムのストリートフード：国の味を探る旅',
    sapo_vi: 'Từ phở Hà Nội đến bánh mì Sài Gòn, ẩm thực đường phố Việt Nam là một bức tranh đa sắc màu về văn hóa, lịch sử và tình yêu ẩm thực của người Việt.',
    sapo_jp: 'ハノイのフォーからサイゴンのバインミーまで、ベトナムのストリートフードは、文化、歴史、そしてベトナム人の食への愛を映す多彩な絵画です。',
    location: 'Hà Nội, Việt Nam',
    tags: ['ẩm thực', 'Việt Nam', 'văn hóa', 'du lịch'],
    featured: true
  },
  {
    title_vi: 'Kiến Trúc Truyền Thống Nhật Bản: Sự Hài Hòa Giữa Thiên Nhiên Và Con Người',
    title_jp: '日本の伝統建築：自然と人間の調和',
    sapo_vi: 'Kiến trúc Nhật Bản không chỉ là nghệ thuật xây dựng mà còn là triết lý sống, nơi con người và thiên nhiên hòa quyện trong từng đường nét, từng không gian.',
    sapo_jp: '日本建築は単なる建設芸術ではなく、人間と自然が一つ一つの線、一つ一つの空間で融合する生活哲学です。',
    location: 'Kyoto, Nhật Bản',
    tags: ['kiến trúc', 'Nhật Bản', 'văn hóa', 'thiên nhiên'],
    editorsPick: true
  },
  {
    title_vi: 'Lễ Hội Hoa Anh Đào: Vẻ Đẹp Phù Du Của Mùa Xuân Nhật Bản',
    title_jp: '桜祭り：日本の春の儚い美しさ',
    sapo_vi: 'Hanami - ngắm hoa anh đào - không chỉ là một lễ hội mà là cách người Nhật thể hiện triết lý về cái đẹp phù du, về sự trân trọng từng khoảnh khắc trong cuộc sống.',
    sapo_jp: '花見は単なる祭りではなく、日本人が儚い美しさの哲学、人生の一瞬一瞬を大切にすることを表現する方法です。',
    location: 'Tokyo, Nhật Bản',
    tags: ['lễ hội', 'Nhật Bản', 'hoa anh đào', 'văn hóa'],
    featured: true
  },
  {
    title_vi: 'Nghệ Thuật Thư Pháp Nhật Bản: Khi Chữ Viết Trở Thành Thiền',
    title_jp: '日本の書道芸術：文字が禅になる時',
    sapo_vi: 'Shodo - thư pháp Nhật Bản - là nghệ thuật biến những nét bút thành thiền định, nơi tâm trí và붓 hòa quyện để tạo nên vẻ đẹp vượt thời gian.',
    sapo_jp: '書道は筆の一筆を瞑想に変える芸術であり、心と筆が融合して時を超えた美しさを生み出す場所です。',
    location: 'Nara, Nhật Bản',
    tags: ['nghệ thuật', 'thư pháp', 'Nhật Bản', 'thiền'],
    editorsPick: true
  },
  {
    title_vi: 'Làng Nghề Truyền Thống Việt Nam: Bảo Tồn Bản Sắc Văn Hóa Dân Tộc',
    title_jp: 'ベトナムの伝統工芸村：民族文化のアイデンティティを保存する',
    sapo_vi: 'Từ gốm Bát Tràng đến lụa Vạn Phúc, các làng nghề truyền thống Việt Nam là nơi lưu giữ linh hồn dân tộc qua bàn tay tài hoa của các nghệ nhân.',
    sapo_jp: 'バッチャン陶器からヴァンフック絹まで、ベトナムの伝統工芸村は職人の巧みな手を通じて民族の魂を保存する場所です。',
    location: 'Hà Nội, Việt Nam',
    tags: ['làng nghề', 'Việt Nam', 'văn hóa', 'truyền thống'],
    featured: true
  },
  {
    title_vi: 'Onsen - Văn Hóa Tắm Suối Nước Nóng Nhật Bản: Liệu Pháp Cho Cơ Thể Và Tâm Hồn',
    title_jp: '温泉 - 日本の温泉文化：体と心のための療法',
    sapo_vi: 'Onsen không chỉ là nơi thư giãn cơ thể mà còn là không gian thanh lọc tâm hồn, nơi người Nhật tìm về sự cân bằng giữa con người và thiên nhiên.',
    sapo_jp: '温泉は単に体をリラックスさせる場所ではなく、心を浄化する空間であり、日本人が人間と自然のバランスを見つける場所です。',
    location: 'Hakone, Nhật Bản',
    tags: ['onsen', 'Nhật Bản', 'văn hóa', 'du lịch'],
    featured: true
  },
  {
    title_vi: 'Nghệ Thuật Ikebana: Triết Lý Sống Qua Cách Cắm Hoa Nhật Bản',
    title_jp: '生け花の芸術：日本の花の生け方を通じた生活哲学',
    sapo_vi: 'Ikebana không chỉ là cắm hoa mà là nghệ thuật sắp đặt không gian, thời gian và cảm xúc, phản ánh triết lý về sự hài hòa và cân bằng trong cuộc sống.',
    sapo_jp: '生け花は単に花を生けることではなく、空間、時間、感情を配置する芸術であり、人生における調和とバランスの哲学を反映しています。',
    location: 'Tokyo, Nhật Bản',
    tags: ['ikebana', 'nghệ thuật', 'Nhật Bản', 'hoa'],
    editorsPick: true
  },
  {
    title_vi: 'Áo Dài Việt Nam: Biểu Tượng Văn Hóa Và Nét Đẹp Duyên Dáng Phương Đông',
    title_jp: 'ベトナムのアオザイ：文化のシンボルと東洋の優雅な美しさ',
    sapo_vi: 'Áo dài không chỉ là trang phục truyền thống mà là biểu tượng văn hóa, thể hiện nét đẹp duyên dáng, kín đáo nhưng vẫn quyến rũ của người phụ nữ Việt Nam.',
    sapo_jp: 'アオザイは単なる伝統衣装ではなく、文化のシンボルであり、ベトナム女性の優雅で控えめながらも魅力的な美しさを表現しています。',
    location: 'Huế, Việt Nam',
    tags: ['áo dài', 'Việt Nam', 'văn hóa', 'thời trang'],
    featured: true,
    editorsPick: true
  },
  {
    title_vi: 'Samurai - Tinh Thần Bushido: Triết Lý Sống Của Những Chiến Binh Nhật Bản',
    title_jp: '侍 - 武士道精神：日本の戦士の生活哲学',
    sapo_vi: 'Bushido - con đường của samurai - không chỉ là bộ quy tắc chiến đấu mà là triết lý sống về danh dự, lòng trung thành và sự hy sinh vì lý tưởng cao cả.',
    sapo_jp: '武士道 - 侍の道 - は単なる戦闘規則ではなく、名誉、忠誠心、そして崇高な理想のための犠牲についての生活哲学です。',
    location: 'Kamakura, Nhật Bản',
    tags: ['samurai', 'bushido', 'Nhật Bản', 'lịch sử'],
    editorsPick: true
  }
];

// Main import function
async function importArticles() {
  try {
    console.log('🚀 Bắt đầu import bài viết mẫu...\n');

    // Use specific IDs
    const categoryId = 'ikptuy70rtcu37z';
    const authorId = 'w190r9qfalokod6';

    console.log(`📁 Sử dụng category ID: ${categoryId}`);
    console.log(`👤 Sử dụng author ID: ${authorId}\n`);

    // Import each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`📝 [${i + 1}/${articles.length}] Đang tạo: ${article.title_vi}`);

      try {
        const data = {
          title_vi: article.title_vi,
          title_jp: article.title_jp,
          sapo_vi: article.sapo_vi,
          sapo_jp: article.sapo_jp,
          content_vi: generateLongContent(article.title_vi, 'vi'),
          content_jp: generateLongContent(article.title_jp, 'jp'),
          location: article.location,
          tags: article.tags,
          categories: [categoryId],
          author: [authorId],
          status: 'published',
          publishedAt: new Date().toISOString(),
          featured: article.featured || false,
          editorsPick: article.editorsPick || false,
          slug: article.title_vi
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
          views: Math.floor(Math.random() * 1000),
          readingMinutes: Math.floor(Math.random() * 10) + 5
        };

        const record = await pb.collection('articles').create(data);
        console.log(`   ✅ Đã tạo bài viết ID: ${record.id}`);

      } catch (error) {
        console.error(`   ❌ Lỗi khi tạo bài viết: ${error.message}`);
      }

      console.log('');
    }

    console.log('🎉 Hoàn thành import bài viết mẫu!');
    console.log(`📊 Tổng số bài viết đã tạo: ${articles.length}`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// Run the import
importArticles();


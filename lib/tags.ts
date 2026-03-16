/**
 * Tag translations mapping
 * Vietnamese tag -> Japanese translation
 */
export const TAG_TRANSLATIONS: Record<string, string> = {
  // Technology
  "AI_Technology": "AI技術",
  "AI Technology": "AI技術",
  "Công_nghệ": "テクノロジー",
  "Công nghệ": "テクノロジー",
  "Trí_tuệ_nhân_tạo": "人工知能",
  "Trí tuệ nhân tạo": "人工知能",
  "Blockchain": "ブロックチェーン",
  "Metaverse": "メタバース",

  // Business
  "Khởi_nghiệp": "起業",
  "Khởi nghiệp": "起業",
  "Kinh_doanh": "ビジネス",
  "Kinh doanh": "ビジネス",
  "Kinh_tế": "経済",
  "Kinh tế": "経済",
  "Đầu_tư": "投資",
  "Đầu tư": "投資",
  "Tài_chính": "金融",
  "Tài chính": "金融",
  "Chứng_khoán": "株式",
  "Chứng khoán": "株式",
  "Tổ_chức": "組織",
  "Tổ chức": "組織",

  // Lifestyle
  "Du_lịch_Xuân": "春の旅行",
  "Du lịch Xuân": "春の旅行",
  "Du_lịch": "旅行",
  "Du lịch": "旅行",
  "Ẩm_thực": "グルメ",
  "Ẩm thực": "グルメ",
  "Sức_khỏe": "健康",
  "Sức khỏe": "健康",
  "Làm_đẹp": "美容",
  "Làm đẹp": "美容",
  "Thời_trang": "ファッション",
  "Thời trang": "ファッション",

  // News
  "Thời_sự": "時事",
  "Thời sự": "時事",
  "Chính_trị": "政治",
  "Chính trị": "政治",
  "Xã_hội": "社会",
  "Xã hội": "社会",
  "Pháp_luật": "法律",
  "Pháp luật": "法律",

  // Entertainment
  "Giải_trí": "エンターテイメント",
  "Giải trí": "エンターテイメント",
  "Phim_ảnh": "映画",
  "Phim ảnh": "映画",
  "Âm_nhạc": "音楽",
  "Âm nhạc": "音楽",
  "Sao_Việt": "ベトナムスター",
  "Sao Việt": "ベトナムスター",

  // Sports
  "Thể_thao": "スポーツ",
  "Thể thao": "スポーツ",
  "Bóng_đá": "サッカー",
  "Bóng đá": "サッカー",
  "SEA_Games": "SEAゲームズ",
  "SEA Games": "SEAゲームズ",

  // Education
  "Giáo_dục": "教育",
  "Giáo dục": "教育",
  "Học_tập": "学習",
  "Học tập": "学習",
  "Tuyển_sinh": "入学",
  "Tuyển sinh": "入学",

  // Culture
  "Văn_hóa": "文化",
  "Văn hóa": "文化",
  "Lịch_sử": "歴史",
  "Lịch sử": "歴史",
  "Nghệ_thuật": "芸術",
  "Nghệ thuật": "芸術",

  // Others
  "Thời_tiết": "天気",
  "Thời tiết": "天気",
  "Môi_trường": "環境",
  "Môi trường": "環境",
  "Khoa_học": "科学",
  "Khoa học": "科学",
  "Ô_tô": "自動車",
  "Ô tô": "自動車",
  "Bất_động_sản": "不動産",
  "Bất động sản": "不動産",

  // Magazine / Elections
  "E-Magazine": "特集",
  "Chuyên_khoản": "専門",
  "Chuyên khoản": "専門",
  "Bầu_cử": "選挙",
  "Bầu cử": "選挙",
  "Bầu_cử_2025": "選挙2025",
  "Bầu cử 2025": "選挙2025",
  "Bầu_cử_Mỹ": "米国選挙",
  "Bầu cử Mỹ": "米国選挙",
  "Đời_sống": "ライフ",
  "Đời sống": "ライフ",
};

/**
 * Get translated tag based on language
 * @param tag - Original tag (Vietnamese)
 * @param language - Target language
 * @returns Translated tag or original if no translation exists
 */
export function getTagByLanguage(tag: string, language: "VN" | "JP"): string {
  if (language === "VN") {
    return tag;
  }

  // For Japanese, try to find translation
  // Remove # if present
  const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;

  // Try exact match first
  if (TAG_TRANSLATIONS[cleanTag]) {
    return TAG_TRANSLATIONS[cleanTag];
  }

  // Try case-insensitive match
  const lowerTag = cleanTag.toLowerCase();
  for (const [key, value] of Object.entries(TAG_TRANSLATIONS)) {
    if (key.toLowerCase() === lowerTag) {
      return value;
    }
  }

  // Return original if no translation found
  return tag;
}

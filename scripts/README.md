# Import Sample Articles Script

Script này tạo 10 bài viết mẫu siêu dài (mỗi bài ~2000 từ) với đầy đủ version tiếng Việt và tiếng Nhật, theo format Tiptap editor blocks.

## Yêu cầu

- Node.js đã cài đặt
- Đã có ít nhất 1 category và 1 user trong database PocketBase
- API đã mở full role (không cần login)

## Cách sử dụng

### 1. Cài đặt dependencies

```bash
npm install pocketbase
```

### 2. Chạy script

```bash
node scripts/import-sample-articles.js
```

## Nội dung bài viết

Script sẽ tạo 10 bài viết về các chủ đề:

1. **Văn Hóa Trà Đạo Nhật Bản** - Nghệ thuật sống chậm
2. **Ẩm Thực Đường Phố Việt Nam** - Hành trình khám phá hương vị
3. **Kiến Trúc Truyền Thống Nhật Bản** - Sự hài hòa với thiên nhiên
4. **Lễ Hội Hoa Anh Đào** - Vẻ đẹp phù du của mùa xuân
5. **Nghệ Thuật Thư Pháp Nhật Bản** - Khi chữ viết trở thành thiền
6. **Làng Nghề Truyền Thống Việt Nam** - Bảo tồn bản sắc văn hóa
7. **Onsen - Văn Hóa Tắm Suối Nước Nóng** - Liệu pháp cho cơ thể và tâm hồn
8. **Nghệ Thuật Ikebana** - Triết lý sống qua cách cắm hoa
9. **Áo Dài Việt Nam** - Biểu tượng văn hóa và nét đẹp duyên dáng
10. **Samurai - Tinh Thần Bushido** - Triết lý sống của chiến binh

## Đặc điểm bài viết

- ✅ Mỗi bài ~2000 từ (18 đoạn văn)
- ✅ Đầy đủ version tiếng Việt và tiếng Nhật
- ✅ Format Tiptap editor blocks (heading, paragraph)
- ✅ Có sapo, location, tags
- ✅ Một số bài được đánh dấu featured và editorsPick
- ✅ Tự động generate slug từ title
- ✅ Random views và readingMinutes

## Lưu ý

- Script sẽ tự động lấy category và author đầu tiên trong database
- Nếu muốn chỉ định category/author cụ thể, sửa dòng 115-116
- Tất cả bài viết được tạo với status "published"
- Có thể chỉnh sửa nội dung trong hàm `generateLongContent()` để tùy chỉnh

---

# Auto Deploy Script

Script tự động deploy lên VPS chỉ với 1 lệnh.

## Cách sử dụng

```bash
npm run deploy
```

Script sẽ tự động:
1. ✅ Hỏi commit message và push git
2. ✅ Build Next.js app locally
3. ✅ Sync files lên VPS (rsync)
4. ✅ Install dependencies trên VPS
5. ✅ Restart PM2 app

## Yêu cầu

- SSH key đã setup với VPS (không cần nhập password)
- rsync đã cài đặt

## Setup SSH Key (nếu chưa có)

```bash
# Generate SSH key (nếu chưa có)
ssh-keygen -t rsa -b 4096

# Copy key lên VPS
ssh-copy-id root@36.50.27.85

# Test connection
ssh root@36.50.27.85
```

Sau khi setup xong, bạn có thể deploy chỉ với 1 lệnh:

```bash
npm run deploy
```


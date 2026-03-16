import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { createContactSubmission } from "@/lib/contacts";

type Errors = Record<string, string>;

const ContactPage = () => {
  const { language } = useLanguage();
  const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);

  const [form, setForm] = useState({
    name: "",
    company: "",
    department: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const fieldLabel = (field: string) => {
    const map: Record<string, [string, string]> = {
      name: ["Họ và Tên", "氏名"],
      company: ["Tên công ty/tổ chức", "会社名・団体名"],
      department: ["Phòng ban", "部署名"],
      email: ["Địa chỉ email", "メールアドレス"],
      phone: ["Số điện thoại", "電話番号"],
      message: ["Tin nhắn", "お問い合わせ内容"],
    };
    const pair = map[field] || [field, field];
    return no(pair[0], pair[1]);
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const requiredMsg = (f: string) => no(`Vui lòng nhập ${f}`, `${f}を入力してください。`);
    const maxMsg = (f: string, max: number) =>
      no(`Vui lòng nhập tối đa ${max} ký tự.`, `${f}は${max}文字以内で入力してください。`);

    // Required
    if (!form.name.trim()) e.name = requiredMsg(fieldLabel("name"));
    else if (form.name.length > 100) e.name = maxMsg(fieldLabel("name"), 100);

    if (!form.company.trim()) e.company = requiredMsg(fieldLabel("company"));
    else if (form.company.length > 100) e.company = maxMsg(fieldLabel("company"), 100);

    // Department (optional, max 100)
    if (form.department.length > 100) e.department = maxMsg(fieldLabel("department"), 100);

    // Email
    if (!form.email.trim()) e.email = requiredMsg(fieldLabel("email"));
    else if (form.email.length > 100) e.email = maxMsg(fieldLabel("email"), 100);
    else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email))
      e.email = no("Vui lòng nhập đúng địa chỉ mail", `${fieldLabel("email")}を正しく入力してください。`);

    // Phone (optional)
    if (form.phone.trim()) {
      if (!/^[0-9]+$/.test(form.phone.trim()))
        e.phone = no("Vui lòng nhập đúng số điện thoại.", "半角文字のみ入力可能です。");
      else if (form.phone.trim().length < 10 || form.phone.trim().length > 11)
        e.phone = no("Vui lòng nhập đúng số điện thoại", `${fieldLabel("phone")}を正しく入力してください。`);
    }

    // Message
    if (!form.message.trim()) e.message = requiredMsg(fieldLabel("message"));
    else if (form.message.length > 2000) e.message = maxMsg(fieldLabel("message"), 2000);

    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await createContactSubmission({
        name: form.name.trim(),
        company: form.company.trim(),
        department: form.department.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
      });
      toast({
        title: no("Gửi thành công!", "送信完了！"),
        description: no("Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất.", "お問い合わせありがとうございます。折り返しご連絡いたします。"),
      });
      setForm({ name: "", company: "", department: "", email: "", phone: "", message: "" });
      setErrors({});
    } catch {
      toast({
        title: no("Gửi thất bại", "送信に失敗しました"),
        description: no("Vui lòng thử lại sau.", "しばらくしてからもう一度お試しください。"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass = "block text-sm font-semibold text-gray-900 mb-1";
  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-sm text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent";
  const inputErrorClass =
    "w-full px-3 py-2 border border-red-400 rounded-sm text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";
  const requiredMark = <span className="text-red-500 ml-0.5">*</span>;
  const errorText = (field: string) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;
  const cls = (field: string) => (errors[field] ? inputErrorClass : inputClass);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-[700px]">
        <div className="mb-8 border-b border-gray-100 pb-4 flex items-center gap-4">
          <span
            className="inline-block w-2.5 h-10 rounded-sm"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)",
              transform: "skewX(-15deg)",
            }}
          />
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {no("Liên hệ với Betonabi", "Betonabiへのお問い合わせ")}
          </h1>
        </div>

        <p className="text-sm text-gray-600 mb-8 whitespace-pre-line">
          {no(
            "Bạn có thể đặt câu hỏi về trang web Betonabi.\nVui lòng điền vào biểu mẫu dưới đây. (* trường bắt buộc)",
            "Betonabiに関するお問い合わせは、以下のフォームよりお願いいたします。（* は必須項目です）"
          )}
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Name */}
          <div>
            <label className={labelClass}>{no("Họ và Tên", "氏名")} {requiredMark}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={no("Nhập họ và tên của bạn", "氏名をご入力ください。")}
              className={cls("name")}
            />
            {errorText("name")}
          </div>
          {/* Company */}
          <div>
            <label className={labelClass}>{no("Tên công ty/tổ chức", "会社名・団体名")} {requiredMark}</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder={no("Nhập công ty hoặc tổ chức", "会社名または団体名をご入力ください。")}
              className={cls("company")}
            />
            {errorText("company")}
            <p className="text-xs text-red-500 mt-1">
              {no(
                "Nếu không cung cấp tên công ty hoặc tổ chức của bạn, đơn đăng ký sẽ bị từ chối.",
                "会社名・団体名のご記入がない場合、対応いたしかねますのでご了承ください。"
              )}
            </p>
          </div>

          {/* Department */}
          <div>
            <label className={labelClass}>{no("Phòng ban", "部署名")}</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => handleChange("department", e.target.value)}
              placeholder={no("Nhập tên phòng ban (không bắt buộc)", "部署名をご入力ください（任意）")}
              className={cls("department")}
            />
            {errorText("department")}
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>{no("Địa chỉ email", "メールアドレス")} {requiredMark}</label>
            <input
              type="text"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder={no("Nhập địa chỉ email của bạn", "メールアドレスをご入力ください。")}
              className={cls("email")}
            />
            {errorText("email")}
            <p className="text-xs text-red-500 mt-1 whitespace-pre-line">
              {no(
                "* Bắt buộc nhập địa chỉ email của cá nhân hoặc tổ chức của bạn.\n* Các địa chỉ email miễn phí KHÔNG được chấp nhận.",
                "企業または組織のメールアドレスをご入力ください。\nフリーメールアドレスはご利用いただけません。"
              )}
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>{no("Số điện thoại", "電話番号")}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder={no("Nhập số điện thoại (không bắt buộc)", "電話番号をご入力ください（任意）")}
              className={cls("phone")}
            />
            {errorText("phone")}
          </div>

          {/* Message */}
          <div>
            <label className={labelClass}>{no("Tin nhắn", "お問い合わせ内容")} {requiredMark}</label>
            <textarea
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder={no("Nhập tin nhắn của bạn...", "お問い合わせ内容をご入力ください。")}
              rows={6}
              className={cls("message")}
            />
            {errorText("message")}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-[#7c3aed] text-white font-bold rounded-sm hover:bg-[#4d0078] transition-colors disabled:opacity-50"
            >
              {submitting ? no("Đang gửi...", "送信中...") : no("Gửi", "送信する")}
            </button>
          </div>
        </form>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default ContactPage;

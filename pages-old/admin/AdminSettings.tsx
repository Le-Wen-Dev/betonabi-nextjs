import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { fetchSiteSettings, upsertSiteSettings } from "@/lib/siteSettings";

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [langTab, setLangTab] = useState<"vi" | "jp">("vi");

  const [siteName, setSiteName] = useState("Betonabi");
  const [aboutVi, setAboutVi] = useState("");
  const [aboutJp, setAboutJp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactZalo, setContactZalo] = useState("");
  const [addressVi, setAddressVi] = useState("");
  const [addressJp, setAddressJp] = useState("");

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const s = await fetchSiteSettings();
        if (s) {
          setSiteName(s.site_name || "Betonabi");
          setAboutVi(s.about_vi || "");
          setAboutJp(s.about_jp || "");
          setContactEmail(s.contact_email || "");
          setContactZalo(s.contact_zalo || "");
          setAddressVi(s.address_vi || "");
          setAddressJp(s.address_jp || "");
        }
      } catch (err: unknown) {
        toast({
          title: "Không tải được settings",
          description:
            "Hãy chắc chắn PocketBase có collection `site_settings` và rule cho phép admin view/update.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    setIsSaving(true);
    try {
      await upsertSiteSettings({
        site_name: siteName.trim(),
        about_vi: aboutVi.trim(),
        about_jp: aboutJp.trim(),
        contact_email: contactEmail.trim(),
        contact_zalo: contactZalo.trim(),
        address_vi: addressVi.trim(),
        address_jp: addressJp.trim(),
      });
      toast({ title: "Đã lưu", description: "Cấu hình đã được cập nhật." });
    } catch (err: unknown) {
      toast({
        title: "Lưu thất bại",
        description: "Vui lòng kiểm tra API rules của collection `site_settings`.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Cài đặt
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý cấu hình trang tin
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Site Info */}
        <div className="bg-background border border-foreground/20 p-6">
          <h2 className="font-serif text-lg font-bold text-foreground mb-4">
            Thông tin trang
          </h2>
          <div className="space-y-4 opacity-100">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Tên trang
              </label>
              <Input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="rounded-none border-foreground/20"
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
            <Tabs value={langTab} onValueChange={(v) => setLangTab(v as "vi" | "jp")}>
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b border-foreground/20">
                <TabsTrigger
                  value="vi"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  VI
                </TabsTrigger>
                <TabsTrigger
                  value="jp"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  JP
                </TabsTrigger>
              </TabsList>
              <TabsContent value="vi" className="mt-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Giới thiệu (VI)
                </label>
                <Textarea
                  value={aboutVi}
                  onChange={(e) => setAboutVi(e.target.value)}
                  className="rounded-none border-foreground/20 resize-none"
                  disabled={isLoading}
                />
              </TabsContent>
              <TabsContent value="jp" className="mt-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Giới thiệu (JP)
                </label>
                <Textarea
                  value={aboutJp}
                  onChange={(e) => setAboutJp(e.target.value)}
                  className="rounded-none border-foreground/20 resize-none"
                  disabled={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-background border border-foreground/20 p-6">
          <h2 className="font-serif text-lg font-bold text-foreground mb-4">
            Thông tin liên hệ
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="rounded-none border-foreground/20"
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Zalo
              </label>
              <Input
                type="tel"
                value={contactZalo}
                onChange={(e) => setContactZalo(e.target.value)}
                className="rounded-none border-foreground/20"
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
            <Tabs value={langTab} onValueChange={(v) => setLangTab(v as "vi" | "jp")}>
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b border-foreground/20">
                <TabsTrigger
                  value="vi"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  VI
                </TabsTrigger>
                <TabsTrigger
                  value="jp"
                  className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  JP
                </TabsTrigger>
              </TabsList>
              <TabsContent value="vi" className="mt-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Địa chỉ (VI)
                </label>
                <Textarea
                  value={addressVi}
                  onChange={(e) => setAddressVi(e.target.value)}
                  className="rounded-none border-foreground/20 resize-none"
                  disabled={isLoading}
                />
              </TabsContent>
              <TabsContent value="jp" className="mt-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Địa chỉ (JP)
                </label>
                <Textarea
                  value={addressJp}
                  onChange={(e) => setAddressJp(e.target.value)}
                  className="rounded-none border-foreground/20 resize-none"
                  disabled={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={onSave}
          disabled={isLoading || isSaving}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium"
        >
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;

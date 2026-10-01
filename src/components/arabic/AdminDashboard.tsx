"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpenText,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Emblem, OrnamentDivider } from "./Ornaments";

/* ================= أنواع البيانات ================= */

type Announcement = {
  id: string;
  title: string;
  body: string;
  important: boolean;
  createdAt: string;
};

type Lesson = {
  id: string;
  title: string;
  grade: string;
  description: string;
  url: string | null;
  createdAt: string;
};

const GRADES = [
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
];

type Tab = "overview" | "announcements" | "lessons";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/* ================= اللوحة الرئيسية ================= */

export function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [aRes, lRes] = await Promise.all([
        fetch("/api/announcements"),
        fetch("/api/lessons"),
      ]);
      const aData = await aRes.json().catch(() => ({}));
      const lData = await lRes.json().catch(() => ({}));
      setAnnouncements(Array.isArray(aData.announcements) ? aData.announcements : []);
      setLessons(Array.isArray(lData.lessons) ? lData.lessons : []);
    } catch {
      // تجاهل — القوائم تبقى كما هي
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      toast.success("تم تسجيل الخروج — مع السلامة");
      onExit();
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
      setLoggingOut(false);
    }
  }

  const NAV: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: "نظرة عامة", icon: LayoutDashboard },
    { key: "announcements", label: "الإعلانات", icon: Megaphone },
    { key: "lessons", label: "الدروس", icon: BookOpenText },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* ===== الهيدر ===== */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Emblem size={42} />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-extrabold text-foreground">
                لوحة تحكم المشرفين
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                منصّة مستر محمد صبري — اللغة العربية
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExit}
              className="font-semibold"
            >
              <ExternalLink className="size-4" />
              عرض الموقع
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="border-destructive/40 font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {loggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
          {/* ===== التنقل الجانبي ===== */}
          <nav aria-label="أقسام لوحة التحكم" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all lg:w-full ${
                  tab === n.key
                    ? "border-primary/35 bg-primary/10 font-bold text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <n.icon className="size-4.5" />
                {n.label}
              </button>
            ))}
          </nav>

          {/* ===== المحتوى ===== */}
          <div className="min-w-0">
            {tab === "overview" && (
              <OverviewTab
                announcements={announcements}
                lessons={lessons}
                loading={loading}
                onGo={setTab}
              />
            )}
            {tab === "announcements" && (
              <AnnouncementsTab items={announcements} refresh={refresh} />
            )}
            {tab === "lessons" && <LessonsTab items={lessons} refresh={refresh} />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= نظرة عامة ================= */

function OverviewTab({
  announcements,
  lessons,
  loading,
  onGo,
}: {
  announcements: Announcement[];
  lessons: Lesson[];
  loading: boolean;
  onGo: (t: Tab) => void;
}) {
  const lastUpdate = [...announcements, ...lessons].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const stats = [
    {
      label: "الإعلانات",
      value: announcements.length,
      icon: Megaphone,
      tab: "announcements" as Tab,
    },
    {
      label: "الدروس",
      value: lessons.length,
      icon: BookOpenText,
      tab: "lessons" as Tab,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ترحيب */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
          <Emblem size={64} className="shrink-0" />
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              أهلًا بك يا أستاذ محمد <span className="text-primary">✦</span>
            </h2>
            <p className="mt-1 leading-7 text-muted-foreground">
              من هنا تدير منصّة اللغة العربية — كل إعلان أو درس تضيفه يظهر
              مباشرة في صفحة الموقع الرئيسية.
            </p>
          </div>
        </div>
        <OrnamentDivider width={260} className="mx-auto mt-5 max-w-full" />
      </div>

      {/* الإحصائيات */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => onGo(s.tab)}
            className="group rounded-xl border border-border bg-card p-5 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
              <s.icon className="size-5 text-primary" />
            </div>
            {loading ? (
              <Loader2 className="mt-2 size-6 animate-spin text-primary/60" />
            ) : (
              <p className="mt-1 text-4xl font-extrabold text-primary">{s.value}</p>
            )}
          </button>
        ))}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">آخر تحديث</span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-7 text-foreground">
            {loading ? "..." : lastUpdate ? formatDate(lastUpdate.createdAt) : "لا يوجد محتوى بعد"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= إدارة الإعلانات ================= */

function AnnouncementsTab({
  items,
  refresh,
}: {
  items: Announcement[];
  refresh: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [important, setImportant] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("من فضلك اكتب العنوان والنص");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/announcements/${editingId}` : "/api/announcements",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), body: body.trim(), important }),
        }
      );
      if (res.ok) {
        toast.success(editingId ? "تم حفظ التعديل بنجاح" : "تمت إضافة الإعلان بنجاح");
        setTitle("");
        setBody("");
        setImportant(false);
        setEditingId(null);
        await refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/announcements/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف الإعلان");
        if (editingId === deleteId) {
          setEditingId(null);
          setTitle("");
          setBody("");
          setImportant(false);
        }
        await refresh();
      } else {
        toast.error("فشل الحذف — حاول مرة أخرى");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setDeleteId(null);
    }
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setTitle(a.title);
    setBody(a.body);
    setImportant(a.important);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setBody("");
    setImportant(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* نموذج الإضافة/التعديل */}
      <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {editingId ? <Save className="size-4.5" /> : <Plus className="size-4.5" />}
          </span>
          {editingId ? "تعديل الإعلان" : "إضافة إعلان جديد"}
        </h3>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="font-semibold text-foreground">عنوان الإعلان</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بدء امتحانات شهر أكتوبر"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-semibold text-foreground">نص الإعلان</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="اكتب تفاصيل الإعلان هنا..."
              rows={4}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Switch
                checked={important}
                onCheckedChange={setImportant}
                id="important-switch"
              />
              <Label htmlFor="important-switch" className="font-semibold text-foreground">
                إعلان مهم
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelEdit}
                  className="font-semibold text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                  إلغاء
                </Button>
              )}
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : editingId ? "حفظ التعديل" : "إضافة الإعلان"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* القائمة */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          الإعلانات المنشورة ({items.length})
        </h3>
        {items.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-lg font-medium text-muted-foreground">
            لا توجد إعلانات بعد — ابدأ بإضافة أول إعلان
          </p>
        ) : (
          <div className="scroll-gold max-h-[460px] space-y-3 overflow-y-auto pe-1">
            {items.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-foreground">{a.title}</h4>
                      {a.important && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                          مهم
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {a.body}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground/70">{formatDate(a.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => startEdit(a)}
                      className="size-8 border-primary/35 text-primary hover:bg-primary/10 hover:text-primary"
                      aria-label={`تعديل ${a.title}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(a.id)}
                      className="size-8 border-destructive/40 text-destructive hover:bg-destructive/15"
                      aria-label={`حذف ${a.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* تأكيد الحذف */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذه الخطوة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive font-bold text-white hover:bg-destructive/85"
            >
              نعم، احذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ================= إدارة الدروس ================= */

function LessonsTab({ items, refresh }: { items: Lesson[]; refresh: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !grade) {
      toast.error("من فضلك اكتب عنوان الدرس واختر الصف");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/lessons/${editingId}` : "/api/lessons",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            grade,
            description: description.trim(),
            url: url.trim() || null,
          }),
        }
      );
      if (res.ok) {
        toast.success(editingId ? "تم حفظ التعديل بنجاح" : "تمت إضافة الدرس بنجاح");
        setTitle("");
        setGrade("");
        setDescription("");
        setUrl("");
        setEditingId(null);
        await refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/lessons/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف الدرس");
        if (editingId === deleteId) cancelEdit();
        await refresh();
      } else {
        toast.error("فشل الحذف — حاول مرة أخرى");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setDeleteId(null);
    }
  }

  function startEdit(l: Lesson) {
    setEditingId(l.id);
    setTitle(l.title);
    setGrade(l.grade);
    setDescription(l.description);
    setUrl(l.url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setGrade("");
    setDescription("");
    setUrl("");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* نموذج الإضافة/التعديل */}
      <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {editingId ? <Save className="size-4.5" /> : <Plus className="size-4.5" />}
          </span>
          {editingId ? "تعديل الدرس" : "إضافة درس جديد"}
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="font-semibold text-foreground">عنوان الدرس</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: المبتدأ والخبر"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-semibold text-foreground">الصف الدراسي</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الصف" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label className="font-semibold text-foreground">وصف الدرس</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لمحتوى الدرس..."
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label className="font-semibold text-foreground">رابط الدرس (اختياري)</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              dir="ltr"
            />
          </div>
          <div className="flex items-center justify-end gap-2 sm:col-span-2">
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                onClick={cancelEdit}
                className="font-semibold text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
                إلغاء
              </Button>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : editingId ? "حفظ التعديل" : "إضافة الدرس"}
            </Button>
          </div>
        </div>
      </form>

      {/* القائمة */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          الدروس المنشورة ({items.length})
        </h3>
        {items.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-lg font-medium text-muted-foreground">
            لا توجد دروس بعد — ابدأ بإضافة أول درس
          </p>
        ) : (
          <div className="scroll-gold max-h-[460px] space-y-3 overflow-y-auto pe-1">
            {items.map((l) => (
              <div
                key={l.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-foreground">{l.title}</h4>
                      <span className="rounded-full border border-primary/25 bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        {l.grade}
                      </span>
                    </div>
                    {l.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {l.description}
                      </p>
                    )}
                    {l.url && (
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="mt-1.5 block truncate text-xs text-primary/80 hover:text-primary"
                      >
                        {l.url}
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => startEdit(l)}
                      className="size-8 border-primary/35 text-primary hover:bg-primary/10 hover:text-primary"
                      aria-label={`تعديل ${l.title}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(l.id)}
                      className="size-8 border-destructive/40 text-destructive hover:bg-destructive/15"
                      aria-label={`حذف ${l.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* تأكيد الحذف */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع عن هذه الخطوة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive font-bold text-white hover:bg-destructive/85"
            >
              نعم، احذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

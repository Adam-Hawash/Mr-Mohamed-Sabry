import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/* (ر8) إعداد OpenNext لكلاود فلير — بدون محوّل صور (يحتاج R2 وبطاقة)
   الصور هتشتغل unoptimized تلقائيًا لما CLOUDFLARE=1 من متغيرات البيئة */
export default defineCloudflareConfig({});

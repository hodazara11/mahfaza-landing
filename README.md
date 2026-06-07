# Mahfaza Landing Page — منصة محفظة

## الملفات

- **index.html** — الصفحة الرئيسية (Landing Page)
- **terms.html** — شروط الاستخدام
- **privacy.html** — سياسة الخصوصية
- **refund.html** — سياسة الاسترداد

## المميزات

✅ **Bilingual** — عربي فصحى + إنجليزي مع toggle في الـ Nav
✅ **Dark / Light Mode** — toggle في الـ Nav، الإعداد يُحفظ في المتصفح
✅ **RTL/LTR** تلقائي حسب اللغة
✅ **CONFIG-driven** — كل القيم المتغيرة (السعر، أرقام الدفع، الخصومات) في object واحد جاهز للربط بـ Supabase

## SITE_CONFIG — إزاي تغير القيم

افتح `index.html` ودوّر على `const SITE_CONFIG = {...}` في أول الـ script. غيّر القيم التالية بسهولة:

```javascript
const SITE_CONFIG = {
  price: {
    current: 199,         // ← السعر الحالي
    original: 199,        // ← السعر الأصلي (يظهر مشطوب لو showDiscount = true)
    showDiscount: false   // ← شغّل ده لو عايز تظهر خصم
  },
  payment: {
    instaPay: '01124941148',      // ← رقم InstaPay
    whatsapp: '01112435090',       // ← رقم WhatsApp
    whatsappLink: 'https://wa.me/201112435090'
  },
  social: {
    instagram: '#',   // ← لينك Instagram
    facebook: '#',    // ← لينك Facebook  
    tiktok: '#'       // ← لينك TikTok
  },
  promoBadge: {
    ar: 'عرض الإطلاق',
    en: 'Launch Offer',
    show: true        // ← اخفي/أظهر الـ badge
  }
};
```

**مثال للخصم:**
```javascript
price: {
  current: 149,         // السعر بعد الخصم
  original: 199,        // السعر الأصلي اللي هيظهر مشطوب
  showDiscount: true    // فعّل عرض الخصم
}
```

## بعد ربط Supabase (Task #4)

الـ `SITE_CONFIG` هيتم استبداله بـ:
```javascript
const SITE_CONFIG = await fetch('/api/site-settings').then(r => r.json());
```

وأنت من الـ Admin Panel هتقدر تعدّل القيم دي **مباشرة من الـ Dashboard** بدون لمس الكود — أي تغيير بيظهر في الموقع فوراً.

## الـ Deployment على Vercel

1. غيّر اسم المجلد إلى `mahfaza-landing` (أو أي اسم)
2. ارفع على GitHub repo جديد
3. اربطه بـ Vercel (Project Settings → Other Framework)
4. Root Directory = ./
5. Deploy

اللينكات داخل الموقع (terms, privacy, refund) ستعمل تلقائيًا.

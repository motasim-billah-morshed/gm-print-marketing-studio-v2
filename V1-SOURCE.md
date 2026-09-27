# V1.0 Source Snapshot — Read-only audit reference

Fetched for architecture audit on 2026-09-27. Source: https://docs.google.com/document/d/1UEPEpTvgjsyPa7NRd26ytxV5W9qTKJAOgION0_cXqUQ/edit

One native tab: t.0. This snapshot is evidence of the audited requirements, not a revised source document. The original remains unchanged.

﻿GM PRINT SOLUTION
AI Digital Marketing & Lead Generation
কার্যকরী চাহিদা ও মডিউল নকশা — সংস্করণ 1.0
১. উদ্দেশ্য, সংশোধিত পরিধি ও ব্যবহারের নিয়ম
এই নথি ব্যবসার মালিক, মার্কেটিং টিম, ডিজাইনার, সফটওয়্যার নির্মাতা এবং ERP টিমের জন্য প্রস্তাবিত functional blueprint। এটি বাস্তবায়িত সফটওয়্যার বা সক্রিয় platform integration-এর দাবি নয়। ব্যবহারকারীর সংশোধন অনুযায়ী কাজের শুরু হবে নিজস্ব বা অনলাইন ডেটা থেকে; শেষ হবে যাচাইকৃত লিড বিদ্যমান ERP-তে সফলভাবে হস্তান্তরে।
অন্তর্ভুক্ত: নিজস্ব ডেটা আপলোড, অনলাইন discovery, যাচাই, company/contact database, segmentation, AI content planning ও creation, approval, digital channel management, content distribution, campaigns, response capture, AI qualification, nurture এবং ERP integration।
ERP-র দায়িত্ব: sales executive assignment, sales task, quotation, negotiation, order, delivery, payment, sales performance এবং KPI নির্ধারণ/গণনা। নতুন ব্যবস্থায় একই sales module আবার তৈরি হবে না। ERP থেকে প্রয়োজনীয় status পড়া এবং marketing data পাঠানো যাবে; data ownership ERP চুক্তি অনুযায়ী স্থির হবে।
ডেটার পথ: Upload / Online discovery → Verification → Company & Contact → Segment → Content → Approval → Campaign → Response → Qualification → ERP handoff acknowledgement।
‘ফেইস’ এখানে কাজের phase বা workflow ধাপ বোঝায়; আলাদা UI screen নয়। প্রতিটি সাবমডিউলে ৩টি নির্দিষ্ট ধাপ আছে: F1 ইনপুট/প্রস্তুতি, F2 প্রক্রিয়া/যাচাই, F3 ফলাফল/হস্তান্তর। নিচে প্রতিটির নিজস্ব কাজ লেখা আছে। এগুলো development release phase-এর থেকে আলাদা।
প্রস্তাবিত মোট: ১৬টি মডিউল × ৪টি সাবমডিউল = ৬৪টি সাবমডিউল; ৬৪ × ৩ = ১৯২টি workflow ধাপ। এটি প্রয়োজন অনুযায়ী সংগঠিত প্রস্তাব, কোনো বাধ্যতামূলক শিল্পমান নয়।
AI সুযোগ বলতে provider-পরিবর্তনযোগ্য text, research, OCR, image, video, audio, translation, personalization, classification ও optimization ক্ষমতা বোঝানো হয়েছে। ভবিষ্যতের প্রতিটি AI tool আগে থেকেই সংযুক্ত থাকবে—এমন প্রতিশ্রুতি নয়। নতুন provider যুক্ত করার ব্যবস্থা থাকবে।
২. মডিউল সূচি ও সংখ্যা
M01 — ব্যবসার প্রেক্ষাপট ও মার্কেটিং পরিকল্পনা: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Marketing Manager।
M02 — নিজস্ব ডেটা আপলোড ও ইমপোর্ট: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Data Operator।
M03 — অনলাইন কোম্পানি আবিষ্কার ও enrichment: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Research Operator।
M04 — ডেটার মান, পরিচয় ও যাচাই: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Data Reviewer।
M05 — কোম্পানি ও কন্টাক্টের 360° ডেটাবেস: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Data Manager।
M06 — সেগমেন্ট, অডিয়েন্স ও personalization: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Marketing Planner।
M07 — AI গবেষণা, ধারণা ও কনটেন্ট পরিকল্পনা: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Content Strategist।
M08 — AI লেখা, SEO ও বহুভাষিক কনটেন্ট: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Copywriter / Editor।
M09 — AI ছবি, ডিজাইন ও পণ্য প্রদর্শন: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Designer।
M10 — AI ভিডিও, অডিও ও ইন্টারঅ্যাকটিভ কনটেন্ট: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Video Producer।
M11 — Asset library, review ও প্রকাশের অনুমোদন: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Content Approver।
M12 — চ্যানেল, ক্যাম্পেইন ও বিতরণ: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Campaign Manager।
M13 — Lead capture ও কেন্দ্রীয় response inbox: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Marketing Response Team।
M14 — AI lead qualification ও nurture সিদ্ধান্ত: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Lead Reviewer।
M15 — ERP handoff ও মার্কেটিং কার্যক্রম পর্যবেক্ষণ: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: Integration Admin / Marketing Manager।
M16 — প্রশাসন, নিরাপত্তা ও AI অপারেশন: ৪ সাবমডিউল, ১২ ধাপ। প্রধান দায়িত্ব: System Admin।
৩. বিস্তারিত মডিউল, সাবমডিউল ও ধাপ
M01 — ব্যবসার প্রেক্ষাপট ও মার্কেটিং পরিকল্পনা
দায়িত্ব: Marketing Manager। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M01.S1 — পণ্য, সেবা ও অফার
F1 — ক্যাটালগ, সক্ষমতা, অনুমোদিত মূল্য ও সেবার তথ্য নেওয়া।
F2 — পণ্যকে শিল্প ও সমস্যার সঙ্গে মেলানো; অসমর্থিত দাবি চিহ্নিত করা।
F3 — অনুমোদিত offer brief ও প্রচারযোগ্য পণ্যের তালিকা রাখা।
M01.S2 — ব্র্যান্ড ও ভাষা
F1 — লোগো, রং, লেখার ধরন, বাংলা/ইংরেজি নির্দেশনা নেওয়া।
F2 — AI-এর জন্য ব্র্যান্ড নিয়ম ও নিষিদ্ধ দাবি নির্ধারণ।
F3 — সব কনটেন্টে ব্যবহারযোগ্য অনুমোদিত brand profile প্রকাশ।
M01.S3 — টার্গেট ক্রেতার সংজ্ঞা
F1 — শিল্প, এলাকা, কোম্পানির আকার ও ক্রয়-সম্পর্কিত পদ নেওয়া।
F2 — আদর্শ ক্রেতা, বাদ দেওয়ার শর্ত ও সম্ভাব্য চাহিদা নির্ধারণ।
F3 — সংস্করণসহ target profile সেভ করে discovery ও segmentation-এ দেওয়া।
M01.S4 — ক্যাম্পেইন উদ্দেশ্য
F1 — সচেতনতা, ক্যাটালগ অনুরোধ, স্যাম্পল আগ্রহ বা inquiry লক্ষ্য নেওয়া।
F2 — বাজেটসীমা, সময়সীমা ও উপযুক্ত CTA নির্ধারণ।
F3 — অনুমোদিত campaign brief তৈরি; sales target/KPI ERP-র দায়িত্বে রাখা।
M02 — নিজস্ব ডেটা আপলোড ও ইমপোর্ট
দায়িত্ব: Data Operator। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M02.S1 — Excel, CSV ও spreadsheet ইমপোর্ট
F1 — ফাইল আপলোড, sheet নির্বাচন ও sample preview।
F2 — কলাম mapping, encoding, ফোনের leading zero ও প্রয়োজনীয় field যাচাই।
F3 — valid row import; rejected row কারণসহ download এবং batch rollback সুবিধা।
M02.S2 — কার্ড, PDF ও ছবি থেকে OCR
F1 — ভিজিটিং কার্ড, স্ক্যান ও অনুমোদিত নথি গ্রহণ।
F2 — AI/OCR দিয়ে নাম, প্রতিষ্ঠান, পদ ও যোগাযোগ বের করা; confidence দেখানো।
F3 — মানুষের যাচাই শেষে record তৈরি; মূল নথির সঙ্গে সম্পর্ক রাখা।
M02.S3 — ম্যানুয়াল ও bulk entry
F1 — একক ফর্ম, bulk paste বা মোবাইল entry দিয়ে তথ্য নেওয়া।
F2 — প্রয়োজনীয় field, বানান ও সম্ভাব্য duplicate দেখানো।
F3 — নতুন record save অথবা অনুমোদিত existing record update।
M02.S4 — পুরোনো সিস্টেম ও ERP ডেটা আনা
F1 — অনুমোদিত API/export থেকে customer ও contact নেওয়া।
F2 — external ID mapping, source priority ও সম্মতির প্রমাণ পরীক্ষা।
F3 — incremental import ও reconciliation; existing customer আলাদা চিহ্নিত।
M03 — অনলাইন কোম্পানি আবিষ্কার ও enrichment
দায়িত্ব: Research Operator। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M03.S1 — সার্চ ও কোম্পানির ওয়েবসাইট
F1 — টার্গেটভিত্তিক query, domain ও প্রকাশ্য source নির্বাচন।
F2 — কোম্পানির প্রাসঙ্গিক ঠিকানা, সেবা ও business contact বের করা।
F3 — প্রমাণের URL ও last-checked তথ্যসহ candidate record তৈরি।
M03.S2 — Maps, directory ও association
F1 — অনুমোদিত Maps/API, trade body ও directory source নির্বাচন।
F2 — কোম্পানির পরিচয় মেলানো; উৎসের storage/attribution নিয়ম প্রয়োগ।
F3 — রাখার অনুমতি থাকা field বা reference ID সংরক্ষণ; refresh queue তৈরি।
M03.S3 — সোশ্যাল উপস্থিতি অনুসন্ধান
F1 — Facebook, LinkedIn, YouTube ও অন্যান্য business page candidate নেওয়া।
F2 — নাম, domain, ঠিকানা দিয়ে official page মিল পরীক্ষা।
F3 — verified/possible/unverified channel link সংরক্ষণ; ব্যক্তি বা email অনুমান না করা।
M03.S4 — চলমান enrichment
F1 — অসম্পূর্ণ বা পুরোনো record-এর field নির্বাচন।
F2 — নতুন source দিয়ে missing field ও change candidate খোঁজা।
F3 — পরিবর্তনের diff review; অনুমোদন শেষে update ও source history রাখা।
M04 — ডেটার মান, পরিচয় ও যাচাই
দায়িত্ব: Data Reviewer। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M04.S1 — কোম্পানি ও ব্যক্তি duplicate
F1 — নাম, domain, ফোন, email ও external ID তুলনা।
F2 — exact ও fuzzy match confidence দেখানো; group/branch আলাদা রাখা।
F3 — reviewed merge, field-level provenance এবং unmerge সুবিধা।
M04.S2 — যোগাযোগ যাচাই
F1 — ফোন country code, email syntax/domain ও URL পরীক্ষা।
F2 — verified, unreachable, unverified অবস্থা আলাদা করা; mailbox delivery নিশ্চিত ধরে না নেওয়া।
F3 — channel-ready status নির্ধারণ; ফোনকে স্বয়ংক্রিয় WhatsApp হিসেবে না ধরা।
M04.S3 — উৎস ও বিরোধ মীমাংসা
F1 — প্রতিটি field-এর value, উৎস ও যাচাইয়ের সময় সংগ্রহ।
F2 — বিরোধ, stale data ও current-role uncertainty চিহ্নিত করা।
F3 — reviewer decision ও confidenceসহ authoritative value সংরক্ষণ।
M04.S4 — ইমপোর্ট মান ও ব্যতিক্রম
F1 — batch-এর accepted/rejected/duplicate গণনা।
F2 — ভুল field ও permission-unknown record quarantine।
F3 — সংশোধিত record পুনঃপ্রক্রিয়া; বাতিল ডেটা প্রচার থেকে বাদ।
M05 — কোম্পানি ও কন্টাক্টের 360° ডেটাবেস
দায়িত্ব: Data Manager। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M05.S1 — গ্রুপ, কোম্পানি ও শাখা
F1 — Company Group, Company ও Branch ID তৈরি।
F2 — আইনি প্রতিষ্ঠান, ব্র্যান্ড ও কারখানার সম্পর্ক আলাদা করা।
F3 — একটি profile-এ সম্পর্ক ও সংশ্লিষ্ট সব যোগাযোগ দেখানো।
M05.S2 — ব্যক্তি ও সিদ্ধান্তগ্রহণের ভূমিকা
F1 — Contact ID, পদ, বিভাগ ও public business contact রাখা।
F2 — procurement, merchandising, management ভূমিকা ও বর্তমান সম্পর্ক যাচাই।
F3 — role map তৈরি; বদলি/চাকরি ছেড়ে যাওয়ার ইতিহাস রাখা।
M05.S3 — চ্যানেল ও সম্মতি রেকর্ড
F1 — email, ফোন, social handle এবং opt-in evidence নেওয়া।
F2 — প্রতি channel ও উদ্দেশ্য অনুযায়ী eligibility নির্ধারণ।
F3 — opt-out/suppression তাৎক্ষণিক কার্যকর করে campaign audience-এ পাঠানো।
M05.S4 — সার্চ ও activity history
F1 — কোম্পানি, ব্যক্তি, campaign ও conversation সংযুক্ত করা।
F2 — search, saved view, tag এবং visibility permission প্রয়োগ।
F3 — profile থেকে interaction history, lead ও ERP reference দেখা।
M06 — সেগমেন্ট, অডিয়েন্স ও personalization
দায়িত্ব: Marketing Planner। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M06.S1 — নিয়মভিত্তিক গ্রুপ
F1 — শিল্প, এলাকা, আকার, পণ্যচাহিদা ও customer status filter নেওয়া।
F2 — AND/OR নিয়ম দিয়ে dynamic segment তৈরি।
F3 — membership preview ও campaign-time audience snapshot সংরক্ষণ।
M06.S2 — AI সহায়ক শ্রেণিবিন্যাস
F1 — যাচাইকৃত company description ও category নেওয়া।
F2 — AI দিয়ে সম্ভাব্য use case/চাহিদা প্রস্তাব; কারণ ও confidence দেখানো।
F3 — মানুষের সংশোধনসহ tag সেভ; অনুমানকে নিশ্চিত তথ্য হিসেবে না রাখা।
M06.S3 — চ্যানেলভিত্তিক audience
F1 — segment-এর email/WhatsApp/social availability পড়া।
F2 — consent, suppression, duplicate ও contact-frequency পরীক্ষা।
F3 — প্রতি channel-এ eligible সংখ্যা ও বাদ পড়ার কারণ প্রকাশ।
M06.S4 — Account-based personalization
F1 — এক কোম্পানির প্রাসঙ্গিক একাধিক ভূমিকা ও অনুমোদিত তথ্য নেওয়া।
F2 — role অনুযায়ী offer/message angle তৈরি; কোম্পানিজুড়ে frequency cap।
F3 — personalized variable preview; missing value-তে নিরাপদ fallback।
M07 — AI গবেষণা, ধারণা ও কনটেন্ট পরিকল্পনা
দায়িত্ব: Content Strategist। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M07.S1 — চাহিদা ও বাজার insight
F1 — অনুমোদিত research, customer question ও competitor public content নেওয়া।
F2 — AI দিয়ে বিষয়, সমস্যা ও content gap বিশ্লেষণ; উৎস দেখানো।
F3 — যাচাইযোগ্য insight brief; প্রতিযোগীর অপ্রমাণিত দাবি বাদ।
M07.S2 — কনটেন্ট ধারণা ও angle
F1 — পণ্য, segment, উদ্দেশ্য ও channel brief নেওয়া।
F2 — AI দিয়ে শিক্ষা, সমস্যা-সমাধান, demo, case study ও offer ধারণা তৈরি।
F3 — নির্বাচিত ধারণা priorityসহ production queue-তে দেওয়া।
M07.S3 — কনটেন্ট calendar
F1 — campaign ও প্রয়োজনীয় format/language নির্ধারণ।
F2 — AI দিয়ে topic sequence, দায়িত্ব ও publishing slot প্রস্তাব।
F3 — সম্পাদিত calendar approve; সময়সূচির conflict দেখানো।
M07.S4 — Brief ও prompt library
F1 — ব্র্যান্ড, approved facts ও সফল template নেওয়া।
F2 — পুনর্ব্যবহারযোগ্য prompt ও channel-specific brief তৈরি।
F3 — versioned prompt save; ব্যবহৃত model ও input reference রাখা।
M08 — AI লেখা, SEO ও বহুভাষিক কনটেন্ট
দায়িত্ব: Copywriter / Editor। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M08.S1 — বিজ্ঞাপন ও মেসেজ copy
F1 — approved brief, CTA ও length constraint নেওয়া।
F2 — headline, caption, email subject/body, WhatsApp template draft তৈরি।
F3 — fact, brand, link ও variable check শেষে review-ready copy।
M08.S2 — দীর্ঘ লেখা ও SEO
F1 — keyword intent, product facts ও audience question নেওয়া।
F2 — blog, landing page, FAQ, metadata ও internal-link suggestion তৈরি।
F3 — editor review ও CMS draft; search/AI answer-এ ranking নিশ্চিত দাবি নয়।
M08.S3 — অনুবাদ ও localization
F1 — source copy ও glossary নেওয়া।
F2 — বাংলা/ইংরেজি অনুবাদ, tone ও আঞ্চলিক ভাষা অভিযোজন।
F3 — অর্থ, মূল্য, একক ও CTA মিলিয়ে অনুমোদিত ভাষা সংস্করণ।
M08.S4 — পুনর্ব্যবহার ও variant
F1 — অনুমোদিত article, transcript বা পুরোনো campaign নেওয়া।
F2 — সংক্ষেপ, carousel copy, email sequence ও A/B variation তৈরি।
F3 — source linkage ও variant ID রেখে পরীক্ষার জন্য প্রস্তুত।
M09 — AI ছবি, ডিজাইন ও পণ্য প্রদর্শন
দায়িত্ব: Designer। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M09.S1 — ইমেজ ও background generation
F1 — অনুমোদিত product photo, brief ও brand asset নেওয়া।
F2 — AI image, background, cleanup ও retouch draft তৈরি।
F3 — পণ্যের বাস্তব বৈশিষ্ট্য ও ভুয়া দাবি পরীক্ষা; অনুমোদিত export।
M09.S2 — Mockup ও product visualization
F1 — লোগো, artwork, label/package reference নেওয়া।
F2 — প্যাকেজিং, hangtag ও print mockup তৈরি।
F3 — illustrative mockup চিহ্নিত; বাস্তব sample হিসেবে উপস্থাপন না করা।
M09.S3 — Template ও bulk creative
F1 — অনুমোদিত design template ও product dataset নেওয়া।
F2 — একাধিক পণ্য/গ্রুপের creative এবং channel size variant তৈরি।
F3 — সব variant preview, overflow/বাংলা text check ও export।
M09.S4 — Design quality ও accessibility
F1 — draft creative ও channel requirement নেওয়া।
F2 — brand color, logo, contrast, spelling ও alt-text পরীক্ষা।
F3 — designer approval; পরিবর্তনের historyসহ final asset।
M10 — AI ভিডিও, অডিও ও ইন্টারঅ্যাকটিভ কনটেন্ট
দায়িত্ব: Video Producer। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M10.S1 — Script ও storyboard
F1 — পণ্য demo, audience এবং duration brief নেওয়া।
F2 — AI script, scene list, shot list ও storyboard draft তৈরি।
F3 — claim ও production feasibility যাচাই করে shoot/generation brief।
M10.S2 — ভিডিও তৈরি ও সম্পাদনা
F1 — অনুমোদিত footage, ছবি ও script নেওয়া।
F2 — AI-assisted scene generation, cut, resize ও short clip তৈরি।
F3 — বাস্তব product fidelity ও দৃশ্য পরীক্ষা; channel-ready render।
M10.S3 — Voice, subtitle ও dubbing
F1 — script, ভাষা এবং অনুমোদিত voice asset নেওয়া।
F2 — voiceover, transcript, caption ও dubbing তৈরি।
F3 — উচ্চারণ ও sync review; অনুমতিহীন voice/face cloning বন্ধ।
M10.S4 — Interactive lead content
F1 — catalog, quiz, calculator বা lead magnet-এর brief নেওয়া।
F2 — অনুমোদিত তথ্য দিয়ে interactive experience ও download asset তৈরি।
F3 — calculation/content test; form, consent ও source tracking যুক্ত।
M11 — Asset library, review ও প্রকাশের অনুমোদন
দায়িত্ব: Content Approver। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M11.S1 — কেন্দ্রীয় asset library
F1 — ছবি, ভিডিও, লেখা, font ও source file গ্রহণ।
F2 — tag, product, language, format, usage rights ও expiry index করা।
F3 — অনুমতি অনুযায়ী search, preview ও reuse।
M11.S2 — Review ও version control
F1 — draft এবং reviewer দায়িত্ব নির্ধারণ।
F2 — comment, revision, approve/reject ও comparison চালানো।
F3 — অনুমোদিত version lock; edit হলে পুনরায় approval প্রয়োজন।
M11.S3 — দাবি, অধিকার ও তথ্যের সুরক্ষা
F1 — product claim, testimonial, likeness ও licensed material পরীক্ষা।
F2 — প্রমাণহীন দাবি, মেয়াদোত্তীর্ণ অধিকার ও ব্যক্তিগত তথ্য চিহ্নিত।
F3 — সংশোধন বা block; review decision ও প্রমাণ সংরক্ষণ।
M11.S4 — প্রকাশের package
F1 — approved asset, copy, CTA ও destination জড়ো করা।
F2 — channel size, link, tracking ও audience preview পরীক্ষা।
F3 — publish-ready package তৈরি; calendar/campaign-এ হস্তান্তর।
M12 — চ্যানেল, ক্যাম্পেইন ও বিতরণ
দায়িত্ব: Campaign Manager। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M12.S1 — Channel connection registry
F1 — business page, ad account, email domain ও messaging account যুক্ত করা।
F2 — API permission, token expiry, quota ও supported action পরীক্ষা।
F3 — Connected/Limited/Manual/Unavailable অবস্থাসহ capability registry।
M12.S2 — Organic, SEO ও community distribution
F1 — অনুমোদিত post/blog/video ও calendar নেওয়া।
F2 — website, social, YouTube, business profile ও অনুমোদিত community-তে publish queue।
F3 — published URL/status ধরে রাখা; unsupported action-এ manual task।
M12.S3 — Paid campaign management
F1 — objective, audience, creative, landing page ও budget নেওয়া।
F2 — supported ad connector দিয়ে campaign draft; account approval ও tracking check।
F3 — অনুমোদিত spend cap-এর মধ্যে launch/pause; platform result sync।
M12.S4 — Direct outreach ও nurture
F1 — eligible audience, approved email/message ও sequence নেওয়া।
F2 — email, WhatsApp, SMS বা supported channel-এ schedule ও frequency cap।
F3 — reply/opt-out/bounce-এ sequence stop; failed delivery ও retry নিয়ন্ত্রণ।
M13 — Lead capture ও কেন্দ্রীয় response inbox
দায়িত্ব: Marketing Response Team। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M13.S1 — Landing page ও form
F1 — offer, field, privacy notice ও CTA নির্ধারণ।
F2 — mobile form, validation, spam protection ও attribution তৈরি।
F3 — submission থেকে inquiry তৈরি; duplicate পরীক্ষা ও confirmation।
M13.S2 — Ads, chat ও social response
F1 — supported lead ads, website chat, inbox/comment event গ্রহণ।
F2 — conversation thread ও identity match; অজানা identity আলাদা রাখা।
F3 — একক inbox-এ route; মানব প্রতিনিধি নেওয়ার সহজ ব্যবস্থা।
M13.S3 — Email, call, event ও referral
F1 — email reply, অনুমতিসম্মত call note, QR/event/referral input নেওয়া।
F2 — attachment scan, transcript/OCR ও source attribution।
F3 — company/contact-এর সঙ্গে যুক্ত response; অস্পষ্ট match review queue।
M13.S4 — Response triage ও engagement
F1 — নতুন response ও relevant conversation context নেওয়া।
F2 — AI দিয়ে intent, ভাষা, urgency ও suggested answer তৈরি।
F3 — approved facts অনুযায়ী সীমিত উত্তর বা human handoff; price promise নয়।
M14 — AI lead qualification ও nurture সিদ্ধান্ত
দায়িত্ব: Lead Reviewer। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M14.S1 — চাহিদা extraction
F1 — message, form ও approved conversation context নেওয়া।
F2 — পণ্য, পরিমাণ, সময়সীমা, লোকেশন ও contact role বের করা।
F3 — প্রমাণের অংশসহ structured inquiry; অনুপস্থিত তথ্য unknown।
M14.S2 — Fit, intent ও confidence
F1 — target profile, inquiry ও অনুমোদিত scoring rule নেওয়া।
F2 — fit ও buying intent আলাদা মূল্যায়ন; confidence ও কারণ দেখানো।
F3 — Qualified/Needs review/Nurture/Irrelevant status; manual override history।
M14.S3 — Qualification conversation
F1 — missing প্রয়োজনীয় field ও recipient eligibility পরীক্ষা।
F2 — চাহিদা পরিষ্কারের প্রশ্ন বা প্রাসঙ্গিক তথ্য পাঠানোর draft তৈরি।
F3 — উত্তরের পর reassess; opt-out/negative intent-এ থামা।
M14.S4 — Lead readiness ও duplicate
F1 — qualified inquiry-র company/contact এবং existing ERP reference দেখা।
F2 — একই inquiry deduplicate; আলাদা project/product হলে সম্পর্কিত পৃথক lead।
F3 — handoff-ready lead package; sales assignment ERP-তে।
M15 — ERP handoff ও মার্কেটিং কার্যক্রম পর্যবেক্ষণ
দায়িত্ব: Integration Admin / Marketing Manager। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M15.S1 — ERP data contract
F1 — ERP team-এর API, required fields ও existing ID গ্রহণ।
F2 — company/contact/lead/source/consent mapping এবং authentication নির্ধারণ।
F3 — versioned schema ও test contract; অজানা ERP detail সিদ্ধান্ততালিকায়।
M15.S2 — Reliable lead transfer
F1 — handoff-ready lead ও unique transfer key তৈরি।
F2 — API/webhook বা agreed import দিয়ে পাঠানো; duplicate-safe retry।
F3 — ERP acknowledgement ও lead ID সংরক্ষণ; ব্যর্থতা manual recovery queue।
M15.S3 — Status feedback ও reconciliation
F1 — ERP-এর accepted/rejected/existing customer status গ্রহণ।
F2 — sync mismatch ও conflict মেলানো; ERP-owned field overwrite বন্ধ।
F3 — handoff status দেখানো; প্রয়োজনমতো marketing suppression/nurture আপডেট।
M15.S4 — Marketing operations ও experiment
F1 — delivery, spend, response, qualified lead ও transfer event নেওয়া।
F2 — campaign/creative/channel comparison; attribution model ও data gap দেখানো।
F3 — operational report/experiment result ERP-তে export; sales/KPI গণনা ERP-তে।
M16 — প্রশাসন, নিরাপত্তা ও AI অপারেশন
দায়িত্ব: System Admin। সাবমডিউল: ৪টি। প্রতিটি সাবমডিউলে ৩ ধাপ; মোট ১২ ধাপ।
M16.S1 — দায়িত্ব, প্রবেশাধিকার ও audit
F1 — user, team, workspace এবং permission নির্ধারণ।
F2 — read/edit/export/publish/budget approval পৃথক অধিকার প্রয়োগ।
F3 — কে কী করেছে audit log; access revoke ও data isolation পরীক্ষা।
M16.S2 — Consent, retention ও suppression
F1 — channel-purpose consent, opt-out ও source policy গ্রহণ।
F2 — retention, deletion, permitted storage এবং suppression rule চালানো।
F3 — ব্যক্তির অনুরোধ কার্যকর; সব queue-তে যোগাযোগ বন্ধ ও প্রমাণ রাখা।
M16.S3 — AI model ও খরচ নিয়ন্ত্রণ
F1 — text/image/video provider, data policy ও budget নির্বাচন।
F2 — model routing, prompt version, rate limit, quality evaluation ও fallback।
F3 — usage/cost log; confidential input masking; low-confidence output review।
M16.S4 — Automation reliability ও recovery
F1 — event trigger, scheduled job এবং connector health নেওয়া।
F2 — retry/backoff, duplicate event protection ও emergency pause প্রয়োগ।
F3 — failure alert, restore test ও operational runbook; secrets নিরাপদ রাখা।
৪. চ্যানেলভিত্তিক সুযোগ ও ব্যবহারের সীমা
প্রতিটি channel connection-এ আলাদা capability থাকবে: Discover, Publish, Advertise, Receive, Reply, Measure। একটি account সংযুক্ত হলেই সব ক্ষমতা পাওয়া যাবে ধরে নেওয়া যাবে না। account type, API approval, দেশ, subscription ও permission অনুযায়ী চালু হবে।
নিজস্ব website, blog ও landing page
SEO content, FAQ, product page, lead magnet, form, website chat; CMS connection বা অনুমোদিত manual publish।
Google Search ও Maps/Business Profile
নিজস্ব ব্যবসার উপস্থিতি ও search campaign; prospect research-এর Maps data-তে source-specific storage/attribution নিয়ম। Maps-কে নির্বিচার contact export হিসেবে ব্যবহার নয়।
Facebook ও Instagram
অনুমোদিত business account-এর post/reel, supported ads/lead forms, message/comment intake; personal profile automation নয়।
LinkedIn
company content, প্রাসঙ্গিক B2B research এবং অনুমোদিত marketing/lead integration; API access না থাকলে manual task। অবারিত profile scraping বা auto-DM প্রতিশ্রুতি নয়।
YouTube
দীর্ঘ ভিডিও, shorts, description/CTA, supported publishing/comment workflow ও video campaign; inquiry link দিয়ে attribution।
Email
পরিচ্ছন্ন eligible list, newsletter/sequence, authentication, unsubscribe, bounce/complaint handling; open tracking অনির্ভুল হতে পারে, reply/form inquiry বেশি নির্ভরযোগ্য signal।
WhatsApp
opt-in audience, approved template, click-to-chat, supported replies ও human handoff; business number পাওয়া মানেই marketing consent নয়।
SMS ও অন্যান্য messaging
সমর্থিত provider, sender identity ও channel-specific permission থাকলে campaign/response integration; না থাকলে disabled/manual।
TikTok, Pinterest, X ও অন্যান্য social
শিল্প/অডিয়েন্সে উপযোগী হলে discovery, creative distribution এবং supported campaign; প্রতিটির অনুমোদিত capability আলাদা যাচাই।
Webinar, event, referral ও partner
registration, attendance/import, QR form, referral source এবং co-marketing lead capture; পরে একই verification ও qualification।
Community ও directory
প্রাসঙ্গিক group, trade body, marketplace ও directory-তে অনুমোদিত listing/content; ব্যক্তিগত member data আহরণের অনুমতি ধরে নেওয়া নয়।
Retargeting ও audience matching
প্রযোজ্য consent ও platform eligibility থাকলে website/ad event audience; সংগ্রহ করা সব email/phone স্বয়ংক্রিয় custom audience upload করা যাবে না।
৫. ডেটা মডেল ও গুরুত্বপূর্ণ field
Company Group → Company → Branch এবং Contact ↔ Company সম্পর্ক আলাদা রাখতে হবে। এক ব্যক্তি একাধিক প্রতিষ্ঠানের সঙ্গে যুক্ত হতে পারে; কোম্পানির একাধিক contact থাকবে। একটি কোম্পানির আলাদা চাহিদা থেকে একাধিক inquiry/lead হতে পারে।
Company: company_id, group_id, branch_id, legal/trade name, industry, location, domain, source, verification status, existing_customer flag, ERP external ID।
Contact: contact_id, role, department, company relationship, role validity; personal ও general business mailbox-এর পার্থক্য।
ChannelEndpoint: channel, address/handle, country code, verification, delivery state; একই নম্বরের ফোন ও WhatsApp availability আলাদা।
Consent: contact/endpoint, channel, purpose, status, evidence, collected_at, withdrawal; unknown, opted-in এবং opted-out পৃথক।
Provenance: field value, source URL/file, imported_by, source timestamp, last_checked, confidence, change history।
ImportBatch: source file, field mapping, accepted/rejected/merged counts, error report, rollback scope; পরবর্তী বৈধ edit rollback-এ মুছে যাবে না।
Segment: rules, exclusions, membership count, snapshot ID; company group ও marketing segment এক জিনিস নয়।
ContentAsset: brief, product facts, prompt/model version, language, source asset, rights, review status, approved version।
Campaign: campaign ID, segment snapshot, channel/account, creative version, budget approval, schedule, tracking fields, stop rule।
Conversation/Inquiry: message/event ID, original source, matched identity, extracted need, attachment reference, intent, confidence।
Lead: lead_id, company/contact ID, product/need, qualification status/reason, missing information, reviewer, campaign attribution, ERP transfer state।
Transfer/Audit: idempotency key, schema version, attempts, ERP acknowledgement/ID, error code, actor, action ও correlation ID।
Unknown তথ্য ফাঁকা/unknown থাকবে; AI দিয়ে email, WhatsApp availability, budget, designation বা সম্মতি বানানো যাবে না। মূল raw value এবং normalized value প্রয়োজনমতো আলাদা রাখতে হবে।
৬. Workflow status, automation ও মানুষের সিদ্ধান্ত
Data: Uploaded/Discovered → Pending validation → Verified/Needs review/Rejected। Content: Draft → Review → Approved → Scheduled → Published/Failed/Archived। Inquiry: New → Classified → Needs information/Qualified/Nurture/Irrelevant। Handoff: Ready → Sending → Acknowledged/Failed/Rejected।
Event rule: নতুন upload হলে validation; verified record হলে segment refresh; approved content হলে publishing eligibility; response এলে চলমান outreach pause; opt-out এলে সব প্রাসঙ্গিক queue suppress; qualified lead হলে ERP transfer; acknowledgement না এলে retry ও alert।
AI স্বয়ংক্রিয় করতে পারে: extraction, tagging, draft, resize suggestion, translation, intent classification, proposed score, routing recommendation ও summary। প্রতিটি ক্ষেত্রে confidence, source context এবং fallback থাকবে।
মানুষের নিয়ন্ত্রণ থাকবে: initial brand/product facts, disputed merge, unsupported claim, final creative approval, campaign spend, low-confidence qualification ও sensitive response। Auto-publish/auto-reply শুধু পূর্বনির্ধারিত অনুমোদিত সীমায়; emergency pause সব queue থামাবে।
বাইরের website, uploaded PDF এবং message-কে তথ্য হিসেবে পড়বে AI; সেখানে থাকা নির্দেশনা দিয়ে account permission, audience export, publishing approval বা system rule বদলাতে পারবে না।
৭. ERP সংযোগের চুক্তি ও সীমানা
Outbound lead package: internal lead/company/contact IDs, সংশ্লিষ্ট ERP IDs, প্রয়োজন ও প্রমাণের summary, যাচাইকৃত contact endpoint, contact permission, source/campaign/creative IDs, qualification reason, attachment reference এবং transfer key। প্রয়োজনের অতিরিক্ত ব্যক্তিগত ডেটা পাঠানো হবে না।
Inbound: ERP lead ID, accepted/rejected status ও কারণ, existing customer flag এবং agreed lifecycle status। salesperson, sales task, order, revenue ও KPI-এর মূল রেকর্ড ERP-তেই থাকবে। marketing app শুধু প্রয়োজনীয় read-only reference রাখবে।
একই lead পুনরায় পাঠালে নতুন duplicate lead তৈরি হবে না। request timeout হলেও ERP আগে গ্রহণ করেছে কি না reconcile করতে হবে। ERP unavailable হলে queue-তে থাকবে; সফল acknowledgement ছাড়া transferred দেখাবে না।
API/webhook অগ্রাধিকার। ERP-তে API না থাকলে agreed CSV/import contract fallback হবে; export file তৈরি হওয়া মানেই ERP গ্রহণ করেছে নয়। তখন import confirmation/reconciliation প্রয়োজন।
বাস্তবায়নের আগে নির্ধারণযোগ্য: ERP vendor/version, API/auth, required fields, enum values, external ID ownership, duplicate rule, attachment limit, sandbox, retry policy, consent sync ও deletion behaviour। এগুলো এখন অজানা; নথিতে নির্দিষ্ট vendor বা endpoint কল্পনা করা হয়নি।
৮. ব্যবহারকারী ও প্রস্তাবিত স্ক্রিন
ভূমিকা: Owner/Admin, Data Operator, Researcher/Reviewer, Marketing Planner, Copywriter/Designer, Approver, Response/Lead Reviewer এবং ERP Integration Admin। ছোট টিমে একই ব্যক্তি একাধিক ভূমিকা নিতে পারবেন; publish/spend/export permission আলাদা থাকবে।
প্রস্তাবিত navigation: Overview; Imports; Discovery; Companies & Contacts; Data Review; Segments; Content Planner; AI Studio; Asset Review; Channels; Campaigns & Calendar; Inbox; Leads; ERP Sync; Settings & Audit।
Overview-এ operational view: import errors, verified/eligible contacts, awaiting approval content, scheduled/failed publication, spend pacing, response backlog, qualified leads এবং ERP transfer failures। এটি sales/KPI dashboard-এর বিকল্প নয়; agreed marketing event data ERP-তে যাবে।
৯. বাস্তবায়নের release ও dependency
R1 — ডেটার ভিত্তি: M01–M06, M16-এর access/consent/audit এবং M15-এর ERP contract। ফলাফল: নিজের ডেটা upload, পরিচয় যাচাই, company profile ও channel-eligible segment।
R2 — কনটেন্ট ব্যবস্থা: M07–M11 এবং M16-এর AI provider/cost controls। ফলাফল: brief থেকে text/image/video draft, review এবং publish-ready package।
R3 — Pilot campaign থেকে ERP: M12–M15 এবং M16-এর reliability। প্রথমে অনুমোদিত ১–২টি উপযুক্ত channel দিয়ে end-to-end pilot; তারপর বাড়ানো। কোন channel আগে হবে তা audience readiness ও account capability দেখে নির্বাচন।
R4 — সম্প্রসারণ: অতিরিক্ত channel/provider, bulk personalization, experiments, localization এবং উন্নত automation। core data, consent, approval ও transfer reliability পাস করার পরে scale।
বাস্তবায়নের সময় ও বাজেট এই document থেকে নিশ্চিত করা হয়নি। ERP এবং channel access যাচাই, data volume ও content workload জানার পর estimate হবে।
১০. গ্রহণযোগ্যতা পরীক্ষা
AT-01 — একই Excel দুইবার import করলে অপ্রত্যাশিত duplicate হবে না; accepted/rejected/merged/ignored row-এর হিসাব মূল input-এর সঙ্গে মিলবে।
AT-02 — ফোনের country code ও leading zero থাকবে; OCR-এর সন্দেহজনক email reviewer ছাড়া verified হবে না।
AT-03 — একই group-এর দুই কোম্পানি বা একই কোম্পানির দুই branch ভুল করে এক রেকর্ডে merge হবে না।
AT-04 — opt-out contact কোনো scheduled/direct campaign-এ যাবে না; অজানা WhatsApp consent-এ marketing message আটকে যাবে।
AT-05 — একটি বাংলা brief থেকে লেখা, design ও video draft হবে; fact/source ও asset rights review ছাড়া final approved হবে না।
AT-06 — approved content edit করলে approval reset হবে; account permission না থাকলে interface action enabled দেখাবে না।
AT-07 — একই recipient একাধিক segment-এ থাকলেও global frequency cap কার্যকর হবে; reply এলে automated nurture থামবে।
AT-08 — form ও message থেকে একই inquiry এলে duplicate lead বন্ধ হবে; নতুন পৃথক চাহিদা হারিয়ে যাবে না।
AT-09 — AI তথ্য না পেলে unknown রাখবে; low-confidence lead reviewer queue-তে যাবে; চাকরির আবেদন sales lead হবে না।
AT-10 — ERP timeout/retry-তে একটিই lead তৈরি হবে; acknowledgement না আসা পর্যন্ত handoff pending থাকবে।
AT-11 — provider failure, budget limit বা token expiry-তে পরিষ্কার error/alert হবে; emergency pause ও backup restore পরীক্ষা পাস করবে।
AT-12 — non-admin user নিষিদ্ধ export/publish করতে পারবে না; consent ও পরিবর্তনের audit trail পাওয়া যাবে।
AT-13 — sales executive assignment, quotation ও KPI নতুন app-এ duplicate তৈরি হবে না; ERP integration contract অনুযায়ী কাজ করবে।
১১. প্ল্যাটফর্ম নীতি ও সংযোগের রেফারেন্স
এখানকার architecture একটি প্রস্তাব। বাস্তব channel চালুর আগে সংশ্লিষ্ট account-এর live permission, API capability ও তখনকার platform policy যাচাই করতে হবে। নিচের নীতিগুলো সংযোগের গুরুত্বপূর্ণ সীমা নির্ধারণে ব্যবহার করা হয়েছে।
WhatsApp: প্রাপকের opt-in, business-initiated approved template, ২৪ ঘণ্টার customer-service window এবং human escalation বিবেচনায় connection তৈরি হবে।
WhatsApp Business Messaging Policy
Google Places: সব response অনির্দিষ্টকাল সংরক্ষণযোগ্য নয়; permitted storage, attribution এবং place ID-এর নিয়ম অনুসরণ করতে হবে।
Google Places API Policies
Email: প্রযোজ্য sender authentication, unsubscribe ও delivery/complaint handling প্রয়োজন; bulk sender-এর অতিরিক্ত নিয়ম account অনুযায়ী পরীক্ষা হবে।
Gmail Email Sender Guidelines
LinkedIn: API product ও permission অনুযায়ী access পাওয়া যায়; approval ছাড়া প্রতিটি marketing feature চালু ধরে নেওয়া যাবে না।
LinkedIn API Access

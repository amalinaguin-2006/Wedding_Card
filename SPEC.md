# Wedding invitation website: specification

## 1. Goal and stack
- A single-page, scroll-driven Bengali wedding invitation for mobile and desktop.
- Vite + plain HTML/CSS/JavaScript. GSAP with ScrollTrigger for all scroll animation. No backend, no framework.
- Static build that can be deployed to Netlify, Vercel or GitHub Pages.
- `reference/page-01.png` ... `page-14.png` are the approved mobile design (1080x1920). Match layout, art style, colours and elements. Never place a reference page on the site as a flat picture (page 12 is the only full illustration). Build pages from separate layers in `assets/`.

## 2. Rules that must not be broken
- Do not redraw, restyle, replace or regenerate characters, faces, clothes, betel leaves, motorbike, house, scroll paper, topor, mukut or cloth knot. Use the files in `assets/`.
- If an asset is missing, show a labelled placeholder and list it. Do not invent a substitute.
- Copy Bengali text exactly from this file. Real HTML text, never text inside images.
- If text in a reference image differs from this file, this file wins.

## 3. Visual system
- Background: #FFF4E4. Main text: #550000. Bright heading red: #A80000.
- Soft pink panels: #FFD0D2 at about 85% opacity, border #5C1414.
- Pages 10, 12 and 13 keep their own backgrounds.
- Bengali font: Noto Serif Bengali. English: a matching serif (page 10 names use a hand-drawn style as shown). Check that conjuncts render correctly. Never split Bengali text letter by letter in animations; animate whole words or lines.

## 4. Layout
- Mobile first, 9:16 composition, using 100svh. Nothing important cropped from 360x640 to 430x932.
- Desktop (1024px and up): a real wide layout, not a stretched phone screen. Petals and background fill the full width; content is centred with a sensible maximum height. Pairs of parents sit further apart; page 9 puts the two families side by side around the knot; page 11 puts the two scrolls side by side; page 13 uses a wider card with map and details in two columns; pages 10 and 12 extend the background without stretching the art.

## 5. Scroll behaviour
- All entrances and transitions are scrubbed by scroll and reverse when scrolling up.
- Only ambient loops run on their own: petals, butterflies, sparkles, chakra, trunks, leaves, hair.
- Pinned groups (scenes change in place): [1-2], [4-5-6-7-8-9].
- [3], [10], [11], [14] are separate sections that scroll in normally.
- [12-13] is one pinned group.
- Each scene must hold still long enough to be read before the next transition starts.
- Petals: one shared looping layer, slightly transparent, behind content, on pages 3-9, 11 and 14. Not on 1, 2, 10, 12, 13.

## 6. Scenes
**1.** Butterfly flies slowly; sparkles glow and twinkle. On scroll the butterfly flies and moves across, bursts into sparkles, and the sparkles reveal page 2.

**2.** Top and bottom ornaments, Brahma (no white box, no watermark), a small chakra rotating slowly behind his head as a halo, small butterflies drifting slowly.
Text: শ্রী শ্রী প্রজাপতয়ে নমঃ

**3.** Falling petals. Two golden elephants at the bottom; trunks rise and swing gently as if trumpeting. Large betel leaves show the English date, smaller ones the Bengali date; they appear one by one. Keep betel leaves.
Text: মহাশয়/ মহাশয়া, | আগামী, | 12 · 02 · 2027 | ২৮ · মাঘ · ১৪৩৩ | শুক্রবার

**4.** Groom's father pans in from the left, then his name; then এবং; then the mother pans in from the right with her name; then জ্যেষ্ঠপুত্র.
Text: শ্রী পঙ্কজ চক্রবর্তী | এবং | শ্রীমতী অনুশ্রী চক্রবর্তী | জ্যেষ্ঠপুত্র

**5.** Groom grows outward from the centre (breathe-out zoom), then his name, then the suffix. Then the groom's family picture appears, shrinks to the upper left and becomes slightly blurred and faded.
Text: শ্রীমান পবিত্রার্ঘ্য চক্রবর্তী | -এর সহিত

**6.** Groom's family stays upper left. Bride's father pans in from the left with name, then এবং, then mother from the right with name, then একমাত্র, then কন্যা.
Text: শ্রী রবি শঙ্কর ব্যানার্জ্জী | এবং | শ্রীমতী বাণী ব্যানার্জ্জী | একমাত্র | কন্যা

**7.** Bride, face hidden by two betel leaves with white-and-red design, grows outward from the centre. On scroll the lower (back) leaf moves left and the upper (front) leaf moves right.

**8.** Both leaves leave the frame completely; the bride grows slightly; her name appears.
Text: কল্যাণীয়া ঐন্দ্রিলা ব্যানার্জ্জী

**9.** At the start, the red cloth enters from the left and the off-white cloth from the right at the same time; they meet at the centre and become the tied knot (cross-fade to the knot image at the meeting moment). Then শুভ বিবাহ appears. Then both family pictures and both information boxes (topor above the groom's box, mukut above the bride's box). Optional very slow moving border. The groom's family has four people; the fourth is his brother.
Bengali:
- Heading: শুভ বিবাহ | চক্রবর্তী পরিবার | ব্যানার্জ্জী পরিবার
- Groom box: কল্যাণীয় পবিত্রার্ঘ্য চক্রবর্তী / পিতা : শ্রী পঙ্কজ চক্রবর্তী / মাতা : শ্রীমতী অনুশ্রী চক্রবর্তী / ভাই : অভ্রনীল চক্রবর্তী / ঠিকানা : স্থান- অনুর বাড়ি, মণিরামপুর, ডাকঘর- মণিরামপুর, জেলা- হুগলি, পিন- ৭১২৩০৪
- Bride box: কল্যাণীয়া ঐন্দ্রিলা ব্যানার্জ্জী / পিতা : শ্রী রবি শঙ্কর ব্যানার্জ্জী / মাতা : শ্রীমতী বাণী ব্যানার্জ্জী / ঠিকানা : গ্রাম- হাঁসনান, ডাকঘর- মাকালপুর, থানা- দাদপুর, জেলা- হুগলি, পিন- ৭১২৩০৫

English:
- Shubho Bibaho
- The Chakraborty Family / Groom: Pabitrarghya Chakraborty / Father: Mr. Pankaj Chakraborty / Mother: Mrs. Anushree Chakraborty / Brother: Abhraneel Chakraborty / Residence: Anur Bari, Manirampur, P.O. Manirampur, Dist. Hooghly – 712304
- The Banerjee Family / Bride: Aindrila Banerjee / Father: Mr. Rabi Shankar Banerjee / Mother: Mrs. Bani Banerjee / Residence: Vill. Hasnan, P.O. Makalpur, P.S. Dadpur, Dist. Hooghly – 712305

**10.** Wall, window and plants as shown; plants sway slowly; bride's hair waves softly. The groom rides in from the left on the same motorbike, stops at the shown position, then looks up to the bride (swap to the looking-up image). Then the text appears. This section has no language toggle.
Text: || আমাদের বিয়ে || / AINDRILA & PABITRARGHYA / Two hearts, one promise—we are tying the knot to spend the rest of our lives together. / We are very excited to share these special days with you. / Wedding Ceremony : 12th February 2027 / Reception : 14th February 2027 at Anur Bari

**11.** Heading, then two paper scrolls start rolled up; on scroll they unroll one after the other and reveal the text (left and right rollers move apart while the paper is unclipped). Petals.
Bengali:
- সময়সূচী
- শুভ বিবাহ / তারিখ: ১২ই ফেব্রুয়ারি, ২০২৭ (ইংরেজি) | ২৮শে মাঘ, ১৪৩৩ (বাংলা) / দিন: শুক্রবার / স্থান: কন্যার নিজস্ব বাসভবন / গ্রাম- হাঁসনান, ডাকঘর- মাকালপুর, থানা- দাদপুর, জেলা- হুগলি, পিন- ৭১২৩০৫
- বৌভাত / তারিখ: ১৪ই ফেব্রুয়ারি, ২০২৭ (ইংরেজি) | ১লা ফাল্গুন, ১৪৩৩ (বাংলা) / দিন: রবিবার / স্থান: অনুর বাড়ি / মণিরামপুর, ডাকঘর- মণিরামপুর, জেলা- হুগলি, পিন- ৭১২৩০৪

English:
- Schedule
- Subho Bibaho (The Wedding Ceremony) / Date: 12th February, 2027 (English) | 28th Magh, 1433 (Bengali) / Day: Friday / Venue: Bride’s Own Residence / Vill- Hasnan, P.O.- Makalpur, P.S.- Dadpur, Dist.- Hooghly, PIN- 712305
- Boubhat (The Wedding Reception) / Date: 14th February, 2027 (English) | 1st Falgun, 1433 (Bengali) / Day: Sunday / Venue: Anur Bari / Manirampur, P.O.- Manirampur, Dist.- Hooghly, PIN- 712304

**12.** The house illustration (page-12.png) unchanged, shown alone first.

**13.** The illustration fades back and the boxes appear. The map picture is a link to MAP_URL (opens in a new tab; on phones this opens the maps app where supported).
Bengali:
- প্রীতিভোজ (বৌভাত) / অনুর বাড়ি
- তারিখ: ১৪ই ফেব্রুয়ারি, ২০২৭ (ইংরেজি) | ১লা ফাল্গুন, ১৪৩৩ (বাংলা) / দিন: রবিবার / মণিরামপুর, ডাকঘর- মণিরামপুর, / জেলা- হুগলি, পিন- ৭১২৩০৪ / (পথনির্দেশ: বেগমপুর রেল স্টেশন থেকে টোটোযোগে মাত্র ১০ মিনিটের পথ)
- Map caption (English in both modes): Click on the map to see your distance

English:
- Pritibhoj (Boubhat / Wedding Reception) / Venue: Anur Bari
- Date: 14th February, 2027 (English) | 1st Falgun, 1433 (Bengali) / Day: Sunday / Address: Manirampur, P.O.- Manirampur, Dist.- Hooghly, PIN- 712304 / Directions: Only a 10-minute ride by Toto (e-rickshaw) from Begampur Railway Station / Click on the map to see your distance

**14.** Petals, couple, heading, live countdown to WEDDING_TIME, updating every second. Never show negative numbers; at zero show আজ শুভ বিবাহ / Today is the wedding, and after 12 February show শুভেচ্ছার জন্য ধন্যবাদ / Thank you for your blessings.
Bengali: আসবেন কিন্তু! | আর মাত্র | দিন | ঘণ্টা | মিনিট | সেকেন্ড (Bengali digits)
English: We Look Forward to Your Presence! | Only | Days | Hours | Minutes | Seconds (English digits)

## 7. Language toggle
- Small floating button in a corner, labelled "English" in Bengali mode and "বাংলা" in English mode.
- Default Bengali. Visible only while page 9, 11, 13 or 14 is on screen; hidden everywhere else.
- One shared choice for those four pages. Switching must not move the scroll position or replay animations. Longer English text must fit its box.

## 8. Config (one file, easy to edit)
- WEDDING_TIME = "2027-02-12T00:00:00+05:30"
- MAP_URL = "PASTE_GOOGLE_MAPS_SHARE_LINK_HERE"

## 9. Quality
- Smooth on mid-range Android phones: animate transform and opacity, fewer petals on small screens, pause loops that are off screen.
- Compress images to WebP, preload the first group, lazy-load the rest, show a small loader.
- Respect prefers-reduced-motion with simple fades.
- Works in Chrome, Safari (iPhone) and the WhatsApp in-app browser.
- Add a page title, favicon and a share preview image (Open Graph).

## 10. Asset & implementation decisions (overrides)
- **Map**: Use `assets/map.jpeg`.
- **Petals**: Crop individual petals from `assets/petal.png` and vary their size, rotation and speed.
- **Cover leaves (Scene 7–8)**: Use `assets/leaf-cover.png` for both cover leaves.
- **Elephants (Scene 3)**: Use `assets/elephant-body.png` mirrored on each side. Using code masks only, hide the original trunk on `elephant-body.png` and animate that same trunk area as a separate layer rotating from where it joins the head (no double trunk or visible gap).
- **Scene 10 Groom**: No separate looking-up bike image; keep `assets/p10-groom-bike.png` pose after stopping.
- **Scene 10 Bride Hair**: Do not use `assets/p10-bride-hair.png`. On `assets/p10-bride.png`, apply only a very gentle wind effect to the outer hair ends without moving or distorting face, body or clothes (or keep still if unnatural).
- **Scene 10 Plants**: Plants are baked into `assets/p10-background.png`; do not add `p10-plant-1.png` to `p10-plant-5.png`.
- **Scene 11 Scrolls**: Rotate `assets/scroll-paper.png` 90 degrees to match `page-11.png` (rollers left and right), and unroll from the centre outward on scroll (first one scroll, then the other) via clipping reveal while keeping text upright.
- **Image cleanup**: Leave the Gemini corner mark on `bride.png` and `p10-bride.png` as-is; remove only the stray orange specks on `p10-bride.png`.

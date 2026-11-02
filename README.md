# IndustryBench-DE Live

Website: https://industrybench-de.github.io/

IndustryBench-DE tests how well AI models know and apply German and EU industrial and safety
rules (mechanical, electrical, chemical, energy). Models answer open questions in German without
any documents; AI graders score each answer from 0 to 3 and count dangerous recommendations
separately. A new batch of questions is added every three months.

This repository holds only the website: static HTML, CSS, JavaScript and the averaged results in
`data/`. The questions, answers and the generation pipeline are not published, so the questions
do not end up in AI training data.

IndustryBench-DE is an independent German adaptation of IndustryBench
([arXiv:2605.10267](https://arxiv.org/abs/2605.10267)). It is not affiliated with or endorsed
by the IndustryBench authors.

After changing `assets/app.js` or `assets/site.css`, update their `?v=` in all four pages (the
first 8 hex digits of the file's SHA-256). GitHub Pages lets browsers cache files for 10 minutes;
without a new version a browser can combine a new page with an old script.

Fonts: Barlow Condensed, Source Sans 3 and IBM Plex Mono, self-hosted under the SIL Open Font
License 1.1 (see `assets/fonts/`).

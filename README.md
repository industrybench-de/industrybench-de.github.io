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

Fonts: Barlow Condensed, Source Sans 3 and IBM Plex Mono, self-hosted under the SIL Open Font
License 1.1 (see `assets/fonts/`).

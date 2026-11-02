# IndustryBench-DE Live

**https://industrybench-de.github.io/** (German and English)

How well do AI models know German and EU industrial and safety rules? This site shows the
results of IndustryBench-DE: a leaderboard per release and a short report on how the benchmark
works.

This repository holds only the website. The questions stay private so they do not end up in AI
training data; `data/` contains averages only.

## Updating

- **New results:** replace `data/<release>.json` (written by the private pipeline) and add the
  release to `data/releases.json`.
- **Changed `assets/app.js` or `assets/site.css`:** update its `?v=` in the four HTML pages to the
  first 8 hex digits of the file's SHA-256, so browsers do not mix a cached old file with a new
  page.

IndustryBench-DE is an independent adaptation of IndustryBench
([arXiv:2605.10267](https://arxiv.org/abs/2605.10267)), not affiliated with its authors. Fonts
are self-hosted under the SIL Open Font License 1.1.

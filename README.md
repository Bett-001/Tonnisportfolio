# Tonny Bett: Portfolio

My personal portfolio as a full-stack software developer in Kenya. It's built with plain **HTML, CSS and JavaScript**, with no frameworks, no build step and no trackers.

**Live site:** https://bett-001.github.io/Tonnisportfolio/

## What's inside

- **Opening intro:** my skills stack up as coloured pills while the page loads, then slide apart to open the site.
- **Hero:** a flip-card that cycles through my roles, and a portrait where a spotlight under the cursor reveals the colour photo.
- **Pull-cord light/dark switch:** a physics rope drawn on a canvas. You can swing it, fling it, or pull it to change the theme.
- **Skill doors:** four doors, one per discipline (Frontend, Backend & APIs, AI & Automation, Trading Tech). Hovering a door opens it and shows what's behind it; clicking walks you through to that skill's projects.
- **Projects:** live products (Clotz Hub, MQTradePro, Imara Logic) and React apps (Bot Battlr, Job Finder), shown with screenshots and links.
- **My story:** a scrolling timeline of my work and education.
- **3D ability card:** a holographic trading card you can tilt, drag and flip.
- **Contact:** a 5-step "Hire me" form that opens your own email app with the message filled in.
- **Responsive and accessible:** it works on phones, supports keyboard use, and respects the "reduce motion" setting.

## Project structure

```
index.html        page shell: header, nav, main, footer, dialogs
style.css         all styles: theme tokens, layout, sections, responsive rules
js/content.js     all text and data: identity, skills, projects, story, card
js/main.js        routing, intro, flip-card, doors, story, contact form
js/cord.js        the physics pull cord (light/dark switch)
js/card.js        the 3D ability card overlay
assets/           portrait, card photo and project screenshots
```

To change any text, edit `js/content.js`. The rest of the site reads from it.

## Run it locally

1. Clone the repo and open the folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**, or run `python3 -m http.server` and open http://localhost:8000.

## Credits

- **Fonts:** Onest, JetBrains Mono and EB Garamond (all SIL Open Font License), served by Google Fonts.
- **Design inspiration:** the layout and interaction ideas (doors, pull cord, flip-card roles, ability card) are inspired by [therishithakor.com](https://therishithakor.com) by Rishi Thakor. All the code here is written from scratch, and all text and photos are my own.
- **Built with AI assistance:** I developed this site with Claude (Anthropic) as a coding assistant. I directed the design, made the decisions and reviewed the work.

© 2026 Tonny Bett

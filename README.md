# Semester Board

One HTML file. No build step, no framework, no npm install. Open `index.html` and it works.

Data lives in `localStorage`. Add a sync endpoint and it follows you between laptop and phone.

---

## Deploy on Vercel from GitHub

```
mkdir semester-board && cd semester-board
# drop index.html and vercel.json in here
git init && git add . && git commit -m "board"
gh repo create semester-board --private --source=. --push
```

Then on vercel.com: Add New, Project, import the repo. Framework Preset **Other**. Leave the build and install commands empty, output directory **.** (a single dot). Deploy.

Every `git push` redeploys. Custom domain lives under Project, Settings, Domains.

`vercel.json` exists only to stop Vercel caching `index.html` forever, which would leave you staring at an old build after a push.

**GitHub Pages** works identically if you would rather skip Vercel: push `index.html` to a repo, Settings, Pages, deploy from branch `main`, folder `/ (root)`. Slower to update, otherwise the same.

**Add to home screen** on iOS and Android. Opens fullscreen, and stops Safari evicting your data (see below).

---

## Cross-device sync

Without a sync endpoint, your laptop and phone keep two separate copies that silently diverge. Pick one.

### Option A: GitHub gist, no backend to run

1. gist.github.com, create a **secret** gist with one file named `semester-board.json` containing `{}`. The gist id is the hash at the end of the URL.
2. GitHub, Settings, Developer settings, Personal access tokens, **Fine-grained tokens**. New token, no repository access, and under Account permissions enable **Gists: read and write**. Nothing else.
3. In the app: Settings, endpoint `gist:<that id>`, key `<the token>`. Save.

The token lives in localStorage on each device, never in the repo. Scoped to gists only, so worst case is someone with your unlocked phone reading your gists. Not your code.

### Option B: Cloudflare Worker

`sync-worker.js` is a 40 line worker backed by KV, with a rolling 30 day snapshot so a bad overwrite is recoverable. Deploy steps are in the header comment of that file. In the app: endpoint = the worker URL, key = the secret you set.

Host the page on Vercel and the sync on Cloudflare if you want. They are independent and CORS is already open on the worker.

### How sync behaves either way

- Every change pushes after a 1.5 second pause.
- Opening the app, or switching back to the tab, pulls.
- Newer `updatedAt` wins. Whole document, not per field.

**If you edit on your phone while the laptop is offline, and the laptop pushes afterwards, the phone edits are gone.** Pull before you start editing on the second device. The dot beside the wordmark is green when the last sync worked, red when it did not.

---

## Back up

Settings, Export JSON. Once a month. Import JSON restores everything.

Do this especially on iOS Safari without the app on your home screen. Safari evicts localStorage for sites you have not opened in 7 days.

---

## The schedule

`RECURRING` in the left rail holds your classes, read off the UTD scheduler:

| Course | Sec | Room | When |
|---|---|---|---|
| CS 2336 | 002 | ECSW 1.355 | MW 10:00 - 11:15 |
| MATH 2418 | 005 | ECSW 1.355 | TTh 10:00 - 11:15 |
| MATH 2418 | 317 | SLC 3.102 | F 10:00 - 11:50 |
| PHYS 2125 | 102 | SCI 1.129 | M 1:00 - 3:45 |
| CS 2340 | 006 | ECSS 2.305 | TTh 1:00 - 2:15 |
| PHYS 2325 | 003 | SCI 1.220 | TTh 2:30 - 3:45 |
| PHYS 2325 | 201 | SCI 1.210 | F 2:30 - 3:20 |
| EPCS 3200 | 201 | GR 3.606 | T 4:00 - 4:45 |
| EPCS 3200 | 001 | SPN 1.121 | W 3:00 - 4:45 |

RHET 1302 is deliberately not in here. The RESET button in the recurring card restores this list.

---

## Auto place rules

| Block | Count | Rule |
|---|---|---|
| Leetcode | 7 x 30m | 15 min after the last morning commitment ends |
| Cardio | 2 x 30m | 8:00am Saturday and Sunday, first thing |
| Lifting | 3 x 75m | first free evening slot, 4pm to 9pm |
| Applications | 3 x 60m | first free evening slot, 5pm to 10pm, on days without lifting |

A "morning commitment" starts before noon and finishes by 1pm, so a Saturday shift running 11am to 6pm does not drag leetcode into the evening. Everything keeps 15 minutes of air around it and refuses to overlap a class or a shift.

Auto place never moves a block you already put down. Clear the week first if you want a fresh layout.

---

## Notes

- **Import .ics** on the Work tab eats a calendar export from eLearning, Canvas or Google Calendar so you are not typing due dates twice.
- **Export .ics** on the week bar dumps the week plus open assignments into a file your phone calendar will import. This app sends no notifications. Your calendar does.
- **Routine blocks** have two states. Tap the check once you actually did it. Pips go solid for done, hollow for merely scheduled.

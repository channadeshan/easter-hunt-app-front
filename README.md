# 🥚 Campus Easter Egg Hunt — Frontend

A live, multiplayer Easter Egg Hunt app built with React + TypeScript + Tailwind CSS + Socket.IO.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Dev server & bundler |
| Tailwind CSS | Styling (mobile-first) |
| React Router v6 | Client-side routing |
| socket.io-client | Live WebSocket events |
| qrcode.react | Admin QR code generation |
| html5-qrcode | Participant camera scanner |

---

## File Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx       # isAuthenticated, role, checkStatus, logout
│   └── SocketContext.tsx     # Shared Socket.IO instance
├── components/
│   ├── ActivityFeed.tsx      # Live scrolling feed (egg/hint/join events)
│   ├── LiveStatsBadge.tsx    # Real-time player count widgets
│   ├── Modal.tsx             # Scan result popup
│   └── Spinner.tsx           # Loading indicator
├── pages/
│   ├── LandingPage.tsx       # Login (admin) + Join (participant) page
│   ├── AdminDashboard.tsx    # Organizer control panel
│   ├── ParticipantDashboard.tsx  # Player's hitlist, intel, feed
│   └── ScannerPage.tsx       # Camera QR scanner (/play/scan)
├── App.tsx                   # Root router + boot check
├── main.tsx                  # Entry point
└── index.css                 # Global styles + Tailwind
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure your backend URL
```bash
cp .env.example .env.local
# Edit VITE_API_URL to point at your backend
```

### 3. Run dev server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## Routes

| Route | Guard | Description |
|---|---|---|
| `/` | Public | Landing: Admin login OR Player join |
| `/admin` | `role === 'organizer'` | Admin dashboard |
| `/play` | `role === 'participant'` | Player dashboard |
| `/play/scan` | `role === 'participant'` | Camera QR scanner |

---

## Boot Check Logic

On every app load, `GET /status` is called with `credentials: 'include'`.  
The backend's HttpOnly cookie is sent automatically — the frontend never sees it.

```
/status response
├── { isAuthenticated: true, role: 'organizer' }  → redirect /admin
├── { isAuthenticated: true, role: 'participant' } → redirect /play
└── { isAuthenticated: false }                     → show landing page
```

---

## WebSocket Events

| Event | Direction | Used by |
|---|---|---|
| `live_player_count` | Server → Client | AdminDashboard LiveStatsBadge |
| `total_registered_count` | Server → Client | AdminDashboard LiveStatsBadge |
| `new_activity` | Server → Client | ActivityFeed (both dashboards) |
| `game_reset` | Server → Client | ParticipantDashboard (redirects to `/`) |

---

## API Calls

All requests include `credentials: 'include'` — required for HttpOnly cookie auth.

### Auth
- `GET /status` — Boot check
- `POST /login` `{ password }` — Admin login
- `POST /logout` — Log out either role
- `POST /join` `{ username, emojiUrl }` — Participant join

### Admin
- `POST /egg` `{ name, emoji, color }` → returns `{ uniqueCode }`
- `POST /hint` `{ text, eggId }` → returns `{ uniqueCode }`
- `GET /eggs` — All eggs
- `GET /hints` — All hints
- `DELETE /eggs/:id`
- `DELETE /hints/:id`
- `POST /reset-game`

### Participant
- `GET /eggs/available` — Eggs visible to this player
- `GET /hints/discovered` — Hints this player has scanned
- `GET /activities` — Historical activity feed
- `POST /scan` `{ scannedCode }` — Submit a scanned QR string

---

## Scanner Notes

The scanner uses `html5-qrcode` targeting `facingMode: 'environment'` (rear camera).  
- Scanning pauses automatically on detection
- Result modal shows success/error with the backend's message
- "Keep Scanning" resumes the camera
- All QR `html5-qrcode` UI chrome is hidden via CSS for a clean look

---

## Mobile PWA Tips

The `index.html` includes:
- `viewport` with `user-scalable=no` — prevents accidental zoom during scanning
- `theme-color` — dark status bar on Android
- `apple-mobile-web-app-capable` — add-to-home-screen ready on iOS
